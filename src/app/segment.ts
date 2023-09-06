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
    b(t) {
        return [this.start[0]+t*(this.end[0]-this.start[0]),
        this.start[1]+t*(this.end[1]-this.start[1])]
    }
    arcLength(t) {
        return t*Math.sqrt(Math.pow(this.end[0]-this.start[0],2)+Math.pow(this.end[1]-this.start[1],2))
    }

    inverse_al(s) {
        return s / Math.sqrt(Math.pow(this.end[0]-this.start[0],2)+Math.pow(this.end[1]-this.start[1],2))
    }

    c = (s) => this.b(this.inverse_al(s));

    drawSegment(ctx) {
        ctx.beginPath();
        ctx.moveTo(...this.start);
        ctx.lineTo(...this.end);
        ctx.stroke();
    }
    drawVehicle(vehicle,ctx) {
        let veh_point = this.c(vehicle.position);
        ctx.beginPath();
        ctx.arc(...veh_point, 5, 0, 2*Math.PI);
        ctx.stroke();
    }
}

function segments(points,ctx) {
    ctx.beginPath();
    ctx.moveTo(...points[0]);
    for (let point of points) {
        ctx.lineTo(...point);
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
    points;
    constructor(config) {
        super(config);
        this.points = config.points;
        this.arclength = this.arcLength(1)
    }

    b = (t) => {
        return [Math.pow((1-t),3)*this.start[0]+3*t*Math.pow((1-t),2)*this.points[0][0]+3*Math.pow(t,2)*(1-t)*this.points[1][0]+Math.pow(t,3)*this.end[0], 
        Math.pow((1-t),3)*this.start[1]+3*t*Math.pow((1-t),2)*this.points[0][1]+3*Math.pow(t,2)*(1-t)*this.points[1][1]+Math.pow(t,3)*this.end[1]]
    } 

   invert_arcl(s)
{
  //initial t
  let t =  s / this.arclength ;
  let lowerBound = 0; 
  let upperBound = 1;

  for (let i = 0; i < 25; ++i)
  {
    //we are looking for t that achieves a good enough approximation of f = 0, 
    //since then we reached the arcLength==s
    let al = this.arcLength(t)
    let f = al - s;

    if (Math.abs(f) < 0.1) {
        return t
    }
      

    let derivative = this.tangentLength(t);
    let candidateT = t - f / derivative;

    if (f > 0)
    {
      upperBound = t;
      if (candidateT <= 0)
        t = (upperBound + lowerBound) / 2;
      else
        t = candidateT;
    }
    else
    {
      lowerBound = t;
      if (candidateT >= 1)
        t = (upperBound + lowerBound) / 2;
      else
        t = candidateT;
    }
  }

  console.log('25');
  return t;
}

    b_dev = derivative_con(this.b);
    tangentLength = speed_con(this.b_dev);
    arcLength = arcLength_con(this.tangentLength);
    c = s => this.b(this.invert_arcl(s))

    
   
    drawSegment(ctx, n=200) {
        segments([...Array(n+1).keys()].map(k => this.c((this.arclength) * k/n)),ctx)
    }
    drawVehicle(vehicle,ctx) {
        ctx.beginPath();
        ctx.arc(...this.c(vehicle.position), 5, 0, 2*Math.PI);
        ctx.stroke();
    }
}