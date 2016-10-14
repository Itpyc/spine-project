angular.module('starter.controllers', ['ngCordova'])
  .controller('TabCtrl', function ($rootScope, DataStore, $timeout, $interval, $scope, $ionicHistory, $state, $location, $ionicPlatform, $cordovaToast, $cordovaLocalNotification, $cordovaDialogs, $http, UrlStore) {
    console.log($location.path())
    $rootScope.ifJZ = false; //是否接诊
    $rootScope.ifWZ = false; //是否问诊，控制视频问诊tab的禁止状态
    $rootScope.showPatientInfo = false;
    $rootScope.badgeCount = '';
    $rootScope.onSwipeRight = function () {
      console.log('左滑了');
      $ionicHistory.goBack();
    };
    $rootScope.goToJZ = function () {
      if ($rootScope.ifJZ) {
        $state.go('tab.huizhen');
      } else {
        $state.go('tab.jiezhen');
      }
    }

    var listener = function () {
      $http({
        method: 'get',
        url: UrlStore.queryAskInfo,
        params: {
          userId: localStorage.getItem('token')
        }
      }).success(function (data) {
        /*alert(JSON.stringify(data));*/
        if (data.code == "1") {
          //通知app有新的通话请求
          //$rootScope.patientInfo_new = data.info;
          // console.log('有新的视频通话请求' + msg);
          $rootScope.$broadcast('newTalkRequest', {askId: data.value.askId, askUser: data.value.askUser});
          $rootScope.askId = data.value.askId;
          $rootScope.badgeCount = 'new';

          //通知栏通知
          $cordovaLocalNotification.schedule({
            id: data.value.askUser,
            title: '一个新的问诊请求',
            text: '来自于用户' + data.value.askUser + '的问诊请求',
            data: {
              customProperty: 'custom value'
            }
          }).then(function (result) {
            // ...
            $cordovaDialogs.beep(3);
            //$cordovaVibration.vibrate(100);
          });
        }
      }).error(function (err) {

      });
    }
    $rootScope.newMsg = false;//是否有新消息，如果有新消息，则不允许下拉刷新
    //接收到视频通话请求
    //采用轮询方式，每隔一段时间(10s)向后台获取
    $rootScope.timer = $interval(function () {
      console.log('hello');
      listener();
    }, 10000);
    //如果医生提交了请求，或者医生50秒内未进行处理。重新开启监听器
    $rootScope.$on('reopenTimer', function (event, data) {
      $rootScope.newMsg = false;
      $rootScope.timer = $interval(function () {
        console.log('hello');
        listener();
      }, 10000);
    });
    //监听来自接诊页面的视频通话请求消息
    //如果接受到新的请求，则暂时停止监听器
    //新开启一个监听专家反应的定时器
    $rootScope.$on('newTalkRequest', function (event, data) {
      $interval.cancel($rootScope.timer);
      $rootScope.newMsg = true;
      var askUser = data.askUser;
      //如果50秒内无相应，则启动该定时器
      $rootScope.timeout = $timeout(function () {
        $rootScope.patientInfo_new = {};
        $rootScope.showPatientInfo = false;//隐藏信息
        $rootScope.badgeCount = '';//tab通知
        $rootScope.ifJZ = false; //是否接诊
        // $cordovaLocalNotification.clearAll();
        //重新启动监听器
        $rootScope.$emit('reopenTimer');
      }, 40000);
      //跳到接诊界面，并且显示接诊信息
      // $state.go('tab.jiezhen');
      /* console.log(data)
       $rootScope.showPatientInfo = true;
       $interval.cancel($rootScope.timer)*/
      //获取请求接诊详细信息
      $http({
        url: UrlStore.queryCureUserInfoByAsk,
        method: 'get',
        params: {
          askId: data.askId
        }
      }).success(function (data) {
        /*alert(JSON.stringify(data))*/
        if (data.code == "1") {
          data["askUser"] = askUser;
          $rootScope.patientInfo_new = data;
          console.log($rootScope.patientInfo_new);
          $rootScope.showPatientInfo = true;
        } else {
          alert('失败');
        }
      });
    });
    //监听是否开启视频
    //接收来自子页面tab-jiezhen
    $rootScope.$on('fromJZ-startVideo', function () {
      //向tab-wenzhen广播视频开启事件
      console.log('接收开启视频通知，我是父页面');
      $rootScope.$broadcast('startVideo');
    });
    $rootScope.$on('fromJZ-closeVideo', function () {
      //向tab-wenzhen广播视频开启事件
      $rootScope.$broadcast('closeVideo');
    });
  })
  .controller('LoginCtrl', function ($scope, $state, $rootScope, $http, HTTPSERVICES, $stateParams, UrlStore, $ionicLoading, $cordovaToast, $cordovaNetwork, Authorize) {
    //登录时，需要同后台服务器进行通信，将用户名和密码发给后台，后台验证成功后传回来一个token
    $scope.userInfo = {};
    // console.log($stateParams)
    $scope.ToLogin = function () {
      /* if ($rootScope.offlineState) {
       $cordovaToast.showLongBottom('网络未连接');
       return;
       }*/
      //$state.go('tab.home');
      console.log($scope.userInfo);
      //获取用户名和密码
      //设置
      Authorize.setUserInfo($scope.userInfo);
      //进行登录
      Authorize.login($scope.userInfo);
      // $state.go('tab.home');
      //HTTPSERVICES.login($rootScope.user);
      $ionicLoading.show({
        content: 'loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0,
        template: '<ion-spinner icon="circles" class="spinner-calm"></ion-spinner><div>登录中，请稍候</div>'
      });
      // $state.go('tab.home');
    };
  })
  .controller('HomeCtrl', function ($scope, Patients, $state, $location, $rootScope, $http, UrlStore, DataStore, HttpServices, $cordovaSpinnerDialog, ChartConfig, $ionicLoading) {
    console.log("$ionicView.loaded");
/*    $ionicLoading.show({
     content: 'loading',
     animation: 'fade-in',
     showBackdrop: true,
     maxWidth: 200,
     showDelay: 0,
     template: '正在加载，请稍候'
     });
     //获取未接诊列表5条，更新首页数据
     HttpServices.getNjzList_5(1).success(function (data) {
     /!*  console.log(data);
     DataStore.setNJZList_5(data.listData);*!/
     $scope.NJZList_5 = data.list;
     }).error(function () {
     });
     console.log("$ionicView.enter");
     //每次进入首页都要从后台获取最新的数据,更新图表
     $http({
     method: 'get',
     params: {
     userId: localStorage.getItem('token')
     },
     url: UrlStore.queryIndexTableData
     }).success(function (data) {
     $scope.chartConfig1 = ChartConfig.chartConfig_column(data.ageArry);
     $scope.chartConfig2 = ChartConfig.chartConfig_pie(data.provinceArry);
     }).finally(function () {
     $ionicLoading.hide();
     });
     */

    $scope.$on("$ionicView.enter", function () {
      //获取未接诊列表5条，更新首页数据
      HttpServices.getNjzList_5(1).success(function (data) {
        /*  console.log(data);
         DataStore.setNJZList_5(data.listData);*/
        $scope.NJZList_5 = data.list;
      }).error(function () {

      });
      console.log("$ionicView.enter");
      //每次进入首页都要从后台获取最新的数据,更新图表
      $http({
        method: 'get',
        params: {
          userId: localStorage.getItem('token')
        },
        url: UrlStore.queryIndexTableData
      }).success(function (data) {
        $scope.chartConfig1 = ChartConfig.chartConfig_column(data.ageArry);
        $scope.chartConfig2 = ChartConfig.chartConfig_pie(data.provinceArry);
      }).finally(function () {
      });
    });
    //进入主页面需要从后台获取的内容，在进入时就应该获取，每次进入获取和更新一次？
    $scope.goToDetail = function (id, patient) {
      /*      $ionicLoading.show({
       content: 'loading',
       animation: 'fade-in',
       showBackdrop: true,
       maxWidth: 200,
       showDelay: 0,
       template: '加载中'
       });
       $http({
       url: UrlStore.queryCureUserInfoByAsk,
       method: 'get',
       params: {
       askId: id
       }
       }).success(function (data) {
       if (data.code == '1') {
       $state.go('tab.nojiezhen-detail', {patientId: id, detail: data});
       } else {
       alert('没有查到该病人详细信息');
       }
       $ionicLoading.hide();
       }).error(function (err) {
       alert(err);
       $ionicLoading.hide();
       });*/


      $state.go('tab.nojiezhen-detail', {patientId: id, detail: patient});
      /*  $cordovaSpinnerDialog.show('加载中')
       $http({
       url: UrlStore.listDetail,
       method: 'get',
       params: {
       token: localStorage.getItem('token'),
       id: id
       },
       timeout: 5000
       }).success(function (data) {
       $state.go('tab.nojiezhen-detail', {patientId: id, detail: data.info});
       $cordovaSpinnerDialog.hide();
       }).error(function () {
       $cordovaSpinnerDialog.hide();
       })*/
    }


    console.log($location.path())
    // $scope.patients = Patients.all();
    /*获取更多*/
    $scope.getMore_NJZ = function () {
      $state.go('tab.list', {listType: 1});
    }
    $scope.getMore_YJZ = function () {
      $state.go('tab.list', {listType: 2});
    }
  })
  .controller('JiezhenCtrl', function ($scope, $timeout, Patients, $state, $rootScope, $location, $cordovaToast, $ionicPlatform, $cordovaLocalNotification, $ionicLoading, $http, UrlStore, DataStore) {
    /****************
     接诊界面主要是负责处理接诊通知的。
     接受接诊：通知后台，已经接受接诊
     拒绝接诊：通知后台，拒绝接诊
     此处不做数据处理
     具体问诊过程在huizhen界面
     *****************/
    //当需要本地计算时开启
    /* console.log(DataStore.getNJZList_5());
     $scope.NJZList_5 = DataStore.getNJZList_5();*/
    //  exit.doubleExit($location.path());
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    /* $scope.patients = Patients.all();
     $scope.remove = function (patient) {
     Patients.remove(patient);
     };*/
    // $scope.showPatientInfo = true;

    //步骤：
    //1、当医生点击进入接诊页面时，向后台发送一次请求.
    //2、如果返回结果为空或者为一个无问诊请求的提示，则设置showNoPatientInfo为false
    //3、如果有返回结果，则设置其为true
    //4、有接诊信息，如果医生选择接诊，则设置tab-wenzhen的disabled为false,即问诊界面可进入，并且主动跳转到此界面
    // $rootScope.patientInfo = {};
    //$rootScope.showPatientInfo = false;
    /* if($scope.patientInfo.doctor){
     $scope.showPatientInfo = true;
     }else{
     $scope.showNoPatientInfo = false;
     }*/
    //如何判断50秒内不做动作呢？
    //设置一个定时器，50秒后触发
    //步骤
    //监听来自接诊页面的视频通话请求消息，病人打开摄像头
    /*下拉刷新接诊页面*/
    //当有请求消息时，不可以使用下拉刷新了
    $scope.JZ_Refresh = function () {
      //下拉刷新，正确的姿势应该是向后台询问是否有问诊请求
      /*  $scope.patient = Patients.all();*/
      //如果有问诊申请，此步骤可以从后台获取如果有申请，则显示申请的信息
      $http({
        method: 'get',
        url: UrlStore.queryAskInfo,
        params: {
          userId: localStorage.getItem('token')
        }
      }).success(function (data) {
        if (data.code == "1") {
          //通知app有新的通话请求
          //$rootScope.patientInfo_new = data.info;
          // console.log('有新的视频通话请求' + msg);
          $rootScope.$emit('newTalkRequest', {askId: data.value.askId});
          // $scope.$apply(function () {
          $rootScope.badgeCount = 'new';
          //});
          //通知栏通知
          $cordovaLocalNotification.schedule({
            id: data.value.askUser,
            title: '一个新的问诊请求',
            text: '来自于用户张三的问诊请求',
            data: {
              customProperty: 'custom value'
            }
          }).then(function (result) {
            // ...
            $cordovaDialogs.beep(3);
            //$cordovaVibration.vibrate(100);
          });
        }
      }).finally(function () {
        $scope.$broadcast('scroll.refreshComplete');
      });
      /*  if ($scope.patientInfo.doctor) {
       $rootScope.showPatientInfo = true;
       }*/
      /* setTimeout(function () {
       $scope.$broadcast('scroll.refreshComplete');
       }, 1000);*/
    };
    //拒绝问诊
    $scope.refuseWZ = function () {
      //获取病人基本信息
      // var patientInfo = $rootScope.patientInfo_new;
      $timeout.cancel($rootScope.timeout);
      //医生选择拒绝问诊，跳回到主页面
      //通知发起者，接诊请求被拒绝
      //$rootScope.socket.emit('refuseJZ', {token: localStorage.getItem('token'), info: $rootScope.patientInfo_new});
      //1、通知后台，该医生拒绝次次接诊
      //2、将该次接诊病人信息存入列表
      $http({
        method: 'get',
        url: UrlStore.expertUpdateAskStatus,
        params: {
          userId: localStorage.getItem('token'),
          askId: $rootScope.askId,
          status: '2'
        }
      }).success(function (data) {

      })
      //更新所有的未接诊列表
      $rootScope.patientInfo_new = {};
      //  $state.go('tab.jiezhen');
      $rootScope.showPatientInfo = false;//隐藏信息
      $rootScope.badgeCount = '';//tab通知
      $rootScope.ifJZ = false; //是否接诊
      // $cordovaLocalNotification.clearAll();
      //重新启动监听器
      $rootScope.$emit('reopenTimer');
    }
    //接受问诊，通知
    $rootScope.$on('startVideo', function () {
      console.log('我已经接收到信息，我是tab-jiezhen');
    });

    $scope.acceptWZ = function () {
      $ionicLoading.show({
        content: 'loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0,
        template: '请等待，正在为您处理'
      });
      //创建socket服务器,为视频通话做准备
      var ioUrl = 'http://123.56.182.64:3000';
      $rootScope.socket = io.connect(ioUrl);
      console.log($rootScope.socket);
      //同socket服务器通信
      $rootScope.socket.on('connect', function () {
        console.log('链接成功');
        $rootScope.socket.emit('doctor connect', localStorage.getItem('token'), $rootScope.askId, '专家登录成功');//医生发送登录成功消息，发送其userId
      });
      $timeout.cancel($rootScope.timeout);
      //更新已接诊列表
      //专家接受接诊
      //通知后台该接诊已经被接受
      // $rootScope.socket.emit('acceptRequest');
      // $ionicLoading.show();
      //医生选择接受问诊，跳到问诊页面
      $http({
        url: UrlStore.expertUpdateAskStatus,
        method: 'get',
        params: {
          userId: localStorage.getItem('token'),
          askId: $rootScope.askId,
          status: '3'
        }
      }).success(function (data) {
        $rootScope.$emit('fromJZ-startVideo');
        //清空容器
        $state.go('tab.huizhen', {huizhenType: 1, patientId: 1, detail: $rootScope.patientInfo_new});
        $rootScope.patientInfo_new = {};
        $rootScope.badgeCount = '';
        $rootScope.showPatientInfo = false;
        $rootScope.ifWZ = true;//是否在问诊，此处控制其他tab是否可选
        $rootScope.ifJZ = true; //是否接诊
        $ionicLoading.hide();
      }).error(function (err) {
        console.log(err);
        $ionicLoading.hide();
      })
      //   $state.go('tab.huizhen', {huizhenType: 1, patientId: 1});
      //向父页面发送通知开启视频
      $rootScope.$emit('fromJZ-startVideo');
      /* $ionicPlatform.registerBackButtonAction(function (e) {
       })*/
    }
  })
  .controller('NjiezhenDetailCtrl', function ($scope, $stateParams, $rootScope, UrlStore, $ionicHistory, $cordovaSpinnerDialog, $http) {
    console.log($stateParams.detail)
    $scope.patient = $stateParams.detail;
    //获取到askId，根据askId获取信息
    // console.log($stateParams.patientId);
    //根据askId从后台获取病人的基本信息
  })
  .controller('WenzhenCtrl', function ($scope, $rootScope, videoCam, $ionicLoading, $location) {
    console.log('我是wen诊室');
    /*  ionic.DomUtil.ready(function () {
     console.log('dom ready')
     })*/
    $rootScope.$on('startVideo', function () {
      console.log('我已经接收到开启视频通知');
      var local = document.getElementById('localVideo');
      var remoteVideo = document.getElementById('remoteVideo');
      videoCam.startCam($rootScope.socket, local, remoteVideo);
    });

    $scope.doRefresh1 = function () {
      var local = document.getElementById('localVideo');
      var remoteVideo = document.getElementById('remoteVideo');
      videoCam.stopCam();
      videoCam.startCam($rootScope.socket, local, remoteVideo);
      setTimeout(function () {
        $scope.$broadcast('scroll.refreshComplete');
      }, 1000)
    }
    console.log(document.getElementById('remoteVideo'));
    console.log('页面加载');
    var local = document.getElementById('localVideo');
    var remoteVideo = document.getElementById('remoteVideo');
    videoCam.startCam($rootScope.socket, local, remoteVideo);
  })
  .controller('SettingsCtrl', function ($scope, $state, $location, $cordovaActionSheet, $rootScope, $http, Authorize, PersonInfoService) {
    //进入settings时从后台获取到用户的基本信息
    //需要从网络获取信息的条件。
    /*    if (localStorage.getItem('personInfo') != {}) {
     $rootScope.personInfo = localStorage.getItem('personInfo');
     } else {*/
    /* if(localStorage.getItem('personInfo') != 'undefined'){
     //alert('dfdf')
     $scope.personInfo = JSON.parse(localStorage.getItem('personInfo'))
     }*/

    /*if(localStorage.getItem('personInfo') != 'undefined'){
     alert('dfdf')
     $scope.personInfo = JSON.parse(localStorage.getItem('personInfo'))
     }*/

    $scope.$on('$ionicView.enter', function () {
      console.log(PersonInfoService.getPersoInfo());
      $scope.personInfo = PersonInfoService.getPersoInfo();
      console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
      console.log($scope.personInfo);
    });
    $scope.logout = function () {
      // localStorage.setItem('personInfo', JSON.stringify($scope.personInfo));
      // alert((localStorage.getItem('personInfo')));
      Authorize.logout();
    }
    //前往患者管理
    $scope.goToPatientManage = function () {
      $state.go('tab.patientManage');
    };

  })
  .controller('PersonInfoCtrl', function ($scope, $ionicPopup, $cordovaCamera, $rootScope, PersonInfoService) {
    //获取信息
    $scope.personInfo = PersonInfoService.getPersoInfo();
    //修改医生信息
    $scope.editInfo = function (infoType) {
      console.log($scope.personInfo)
      $scope.inputInfo = {};
      $ionicPopup.show({
        template: '<input type="text" autofocus ng-model="inputInfo.data">',
        title: '修改个人信息',
        scope: $scope,
        buttons: [
          {
            text: '取消',
            onTap: function () {
            }
          },
          {
            text: '<b>保存</b>',
            type: 'button-positive',
            onTap: function (e) {
              console.log($scope.inputInfo.data)
              if ($scope.inputInfo.data) {
                $scope.personInfo[infoType] = $scope.inputInfo.data;
                /*  PersonInfoService.updateInfoOnServr({
                 data: $scope.inputInfo.data,
                 type: infoType
                 }).success(function (data) {//上传修改的内容到服务器
                 console.log(data.state);
                 });*/
              } else {
                alert('不能为空');
              }
            }
          }
        ]
      });
    };

    //更改头像
    $scope.changeAvatar = function () {
      var confirmPopup = $ionicPopup.confirm({
        title: '选择方式',
        cancelText: '拍照',
        okText: '相册'
      });
      confirmPopup.then(function (res) {
        if (res) {
          var options = {
            destinationType: 1,
            sourceType: 0
          };
          $cordovaCamera.getPicture(options).then(function (imageURI) {
            $scope.personInfo.imgUrl = imageURI;
            /*  PersonInfoService.updateInfoOnServr({data: imageURI, type: 'imgUrl'}).success(function (data) {//上传修改的内容到服务器
             console.log(data.state);
             });*/
          }, function (err) {
            // error
            alert('获取失败');
          });
        } else {
          var options_camera = {
            quality: 50,
            destinationType: 1,
            sourceType: 1,
            allowEdit: true,
            encodingType: 0,
            targetWidth: 100,
            targetHeight: 100,
            saveToPhotoAlbum: false,
            correctOrientation: true
          };
          $cordovaCamera.getPicture(options_camera).then(function (imageData) {
            $scope.personInfo.imgUrl = imageData;
            /*   PersonInfoService.updateInfoOnServr({data: imageData, type: 'imgUrl'}).success(function (data) {//上传修改的内容到服务器
             console.log(data.state);
             });*/
          }, function (err) {
            // error
            alert('获取失败');
          });
        }
      });
    };


    //离开界面时上传给服务器，并且本地修改
    $scope.$on('$ionicView.leave', function () {
      PersonInfoService.initPersonInfo($scope.personInfo);//更改个人信息
      console.log('我离开了');
      /* PersonInfoService.updateInfoOnServr().success(function (data) {//上传修改的内容到服务器
       console.log(data.state);
       });*/
    });


  })
  .controller('PatientListCtrl', function ($scope, $ionicLoading, $timeout, Patients, $http, $stateParams, $ionicHistory, $location, $state, UrlStore, $rootScope, HttpServices, DataStore, $cordovaSpinnerDialog) {
    //每次进入，向后台获取最新的列表
    console.log("$ionicView.loaded");
    console.log($location.path());
    if ($stateParams.listType == 1) {
      var i = 1;
      $scope.listTitle = "未接诊病人列表";
      $scope.NJZList_All = [];
      $scope.moreData = true;
      //获取所有的未接诊用户列表
      //1、判断是否有列表,如果有，则获取即可.....以后再用
      //向后台获取未接诊病人信息
      /* HttpServices.getNjzList_All(i).success(function (data) {
       if (data.code === '1') {
       //初始化未接诊列表
       DataStore.setNJZList_All(data.listData);
       $scope.NJZList_All = data.listData;
       } else {
       $scope.errorInfo = data.info;
       }
       }).error(function () {
       });*/
      //上拉加载，向后台获取列表
      $scope.loadMore = function () {
        console.log(i);
        HttpServices.getNjzList_All(i).success(function (data) {
          console.log(data.list)
          if (data.code == '1') {
            console.log(data.list)
            //初始化未接诊列表
            $scope.NJZList_All = $scope.NJZList_All.concat(data.list);
            DataStore.setNJZList_All($scope.NJZList_All);
            if (data.list.length < 5) {
              $scope.moreData = false;
            } else {
              $scope.moreData = true;
              i = i + 1;
            }
          } else {
            $scope.errorInfo = data.info;
            console.log(data.code);
            $scope.moreData = false;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).error(function () {
          $scope.moreData = false;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        }).finally(function () {
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
      }
    } else {
      $scope.listTitle = "已接诊病人列表";
      var num = 1;
      $scope.YJZList_All = [];
      $scope.moreData = true;
      //向后台获取已接诊病人信息
      //上拉加载，向后台获取列表
      $scope.loadMore = function () {
        HttpServices.getYjzList_All(num).success(function (data) {
          if (data.code == '1') {
            //初始化已接诊列表
            $scope.YJZList_All = $scope.YJZList_All.concat(data.list);
            DataStore.setYJZList_All($scope.YJZList_All);
          } else {
            $scope.moreData = false;
          }
          if (data.list.length < 5) {
            $scope.moreData = false;
          } else {
            $scope.moreData = true;
            num = num + 1;
          }
          $timeout(function () {
            $scope.$broadcast('scroll.infiniteScrollComplete');
          }, 500);
        }).error(function () {
          $scope.moreData = false;
          $scope.$broadcast('scroll.infiniteScrollComplete');
        })
      };
    }

    //去未接诊病人详情
    $scope.goToDetail = function (id, info) {
      $state.go('tab.nojiezhen-detail', {patientId: id, detail: info});
      //  $cordovaSpinnerDialog.show('加载中');
      /*  $ionicLoading.show({
       content: 'loading',
       animation: 'fade-in',
       showBackdrop: true,
       maxWidth: 200,
       showDelay: 0,
       template: '加载中'
       });*/
      /*      $http({
       url: UrlStore.queryCureUserInfoByAsk,
       method: 'get',
       params: {
       askId: id
       }
       }).success(function (data) {
       if (data.code == '1') {
       $state.go('tab.nojiezhen-detail', {patientId: id, detail: data});
       } else {
       alert('没有查到该病人详细信息');
       }
       $ionicLoading.hide();
       }).error(function (err) {
       alert(err);
       $ionicLoading.hide();
       });*/

    }
    //前往已接诊病人详情
    $scope.goToDetail_y = function (id, info) {
      $state.go('tab.yjz-detail', {patientId: id, detail: info});
      // $cordovaSpinnerDialog.show('加载中');
      /*      $ionicLoading.show({
       content: 'loading',
       animation: 'fade-in',
       showBackdrop: true,
       maxWidth: 200,
       showDelay: 0,
       template: '加载中'
       });
       $http({
       url: UrlStore.queryCureUserInfoByAsk,
       method: 'get',
       params: {
       askId: id
       }
       }).success(function (data) {
       if (data.code == '1') {
       $state.go('tab.yjz-detail', {patientId: id, detail: data});
       } else {
       alert('没有查到该病人基本信息');
       }
       $ionicLoading.hide();
       }).error(function () {
       $ionicLoading.hide();
       });*/
    }

    //$scope.patients = Patients.all();
    console.log($stateParams.listType);
  })
  .controller('YJZDetailCtrl', function ($scope, $stateParams, $rootScope, DataStore, getDetail, $ionicLoading) {
    $scope.patient = $stateParams.detail;
  })
  .controller('HuizhenCtrl', function ($scope, $ionicPopover, $state, $rootScope, $ionicLoading, $timeout, DataStore, videoCam, $stateParams, $ionicHistory, $ionicPopup, UrlStore, $http, PersonInfoService, $ionicModal, $ionicSlideBoxDelegate, UrlStore) {

    if ($stateParams.huizhenType == "1") {
      $scope.huizhenTitle = "会诊室"
      //保存病人信息
      console.log('我是会诊室');
      DataStore.setPatientInfo($stateParams.detail);
      console.log($scope.patientDetailInfo);
      console.log($stateParams.patientId);
      console.log($stateParams.detail);
    }
    //查询病人详细信息
    //获取病人信息
    $scope.patientDetailInfo = DataStore.getPatientInfo();
    console.log($scope.patientDetailInfo);
    /*会诊结果数据*/
    //诊治结果
    $scope.clientSideList = [
      {text: "适应症，可以急需治疗", value: "yes"},
      {text: "非适应症，建议继续检查", value: "reCheck"},
      {text: "禁忌症，无法治疗", value: "refuse"}
    ];
    /* $scope.choseValue = 'refuse';*/
    $scope.data = {
      choseValue: 'refuse'
    };
    //禁忌症列表
    $scope.jjzList = [
      {text: "脊柱结核、脊柱肿瘤、脊柱感染等病变者", checked: false},
      {text: "严重突出超过椎管容积50%、游离型椎间盘脱出者", checked: false},
      {text: "合并心、脑血管、肝、肾、造血系统、内分泌系统等严重原发性疾病及精神病患者", checked: false},
      {text: "腰椎间盘手术后有植入物者及先天性脊柱异常者", checked: false},
      {
        text: "孕妇及产褥期妇女;",
        checked: false
      },
      {text: "强直性脊柱炎及风湿性、类风湿性关节炎的患者", checked: false},
      {
        text: "有骨质疏松症的患者",
        checked: false
      }
    ];
    /*病变部位*/
    $scope.sickPlace = [{id: 1, text: 'T1/2', checked: false},
      {id: 2, text: 'T2/3', checked: false}, {
        id: 3,
        text: 'T3/4',
        checked: false
      }, {
        id: 4,
        text: 'T4/5',
        checked: false
      }, {id: 5, text: 'T5/6', checked: false},
      {id: 6, text: 'T6/7', checked: false}, {
        id: 7,
        text: 'T7/8',
        checked: false
      }, {id: 8, text: 'T9/10', checked: false}, {
        id: 9,
        text: 'T11/12',
        checked: false
      }, {id: 10, text: 'T12/L1', checked: false},
      {id: 11, text: 'L1/2', checked: false}, {
        id: 12,
        text: 'L2/3',
        checked: false
      },
      {id: 13, text: 'L3/4', checked: false},
      {
        id: 14,
        text: 'L4/5',
        checked: false
      },
      {id: 15, text: 'L5/S1', checked: false}
    ];
    // 大图io
    //$scope.aImages = $scope.patientDetailInfo.patietnInfo.X_Img;

    $ionicModal.fromTemplateUrl('showBigImg.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hardwareBackButtonClose: false
    }).then(function (modal) {
      $scope.modal = modal;
    });
    $scope.openModal = function () {
      // $scope.modal.show();
    };
    $scope.closeModal = function () {
      // $scope.modal.hide();
    };
    // Call this functions if you need to manually control the slides
    $scope.next = function () {
      $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function () {
      $ionicSlideBoxDelegate.previous();
    };
    $scope.goToSlide = function (index) {
      $scope.modal.show();
      $scope.myActiveSlide = index;
      // alert(typeof index);
      // $ionicSlideBoxDelegate.slide(index);
    }
    // Called each time the slide changes
    $scope.slideChanged = function (index) {
      $scope.slideIndex = index;
    };
    // 病变部位popover
    $ionicPopover.fromTemplateUrl('my-popover.html', {
      scope: $scope
    }).then(function (popover) {
      $scope.popover = popover;
    });
    $scope.sickPlaceChosed = '未选择';
    $scope.openSickPlacePop = function ($event) {
      $scope.sickPlaceChosed = '';
      $scope.popover.show($event);
    };
    $scope.myActiveSlide = 1;

    $scope.$on('popover.hidden', function () {
      // 执行代码
      for (var i = 0; i < $scope.sickPlace.length; i++) {
        var temp = $scope.sickPlace;
        if (temp[i].checked === true) {
          console.log(temp[i].text);
          if (i < temp.length) {
            $scope.sickPlaceChosed += temp[i].text + ',';
          } else {
            $scope.sickPlaceChosed += temp[i].text + '';
          }
        }
      }
      console.log($scope.sickPlaceChosed)
    });
    //病变偏向
    $scope.sickDir = '偏左';//默认值
    $scope.sickDirs = ['偏左', '偏右']
    //病变程度
    $scope.sickLevel = '轻';//默认值
    $scope.sickLevels = ['轻', '中', '重'];
    //转角方式
    $scope.ZJFS = '交替';//默认值
    $scope.ZJFSs = ['单向', '交替'];
    //冲击行程
    $scope.ciDistance_chosed = '0';
    $scope.ciDistance_all = ['-4', '-3', '-2', '-1', '0', '1', '2', '3', '4'];
    //成角
    $scope.ciAngulation_chosed = '0';
    $scope.ciAngulation_all = ['3', '2', '1', '0', '-1', '-2', '-3'];
    //转角
    $scope.ciCorner_chosed = '0';
    $scope.ciCorner_all = ['3', '2', '1', '0', '-1', '-2', '-3'];
    //提交结果

    $scope.submitHZResult = function () {
      //构建json串
      if ($scope.data.choseValue == "yes") {//医生选择为适应症
        $scope.HZResult = {
          status: '3',
          expertAdvice: '3',
          eci: {
            userId: localStorage.getItem('token'),
            askId: $rootScope.askId,
            illPart: $scope.sickPlaceChosed,
            illDeviation: $scope.sickDir,
            illDegree: $scope.sickLevel,
            cornerType: $scope.ZJFS,
            ciDistance: $scope.ciDistance_chosed,
            ciAngulation: $scope.ciAngulation_chosed,
            ciCorner: $scope.ciCorner_chosed
          },
          forbidReason: []
        }
      } else if ($scope.data.choseValue === "refuse") {//医生选择为拒绝治疗
        var tempArr = [];
        for (var i = 0; i < $scope.jjzList.length; i++) {
          var temp = $scope.jjzList;
          if (temp[i].checked == true) {
            tempArr.push(temp[i].text);
          }
        }
        $scope.HZResult = {
          expertAdvice: '1',
          status: '4',
          eci: {
            userId: localStorage.getItem('token'),
            askId: $rootScope.askId
          },
          forbidReason: tempArr.toString()
        }
      } else {
        $scope.HZResult = {
          expertAdvice: '2',
          status: '4',
          eci: {
            userId: localStorage.getItem('token'),
            askId: $rootScope.askId
          },
          forbidReason: []
        }
      }
      console.log($scope.HZResult);
      //设置等待动画
      $ionicLoading.show({
        content: 'loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0,
        template: '请等待，正在传输您的诊断结果'
      });
      // 数据发送成功后关闭等待，
      $http({
        url: UrlStore.expertAddCurePermeate,
        method: 'get',
        params: $scope.HZResult,
        timeout: 50000
      }).success(function (data) {
        $rootScope.getJF = 20;//设置此次获得的积分
        $rootScope.totalJF = '100';
        /*   $rootScope.totalJF = data.info.totalJF;//总共具有的积分
         //积分 余额 称号 等的获取
         PersonInfoService.setChangeAbleInfo({
         num: data.info.num,
         balance: data.info.balance,
         title: data.info.title,
         totalJF: data.info.totalJF,
         });*/
        /*  $rootScope.numberOfpatient_y = data.num;//人数
         $rootScope.balance = data.balance;//余额
         $rootScope.title = data.title;//当前称号*/
        $rootScope.ifJZ = false;
        //连接服务器，数据传输成功后返回home主界面
        $state.go('tab.jiezhen');
        //视频问诊设为禁止状态
        $rootScope.ifWZ = false;
        //隐藏病人信息显示界面
        $rootScope.showPatientInfo = false;
        //清空视图历史
        //$ionicHistory.removeBackView();
        //关闭视频
        videoCam.stopCam($rootScope.socket);
        var confirmPopup = $ionicPopup.confirm({
          title: '问诊完成',
          cssClass: 'confirm',
          template: '<div>恭喜您完成本次治疗，获得20功德点。</div>',
          // template: '<div>本次会诊完成，您获得{{getJF}}积分。</div><div>您当前总积分为<strong style="color: red;">{{totalJF}}</strong>，可用积分为<strong style="color: red;">{{totalJF}}</strong>.</div>',
          //templateUrl:'templates/finishWZ.html',
          // cancelText: '前往兑换积分',
          cancelText: '留在本页面',
          okText: '返回主页面'
        });
        $ionicLoading.hide();
        confirmPopup.then(function (res) {
          if (res) {
            $state.go('tab.home');
          }
          /*else {
           $state.go('tab.jiezhen');
           }*/
        });
        //重新启动监听器
        $rootScope.$emit('reopenTimer');
      }).error(function () {
        $ionicLoading.hide();
        alert('提交失败');
      })
    }
  })
  .controller('SysSetting', function ($scope) {
    $scope.noticationCheckd = true;
    console.log($scope.noticationCheckd);

  });
