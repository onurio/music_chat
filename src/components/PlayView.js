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
        points.push(new Two.Anchor(x,(window.innerHeight/3.5) + waveArray[i]*70,Two.Commands.line));
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



const waveform = new Tone.Analyser('waveform',512).toMaster();


let mix = new Tone.Gain(0.5).connect(waveform);

let pitchshift = new Tone.PitchShift(0).connect(mix);
let feedbackDelay = new Tone.FeedbackDelay(0, 0.5).connect(mix);
let reverb = new Tone.Reverb().connect(mix);
reverb.wet.value = 0;
reverb.generate();
feedbackDelay.wet.value = 0.2;
pitchshift.windowSize = 0.02;
var dist = new Tone.Distortion(0).connect(mix);
dist.wet.value = 0.5;

let sampler = {
    snare: new Tone.Sampler({"C3" : snare}).connect(pitchshift),
    kick: new Tone.Sampler({"C3" : kick}).connect(dist),
    clap: new Tone.Sampler({"C3" : clap}).connect(reverb),
    hihat: new Tone.Sampler({"C3" : hihat}).connect(waveform),
    clave: new Tone.Sampler({"C3" : clave}).connect(waveform),
    maracas: new Tone.Sampler({"C3" : maracas}).connect(waveform)
}

sampler.snare.volume.value = 5;
sampler.clap.volume.value = -7;
sampler.hihat.volume.value = -7;


let wheels;
// let friendView;
let two;


const makeSequence = (sound)=>{
    let seq = new Tone.Sequence(function(time, note){
        if(note === 1){
            sampler[sound].triggerAttack('C3','+0.05');
        }
    }, patterns.clap[1], '1:0:0' );
    return seq;
}



let seqs={
    snare: makeSequence('snare'),
    kick: makeSequence('kick'),
    clap: makeSequence('clap'),
    clave: makeSequence('clave'),
    hihat: makeSequence('hihat'),
    maracas: makeSequence('maracas')
}


let colors = {
    bg: '#42bb8d',
    hex: {
        on: '#e0fda3',
        off: '#45798c',
        beat: '#00093c'
    }
}





export const PlayView=(props)=>{
        const [currentHexes,setCurrentHexes] = useState({});
    

    const handleMove=(e,wheelNum,angleComp,range)=>{    
        let rect = wheels[0][wheelNum].wheel._renderer.elem.getBoundingClientRect();    
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
            wheels[0][wheelNum].wheel.rotation = degToRad(angleComp) - result;
            let effect = Math.abs(1-(resultDeg - range.min)/120);
            wheels[0][wheelNum].fader.ending = effect;

            changeEffect({index: wheelNum,amount: effect},true);
            switch(wheelNum){
                case 'one': 
                    props.socket.emit('clFx',{index: 'one',amount: effect}); 
                    break;
                case 'two':
                    props.socket.emit('clFx',{index: 'two',amount: effect}); 
                    break;
                case 'three':
                    props.socket.emit('clFx',{index: 'three',amount: effect}); 
                    break;
                default:
                    return;
            }
        }  
    }
    

    const updateSize=()=>{
        Tone.Transport.loopEnd = '4m'
        Tone.Transport.loop = true
        Tone.Transport.start("+0.1");
        let elem = document.getElementById('canvas');
        let params = { fullscreen: true};
        let twoNew = new Two(params).appendTo(elem);
        two = twoNew;        
        let ratio = window.devicePixelRatio;
        let width = two.width;
        let height = two.height;

        let bg = two.makeRectangle(0,0,width*ratio,height*ratio);
        bg.fill = colors.bg;
        let wheel1 = makeHexWheel(two,0,0,width/10,width*0.25,height*0.875,0,width/2.6,6);
        let wheel2 = makeHexWheel(two,0,0,width/10,width*0.75,height*0.875,-120,width/2.6,3);
        let wheel3 = makeHexWheel(two,0,0,width/10,width*0.5,height*0.65,-60,width/2.6,10);
        two.makeLine(0,height*0.17,width,height*0.17);
        two.makeLine(0,height*0.4,width,height*0.4);

        let wheel4 = makeFriendHexWheel(two,0,0,width/22,width*0.25,height*0.1,0,width/6,3);
        let wheel5 = makeFriendHexWheel(two,0,0,width/22,width*0.5,height*0.1,0,width/6,3);
        let wheel6 = makeFriendHexWheel(two,0,0,width/22,width*0.75,height*0.1,0,width/6,3);


        wheels = [
            {
                one: wheel1,
                two: wheel2,
                three: wheel3
            },
            {
                one: wheel4,
                two: wheel5,
                three: wheel6
            }
        ]
        

        setTimeout(() => {
            addListeners('one',180);
            addListeners('two',-60);
            addListeners('three',-120);
            wheels[0]['one'].opacity = 1;
            wheels[0]['two'].opacity = 1;
            wheels[0]['three'].opacity = 1;
        },3000);


        let wave = new Two.Path(drawWave());
        two.add(wave);
        wave.fill = 'transparent';
            

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
        let circle = wheels[0][wheelNum].circle._renderer.elem;
        let curve = wheels[0][wheelNum].curve._renderer.elem;
        setTimeout(() => {
            assignListeners(curve);
            assignListeners(circle);
            wheels[0][wheelNum].hexes.forEach((hex,index)=>hex._renderer.elem.ontouchstart = (e)=> handleClick(wheelNum,index));
            
        }, 200);
        
        
    };

    

    const changeSequence=(player,wheelNum,hexNum,start)=>{                
        let sample = instruments[player][wheelNum];        
        let seq = seqs[sample];
        seq.dispose();        
        
        seq = new Tone.Sequence(function(time, note){
            if(note === 1){
                sampler[sample].triggerAttack('C3',`+${((Math.random()*0.00)+0.05)}`);
                Tone.Draw.schedule(function(){

                    let curentDraw = player===props.player?1:2;
                    //this callback is invoked from a requestAnimationFrame
                    //and will be invoked close to AudioContext time                    
                    wheels[curentDraw-1][wheelNum].beat.scale = 1.5;
                    setTimeout(()=>{

                        wheels[curentDraw-1][wheelNum].beat.scale = 1;

                    },50);
                }, time); 
            }
        }, patterns[sample][hexNum + 1], '1m' );
        seqs[sample] = seq;
        start?seq.start(0):seq.stop();
    };



    const changeHex =(currentWheel,wheelNum,hexNum)=> {                        
        let otherHexes = [...currentWheel[wheelNum].hexes];
        otherHexes.splice(hexNum,1);
        otherHexes.forEach(hex=>hex.fill = colors.hex.off);      
        let currentHexesNew = {};
        currentHexesNew = currentHexes;  
        let start=true;
        
        if(currentHexes[wheelNum] ===hexNum){
            currentWheel[wheelNum].hexes[hexNum].fill = colors.hex.off;            
            currentHexesNew[wheelNum] = undefined;
            setCurrentHexes(currentHexesNew);
            start=false;
            
        } else{
            currentWheel[wheelNum].hexes[hexNum].fill = colors.hex.on;
            currentHexesNew[wheelNum] = hexNum;
            setCurrentHexes(currentHexesNew);
        }

        return start;
    }

    const handleClick =(wheelNum,hexNum)=>{                
        let start = changeHex(wheels[0],wheelNum,hexNum);
        changeSequence(props.player,wheelNum,hexNum,start);
        props.socket.emit('clSeq',{wheel: wheelNum,hex: hexNum,start});   
    }


    const makeFriendHexWheel =(two,x,y,r,gX,gY,rot,length,dashes)=>{
        let beat = two.makeCircle(x,y,r);
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
        beat.fill = (colors.hex.beat);
        
  
      
        let hex1 = two.makePolygon(x+r/1.135 -1,r/2+y,r,6);
        hex1.rotation = 1.5708;
        let hex2 = two.makePolygon(x -r/1.135 + 1,r/2+y,r,6);
        hex2.rotation = 1.5708;
        let hex3 = two.makePolygon(x,-r,r,6);
        hex3.rotation = 1.5708;
        hex1.fill = colors.hex.off;
        hex2.fill = colors.hex.off;
        hex3.fill = colors.hex.off;
        let wheel1 = two.makeGroup(beat,hex1,hex2,hex3)
        let wheel = two.makeGroup(wheel1,fader,curve);        
        wheel.translation.set(gX,gY);
        wheel.rotation = degToRad(rot);

        return {wheel:wheel1,hexes: [hex1,hex2,hex3],curve,fader,beat};
    }
    

    const makeHexWheel =(two,x,y,r,gX,gY,rot,length,dashes)=>{
        let circle = two.makeCircle(x,y-r*2 + 2,r/2);
        let beat = two.makeCircle(x,y,r);

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

        beat.fill = (colors.hex.beat);
  
      
        let hex1 = two.makePolygon(x+r/1.135 -1,r/2+y,r,6);
        hex1.rotation = 1.5708;
        let hex2 = two.makePolygon(x -r/1.135 + 1,r/2+y,r,6);
        hex2.rotation = 1.5708;
        let hex3 = two.makePolygon(x,-r,r,6);
        hex3.rotation = 1.5708;
        hex1.fill = colors.hex.off;
        hex2.fill = colors.hex.off;
        hex3.fill = colors.hex.off;
        let wheel1 = two.makeGroup(beat,hex1,hex2,hex3,circle,)
        let wheel = two.makeGroup(wheel1,fader,curve);        
        wheel.translation.set(gX,gY);
        wheel.rotation = degToRad(rot);
        wheel1.opacity = 0.5;

        setTimeout(() => {
            setTimeout(() => {
                wheel1._renderer.elem.classList.add('wheel');
                wheel1.opacity = 1;
                wheel1._renderer.elem.classList.add('on');
                wheel1._renderer.elem.classList.add('set');
            }, 2000);
        }, 1000);
        

        return {wheel:wheel1,hexes: [hex1,hex2,hex3],circle,curve,fader,beat};
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

    const changeEffect=(msg,isSelf)=>{
        if(typeof props.player === 'number'){
            // console.log(isSelf);
            let id = isSelf?2:1;
            if(props.player === id){
                switch(instruments[2][msg.index]){
                    case 'clap':
                        reverb.wet.value = msg.amount;
                        break;
                    case 'kick':
                        dist.distortion = msg.amount;
                        break;
                    default:
                        console.log(instruments[2][msg.index]);
                        break;
                        
                }
            } else{
                switch(instruments[1][msg.index]){
                    case 'snare':
                        pitchshift.pitch = msg.amount*20-10;
                        break;
                    default:
                        console.log(instruments[1][msg.index]);    
                        break;
                }
            }
            
        }
    }

    useEffect(()=>{
        if(props.socket!==null){
            props.socket.on('clFx',(msg)=>{
                wheels[1][msg.index].fader.ending = msg.amount;
                wheels[1][msg.index].wheel.rotation = degToRad(msg.amount*120);
                changeEffect(msg,false);
            });
            props.socket.on('clSeq',(msg)=>{                                                
                let start = changeHex(wheels[1],msg.wheel,msg.hex);
                if(props.player){
                    if(props.player===1){
                        changeSequence(2,msg.wheel,msg.hex,start);
                    }else{
                        changeSequence(1,msg.wheel,msg.hex,start);
                    }
                }
            });     
        }
        // eslint-disable-next-line
    },[props.socket,props.player])


    return(

        <div style={{position: 'fixed' , backgroundColor:'aqua',height: '100%',userSelect: 'none',WebkitTapHighlightColor:'rgb(0,0,0,0)',WebkitUserSelect:'none',WebkitTouchCallout:'none',outline: 'none'}}>
            <div 
            style={{position: 'fixed' , backgroundColor:'aqua',height: '100%',userSelect: 'none',WebkitTapHighlightColor:'rgb(0,0,0,0)',WebkitUserSelect:'none',WebkitTouchCallout:'none',outline: 'none'}}
            id='canvas'
            >
            </div>
        </div>
    );
}