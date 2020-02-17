import React,{useReducer,useState,useEffect} from 'react';
import Tone from 'tone';
import Two from 'two.js';
import {radToDeg,degToRad} from '../utils/utils';






const waveform = new Tone.Analyser('waveform',1024);


let Sampler = new Tone.Sampler({

}).chain(waveform).toMaster();








let wheels;
let friendView;
let two;
let currentHexesGlobal = {};

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
        const [currentHexes,setCurrentHexes] = useState({});
        const [rot,setRot] = useState(0);
    

    const handleMove=(e,wheelNum,angleComp,range)=>{    
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


    const draw=()=> {
        requestAnimationFrame(draw);
        var waveArray = waveform.getValue();
        // canvasCtx.fillStyle = 'rgb(0,0,0,0)';
        // canvasCtx.lineWidth = 4;
        // canvasCtx.clearRect(0, 0, window.innerWidth*2, window.innerHeight*2);
        // canvasCtx.fillRect(0,0,window.innerWidth*2, window.innerHeight*2);
        // canvasCtx.beginPath();
        for (var i = 0; i < waveArray.length; i+=4) {
          let x= (i/waveArray.length)*(window.innerWidth*2);
          if (i === 0) {
            // canvasCtx.moveTo(0,(window.innerHeight)+ waveArray[i]);
          } else {
            // canvasCtx.lineTo(x, (window.innerHeight)+waveArray[i]*(window.innerHeight));
          }
        }
        // canvasCtx.strokeStyle = 'black';
        // canvasCtx.stroke();
      }

    
    

    // useEffect(()=>{   
           
    //     if(two){
                  
    //     }
    // },[rot])

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
        let wheel1 = makeHexWheel(two,0,0,width/10,width*0.25,height*0.875,0,width/2.6,6);
        let wheel2 = makeHexWheel(two,0,0,width/10,width*0.75,height*0.875,-120,width/2.6,3);
        let wheel3 = makeHexWheel(two,0,0,width/10,width*0.5,height*0.65,-60,width/2.6,10);
        wheels = {
            one: wheel1,
            two: wheel2,
            three: wheel3
        }



        
        setTimeout(() => {
            addListeners('one',180);
            addListeners('two',-60);
            addListeners('three',-120);
        },0)


        let friendViewNew = renderFriend(twoNew,width/2,height/8,width/15);
        friendView = friendViewNew;

        


        var waveArray = waveform.getValue();
        let points =[];
        for (var i = 0; i < waveArray.length; i+=4) {
            let x= (i/waveArray.length)*(window.innerWidth*2);
            if (i === 0) {
                // points.push((window.innerHeight)+ waveArray[i]);
                // two.makeCircle(x,(height/2) + waveArray[i],1);
                points.push(new Two.Anchor(x,(height/2) + waveArray[i],Two.Commands.line));
            } else {
                // points.push((window.innerHeight)+waveArray[i]*(window.innerHeight));
                // two.makeCircle(x,(height/2) + waveArray[i],1);
                points.push(new Two.Anchor(x,(height/2) + waveArray[i],Two.Commands.line));
            }
        }

        let bla = new Two.Path(points);
        two.add(bla);

            

        two.bind('update', function(frameCount) {
            var waveArray = waveform.getValue();
            let points =[];
            for (var i = 0; i < waveArray.length; i+=4) {
                let x= (i/waveArray.length)*(window.innerWidth*2);
                if (i === 0) {
                    // points.push((window.innerHeight)+ waveArray[i]);
                    // two.makeCircle(x,(height/2) + waveArray[i],1);
                    points.push(new Two.Anchor(x,(height/2) + waveArray[i],Two.Commands.line));
                } else {
                    // points.push((window.innerHeight)+waveArray[i]*(window.innerHeight));
                    // two.makeCircle(x,(height/2) + waveArray[i],1);
                    points.push(new Two.Anchor(x,(height/4+height/4*Math.random()) + waveArray[i],Two.Commands.line));
                }
            }
            bla.vertices = points;
            // console.log(points);
            
            // canvasCtx.strokeStyle = 'black';
            // canvasCtx.stroke();
            
        }).play();   
        
    }



    const addListeners=(wheelNum,angleComp)=>{
        let range =  wheelRange[wheelNum];
        const faderFunc =  (e)=>handleMove(e,wheelNum,angleComp,range);
        const assignListeners =(elem) =>{
            elem.ontouchstart = faderFunc;
            elem.ontouchend = faderFunc;
            elem.ontouchmove = faderFunc;
        }
        let circle = wheels[wheelNum].circle._renderer.elem;
        let curve = wheels[wheelNum].curve._renderer.elem;
        assignListeners(curve);
        assignListeners(circle);
        wheels[wheelNum].hexes.forEach((hex,index)=>hex._renderer.elem.ontouchstart = (e)=> handleClick(wheelNum,index));
        
    }

    const handleClick =(wheelNum,hexNum)=>{
        let otherHexes = [...wheels[wheelNum].hexes];
        otherHexes.splice(hexNum,1);
        otherHexes.forEach(hex=>hex.fill = 'white');      
        let currentHexesNew = {};
        currentHexesNew = currentHexes;  
        
        if(currentHexesGlobal[wheelNum] ===hexNum){
            wheels[wheelNum].hexes[hexNum].fill = 'white';
            currentHexesNew[wheelNum] = undefined;
            setCurrentHexes(currentHexesNew);
            
        } else{
            wheels[wheelNum].hexes[hexNum].fill = 'black';
            currentHexesNew[wheelNum] = hexNum;
            setCurrentHexes(currentHexesNew);
        }
                
    }

    const renderFriend=(two,x,y,r)=>{
        let hex1 = two.makePolygon(x,y,r,6);
        let hex2 = two.makePolygon(x - r*1.5,y-r*0.85,r,6);
        let hex3 = two.makePolygon(x + r*1.5,y-r*0.85,r,6);
        let hex4 = two.makePolygon(x,y - r*1.7,r,6);

        return {hex1,hex2,hex3,hex4}
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
        curve.translation.set(x+55,-r*0.85);
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

        return {wheel:wheel1,hexes: [hex1,hex2,hex3],circle,curve,fader};
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