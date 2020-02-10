import React,{useState,useEffect} from 'react';
import Tone from 'tone';
import Two from 'two.js';


const degToRad=(deg)=>{
  let pi = Math.PI;
  return deg * pi / 180;
}


export const PlayView=props=>{
    const [two,setTwo] = useState(null);
    const [loaded,setLoaded] = useState(false);

    const updateSize=()=>{
        let elem = document.getElementById('canvas');
        let params = { fullscreen: true};
        let two = new Two(params).appendTo(elem);
        let ratio = window.devicePixelRatio;
        let width = two.width;
        let height = two.height;
        let bg = two.makeRectangle(0,0,width*ratio,height*ratio);
        bg.fill = 'white';
        let wheel1 = makeHexWheel(two,0,0,width/10);
        let wheel2 = makeHexWheel(two,0,0,width/10);
        let wheel3 = makeHexWheel(two,0,0,width/10);
        wheel2.translation.set(width*0.75,height*0.85);
        wheel1.translation.set(width*0.25,height*0.85);
        wheel3.translation.set(width*0.5,height*0.65);
        wheel3.rotation = degToRad(-60);
        wheel2.rotation = degToRad(-120);
        setTwo(two);
        setLoaded(true);
        two.update();
        // setTimeout(()=>{
        //     setInterval(()=>{
        //         wheel1.rotation += 0.05;
        //         wheel2.rotation += 0.075;
        //         wheel3.rotation += 0.1;
        //         two.update();
        //     },50);
        // },2000);
    }

    const makeHexWheel =(two,x,y,r)=>{
        let circle = two.makeCircle(x,y-r*2 + 2,r/5);
        circle.fill = 'black';
        let hex1 = two.makePolygon(x+r/1.135,r/2+y,r,6);
        hex1.rotation = 1.5708;
        let hex2 = two.makePolygon(x+-r/1.135 + 1,r/2+y,r,6);
        hex2.rotation = 1.5708;
        let hex3 = two.makePolygon(x,-r,r+y,6);
        hex3.rotation = 1.5708;
        let wheel = two.makeGroup(hex1,hex2,hex3,circle);        
        return wheel;
    }


    useEffect(()=>{
        updateSize();
        window.addEventListener('resize',(e)=>{updateSize()});
        return(()=>{
            window.removeEventListener('resize',updateSize());
        });
        // eslint-disable-next-line
    },[]);


    return(

        <div style={{position: 'fixed' , backgroundColor:'white',height: '100%',userSelect: 'none',WebkitTapHighlightColor:'rgb(0,0,0,0)',WebkitUserSelect:'none',WebkitTouchCallout:'none',outline: 'none'}}>
            <div 
            style={{position: 'fixed' , backgroundColor:'white',height: '100%',userSelect: 'none',WebkitTapHighlightColor:'rgb(0,0,0,0)',WebkitUserSelect:'none',WebkitTouchCallout:'none',outline: 'none'}}
            id='canvas'
            >
            </div>
        </div>
    );
}