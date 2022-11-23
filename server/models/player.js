const mongoose = require('mongoose')

const playerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    player_id: String,
    name: String,
    ready: {
        type: Boolean,
        default: false
    },
    turn: Number
})


const player = mongoose.model('Player', playerSchema)

module.exports = player