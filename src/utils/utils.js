



export const degToRad=(deg)=>{
    let pi = Math.PI;
    return deg * pi / 180;
  }
  
export const radToDeg=(rad)=>{
    let pi = Math.PI;
    return rad * 180 / pi;
}
  


export const wheelRange = {
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



export const onStart =( e )=> {    
  if( navigator.userAgent.match(/Android/i && e.target.id === 'two-1')) {
      e.preventDefault();
  }
}