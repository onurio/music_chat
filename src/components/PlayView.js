import React,{useState,useEffect} from 'react';
import Tone from 'tone';
import Two from 'two.js';


const degToRad=(deg)=>{
  let pi = Math.PI;
  return deg * pi / 180;
}

let wheel;

export const PlayView=props=>{
    // const [wheel,setWheel] = useState(undefined);

    const handleMove=(two,e)=>{
        let rect = e.touches[0].target.parentElement.getBoundingClientRect();        
        let touch = {x:e.touches[0].clientX,y:e.touches[0].clientY}
        // let buttonX = rect.x;
        // let buttonY = rect.y;
        let x = rect.width/2 + rect.x;
        let y = rect.width/2 + rect.y;
        let button = {x:x,y:y};
        
        let result =  Math.atan2((button.y+ 20) - button.y, button.x - button.x) -  Math.atan2(touch.y - button.y, touch.x - button.x);
        wheel.wheel.rotation = 135 - result ;
        two.update();
        
        
    }


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
        wheel2.wheel.translation.set(width*0.75,height*0.875);
        wheel1.wheel.translation.set(width*0.25,height*0.875);
        wheel = wheel1;
        wheel3.wheel.translation.set(width*0.5,height*0.65);
        wheel3.wheel.rotation = degToRad(-60);
        wheel2.wheel.rotation = degToRad(-120);
        let fader1= makeFader(two,width*0.5,height*0.585,width/2.4);
        let fader2= makeFader(two,width*0.4,height*0.86,width/2.4);
        let fader3= makeFader(two,width*0.6,height*0.86,width/2.4);

        setTimeout(() => {
            wheel1.circle._renderer.elem.ontouchstart = ()=>console.log('hi');
            wheel1.circle._renderer.elem.ontouchmove = (e)=>handleMove(two,e);
            

            console.log(wheel1.circle._renderer.elem);
            
        }, 1000);



        fader1.fill = 'transparent';
        fader2.fill = 'transparent';
        fader3.fill = 'transparent';
        // console.log(wheel1.circle.dashes);
        fader1.dashes[0] = 5;
        fader2.dashes[0] = 10;
        fader3.dashes[0] = 6;
        fader2.rotation = degToRad(60);
        fader3.rotation = degToRad(-60);
        // curve.translation.set(width*0.5,height*0.65)
        
        two.update();
    }

    const makeFader =(two,x1,y1,length)=>{
        
        let curve = two.makeCurve(
            x1 - length/2,y1,
            x1 - length/2.5,y1-length/8,
            x1 - length/3,y1-length/5.75,
            x1 - length/4,y1-length/4.5,
            x1,y1 - length/3.6,
            x1 + length/4,y1-length/4.5,
            x1 + length/3,y1-length/5.75,
            x1 + length/2.5,y1-length/8,
            x1 + length/2,y1,
            true);
        curve.linewidth = 1;
        curve.opacity = 0.5;
        curve.cap = 'rounded'
        curve.subdivide();
        // curve.dashes.offset = 4;
        // curve.dashes.length = 2;
        // console.log(curve);
        
        return curve;
    }

    const makeHexWheel =(two,x,y,r)=>{
        let circle = two.makeCircle(x,y-r*2 + 2,r/2);

        let circle1 = two.makeCircle(x,y-r*2 + 2,r/5);
        circle.stroke = 'transparent';
        circle.fill = 'transparent';

        circle1.fill = 'black';
        
      
        let hex1 = two.makePolygon(x+r/1.135 -1,r/2+y,r,6);
        hex1.rotation = 1.5708;
        let hex2 = two.makePolygon(x -r/1.135 + 1,r/2+y,r,6);
        hex2.rotation = 1.5708;
        let hex3 = two.makePolygon(x,-r,r,6);
        hex3.rotation = 1.5708;
        let wheel = two.makeGroup(hex1,hex2,hex3,circle1,circle);        
        return {wheel,hex1,hex2,hex3,circle};
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