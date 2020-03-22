import React,{useState} from 'react';
import {useParams,useHistory} from 'react-router-dom';




export const EnterRoom=props=>{
    const { id } = useParams();
    const history = useHistory();
    
    const [name,setName]=useState('');

      

    const getLink=(e)=>{
        if(name!==''){
            props.socket.emit('joinRoom',{id:id,name:name});
            // window.location = `http://192.168.1.5:3000/room/${id}`;\
            props.setPlayer(2);
            history.push(`/room/${id}`);

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


    return(
        <div className='main'>
            <input style={{marginBottom:'10vmin',border:'2px solid black',}}  type='text' className="name" name="name" onKeyDown={handleEnter} onChange={handleChange} value={name}></input>
            <button onClick={getLink} style={{backgroundColor:'black',color:'white',marginBottom:'10vmin',fontSize:'5vmin',padding:'2vmin',borderRadius:100,border:'2px solid black' }}>Enter Room!</button>
        </div>
    );
}