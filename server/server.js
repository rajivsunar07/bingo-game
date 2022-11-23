require('./db/conn')
const express = require("express")
const app = express()
const http = require("http")
const { Server } = require("socket.io")
const cors = require('cors')
const bodyParser = require('body-parser')

const {create_room, join_room, player_ready, cross, bingo} = require('./controllers/room')

const {Room} = require('./models/room')

const { instrument } = require("@socket.io/admin-ui");
const player = require('./models/player')

app.use(cors)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', "https://admin.socket.io", 'http://192.168.1.69:3000'],
        credentials: true
    }
}) 

instrument(io, {
    auth: false
  });
/*
ids = {
    room : {
        type: 
        players: [
            { 
                id: string,
                name: stirng,
                ready: bool,
                turn: number
            }
        ]
    }
}
*/

let room_dict = {}

io.on("connection", socket => {

    socket.on('player_ready', async (room, cb) => player_ready(room, socket, io, cb))
    socket.on('cross', async (room, num, current_turn, cb) => cross(room, num, current_turn, io, cb))
    socket.on('bingo', (room, cb) => bingo(room, socket, io, cb))

    socket.on('join_room', (room, name, cb) => {
        join_room(room, false, {id: socket.id, name: name}, socket, cb)
      
    })
    socket.on('create_room', (name, cb) => create_room({id:socket.id, name:name}, socket, io, cb))
    socket.on('random_room', async (cb) => join_room('', true, {id: socket.id, name: ''}, socket, io, cb))
    socket.on('append_player', async (room, name, cb) => join_room(room, false, {id: socket.id, name:name}, socket, io, cb))
})

server.listen(3001, '0.0.0.0',  () => {
    console.log('Server is running');
})