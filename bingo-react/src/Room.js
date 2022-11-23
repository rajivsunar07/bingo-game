import { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom"

import MainContext from './Context/MainContext';

import { Button, Card, TextField } from '@mui/material'


function Room(props) {
    const [error_message, update_error_message] = useState('')
    const { room, update_room, name, update_name, players, update_players } = useContext(MainContext)

    let navigate = useNavigate()


    function create_room() {
        if (name != "") {
            props.socket.emit('create_room', name, r => {
                update_room(r)

                navigate("../bingo/" + r)
            })
        } else {
            alert("name not inpuuted")
        }


    }

    function random_room() {
        props.socket.emit('random_room', success => {
            if (success) {

            }
        })
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <h4 className="display-3 text-center">
                    B
                    i
                    N
                    G
                    O
                </h4>
            </div>
            <div className="row">
                <h6 className="display-6 text-danger text-center">{error_message}</h6>
            </div>
            
            <div className="row justify-content-center mt-4">
                <div className="col-6 pt-4 pb-4">
                    <Card className='p-4'>
                    <div className="row justify-content-center">
                        <div className="col-10">
                            <TextField size='small' variant='filled' label='Enter player name' className='form-control' onChange={(val) => update_name(val.target.value)}></TextField>
                        </div>
                    </div>
                    <div className="row justify-content-center mt-4">
                        <div className="col-9">
                            <Button className='form-control' variant='outlined' onClick={create_room}>
                                Creact a private room
                            </Button>
                        </div>
                    </div>
                    <div className="row justify-content-center mt-4">
                        <div className="col-9">
                            <Button className='form-control' variant='contained' onClick={random_room} >
                                Join a random room
                            </Button>

                        </div>
                    </div>
                    </Card>
                </div>
                <br />

            </div>
   
            
        </div>

    )
}

export { Room }