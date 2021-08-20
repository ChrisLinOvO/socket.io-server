const express = require('express')
const app = express()

//將 express 放進 http 中開啟 Server 的 3000 port ，正確開啟後會在 console 中印出訊息
const server = require('http').Server(app)
    .listen(3333, () => { console.log('open server!') })

//將啟動的 Server 送給 socket.io 處理
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
})

/*上方為此寫法的簡寫：
  const socket = require('socket.io')
  const io = socket(server)
*/

//監聽 Server 連線後的所有事件，並捕捉事件 socket 執行
io.on('connection', socket => {

    socket.on('addRoom', room => {
        // socket.join(room)
        //發送給在同一個 room 中除了自己外的 Client
        //socket.to(room).emit('addRoom', '已有新人加入聊天室！')
        //發送給在 room 中所有的 Client
        // io.sockets.in(room).emit('addRoom', '已有新人加入聊天室！')

        //將值取出來，尋找預設 id 外的值就能取到 join 的 id,加入前檢查是否已有所在房間
        const nowRoom = Object.keys(socket.rooms).find(room => {
            return room !== socket.id
        })
        //有的話要先離開
        if (nowRoom) {
            socket.leave(nowRoom)
        }
        //再加入新的
        socket.join(room)
        io.sockets.in(room).emit('addRoom', '已有新人加入聊天室！')
    })


    /*只回傳給發送訊息的 client*/
    socket.on('getMessage', message => {
        socket.emit('getMessage', message)
    })

    /*回傳給所有連結著的 client*/
    socket.on('getMessageAll', message => {
        io.sockets.emit('getMessageAll', message)
    })

    /*回傳給除了發送者外所有連結著的 client*/
    socket.on('getMessageLess', message => {
        socket.broadcast.emit('getMessageLess', message)
    })

    /*回傳給和發送者相同房間的 client*/
    socket.on('getMessageRoom', message => {
    
        const rooms = socket.rooms

        //將值取出來，尋找預設 id 外的值就能取到 join 的 id
  
        let roomRes = Array.from(rooms).find(room => {
            // console.log(room)
            // console.log(socket.id)
            return room == socket.id
        })
     

       
        io.sockets.in(roomRes).emit('getMessageRoom', message)
    })
})


