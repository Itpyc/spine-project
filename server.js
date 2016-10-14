var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.get('/index', function (req, res) {
    console.log(req.query);//获取接受者id
    res.sendfile('index.html');
});
/*app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});*/
var romId = [];
io.on('connection', function (socket) {
    //console.log('a user connected');
  /*  socket.on('disconnect', function () {
        console.log('user disconnected');
    });*/
    socket.on('doctor connect', function (from,to,msg) {//医生连接成功
        //创建一个房间
        socket.join(to);//进入askId的room
        if (romId.indexOf(to) == -1) {//说明不存在该房间，则将房间号加入数组中
            console.log('新建房间')
            romId.push(to);
        }
        console.log(romId)
        console.log('医生进来了')
    });
    socket.on('patient connect', function (from, to, msg) {//病人连接成功.from来自哪个病人，即其askId，to去找哪个医生即医生userId
        //病人进入医生所在room
        console.log('病人进来了');
        console.log(romId);
        console.log(from);
        if (romId.indexOf(from) > -1) {//判断是否有此房间号,如果有则加入此房间
            //加入房间
            console.log('病人加入房间')
            socket.join(from);
        }
    });

    //结束通话，移除房间号
    socket.on('finishVideoTalk', function (data) {
        var index = romId.indexOf(data);
        romId.splice(index,1);
        console.log('结束通话');
        console.log(romId);
    });

    //接受方打开摄像头
    socket.on('videoOpen', function (from, to, msg) {//医生打开视频，应该通知病人即向to发送消息
        console.log(from + '来自' + to)
        console.log('对方打开video');
        socket.to(to).emit('accept');
    });
    //允许双方传递信令
    socket.on('message', function (from, to, message) {
        console.log(message + '----fuwuqi--------' + from);
        if (romId.indexOf(from) > -1) {
            socket.to(from).emit('message', from, to, message);
        } else if (romId.indexOf(to) > -1) {
            socket.to(to).emit('message', from, to, message);
        }
    });
});
app.set('port', process.env.PORT || 3000);
var server = http.listen(app.get('port'), function () {
    console.log('start at port:' + server.address().port);
});