import React,{useRef} from 'react';
import { useEffect } from 'react';
import {useHistory} from 'react-router-dom';



export const WaitRoom=props=>{
    const link = useRef(null);
    const history = useHistory();

    useEffect(()=>{
        props.socket.on('friendJoined',()=>{
            history.push(`room/${props.id}`);
        })
    })

    function copyLink() {

        const el = document.createElement('textarea');
        el.value = link.current.innerText;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      
        /* Alert the copied text */
        alert("Copied the text: " + link.current.innerText);
    }


    return(
        <div className='main'>
            <div>
                <h1 style={{marginBottom:'10vmin'}}>send this link to your FRIEND:</h1>
                <h4  ref={link}>http://192.168.1.5:3000/join/{props.id}</h4>
                <button  onClick={copyLink} style={{backgroundColor:'black',color:'white',marginBottom:'10vmin',fontSize:'5vmin',padding:'2vmin',borderRadius:100,border:'2px solid black' }}>COPY LINK!</button>
                <h3>Waiting for your friend to join!</h3>
            </div>
            
            
        </div>
    );
}