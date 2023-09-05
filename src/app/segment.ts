class Segment {
    type: string;
    start: [number,number];
    end: [number,number];
    before: [];
    after: [];
    arclength: number
    constructor(config) {
        this.type = config.type;
        this.start = config.start;
        this.end = config.end;
        this.before = config.before;
        this.after = config.after;
    }
    drawSegment(ctx) {};
    drawVehicle(vehicle,ctx) {};
}

export class StraightSegment extends Segment {
    constructor(config) {
        super(config);
        this.arclength = this.arcLength(1)
    }
    arcLength(t) {
        return t*Math.sqrt(Math.pow(this.end[0]-this.start[0],2)+Math.pow(this.end[1]-this.start[1],2))
    }
    drawSegment(ctx) {
        ctx.beginPath();
        ctx.moveTo(...this.start);
        ctx.lineTo(...this.end);
        ctx.stroke();
    }
    drawVehicle(vehicle,ctx) {
        ctx.arc(...vehicle.position, 5, 0, 2*Math.PI)
    }
}

function segments(points,ctx) {
    ctx.beginPath();
    for (let point of points) {
        ctx.moveTo(...this.start);
        ctx.lineTo(...this.end);
    }
    ctx.stroke();
 }

 //linear Interpolation needed for numerical integration

 function lerp1 (a,b,prop)
 {
   return a+prop*(b-a)
 }
 
 function inverseLerp(a,b,c)
 {
   return ((c-a)/(b-a))
 }
 
 const CubicQuadrature =
   [[-0.7745966, 0.5555556], [0, 0.8888889], [0.7745966, 0.5555556]]

 
// Gaussian numerical integration method
 function numerically_integrate1(f, lb, ub)
 {
   let lowerBound;
   let upperBound = lb;
   let value = 0;
   for (let i = 0; i<ub ; i++) {
     lowerBound = upperBound;
     upperBound = i+1 < ub ? i+1 : ub;
     let sum = 0;
     CubicQuadrature.forEach(([arg, weight]) =>{
       var t = lerp1(lowerBound, upperBound, inverseLerp(-1, 1, arg));
       sum += weight * f(t);
     })
     value += sum * (upperBound - lowerBound) / 2
   }
   
   return value;
 }


  
  //b is parameterized curve b()[0] -> x-values/ b()[1] -> y-values

  //TODO: Es wäre besser wenn hier direkt auf die Punkte des Objekts zugriffen wird, 
  //weil wenn die Werte sich zur Laufzeit ändern sollten (Straßen werden verformt oder so),
  //dann funktioniert das hier nicht mehr
  
  function b_con(Points) {
    return t => [Math.pow((1-t),3)*Points[0][0]+3*t*Math.pow((1-t),2)*Points[1][0]+3*Math.pow(t,2)*(1-t)*Points[2][0]+Math.pow(t,3)*Points[3][0], 
    Math.pow((1-t),3)*Points[0][1]+3*t*Math.pow((1-t),2)*Points[1][1]+3*Math.pow(t,2)*(1-t)*Points[2][1]+Math.pow(t,3)*Points[3][1]]
  }

 //constructor of approximation function of derivative of f, returns function for approximation
function derivative_con(f) {
    let h = 0.000001;
    return x => [(f(x+h)[0]-f(x)[0])/h,(f(x+h)[1]-f(x)[1])/h]
  }
  
  //constructor of function that calculcates the speed of f 
  let speed_con = f => x => Math.sqrt(Math.pow(f(x)[0],2)+Math.pow(f(x)[1],2))
  
  //constructor of function for f reparameterized by arc-length
  let arcLength_con = f => t => numerically_integrate1(f,0,t)
  
  

export class BezierSegment extends Segment {
    constructor(config) {
        super(config);
        this.arclength = this.arcLength(1)
    }
    arcLength(t) {
        return t*Math.sqrt(Math.pow(this.end[0]-this.start[0],2)+Math.pow(this.end[1]-this.start[1],2))
    }

    b(t) = 
    
   
    drawSegment(ctx, n=200) {
        segments([...Array(n+1).keys()].map(k => this.c((this.arclength) * k/n)),ctx)
    }
    drawVehicle(vehicle,ctx) {
        ctx.arc(...vehicle.position, 5, 0, 2*Math.PI)
    }
}