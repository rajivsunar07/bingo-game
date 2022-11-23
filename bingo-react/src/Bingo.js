import { BingoBoard } from "./BingoBoard"

function Bingo(props) {


    return(
        <div className="container text-center">
            <h3>
            <a className="text-center" href="/">
                Bingo Game
            </a>
            </h3>
            
            <div className="row mt-4 justify-content-around">
                <div className="col-10">
                    <BingoBoard socket={props.socket}></BingoBoard>
                </div>
            </div>
        </div>
    )
}


export {Bingo};