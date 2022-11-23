import { faLongArrowLeft, faCheck } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

function BingoButtons(props) {

    return (
        <>
            <div className="col-1" onClick={props.revertNum} style={props.display_back ? { visibility: "visible" } : { visibility: "hidden" }} >
                <FontAwesomeIcon icon={faLongArrowLeft} size="1x" />
                <h6>Back</h6>
            </div>
            <button
                className="btn btn-info col-3 mb-2 self-align-center"
                onClick={props.randomize}
                style={props.ready ? { visibility: "hidden" } : { visibility: "visible" }}
            >Randomize</button>

            <button
                className="btn btn-success mb-2 col-2"
                onClick={props.ready_to_play}
                style={props.filled ? (props.ready ? { visibility: "hidden" } : { visibility: "visible" }) : { visibility: "hidden" }}
            >Ready</button>
        </>
    )
}

export {BingoButtons}