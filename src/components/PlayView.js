import React,{useReducer,useState,useEffect} from 'react';
// import Tone from 'tone';
import Two from 'two.js';
import {radToDeg,degToRad} from '../utils/utils';




let wheels;
let two;

let wheelRange = {
    one: {
        min: 60,
        max: 180
    },
    two: {
        min: 180,
        max: 300
    },
    three: {
        min: 120,
        max: 240
    }
}


function onStart ( e ) {
    if( navigator.userAgent.match(/Android/i && e.target.id === 'two-1')) {
        e.preventDefault();
    }
}


export const PlayView=(props)=>{


    const [rot,setRot] = useState(0);

    const handleMove=(e,wheelNum,angleComp,range)=>{    
        e.preventDefault();    
        let rect = wheels[wheelNum].wheel._renderer.elem.getBoundingClientRect();    
        let touch = {x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}
        let x = rect.width/2 + rect.x;
        let y = rect.width/2 + rect.y;
        let button = {x:x,y:y};
        
        let result =  Math.atan2((button.y+ 20) - button.y, button.x - button.x) -  Math.atan2(touch.y - button.y, touch.x - button.x);

        let resultDeg = radToDeg(result);
        if(resultDeg < 0 ){
            resultDeg =  270 + resultDeg + 90;
        }        
        if(resultDeg<range.max && resultDeg>range.min){
            wheels[wheelNum].wheel.rotation = degToRad(angleComp) - result;
            let effect = Math.abs(1-(resultDeg - range.min)/120);
            wheels[wheelNum].fader.ending = effect;
            setRot(effect);

        }
        
    }


    
    

    useEffect(()=>{        
        if(two){
            two.update();
            
        }
    },[rot])

    const updateSize=()=>{
        let elem = document.getElementById('canvas');
        let params = { fullscreen: true};
        let twoNew = new Two(params).appendTo(elem);
        two = twoNew;

        let ratio = window.devicePixelRatio;
        let width = two.width;
        let height = two.height;
        let bg = two.makeRectangle(0,0,width*ratio,height*ratio);
        bg.fill = 'white';
        let wheel1 = makeHexWheel(two,0,0,width/10,width*0.25,height*0.875,0,width/2.3,6);
        let wheel2 = makeHexWheel(two,0,0,width/10,width*0.75,height*0.875,-120,width/2.3,3);
        let wheel3 = makeHexWheel(two,0,0,width/10,width*0.5,height*0.65,-60,width/2.3,10);

        wheels = {
            one: wheel1,
            two: wheel2,
            three: wheel3
        }

        setTimeout(() => {
            addListeners('one',180);
            addListeners('two',-60);
            addListeners('three',-120);
        },200)


        const addListeners=(wheelNum,angleComp)=>{
            let circle = wheels[wheelNum].circle._renderer.elem;
            
            let range =  wheelRange[wheelNum];
            circle.ontouchstart = (e)=>handleMove(e,wheelNum,angleComp,range);
            circle.ontouchmove = (e)=>handleMove(e,wheelNum,angleComp,range);
            circle.ontouchend = (e)=>handleMove(e,wheelNum,angleComp,range);
            let curve = wheels[wheelNum].curve._renderer.elem;
            curve.ontouchstart = (e)=>handleMove(e,wheelNum,angleComp,range);
            curve.ontouchmove = (e)=>handleMove(e,wheelNum,angleComp,range);
            curve.ontouchend = (e)=>handleMove(e,wheelNum,angleComp,range);
        }
        


        two.update();
    }

    

    const makeHexWheel =(two,x,y,r,gX,gY,rot,length,dashes)=>{
        let circle = two.makeCircle(x,y-r*2 + 2,r/2);

        let curve = two.makeCurve(
            x - length/2,y,
            x - length/2.5,y-length/8,
            x - length/3,y-length/5.75,
            x - length/4,y-length/4.5,
            x,y - length/3.6,
            x + length/4,y-length/4.5,
            x + length/3,y-length/5.75,
            x + length/2.5,y-length/8,
            x + length/2,y,
            true);
        curve.linewidth = 1;
        curve.cap = 'rounded'
        curve.dashes[0] = dashes;
        curve.fill = 'transparent';
        curve.translation.set(x+50,-r*0.8);
        curve.rotation = degToRad(60);
        let fader =  curve.clone();
        fader.linewidth = 3;
        curve.opacity = 0.5;
        fader.ending = 0;
        circle.fill = 'transparent';
        
  
      
        let hex1 = two.makePolygon(x+r/1.135 -1,r/2+y,r,6);
        hex1.rotation = 1.5708;
        let hex2 = two.makePolygon(x -r/1.135 + 1,r/2+y,r,6);
        hex2.rotation = 1.5708;
        let hex3 = two.makePolygon(x,-r,r,6);
        hex3.rotation = 1.5708;
        let wheel1 = two.makeGroup(hex1,hex2,hex3,circle)
        let wheel = two.makeGroup(wheel1,fader,curve);        
        wheel.translation.set(gX,gY);
        wheel.rotation = degToRad(rot);

        return {wheel:wheel1,hex1,hex2,hex3,circle,curve,fader};
    }


    useEffect(()=>{


        window.addEventListener( "touchstart", function(e){ onStart(e); }, false );
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