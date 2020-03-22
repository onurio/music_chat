import React,{useState,useEffect} from 'react';
import Tone from 'tone';
import Two from 'two.js';
import {radToDeg,degToRad,wheelRange,onStart} from '../utils/utils';
import patterns from '../utils/patterns';
import snare from '../audio/Snare.wav';
import kick from '../audio/Kick.wav';
import clap from '../audio/Clap.wav';
import maracas from '../audio/Maracas.wav';
import clave from '../audio/Clave.wav';
import hihat from '../audio/Hihat.wav';




const drawWave = ()=>{
    var waveArray = waveform.getValue();
    let points =[];
    for (var i = 0; i < waveArray.length; i++) {
    let x= (i/waveArray.length)*(window.innerWidth*2);            
    if (i === 0) {
        points.push(new Two.Anchor(x,(window.innerHeight/3.5) + waveArray[i]*70,Two.Commands.line));
    } else {
        points.push(new Two.Anchor(x,(window.innerHeight/3.5) + waveArray[i]*70,Two.Commands.line));
        }
    }    
    return points;
}


let instruments = {
    1: {
        'one': 'snare',
        'two': 'clave',
        'three': 'maracas'
    },
    2: {
        'one': 'hihat',
        'two': 'kick',
        'three': 'clap'
    }
}



const waveform = new Tone.Analyser('waveform',128).toMaster();


let mix = new Tone.Gain(0.5).connect(waveform);

let pitchshift = new Tone.PitchShift(0).connect(mix);
let feedbackDelay = new Tone.FeedbackDelay(0, 0.5).connect(mix);
feedbackDelay.wet.value = 0.2;
pitchshift.windowSize = 0.02;
var dist = new Tone.Distortion(0).connect(mix);
dist.wet.value = 0.5;

let sampler = {
    snare: new Tone.Sampler({"C3" : snare}).connect(pitchshift),
    kick: new Tone.Sampler({"C3" : kick}).connect(dist),
    clap: new Tone.Sampler({"C3" : clap}).connect(feedbackDelay),
    hihat: new Tone.Sampler({"C3" : hihat}).connect(waveform),
    clave: new Tone.Sampler({"C3" : clave}).connect(waveform),
    maracas: new Tone.Sampler({"C3" : maracas}).connect(waveform)
}

sampler.snare.volume.value = 5;
sampler.clap.volume.value = -7;
sampler.hihat.volume.value = -7;


let wheels;
let friendView;
let two;





let seqs={
    snare: new Tone.Sequence(function(time, note){
            if(note === 1){
                sampler.snare.triggerAttack('C3');
            }
        }, patterns.snare[1], '1:0:0' )
    ,
    kick: new Tone.Sequence(function(time, note){
            if(note === 1){
                sampler.kick.triggerAttack('C3');
            }
        }, patterns.kick[1], '1:0:0' )
    ,
    clap: new Tone.Sequence(function(time, note){
            if(note === 1){
                sampler.clap.triggerAttack('C3');
            }
        }, patterns.clap[1], '1:0:0' ),
    clave: new Tone.Sequence(function(time, note){
        if(note === 1){
            sampler.clave.triggerAttack('C3');
        }
    }, patterns.clap[1], '1:0:0' ),
    hihat: new Tone.Sequence(function(time, note){
        if(note === 1){
            sampler.hihat.triggerAttack('C3');
        }
    }, patterns.clap[1], '1:0:0' ),
    maracas: new Tone.Sequence(function(time, note){
        if(note === 1){
            sampler.maracas.triggerAttack('C3');
        }
    }, patterns.clap[1], '1:0:0' )
}




export const PlayView=(props)=>{
        const [currentHexes,setCurrentHexes] = useState({});
    

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
            switch(wheelNum){
                case 'one': 
                    // feedbackDelay.delayTime.value = effect;  
                    props.socket.emit('clFx',{index: 'one',amount: effect}); 
                    pitchshift.pitch = effect*20-10;   
                    break;
                case 'two':
                    props.socket.emit('clFx',{index: 'two',amount: effect}); 
                    dist.distortion = effect
                    break;
                case 'three':
                    props.socket.emit('clFx',{index: 'three',amount: effect}); 
                    feedbackDelay.delayTime.value = effect*0.05;
                    break;
                default:
                    return;
            }

        }

        

        
        
    }
    

    const updateSize=()=>{
        Tone.Transport.loopEnd = '4m'
        Tone.Transport.loop = true
        Tone.Transport.start();
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
        two.makeLine(0,height*0.17,width,height*0.17);
        two.makeLine(0,height*0.4,width,height*0.4);

        // let friendViewNew = renderFriend(twoNew,width/2,height/8,width/15);
        let wheel4 = makeFriendHexWheel(two,0,0,width/22,width*0.25,height*0.1,0,width/6,3);
        let wheel5 = makeFriendHexWheel(two,0,0,width/22,width*0.5,height*0.1,0,width/6,3);
        let wheel6 = makeFriendHexWheel(two,0,0,width/22,width*0.75,height*0.1,0,width/6,3);
        friendView = {one: wheel4,two: wheel5,three: wheel6};

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

        


        let wave = new Two.Path(drawWave());
        two.add(wave);

            

        two.bind('update', function(frameCount) {            
            wave.vertices = drawWave(); 
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
        
    };

    

    const changeSequence=(sample,pattern,start)=>{
        let seq = seqs[sample];
        seq.dispose();
        seq = new Tone.Sequence(function(time, note){
            if(note === 1){
                sampler[sample].triggerAttack('C3');
            }
        }, patterns[sample][pattern + 1], '1m' );
        seqs[sample] = seq;
        start?seq.start(0):seq.stop();
    };



    const changeHex =(wheels,wheelNum,hexNum)=> {
        let otherHexes = [...wheels[wheelNum].hexes];
        otherHexes.splice(hexNum,1);
        otherHexes.forEach(hex=>hex.fill = 'white');      
        let currentHexesNew = {};
        currentHexesNew = currentHexes;  
        let start=true;
        
        if(currentHexes[wheelNum] ===hexNum){
            wheels[wheelNum].hexes[hexNum].fill = 'white';            
            currentHexesNew[wheelNum] = undefined;
            setCurrentHexes(currentHexesNew);
            start=false;
            
        } else{
            wheels[wheelNum].hexes[hexNum].fill = 'black';
            currentHexesNew[wheelNum] = hexNum;
            setCurrentHexes(currentHexesNew);
        }

        return start;
    }

    const handleClick =(wheelNum,hexNum)=>{        
        let start = changeHex(wheels,wheelNum,hexNum);
        changeSequence(instruments[props.player][wheelNum],hexNum,start);
        props.socket.emit('clSeq',{wheel: wheelNum,hex: hexNum,start});   
    }


    const makeFriendHexWheel =(two,x,y,r,gX,gY,rot,length,dashes)=>{
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
        curve.translation.set(x+r*1.6,-r*0.85);
        curve.rotation = degToRad(60);
        let fader =  curve.clone();
        fader.linewidth = 3;
        curve.opacity = 0.5;
        fader.ending = 0;
        
  
      
        let hex1 = two.makePolygon(x+r/1.135 -1,r/2+y,r,6);
        hex1.rotation = 1.5708;
        let hex2 = two.makePolygon(x -r/1.135 + 1,r/2+y,r,6);
        hex2.rotation = 1.5708;
        let hex3 = two.makePolygon(x,-r,r,6);
        hex3.rotation = 1.5708;
        let wheel1 = two.makeGroup(hex1,hex2,hex3)
        let wheel = two.makeGroup(wheel1,fader,curve);        
        wheel.translation.set(gX,gY);
        wheel.rotation = degToRad(rot);

        return {wheel:wheel1,hexes: [hex1,hex2,hex3],curve,fader};
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
        props.socket.on('clFx',(msg)=>{
            friendView[msg.index].fader.ending = msg.amount;
            friendView[msg.index].wheel.rotation = degToRad(msg.amount*120);
        });
        props.socket.on('clSeq',(msg)=>{
            let start = changeHex(friendView,msg.wheel,msg.hex);

            switch (props.player) {
                case 2:
                    changeSequence(instruments[1][msg.wheel],msg.hex,start);
                    break;
                case 1:
                    changeSequence(instruments[2][msg.wheel],msg.hex,start);
                    break;
                default:
                    return;
            }
            
        });        

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