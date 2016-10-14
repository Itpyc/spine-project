// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'highcharts-ng'])
  .run(function ($ionicPlatform, $rootScope, $state, $cordovaToast, $cordovaKeyboard, $ionicHistory, $location, $ionicPopup, $cordovaSplashscreen, $cordovaLocalNotification, $cordovaNetwork, PersonInfoService) {
    /*  $rootScope.ifJZ = true;
     $rootScope.localVideo = '';
     $rootScope.remoteVideo = '';*/
    /* var token = localStorage.getItem('token');
     console.log(token);*/
    //检查token合法性
    /* if (token && !$rootScope.offlineState) {
     HTTPSERVICES.checkToken(token, 'tab.home');
     } else {
     $state.go('login', {w: '未登录'});
     }*/
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      $cordovaSplashscreen.hide();
    });
    /* if (!localStorage.getItem('token')) {
     $state.go('login');
     alert('dddd');
     }*/
    //监听网络状态
    $rootScope.$on('$cordovaNetwork:offline', function (event, networkState) {
      $rootScope.offlineState = true;
      //$cordovaToast.showLongBottom('网络未连接');
    });
    $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
      $rootScope.offlineState = false;
      //$cordovaToast.showLongBottom('网络未连接');
    });
    //物理返回按钮控制&双击退出应用
    //之前出现的问题，写了一个service，绑定了registerBackButtonAction，造成冲突
    $ionicPlatform.registerBackButtonAction(function (e) {
      //当医生选择接诊后，无法进行后退操作，必须提交结果后方可。
      if ($location.path() == '/tab/jiezhen/1') {
        $ionicPopup.alert({
          title: '无法离开',
          template: '您未提交诊断结果，无法离开此页面！'
        })
      } else if ($location.path() == '/tab/home' || $location.path() == '/tab/jiezhen' || $location.path() == '/login' || $location.path() == '/tab/settings') {
        if ($rootScope.backButtonPressedOnceToExit) {
          //退出程序时保存
          var personInfo = PersonInfoService.getPersoInfo();
          localStorage.setItem('personInfo', JSON.stringify(personInfo));
          ionic.Platform.exitApp();
        } else {
          $rootScope.backButtonPressedOnceToExit = true;
          $cordovaToast.showShortBottom('再按一次退出系统');
          setTimeout(function () {
            $rootScope.backButtonPressedOnceToExit = false;
          }, 2000);
        }
      } else if ($ionicHistory.backView()) {
        if ($cordovaKeyboard.isVisible()) {
          $cordovaKeyboard.close();
        } else {
          $ionicHistory.goBack();
        }
      } else {
        $rootScope.backButtonPressedOnceToExit = true;
        $cordovaToast.showShortBottom('再按一次退出系统');
        setTimeout(function () {
          $rootScope.backButtonPressedOnceToExit = false;
        }, 2000);
      }
      e.preventDefault();
      return false;
    }, 101);
    //监测页面跳转状态
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      //进入jiezhen界面时，需要判断是否已经选择了接诊，如果选择了则进入会诊界面
      console.log("从视图" + fromState.name + "跳转到视图" + toState.name);
      if (toState.name == 'login') return; // 如果是进入登录界面则允许
      if (!localStorage.getItem('token')) {
        event.preventDefault(); // 取消默认跳转行为
        $state.go("login"); //跳转到登录界面
      }
    });
    //监听用户点击通知事件
    $rootScope.$on('$cordovaLocalNotification:click',
      function (event, notification, state) {
        //$cordovaToast.showLongBottom(event+'         '+notification+'      '+state);
        $state.go('tab.jiezhen');
      });
  })
  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $ionicConfigProvider.views.maxCache(6);
    // $httpProvider.interceptors.push('AuthInjector');
    // note that you can also chain configs
    $ionicConfigProvider.tabs.position("bottom");
    $stateProvider
    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        controller: 'TabCtrl'
      })
      // Each tab has its own nav history stack:
      .state('tab.home', {
        url: '/home',
        views: {
          'tab-home': {
            templateUrl: 'templates/tab-home.html',
            controller: 'HomeCtrl'
          }
        },
        onEnter: function ($ionicLoading) {
          /* $ionicLoading.show({
           });
           setTimeout(function () {
           $ionicLoading.hide();
           },300)*/
          console.log('我已经进入')
        },
        onExit: function ($rootScope) {
          //$rootScope.NJZList_5 = [];
        }
      })
      .state('tab.jiezhen', {
        url: '/jiezhen',
        views: {
          'tab-jiezhen': {
            templateUrl: 'templates/tab-jiezhen.html',
            controller: 'JiezhenCtrl'
          }
        }
      })
      .state('tab.huizhen', {
        url: '/jiezhen/:huizhenType',
        views: {
          'tab-jiezhen': {
            templateUrl: 'templates/huizhen.html',
            controller: 'HuizhenCtrl'
          }
        },
        params: {'patientId': '',detail:{}},
      })
      .state('tab.nojiezhen-detail', {
        url: '/home/1/:patientId',
        views: {
          'tab-home': {
            templateUrl: 'templates/nojiezhen-detail.html',
            controller: 'NjiezhenDetailCtrl'
          }
        },
        params:{
          detail:{}
        }
      })
      .state('tab.yjz-detail', {
        url: '/home/2/:patientId',
        views: {
          'tab-home': {
            templateUrl: 'templates/yjz-detail.html',
            controller: 'YJZDetailCtrl'
          }
        },
        params:{
          detail:{}
        }
      })
      .state('tab.wenzhen', {
        url: '/wenzhen',
        views: {
          'tab-wenzhen': {
            templateUrl: 'templates/tab-wenzhen.html',
            controller: 'WenzhenCtrl'
          }
        }
      })
      .state('tab.settings', {
        url: '/settings',
        views: {
          'tab-settings': {
            templateUrl: 'templates/tab-settings.html',
            controller: 'SettingsCtrl'
          }
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      .state('tab.list', {
        url: '/home/:listType',
        views: {
          'tab-home': {
            templateUrl: 'templates/patient-list.html',
            controller: 'PatientListCtrl'
          }
        }
      })
      .state('tab.patientManage', {
        url: '/settings/patientManage',
        views: {
          'tab-settings': {
            templateUrl: 'templates/settings/patientManage.html',
            controller: 'SettingsCtrl'
          }
        }
      })
      .state('tab.jifen', {
        url: '/settings/jifen',
        views: {
          'tab-settings': {
            templateUrl: 'templates/settings/jifen.html',
            controller: 'SettingsCtrl'
          }
        }
      })
      .state('tab.aboutUs', {
        url: '/settings/aboutUs',
        views: {
          'tab-settings': {
            templateUrl: 'templates/settings/aboutUs.html',
            controller: 'SettingsCtrl'
          }
        }
      })
      .state('tab.feedback', {
        url: '/settings/feedback',
        views: {
          'tab-settings': {
            templateUrl: 'templates/settings/feedback.html',
            controller: 'SettingsCtrl'
          }
        }
      })
      .state('tab.help', {
        url: '/settings/help',
        views: {
          'tab-settings': {
            templateUrl: 'templates/settings/help.html',
            controller: 'SettingsCtrl'
          }
        }
      })
      .state('tab.personInfo', {
        url: '/settings/personInfo',
        views: {
          'tab-settings': {
            templateUrl: 'templates/settings/personInfo.html',
            controller: 'PersonInfoCtrl'
          }
        }
      })
      .state('tab.sysSetting', {
        url: '/settings/sysSetting',
        views: {
          'tab-settings': {
            templateUrl: 'templates/settings/sysSetting.html',
            controller: 'SysSetting'
          }
        }
      })
    ;

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('tab/home');

  });
