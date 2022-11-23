import { useEffect, useState, useContext } from "react"
import { IconButton, Snackbar } from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import MainContext from "./Context/MainContext";


function PlayersNames(props) {

    const socket = props.socket

    const {players, update_players} =  useContext(MainContext)
    const [open, setOpen] = useState(false);

    const handleClick = () => {
        setOpen(true);
        navigator.clipboard.writeText("http://localhost:3000/newentry/" + props.room);
    };

    useEffect(() => {
        socket.on('room_joined', data => {
            update_players(data)
        })

        socket.on('player_data_changed', data => {
            update_players(data)
        })
    }, [])



    return (
        <div className="border border-black p-2 mt-4">
            <h3>Players</h3>
            <hr />
            {players.length > 0 ? players.map((val, i) => {
                return (
                    <div className="row" key={i}>
                        <div className="col">{val['name']}</div>
                        <div className="col">{val['ready'] ? 'Ready' : 'Not ready'}</div>
                    </div>
                )
            }) : <></>}
            <div className="row justify-content-center border-top m-1 pt-1">
                <h6 className="col-5 mb-0 pt-2">Copy to send to friends</h6>
                <div className="col-2">
                    <IconButton onClick={handleClick} color="primary">
                        <ShareIcon />
                    </IconButton>
                    <Snackbar
                        message="Copied to clibboard"
                        anchorOrigin={{ vertical: "top", horizontal: "center" }}
                        autoHideDuration={2000}
                        onClose={() => setOpen(false)}
                        open={open}
                    />
                </div>

            </div>

        </div>
    )
}

export { PlayersNames }