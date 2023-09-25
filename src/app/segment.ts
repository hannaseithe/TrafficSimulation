import { VEH_TYPES } from "./types";

class Segment {
  type: string;
  start: [number, number];
  end: [number, number];
  before: [];
  after: [];
  arclength: number;
  vehicles = [];
  pedestrians = [];
  tangent: Function;
  c: Function;
  invert_arcl: Function;
  constructor(config) {
    this.type = config.type;
    this.start = config.start;
    this.end = config.end;
    this.before = config.before;
    this.after = config.after;

  }
  degree(point) {
    let degree = Math.acos(point[0] / Math.sqrt(Math.pow(point[0], 2) + Math.pow(point[1], 2)));
    degree = point[1] < 0 ? -degree : degree;
    return (degree)
  }
  drawSegment(ctx, type) { };
  drawVehicle(vehicle, ctx, seg_index, veh_index) {
    let veh_point = this.c(vehicle.position);
    let shift = [0, 0];

    ctx.save();

    ctx.beginPath();
    // move the rotation point to the center of the rect
    ctx.translate(veh_point[0], veh_point[1]);

    //calculate the rotation degree
    // rotate the rect
    let tangent = this.tangent(this.invert_arcl(vehicle.position));
    let degree = this.degree(tangent);
    ctx.rotate(degree);


    if (vehicle.type == VEH_TYPES.CAR) {



      // draw the rect on the transformed context

      ctx.rect(-vehicle.len / 2, -vehicle.width / 2, vehicle.len, vehicle.width);

      ctx.fillStyle = vehicle.collided ? "black" : vehicle.color;
      ctx.fill();

    } else if (vehicle.type == VEH_TYPES.TRAFFIC_LIGHT) {
      ctx.translate(0, 10);
      ctx.arc(0, 0, 3, 0, 2 * Math.PI);
      ctx.fillStyle = vehicle.tf.state;
      ctx.fill();
      shift = [-10 * Math.sin(degree),
      10 * Math.cos(degree)]
    }

    // restore the context to its untranslated/unrotated state
    ctx.restore();
    return {
      x: veh_point[0] + shift[0],
      y: veh_point[1] + shift[1],
      veh: vehicle,
      degree: degree
    }
  }

  drawPedestrian(ped, ctx) {
    let veh_point = this.c(ped.position);

    ctx.save();

    ctx.beginPath();
    // move the rotation point to the center of the rect
    ctx.translate(veh_point[0], veh_point[1]);

    //calculate the rotation degree
    // rotate the rect
    let tangent = this.tangent(this.invert_arcl(ped.position));
    let degree = this.degree(tangent);
    ctx.rotate(degree);
    if (ped.direction == -1) {
      ctx.rotate(Math.PI)
    }

    ctx.beginPath();
    ctx.moveTo(0, -3);
    ctx.lineTo(5, 0);
    ctx.lineTo(0, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

  }

  drawSpeedLimit(position, speed, ctx) {
    let sign_point = this.c(position);
    ctx.save();
    ctx.beginPath();
    ctx.translate(sign_point[0], sign_point[1]);
    let tangent = this.tangent(this.invert_arcl(position));
    let degree = this.degree(tangent);
    ctx.rotate(degree);

    ctx.translate(0, 15);
    ctx.arc(0, 0, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.rotate(-degree);

    if (speed == -1) {
      ctx.rotate(0.25 * Math.PI);
      ctx.moveTo(-1, -6);
      ctx.lineTo(-1, 6);
      ctx.moveTo(1, -6);
      ctx.lineTo(1, 6);
      ctx.strokeStyle = "black";
      ctx.stroke();
    } else {
      ctx.font = "9px Arial bold";
      ctx.fillStyle = "black";
      let limit = Math.floor(speed * 3.6).toString();
      if (limit.length == 3) {
        ctx.fillText(limit, -6, 3);
      } else {
        ctx.fillText(limit, -5, 3);
      }
    }



    ctx.restore();

  }
}

export class StraightSegment extends Segment {
  constructor(config) {
    super(config);
    this.arclength = this.arcLength(1)
  }
  b(t) {
    return [this.start[0] + t * (this.end[0] - this.start[0]),
    this.start[1] + t * (this.end[1] - this.start[1])]
  }
  arcLength(t) {
    return t * Math.sqrt(Math.pow(this.end[0] - this.start[0], 2) + Math.pow(this.end[1] - this.start[1], 2))
  }

  invert_arcl = (s) => {
    return s / Math.sqrt(Math.pow(this.end[0] - this.start[0], 2) + Math.pow(this.end[1] - this.start[1], 2))
  }

  tangent = () => {
    return [this.end[0] - this.start[0], this.end[1] - this.start[1]]
  }

  c = (s) => this.b(this.invert_arcl(s));

  drawSegment(ctx, type) {
    ctx.beginPath();
    ctx.moveTo(...this.start);
    ctx.lineTo(...this.end);
    if (type == "road") {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
    } else if (type == "sw") {
      ctx.lineWidth = 2
      ctx.strokeStyle = "white";
    }
    ctx.stroke();

  }

}

function segments(points, ctx, type) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (let point of points) {
    ctx.lineTo(...point);
  }
  if (type == "road") {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
  } else if (type == "sw") {
    ctx.lineWidth = 2
    ctx.strokeStyle = "white";
  }
  ctx.stroke();
}

//linear Interpolation needed for numerical integration

function lerp1(a, b, prop) {
  return a + prop * (b - a)
}

function inverseLerp(a, b, c) {
  return ((c - a) / (b - a))
}

const CubicQuadrature =
  [[-0.7745966, 0.5555556], [0, 0.8888889], [0.7745966, 0.5555556]]


// Gaussian numerical integration method
function numerically_integrate1(f, lb, ub) {
  let lowerBound;
  let upperBound = lb;
  let value = 0;
  for (let i = 0; i < ub; i++) {
    lowerBound = upperBound;
    upperBound = i + 1 < ub ? i + 1 : ub;
    let sum = 0;
    CubicQuadrature.forEach(([arg, weight]) => {
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
  return x => [(f(x + h)[0] - f(x)[0]) / h, (f(x + h)[1] - f(x)[1]) / h]
}

//constructor of function that calculcates the speed of f 
let speed_con = f => x => Math.sqrt(Math.pow(f(x)[0], 2) + Math.pow(f(x)[1], 2))

//constructor of function for f reparameterized by arc-length
let arcLength_con = f => t => numerically_integrate1(f, 0, t)



export class BezierSegment extends Segment {
  points;
  constructor(config) {
    super(config);
    this.points = config.points;
    this.arclength = this.arcLength(1)
  }

  b = (t) => {
    return [Math.pow((1 - t), 3) * this.start[0] + 3 * t * Math.pow((1 - t), 2) * this.points[0][0] + 3 * Math.pow(t, 2) * (1 - t) * this.points[1][0] + Math.pow(t, 3) * this.end[0],
    Math.pow((1 - t), 3) * this.start[1] + 3 * t * Math.pow((1 - t), 2) * this.points[0][1] + 3 * Math.pow(t, 2) * (1 - t) * this.points[1][1] + Math.pow(t, 3) * this.end[1]]
  }

  //3*d*t^2-3*c*t^2+6*c*(1-t)*t-6*b*(1-t)*t+3*b*(1-t)^2-3*a*(1-t)^2

  tangent = (t) => {
    return [-3 * this.start[0] * Math.pow(1 - t, 2) + 3 * this.points[0][0] * (Math.pow(1 - t, 2) - 2 * t * (1 - t)) + 3 * this.points[1][0] * (2 * t * (1 - t) - t * t) + 3 * this.end[0] * Math.pow(t, 2),
    -3 * this.start[1] * Math.pow(1 - t, 2) + 3 * this.points[0][1] * (Math.pow(1 - t, 2) - 2 * t * (1 - t)) + 3 * this.points[1][1] * (2 * t * (1 - t) - t * t) + 3 * this.end[1] * Math.pow(t, 2)]
  }

  invert_arcl = (s) => {
    //initial t
    let t = s / this.arclength;
    let lowerBound = 0;
    let upperBound = 1;

    for (let i = 0; i < 25; ++i) {
      //we are looking for t that achieves a good enough approximation of f = 0, 
      //since then we reached the arcLength==s
      let al = this.arcLength(t)
      let f = al - s;

      if (Math.abs(f) < 0.1) {
        return t
      }


      let derivative = this.tangentLength(t);
      let candidateT = t - f / derivative;

      if (f > 0) {
        upperBound = t;
        if (candidateT <= 0)
          t = (upperBound + lowerBound) / 2;
        else
          t = candidateT;
      }
      else {
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



  drawSegment(ctx, type, n = 200) {
    segments([...Array(n + 1).keys()].map(k => this.c((this.arclength) * k / n)), ctx, type)
  }
}