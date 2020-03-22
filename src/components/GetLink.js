import React from 'react';
import { useState } from 'react';




export const GetLink=props=>{
    const [name,setName]=useState('');


    function uuidv4() {
        return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r && 0x3) || 0x8);
          return v.toString(16);
        });
      }
      

    const getLink=(e)=>{
        if(name!==''){
            let uuid= uuidv4();
            props.setId(uuid);
            props.socket.emit('newRoom',{id:uuid,name:name});

        }else{
            alert('you have to put your name!');
        }
        
    }


    const handleChange =(e)=>{
        setName(e.target.value);
    };

    const handleEnter=e=>{
        if(e.key==='Enter'){
            if(name!==''){
                getLink();
            }else{
                alert('you have to put your name!');
            }
                
        }
    }

    

    return (

        <div className='main'>
            <h1 style={{marginBottom:'10vmin'}}>Welcome to Bumble Beat</h1>
            <h4 style={{marginBottom:'5vmin'}}>Enter your name</h4>
            <input style={{border:'2px solid black',marginBottom:'5vmin'}} type='text' className="name" name="name" onKeyDown={handleEnter} onChange={handleChange} value={name}></input>
            <button onClick={getLink} style={{backgroundColor:'black',color:'white'}}>GET LINK</button>
        </div>
    );
}