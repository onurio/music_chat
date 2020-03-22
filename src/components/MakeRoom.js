import React from 'react';
import { useState } from 'react';
import { WaitRoom } from './WaitRoom';
import { GetLink } from './GetLink';





export const MakeRoom=props=>{
    const [id,setId]=useState(undefined);

    return(
        id?<WaitRoom id={id} socket={props.socket} />:<GetLink setId={setId} socket={props.socket}/>
    );
}