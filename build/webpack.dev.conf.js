'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const { log } = require('console')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

// 搭建一个socket.io服务
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, { origins: '*:*'});
console.log("服务已启动");

let roomInfo = {}

io.on('connection', socket => {

  //加入房间
  socket.on("joinRoom", function (data, fn) {
      socket.join(data.roomId); // join(房间名)加入房间

      if (!roomInfo[data.roomId]){  
        roomInfo[data.roomId] = []  //为新房间分配空间
      } 

      //如果房间人数大于2了，不让加入
      if(roomInfo[data.roomId].length == 2){
         socket.emit("full",{"roomId": data.roomId})
      }
      else {
          //如果房间为空，则回调给房主权限，否则为房客权限
          fn({"permission": roomInfo[data.roomId].length === 0 ? 1 : 0, "roomId": data.roomId})
          //将玩家名字放入房间数组
          roomInfo[data.roomId].push(data.playerName)

          console.log(data.playerName + "加入了房间" + data.roomId)
          console.log("当前房间内总人数为：",roomInfo[data.roomId].length)
          console.log(roomInfo)
          }

          //当房客加入房间时，将房内双方信息发送给两人
          if(roomInfo[data.roomId].length == 2){

            //发送给房客
            socket.emit("findmate", 
                //房主是数组中第一个值，房客是第二个                
                {"holder": roomInfo[data.roomId][0],"unholder": roomInfo[data.roomId][1]}
            )
            //发送给房主
            socket.in(data.roomId).emit("findmate",               
                {"holder": roomInfo[data.roomId][0],"unholder": roomInfo[data.roomId][1]}  
            )
        }
    
  });
  //退出房间
  socket.on("leaveRoom", function(data) {
      
      //房主退出房间事件：发送信息让房间内所有客户端断开
      if(data.power == 1){

          //让其他人先离开
          socket.to(data.roomId).emit("quit",{"power":data.power}) 
          console.log("所有人都被请出了房间")

          //自己离开
          socket.emit("quit",{"power":data.power})                 
          console.log("房主退出了房间" + data.roomId)

          //清空房间数组中所有玩家信息
          while(roomInfo[data.roomId].length>0){             
              roomInfo[data.roomId].pop()     
          }
      }

      //房客退出房间事件
      else {
          //发送信息让自己离开
          socket.emit("quit",{"power":data.power})

          //清除房客个人信息
          var index = roomInfo[data.roomId].indexOf(data.playerName);
          if (index !== -1) {
            roomInfo[data.roomId].splice(index, 1);
          } 

          //发送消息告诉房主
          socket.to(data.roomId).emit("memberleave")
      }
      
      socket.leave(data.roomId)
      //console.log("当前房间内总人数为：",roomInfo[data.roomId].length)
      console.log(roomInfo)
      
  });

    //接收房主更改时间的命令并同步给房客
    socket.on("changeTime", data => {
        socket.to(data.roomId).emit("changeT",{"newTime": data.limitTime})
    });

    //接受房主更改难度的命令并同步给房客
    socket.on("changeLevel", data => {
        socket.to(data.roomId).emit("changeL", {"mode": data.mode})
    });

    //开始游戏
    socket.on("startGame", data => {
      socket.to(data.roomId).emit("start")
      socket.emit("start")
      console.log("游戏开始！")
  });

    //接受A对分数的更新并同步给B
  socket.on("newscore", data => {
      socket.to(data.roomId).emit("updatescore",{"updatescore":data.score})
  });

    //接收来自A的消息并传给B
    socket.on("send", (data,fn) => {
      socket.to(data.roomId).emit("partnerMsg",{"msg": data.msg})
      fn("已发送")
      console.log("成功传递一条消息..")
  });

    //接受A完成了大的消块并返回给B接受对应惩罚
  socket.on("scorechange", data => {
      if(data.score > 4) {
          //返回另一个人合成128的惩罚
          console.log("触发了128块惩罚");
          socket.to(data.roomId).emit("score64", {'score': data.score})
      }
  });

    //游戏结束后用户自动退房
  socket.on("gameover", data => {

    //清除用户个人信息
    var index = roomInfo[data.roomId].indexOf(data.playerName);
    if (index !== -1) {
      roomInfo[data.roomId].splice(index, 1);
    } 
    //连接断开
    console.log("连接已断开");
    socket.leave(data.roomId)
    console.log(roomInfo)
  })

})

http.listen(8081)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
