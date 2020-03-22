import React,{useEffect,useState} from 'react';
import './App.css';
import {PlayView} from './components/PlayView';
import io from 'socket.io-client';
import { MakeRoom } from './components/MakeRoom';
import { BrowserRouter, Route } from 'react-router-dom';
import { EnterRoom } from './components/EnterRoom';



const socketURL = 'http://192.168.1.5:4000/';

function App() {
  const [socket,setSocket] = useState(null);
  console.log('something');
  
  const [player,setPlayer] = useState(1);

  useEffect(()=>{
    initSocket();
    // document.addEventListener('visibilitychange',(e)=>{
    //   console.log(e);
    // });
    document.addEventListener('gesturestart', (e)=>preventZoom(e));
    document.addEventListener('gesturechange', (e)=>preventZoom(e));
    document.addEventListener('gestureend', (e)=>preventZoom(e));
    return (()=>{
      document.removeEventListener('gestureend',(e)=>preventZoom(e));
      document.removeEventListener('gesturechange', (e)=>preventZoom(e));
      document.removeEventListener('gestureend', (e)=>preventZoom(e));
    });
  },[]);




  const preventZoom =e=>{
    e.preventDefault();
    document.body.style.zoom = 0.999999;
  }


  const initSocket = () =>{
    // console.log('connecting')
    const socket = io(socketURL,{secure: true});

    socket.on('connect',()=>{
      console.log('connected');
      socket.binaryType = 'arraybuffer';
    });
    socket.connect();    

    setSocket(socket);
  }

  return (
    <BrowserRouter>
      <div className="App">

        <Route path='/' exact>
          <MakeRoom socket={socket}/>
        </Route>
        <Route path='/join/:id' >
          <EnterRoom setPlayer={setPlayer} socket={socket}/>
        </Route>
        <Route path='/room/:id'>
          <PlayView socket={socket}/>
          {socket!==null?<PlayView player={player} socket={socket}/>:<MakeRoom socket={socket}/>}
        </Route>
      </div>
    </BrowserRouter>
    
  );
}

export default App;
