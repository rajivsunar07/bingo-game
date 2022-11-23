import { useState, useRef, useEffect, useContext } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLongArrowLeft, faCheck } from "@fortawesome/free-solid-svg-icons"

import { PlayersNames } from './PlayersNames'
import { BingoButtons } from './BingoButtons'

import { useNavigate } from 'react-router-dom'


import RoomContext from "./Context/MainContext"
import MainContext from "./Context/MainContext"

function BingoBoard(props) {

    const socket = props.socket

    const navigate = useNavigate()

    let board = {
        0: [0, 0, 0, 0, 0],
        1: [0, 0, 0, 0, 0],
        2: [0, 0, 0, 0, 0],
        3: [0, 0, 0, 0, 0],
        4: [0, 0, 0, 0, 0],
    }

    const [bingo_board, update_board] = useState(board)
    const [crossed, update_crossed] = useState({
        0: [0, 0, 0, 0, 0],
        1: [0, 0, 0, 0, 0],
        2: [0, 0, 0, 0, 0],
        3: [0, 0, 0, 0, 0],
        4: [0, 0, 0, 0, 0],
    })
    const [curr_num, update_num] = useState(1)
    const [num_changes, update_num_changes] = useState([[]])

    const [ready, update_ready] = useState(false)
    const [ready_text, update_ready_text] = useState('')
    const [vertical, update_vertical] = useState([0, 0, 0, 0, 0])
    const [horizontal, update_horizontal] = useState([0, 0, 0, 0, 0])
    const [across, update_across] = useState([0, 0])

    const [bingo, update_bingo] = useState([])
    const [bingo_text, update_bingo_text] = useState('')
    const {room, update_room} = useContext(RoomContext)
    const [filled, update_filled] = useState(false)

    const {players, update_players} = useContext(MainContext)
    const [turn, update_turn] = useState(1)
    const [yourturn, update_yourturn] = useState(false)

    const [display_back, update_display_back] = useState(false)

    const [game_ended, update_game_ended] = useState(false)
    const [winner, update_winner] = useState('')
 



    const canvasRef = useRef(null)

    const currentBingoBoardRef = useRef(bingo_board);

    const draw = (ctx, beg, end) => {
        ctx.beginPath();
        ctx.moveTo(beg[0], beg[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.stroke()
    }

    useEffect(() => {
        currentBingoBoardRef.current = bingo_board;
    }, [bingo_board]);

    useEffect(() => {

        socket.on('disconnect', () => {
            navigate('../')
        });

        socket.on('bingo_won', (id) => {
            players.forEach((v) => {
                if(v['player_id'] == id){
                    update_winner(v['name'])
                    update_game_ended(true)
                }
            })
        })

        socket.on('room_joined', data => {
            update_players(data)
        })

        socket.on('player_data_changed', (data, turn) => {
            update_players(data)
            update_turn(turn)

            if(data.length < 2){
                update_ready_text('At least 2 players needed')
            }else{
                let all_players_ready = check_players_ready_status(data)
                if (all_players_ready) {
                    update_ready_text('Ready to play')
                    checkTurn(data, turn)
                }
                else update_ready_text('Waiting for other players')
            }

           


        })

        socket.on('crossed', num => {
            let key = 0
            let index = 0
            for (const [k, value] of Object.entries(currentBingoBoardRef.current)) {
                value.forEach((val, i) => {
                    if (val === num) {
                        key = k
                        index = i
                        console.log(currentBingoBoardRef.current[key][index]);

                        let copy = { ...crossed }
                        copy[key][index] = 1
                        update_crossed(copy)

                    }
                })
            }
        })

    }, [socket])

    useEffect(() => {

        console.log('useeffect');

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        if (across[1] === 1) draw(context, [10, 5], [245, 240])
        if (across[0] === 1) draw(context, [245, 5], [10, 240])

        vertical.forEach((val, i) => {
            if (val === 1) draw(context, [(28 - i) + ((52 - 1) * i), 5], [(28 - i) + ((52 - 1) * i), 240])
        })

        horizontal.forEach((val, i) => {
            if (val === 1) draw(context, [10, (23 - i) + ((46 + 5) * i)], [245, (23 - i) + ((46 + 5) * i)])
        })

        return () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [horizontal, across, vertical])

    function ready_to_play() {
        // Clicked with ready to playe
        let is_ready = true
        let player_number = 0
        for (const [key, value] of Object.entries(bingo_board)) {
            if (value.includes(0)) {
                is_ready = false
                break
            }
        }

        if (is_ready) {
            if(players.length < 2){
                // At least 2 players needed
                update_ready_text('Atleast 2 players needed')
                update_ready(true)
                socket.emit('player_ready', room)
            }else{
                update_ready(true)
                let all_players_ready = check_players_ready_status(players)
                if (all_players_ready) update_ready_text('Ready to play')
                else update_ready_text('Waiting for other players')
    
                socket.emit('player_ready', room)
            }
        } else {
            update_ready_text('Please fill out the bingo board')
        }

    }

    function check_players_ready_status(data) {
        let all_players_ready = true
        if(data.length < 2) all_players_ready = false
        else data.forEach((v, i) => { if (!v['ready']) all_players_ready = false })
        return all_players_ready
    }

    function changeNumber(key, index) {
        update_ready_text('')
        if (ready) return
        if (!display_back) update_display_back(true)
        let copy = { ...bingo_board }
        if (copy[key][index] === 0 & curr_num <= 25) {
            copy[key][index] = curr_num
            update_num_changes((num_changes) => [...num_changes, [key, index]])
            update_board(copy)
            update_num(curr_num + 1)
            if (curr_num == 25) update_filled(true)
        }
    }

    function revertNum() {
        update_ready_text('')
        if (ready) return
        if (num_changes.length !== 1) {
            let copy = { ...bingo_board }
            let changes_copy = [...num_changes]

            let update_i_v = changes_copy.pop()
            copy[update_i_v[0]][update_i_v[1]] = 0

            update_board(copy)
            update_num_changes(changes_copy)
            update_num(curr_num - 1)
        }
    }




    function randomize() {
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]

        let random_bingo = {
            0: [0, 0, 0, 0, 0],
            1: [0, 0, 0, 0, 0],
            2: [0, 0, 0, 0, 0],
            3: [0, 0, 0, 0, 0],
            4: [0, 0, 0, 0, 0],
        }

        let index = 0
        while (index < 25) {
            let ran1 = Math.floor(Math.random() * 5)
            let ran2 = Math.floor(Math.random() * 5)
            if (random_bingo[ran1][ran2] != 0) continue
            random_bingo[ran1][ran2] = numbers[index++]
        }

        update_board(random_bingo)
        update_filled(true)

    }

    function cross(key, index) {
        if(game_ended) return
        if (!yourturn) return
        let copy = { ...crossed }
        copy[key][index] = 1
        update_crossed(copy)
        update_yourturn(false)
        socket.emit('cross', room, bingo_board[key][index], turn)
        // checkTurn(players)
    }


    function check(type, position) {
        if (type === 'horizontal') {
            if (crossed[position].includes(0)) return false
        } else if (type === 'vertical') {
            for (const [key, value] of Object.entries(crossed)) {
                if (value[position] === 0) return false
            }
        } else if (type === 'cross') {
            let index = 4
            let change = 1
            if (position === 1) {
                index = 0
                change = -1
            }
            for (const [key, value] of Object.entries(crossed)) {
                console.log(index)
                if (value[index] === 0) return false
                index += change
            }
        }
        return true
    }

    function check_crossed(type, position) {
        if (check(type, position)) {
            console.log(bingo)
            if (type === 'horizontal') {
                let copy = [...horizontal]
                copy[position] = 1
                update_horizontal(copy)
                update_bingo()
            } else if (type === 'vertical') {
                let copy = [...vertical]
                copy[position] = 1
                update_vertical(copy)
            } else if (type === 'cross') {
                let copy = [...across]
                copy[position] = 1
                update_across(copy)
            }

            let bingo_copy = [...bingo]
            bingo_copy.push(bingo_copy.length)
            update_bingo(bingo_copy)


        }

    }

    function callbingo() {
        if(game_ended) return
        if (bingo.length === 5) {
            update_bingo_text('WON')
            socket.emit('bingo', room)
        }else{
            update_bingo_text('Not yet')
        }

        
    }

    function checkTurn(data, turn) {
        let player_turn = data.filter((v) => {
            if (v['player_id'] === socket.id) return v
        })
        if (turn == player_turn[0]['turn']) {
            update_ready_text('Your turn')
            update_yourturn(true)
        } else {
            update_yourturn(false)
            update_ready_text("Other players' turn")
        }

    }

    function clearBoard() {
        update_board({
            0: [0, 0, 0, 0, 0],
            1: [0, 0, 0, 0, 0],
            2: [0, 0, 0, 0, 0],
            3: [0, 0, 0, 0, 0],
            4: [0, 0, 0, 0, 0],
        })
        update_display_back(false)
        update_ready(false)
        update_filled(false)
    }


    return (
        <div>

            <div className="row">
                <div className="col-6">
                    <div className="border pt-4">
                        <div className="position-relative">
                            <canvas id="canvas" className="position-absolute" style={{ top: "1%", right: "31.5%" }} ref={canvasRef} height="250px" width="250px">
                            </canvas>
                            {Object.entries(bingo_board).map(([key, value]) => {
                                return (
                                    <div key={key} className="row justify-content-center align-items-center">
                                        {value.map((val, i) => {
                                            return (
                                                <div key={i} className="col-2 justify-text-center border border-dark m-0 position-relative align-self-center p-0 " onClick={() => {
                                                    if (ready) cross(key, i)
                                                    else changeNumber(key, i)
                                                }}
                                                    style={{ width: "50px", height: "50px" }}>
                                                    <h4 className="pt-2">{val}</h4>

                                                    <h1 className="position-absolute m-0 p-0" style={{ top: 0, right: "10px", fontSize: 40, color: "gray", opacity: "80%" }}>
                                                        {crossed[key][i] === 1 ? 'X' : null}
                                                    </h1>
                                                </div>
                                            )
                                        })}
                                        <div className="col-2 border ml-4" style={{ width: "50px", height: "50px", }} onClick={() => { check_crossed('horizontal', key) }}>
                                            <FontAwesomeIcon icon={faCheck} size="2x" color={horizontal[key] === 1 ? 'green' : ''} />
                                        </div>
                                    </div>
                                )
                            })}

                        </div>



                        <div className="row justify-content-center" style={{ marginRight: 38 }}>
                            <div className="col-2 border ml-4" style={{ width: "50px", height: "50px" }} onClick={() => { check_crossed('cross', 0) }}>
                                <FontAwesomeIcon icon={faCheck} size="2x" color={across[0] === 1 ? 'green' : ''} />
                            </div>
                            {[0, 1, 2, 3, 4].map((val, i) => {
                                return (
                                    <div key={i} className="col-2 border ml-4" style={{ width: "50px", height: "50px" }} onClick={() => { check_crossed('vertical', val) }}>
                                        <FontAwesomeIcon icon={faCheck} size="2x" color={vertical[i] === 1 ? 'green' : ''} />
                                    </div>
                                )
                            })}
                            <div className="col-2 border ml-4" style={{ width: "50px", height: "50px" }} onClick={() => { check_crossed('cross', 1) }}>
                                <FontAwesomeIcon icon={faCheck} size="2x" color={across[1] === 1 ? 'green' : ''} />
                            </div>

                        </div>

                        <div className="row justify-content-center mt-4">
                            {['B', 'I', 'N', 'G', 'O'].map((val, i) => {
                                return <h3 className="col-1" key={i} style={{ color: bingo.includes(i) ? 'green' : '' }}>{val}</h3>
                            })}
                        </div>


                        <button className="btn btn-info mb-3" onClick={clearBoard}
                            style={ready ? { visibility: "hidden" } : { visibility: "visible" }}
                        >Clear</button>

                    </div>

                    <div className="row justify-content-around mt-4 pt-2">
                        <BingoButtons revertNum={revertNum} display_back={display_back} randomize={randomize} ready={ready} ready_to_play={ready_to_play} filled={filled}/>
                    </div>

                    <h4 className="text-success">{ready_text}</h4>
                    <br />
                    <button
                        className="btn btn-success mt-4"
                        onClick={callbingo}
                        style={ready && check_players_ready_status(players) ? { visibility: "visible" } : { visibility: "hidden" }}
                    >Call bingo</button>
                    <h3>{bingo_text}</h3>
                    <h3>{winner}</h3>

                </div>




                <div className="col-6">
                    <PlayersNames players={props.players} socket={socket} room={room} name={props.name}></PlayersNames>
                </div>


            </div>

        </div>

    )
}

export { BingoBoard };