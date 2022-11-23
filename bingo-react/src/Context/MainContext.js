import { createContext, useState } from 'react'

const MainContext = createContext()

export const MainProvider = ({children}) => {
    const [room, update_room] = useState('')
    const [name, update_name] = useState('')
    const [players, update_players] = useState([])



    return (
        <MainContext.Provider
            value = {
                {
                    room,
                    update_room,
                    name,
                    update_name,
                    players,
                    update_players
                }
            }
        >
            {children}
        </MainContext.Provider>
    )
}

export default MainContext