angular.module('starter.services', [])
  .factory('UrlStore', function () {
    var baseUrl = "http://192.168.0.133:8080/";
    return {
      checkTokenUrl: 'http://192.168.0.21:1000/checkToken',
      loginUrl: baseUrl+'expertLogin.action',
      NJZList_5: 'http://192.168.0.21:1000/NJZList_5',
      YJZList: 'http://192.168.0.21:1000/YJZList',
      NJZList_All: 'http://192.168.0.21:1000/NJZList_All',
      checkRequestId: 'http://192.168.0.21:1000/checkReq',
      listDetail: 'http://192.168.0.21:1000/listDetail',
      huizhenResult: 'http://192.168.0.21:1000/huizhenResult',
      listDetail_y: 'http://192.168.0.21:1000/listDetail',
      updatePersonInfo: 'http://192.168.0.21:1000/updatePersonInfo',
      queryAskInfo: baseUrl+'/queryAskInfo.action',//查询申请接诊信息
      queryAskList: baseUrl + 'queryAskList.action',//查询列表
      queryIndexTableData: baseUrl + 'queryIndexTableData.action',//首页图表
      expertAddCurePermeate: baseUrl + 'expertAddCurePermeate.action',//专家提交治疗参数，
      expertUpdateAskStatus: baseUrl + 'expertUpdateAskStatus.action',//专家修改接诊请求。参数:userId-专家ID，askId-请求诊断对象ID，status-要修改的状态，expertAdvice-建议代码
      queryCureUserInfoByAsk: baseUrl + 'queryCureUserInfoByAsk.action'
    }
  })
  .factory('Patients', function ($ionicLoading, $http, UrlStore) {
    // Might use a resource here that returns a JSON array
    // Some fake testing data
    var patients = [{
      id: 0,
      name: '医生1',
      lastText: '病人1，身高180cm',
      face: 'img/ben.png'
    }, {
      id: 0,
      name: '医生1',
      lastText: '病人1，身高180cm',
      face: 'img/ben.png'
    }, {
      id: 0,
      name: '医生1',
      lastText: '病人1，身高180cm',
      face: 'img/ben.png'
    }, {
      id: 0,
      name: '医生1',
      lastText: '病人1，身高180cm',
      face: 'img/ben.png'
    }, {
      id: 0,
      name: '医生1',
      lastText: '病人1，身高180cm',
      face: 'img/ben.png'
    }];
    //未接诊的5个病人
    var NJZList_5;


    return {
      all: function () {
        return patients;
      },
      remove: function (patient) {
        patients.splice(patients.indexOf(patient), 1);
      },
      get: function (patientId) {
        for (var i = 0; i < patients.length; i++) {
          if (patients[i].id === parseInt(patientId)) {
            return patients[i];
          }
        }
        return null;
      },
      getNJZList: function ($scope, type) {
        console.log(this);
        var url = (type == 1) ? UrlStore.NJZList_5 : UrlStore.NJZList_All;
        $http({
          method: 'get',
          url: url,
          params: {
            token: localStorage.getItem('token')
          }
        }).success(function (data, status) {
          //console.log(this);
          //NJZList_5 =data;
          if (data.state === 'ok') {
            if (type == 1) {
              $scope.NJZList_5 = data.listData;
            } else {
              $scope.NJZList_All = data.listData;
            }
          } else {
            $scope.errorInfo = data.info;
          }
        }).error(function (err) {
          console.log(err);
        });
      }

    };
  })
  .factory('HttpServices', function ($http, UrlStore) {
    return {
      getNjzList_5: function () {
        return $http({
          method: 'get',
          url: UrlStore.queryAskList,
          params: {
            userId: localStorage.getItem('token'),
            num: 1,
            type: 0
          }
        });
      },
      getNjzList_All: function (num) {
        return $http({
          method: 'get',
          url: UrlStore.queryAskList,
          params: {
            userId: localStorage.getItem('token'),
            num: num,
            type: 0
          }
        });
      },
      getYjzList_All: function (num) {
        return $http({
          method: 'get',
          url: UrlStore.queryAskList,
          params: {
            userId: localStorage.getItem('token'),
            num: num,
            type: 4
          }
        });
      },
      //获取列表的详情，根据ID获取？
      getListDetail: function (id) {
        return $http({
          url: UrlStore.listDetail,
          method: 'get',
          params: {
            token: localStorage.getItem('token'),
            id: id
          }
        });
      },
      login: function () {

      },
      checkToken: function () {

      },
      submitHZResult: function (config) {
      }

    }
  })
  .factory('DataStore', function () {
    var NjzList_5 = [];
    var NjList_all = [];
    var YjList_all = [];
    var patientInfo = {};
    return {
      setPatientInfo: function (data) {
        patientInfo = data;
        console.log(patientInfo)
      },
      getPatientInfo: function () {
        console.log('**************');
        console.log(patientInfo)
        return patientInfo;
      },
      setNJZList_5: function (data) {
        console.log(data)
        NjzList_5 = data;
      },
      getNJZList_5: function () {
        return NjzList_5;
      },
      updateN_5: function (info) {
        if (NjList_all.length > 1) {
          info.id += NjList_all.length;
        } else {
          info.id += NjzList_5.length;
        }
        if (NjzList_5.length >= 5) {
          NjzList_5.shift();
          NjzList_5.push(info);
        } else {
          NjzList_5.push(info);
        }
        console.log(NjzList_5);

        return NjzList_5;
      },
      setNJZList_All: function (data) {
        console.log(data);
        NjList_all = data;
      },
      getNJZList_All: function () {
        return NjList_all;
      },
      updateN_All: function (info) {
        info.id += NjList_all.length;
        return NjList_all.push(info);
      },
      setYJZList_All: function (data) {
        console.log(data)
        YjList_all = data;
      },
      getYJZList_All: function () {
        return YjList_all;
      },
      updateY_All: function (info) {
        info.id += YjList_all.length;
        return YjList_all.push(info);
      },
    }
  })
  .directive('showTabs', function ($rootScope) {
    return {
      restrict: 'A',
      link: function () {
        $rootScope.hideTabs = false;
      }
    }
  })
  .directive('hideTabs', function ($rootScope) {
    return {
      restrict: 'A',
      link: function (scope, element, attributes) {
        scope.$on('$ionicView.beforeEnter', function () {
          scope.$watch(attributes.hideTabs, function (value) {
            $rootScope.hideTabs = value;
          });
        });
        scope.$on('$ionicView.beforeLeave', function () {
          $rootScope.hideTabs = false;
        });
      }
    }
  })
  .factory('videoCam', function ($ionicLoading, $rootScope, $cordovaToast, $cordovaCapture) {
    //医生是做为接受请求方的
    //通话基本流程
    //专家接受会诊请求，进入到接诊界面。通知病人专家已经接诊，然后就会打开视频通话开始界面，等待专家。当其进入视频问诊界面时，会打开本地视频
    //本地视频打开成功后，通知病人专家这边的视频流已经准备好。病人接受到通知后发送offer请求。专家接收到offer请求后，将其存入本地，并且回复一个
    //answer。
    //然后就开始相互交换信令相互通信了。
    var videoStream;
    var pc1;
    var iceServer = {
      "iceServers": [{
        "url": "stun:stun.l.google.com:19302"
      }, {
        "url": "turn:numb.viagenie.ca",
        "username": "webrtc@live.com",
        "credential": "muazkh"
      }]
    };
    return {
      startCam: function (socket, localVideo, remoteVideo) {
        $ionicLoading.show({
          template: '请稍等，正在为您开启视频'
        });
        var pc;
        var userId = localStorage.getItem('token');
        var askId = $rootScope.askId;
        // 发送offer和answer的函数，发送本地session描述
        var sendOfferFn = function (desc) {
            pc.setLocalDescription(desc);
            socket.emit('message', userId, askId, JSON.stringify({
              "event": "_offer",
              "data": {
                "sdp": desc
              }
            }));
          },
          sendAnswerFn = function (desc) {
            pc.setLocalDescription(desc);
            socket.emit('message', userId, askId, JSON.stringify({
              "event": "_answer",
              "data": {
                "sdp": desc
              }
            }));
          };
       // var start = function (isCaller) {
          pc = new webkitRTCPeerConnection(iceServer);
          console.log(pc);
          console.log(remoteVideo);
          //接受到cilent A发来的cand
          pc.onicecandidate = function (event) {
            // alert(event.cancelable)
            console.log(event.candidate + '----onicecandidate-----接受道德信息')
            if (event.candidate !== null) {
              socket.emit('message', userId, askId, JSON.stringify({
                "event": "_ice_candidate",
                "data": {
                  "candidate": event.candidate
                }
              }));
            }
          };
          // 如果检测到媒体流连接到本地，将其绑定到一个video标签上输出
          pc.onaddstream = function (event) {
            /* $scope.text = event.stream;*/
            console.log(event.stream + '----检测到媒体流');
            if (window.URL) {
              remoteVideo.src = window.URL.createObjectURL(event.stream);
            } else {
              remoteVideo.src = event.stream;
            }
            remoteVideo.autoplay = true;
            // $ionicLoading.hide();
            // remoteVideo = $rootScope.remoteVideoUrl;
            // console.log($rootScope.localVideo);
            // $rootScope.remoteVideoStream = event.stream;
            //console.log($rootScope.remoteVideoUrl)
            videoStream = event.stream;
            $ionicLoading.hide();
          };
          // 2、获取本地音频和视频流，并将其加入pc中
          navigator.getUserMedia ||
          (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
          navigator.getUserMedia({
            audio: true,
            video: true
          }, function (stream) {
            //绑定本地媒体流到video标签用于输出
         /* if (window.URL) {
              localVideo.src = window.URL.createObjectURL(stream);
            } else {
              localVideo.src = stream;
            }
            localVideo.src = URL.createObjectURL(stream);
            localVideo.autoplay = true;*/
            //向PeerConnection中加入需要发送的流
            pc.addStream(stream);
            socket.emit('videoOpen', userId, askId, '视频已经打开');//通知病人已经打开视频，可以进行信令交换
            //做为应答方，在视频准备好之后，发送一个answer
         /*   if (!isCaller) {
              pc.createAnswer(sendAnswerFn, function (error) {
                console.log('Failure callback: ' + error);
              });
            } else {
              pc.createOffer(sendOfferFn);
            }*/
            console.log(stream + '----' + localVideo + '-----' + pc);
            // videoStream = stream;
          }, function (error) {
            //处理媒体流创建失败错误
            alert('getUserMedia error: ' + error);
          });
          pc1 = pc;
        //}

        // console.log($ionicLoading)
        /***************响应视频请求过程********************/
        //通知服务器，视频界面已经打开，可以进行通话
        //1、创建一个pc
        //3、来自接收者的消息，创建ice_Candiate
        socket.on('message', function (from, to, data) {
         /* if (!pc) {//如果pc创建失败
            start(false);
          }*/
          var json = JSON.parse(data);
         //如果是来自于病人的offer，则回复一个answer
        /*  if(from == $rootScope.askId&&json.event === "_offer"){
            alert('来自于病人的offer');
          }
*/
          console.log(data + "来自于服务器");
          console.log('onmessage: ', json);
          //如果是一个ICE的候选，则将其加入到PeerConnection中，否则设定对方的session描述为传递过来的描述
          if (json.event === "_ice_candidate") {
            console.log('我是一个ice候选者++++++++++++++++++++++' + 'dddddd' + json.data.candidate);
            console.log(pc);
            pc.addIceCandidate(new RTCIceCandidate(json.data.candidate));
          } else if (json.event === "_offer") {//ClientB接收到ClientA发送过的offer SDP对象，通过PeerConnection的SetRemoteDescription方法将其保存起来
            pc.setRemoteDescription(new RTCSessionDescription(json.data.sdp));
            pc.createAnswer(sendAnswerFn, function (error) {
              console.log('Failure callback: ' + error);
            });
          }
        });
        //2秒后关闭
        setTimeout(function () {
          $ionicLoading.hide();
        }, 5000)
      },
      stopCam: function (socket) {
        //$rootScope.remoteVideoUrl = '';
        //socket1.disconnect();
        //关闭监听
        socket.removeAllListeners('message');
        socket.disconnect();
        console.log(videoStream);
       /* if (pc1) {
          console.log(pc1)
          pc1.removeStream(videoStream);
          pc1.close();
          console.log(pc1);
        }*/
        //通知服务器关闭视频通话
        // socket.emit('finishVideoTalk')

      }
    };
  })
  .factory('Authorize', function ($http, UrlStore, $ionicLoading, $state, $cordovaToast, $cordovaActionSheet, PersonInfoService) {
    var options = {
      title: '退出登录',
      buttonLabels: ['退出应用', '注销登录'],
      addCancelButtonWithLabel: '取消',
      androidEnableCancelButton: true,
      winphoneEnableCancelButton: true
    };
    return {
      uid: '',
      token: '',
      userName: '',
      password: '',
      logout: function () {
        //退出时保存
        $cordovaActionSheet.show(options)
          .then(function (btnIndex) {
            var index = btnIndex;
            if (index === 1) {
              ionic.Platform.exitApp();
              //退出时保存专家个人信息
              PersonInfoService.storeInfo();
            } else if (index === 2) {
              this.uid = '';
              this.token = '';
              localStorage.removeItem('authorize.uid');
              localStorage.removeItem('token');
              $state.go('login');
            }
          });
      },
      login: function (params) {
        $ionicLoading.show({
          content: 'loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0,
          template: '<ion-spinner icon="circles" class="spinner-calm"></ion-spinner><div>登录中，请稍候</div>'
        });
        $http({
          method: 'get',
          url: UrlStore.loginUrl,
          timeout: 5000,
          params: {
            loginName: params.username,
            password: params.password
          }
        })
          .success(function (data) {
           // alert(JSON.stringify(data))
            if (data.code == "1") {
              //如果登录成功，将token保存到本地存储中
              localStorage.setItem('token', data.user.id);
              //登录后，获取并保存专家用户的个人信息
              PersonInfoService.initPersonInfo(data.user);
              //localStorage.setItem('personInfo', JSON.stringify(data.personInfo));
              this.token = data.user.id;
              this.userName = params.username;
              this.password = params.password;
              setTimeout(function () {
                $ionicLoading.hide();
              }, 1000)
              $state.go('tab.home');
            } else {
              $cordovaToast.showLongBottom('登录失败' + data.msg);
              setTimeout(function () {
                $ionicLoading.hide();
              }, 1000)
              //如果验证失败，toast失败原因
              // console.log(data.res);
            }
          })
          .error(function (error) {
            $ionicLoading.hide();
            $cordovaToast.showLongBottom('登录失败，请检查网络');
          })
      },
      setUserInfo: function (params) {
        this.userName = params.username;
        this.password = params.password;
      }
    }
  })
  .factory('HTTPSERVICES', function ($http, Authorize, $state, UrlStore, $cordovaToast) {
    return {
      login: function (config) {

      },
      checkToken: function (token, path, event) {
        /*  var check = */
        if (!token) {//如果token不存在,跳转到登录界面
          $state.go('login');
        } else {
          $http(
            {
              method: 'GET',
              url: UrlStore.checkTokenUrl,
              params: {
                token: token
              }
            }).success(function (data, status) {
            console.log(data);
            console.log(status);
            /*if (!path) {
             path = 'tab.home';
             }*/
            if (data.res === 'ok') {//如果token检查通过
              //  Authorize.token = token;
              $state.go(path);
            } else {//如果没有检查通过，跳转到登录页面
              if (event) {
                event.preventDefault();
              }
              $state.go('login', {w: data.res});
              $cordovaToast.showLongBottom('登录已过期，请重新登录');
            }
          });


        }
      }
    }
  })
  .factory('AuthInjector', function ($q, Authorize, $injector) {
    return {
      request: function (req) {
        console.log(req);
        req.params = req.params || {};
        if (Authorize.token) {
          req.params.token = Authorize.token;
        }
        return req;
      },
      requestError: function (error) {
      },
      responseError: function (error) {
        console.log(error)
      }
    }
  })
  .factory('PersonInfoService', function ($http, UrlStore) {
    if (localStorage.getItem('personInfo') === "undefined") {
      var info = {};
    } else {
      var info = JSON.parse(localStorage.getItem('personInfo'));
    }
    /*var info = localStorage.getItem('token');
     console.log('########################')
     console.log(info)*/
    return {
      //用户登录成功后获取，会从后台获取其个人信息，
      initPersonInfo: function (personInfo) {
        info = personInfo;
        console.log(info)
        /* $http({
         url:'',
         method:'get',
         params:{
         token:localStorage.getItem('token')
         }
         }).success(function (data) {
         info=data.info;
         }).error(function () {

         })*/
      },
      storeInfo: function () {
        localStorage.setItem('personInfo', JSON.stringify(info));
        //alert(localStorage.getItem('personInfo'))
      },
      getPersoInfo: function () {
        return info;
      },
      setChangeAbleInfo: function (changeInfo) {
        info.changeInfo = changeInfo;
      },
      getChangeAbleInfo: function () {
        return info.changeInfo;
      },
      clearInfo: function () {
        info = {};
      },
      updateInfoOnServr: function (config) {
        return $http({
          url: UrlStore.updatePersonInfo,
          method: 'get',
          params: {
            token: localStorage.getItem('token'),
            data: config.data,
            type: config.type
          }
        });
      }

    }


  })
  .factory('ChartConfig', function ($http) {
    return {
      chartConfig_column: function (data) {
        return {
          options: {
            //This is the Main Highcharts chart config. Any Highchart options are valid here.
            //will be overriden by values specified below.
            chart: {
              type: 'column'
            },
            plotOptions: {
              series: {
                dataLabels: {
                  enabled: true
                }
              }
            }
          },
          title: {
            text: '年龄分布'
          },
          subtitle: {
            text: '统计数据来源斯邦医疗'
          },
          xAxis: {
            categories: [
              '0-30',
              '30-40',
              '40-50',
              '50-60',
              '60以上'
            ],
            crosshair: true
          },
          yAxis: {
            min: 0,
            title: {
              text: '治疗人数'
            }
          },
          series: [{
            name: '人数',
            data: data
          }]
        }
      },
      chartConfig_pie: function (data) {
        return {
          options: {
            chart: {
              type: 'pie'
            },
            plotOptions: {
              pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                  enabled: true,
                  format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                  style: {
                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                  }
                }
              }
            },
          },
          title: {
            text: '已治疗病人地区分布'
          },
          subtitle: {
            text: '统计数据来源斯邦医疗'
          },
          tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
          },
          series: [{
            type: 'pie',
            name: '地区分布',
            data: data
          }]
        }
      }

    }
  });

