import { useState, useContext } from 'react';
import { useNavigate } from "react-router-dom"
import MainContext from './Context/MainContext'

function NewEntry(props) {
    const [error_message, update_error_message] = useState('')
    const { room, update_room, name, update_name } = useContext(MainContext)


    let navigate = useNavigate()

    function create_room() {
        if(name != "") {
            props.socket.emit('create_room', r => {
                update_room(r)
          
                navigate("../bingo/" + r)
            })
        }else{
            alert("name not inpuuted")
        }
       
        
    }

    function random_room() {
        props.socket.emit('random_room', success => {
            if(success) {

            }
        })
    }

    function join_room() {
        if(name == ""){
            alert("Please input name")
        }else{
            console.log(room, name);
            props.socket.emit('append_player', room, name, r => {
          
                navigate("../bingo/" + room)
            })
        }
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <h3 className='display-3 text-center'>Welcome to the BINGO game</h3>
            </div>
            <div className="row">
                <h6 className="display-6 text-danger text-center">{error_message}</h6>
            </div>
            <div className="row justify-content-center mt-4">
                <div className="col-6 p-4 border mt-4">
                    <h4 className="text-center mb-4">Enter name</h4>
                    <div className="row justify-content-center">
                        <div className="col-10">
                            <input type="text" placeholder="Enter name" className="form-control" onChange={(val) => update_name(val.target.value)} />
                        </div>
                    </div>
        
                    <div className="row justify-content-center">
                        <div className="col-10">
                            <button className="btn btn-info form-control mt-4" onClick={join_room}>Enter</button>
                        </div>
                    </div>
                </div>
                <br />
             
            </div>
        </div>

    )
}

export { NewEntry }