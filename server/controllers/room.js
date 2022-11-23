

const { v4 } = require('uuid')
const Room = require('../models/room')
const Player = require('../models/player')
const mongoose = require('mongoose')
const player = require('../models/player')
const { $where } = require('../models/room')
const { Socket } = require('socket.io')



exports.create_room = async (player_data, socket, io, cb) => {
    const room = v4()
    while (true) {
        const r = await Room.findOne({ room_id: room })
        if (r == null) {
            const newPlayer = new Player({
                _id: mongoose.Types.ObjectId(),
                player_id: player_data['id'],
                name: player_data['name'],
                turn: 1
            })
            await newPlayer.save()
            console.log('newplayer', newPlayer);
            const newRoom = new Room({
                room_id: room,
                room_type: "private",
                players: [newPlayer]
            })
            await newRoom.save()
            socket.join(room)
            io.sockets.in(room).emit('room_joined', [newPlayer]);
            // socket.to(room).emit("room_joined", newPlayer)
            break


        } else {
            room = v4()
        }
    }
    cb(room)

}

exports.join_room = async (room, random, player_data, socket, io, cb) => {
    if (!random) {
        const all_rooms = await Room.findOne({ room_id: room }).populate('players')
        if (all_rooms == null) cb({ success: false, message: 'Room does not exist' })
        else {
            const player = new Player({
                _id: mongoose.Types.ObjectId(),
                player_id: player_data['id'],
                name: player_data['name'],
                ready: false,
                turn: all_rooms['players'][all_rooms['players'].length - 1]['turn'] + 1
            })
            await player.save()

            await Room.updateOne({ room_id: room }, { $push: { players: player } })

            const players = await Room.findOne({ room_id: room }).populate('players')
            socket.join(room)

            io.sockets.in(room).emit('room_joined', players['players']);
            cb({ success: true, message: 'Added to room', room: all_rooms['room_id'] })
        }
    } else if (room == "") {
        const all_rooms = await Room.find({ room_type: PUBLIC, "$expr": { $lt: [{ $size: "$players" }, 5] } })

        if (all_rooms == []) {
            let room = new Room({
                _id: mongoose.Types.ObjectId(),
                room_id: v4(),

            })
        } else {

        }
    } else {
        const all_rooms = await Room.find({ room_id: room })

        console.log(all_rooms)
    }

}

exports.player_ready = async (room, socket, io, cb) => {
    await Player.updateOne({ player_id: socket.id }, { ready: true })
    let players = await Room.findOne({room_id: room}).populate('players')
  
    io.sockets.in(room).emit('player_data_changed', players['players'], players['current_turn'])
    cb({success: true})

}


exports.cross = async (room, num, current_turn, io, cb) => {
    let room_data = await Room
        .findOne({'room_id': room})
        .populate({
            path: 'players',
            match: {
                'turn': current_turn + 1
            }
        })

    let next_turn = null
    if(room_data['players'].length == 0) next_turn = 1
    else next_turn = current_turn + 1


    Room.findOneAndUpdate({room_id: room}, {current_turn: next_turn})
    .populate('players')
    .then(data => {
        io.to(room).emit('crossed', num)
        io.to(room).emit('player_data_changed', data['players'], next_turn)
    })
    .catch()
}


exports.bingo = async (room, socket, io, cb) => {
    io.to(room).emit('bingo_won', socket.id)
}