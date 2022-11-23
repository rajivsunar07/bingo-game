const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
    room_id: String,
    room_type: {
        type: String,
        enum: ["public", "private"],
    },
    players: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Player'
    },
    current_turn: {
        type: Number,
        default: 1
    }
})


const room = mongoose.model('Room', roomSchema)

module.exports = room