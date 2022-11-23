import { Bingo } from './Bingo';
import { Room } from './Room';
import { NewEntry } from './NewEntry';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Redirect

} from "react-router-dom";
import { useEffect, useState, useContext } from 'react';
import { Link, useHis, useNavigate } from "react-router-dom"
import { io } from 'socket.io-client'

import { MainProvider } from './Context/MainContext'
import MainContext from './Context/MainContext';
import { HOST } from './Utils/bingo';

const socket = io.connect(HOST)

function App() {

  const { room, update_room, name, update_name, players, update_players } = useContext(MainContext)

  useEffect(() => {
    socket.on('room_joined', data => {
      update_players(data)
    })
    socket.on('player_data_changed', data => {
      update_players(data)
    })

    window.onbeforeunload = function () {
      return true;
    };

    return () => {
      window.onbeforeunload = null;
    };

  }, [])

  useEffect(() => {
    update_room(window.location.href.split('/')[4])
  }, [room])



  return (
      <Router>
        <Routes>
          <Route path="/" element={
            <Room socket={socket}/>
          } />
          <Route path={"/newentry/" + room} element={
            <NewEntry socket={socket} />
          } />
          <Route path={"/bingo/" + room} element={
            <Bingo socket={socket} />
          } />

        </Routes>
      </Router>

  );
}

export default App;
