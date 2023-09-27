import { VEH_TYPES } from "./types";
import { Zebra } from "./vehicle";

class Segment {
  type: string;
  start: [number, number];
  end: [number, number];
  before: [];
  after: [];
  arclength: number;
  vehicles = [];
  pedestrians = [];
  zebra = false;
  zebraCounter = 0;
  zebraLink;
  zebraPosition;
  zebraVehicle;
  tangent: Function;
  c: Function;
  b: Function;
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
    /*     ctx.translate(0,20);
        ctx.fillText(ped.after + " / " + ped.before, 0, 0); */
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
  increaseZebra() {
    if (this.zebra) {
      if (this.zebraCounter == 0) {
        this.zebraLink.segment.activateZebra()
      }
      this.zebraCounter++
    }
  }

  decreaseZebra() {
    if (this.zebra) {
      if (this.zebraCounter > 0) {
        if (this.zebraCounter == 1) { this.zebraLink.segment.deactivateZebra() }
        this.zebraCounter--
      }
    }
  }

  activateZebra() {
    let newZebra = new Zebra(0, this.zebraPosition, 0);
    this.zebraVehicle = newZebra;
    this.vehicles.push(newZebra)
  }

  deactivateZebra() {
    let i = this.vehicles.findIndex((vehicle) => vehicle.type == VEH_TYPES.ZEBRA);
    this.vehicles.splice(i, 1)
  }

}

export class StraightSegment extends Segment {
  constructor(config) {
    super(config);
    this.arclength = this.arcLength(1)
  }
  b = (t) => {
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

  computeIntersectionsWithStraight(start, end) {
    let a = this.start[0] - start[0];       //xs1-xs2
    let b = this.start[1] - start[1];       //ys1-ys2
    let c = this.end[0] - this.start[0];  //xe1 - xs2
    let d = end[0] - start[0];            //xe2 - xs2
    let e = this.end[1] - this.start[1];  //ye1 - ys1
    let f = end[1] - start[1];            //ye2-ys2

    let u = (a * e - b * c) / (d * e - c * f)
    let t = (u * d - a) / c

    return { tS: t, toS: u }
  }

  drawSegment(ctx, type, zebra = false) {
    ctx.beginPath();
    ctx.moveTo(...this.start);
    ctx.lineTo(...this.end);
    if (type == "road") {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
    } else if (type == "sw") {
      ctx.lineWidth = 2
      ctx.strokeStyle = "white";
      if (zebra) {
        ctx.setLineDash([3, 3]);
      }
    }
    ctx.stroke();
    ctx.setLineDash([]);

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

  bezierCoeffs() {
    var Z = Array();
    //-P0 + 3*P1 + -3*P2 + P3
    Z[0] = [-this.start[0] + 3 * this.points[0][0] - 3 * this.points[1][0] + this.end[0],
    -this.start[1] + 3 * this.points[0][1] - 3 * this.points[1][1] + this.end[1]]
    //3 * P0 - 6 * P1 + 3 * P2;
    Z[1] = [3 * this.start[0] - 6 * this.points[0][0] + 3 * this.points[1][0],
    3 * this.start[1] - 6 * this.points[0][1] + 3 * this.points[1][1]]
    //-3 * P0 + 3 * P1
    Z[2] = [-3 * this.start[0] + 3 * this.points[0][0],
    -3 * this.start[1] + 3 * this.points[0][1]];
    //P0
    Z[3] = this.start;
    return Z;
  }

  sgn(x) {
    if (x < 0.0) return -1;
    return 1;
  }

  sortSpecial(a) {
    var flip;
    var temp;

    do {
      flip = false;
      for (var i = 0; i < a.length - 1; i++) {
        if ((a[i + 1] >= 0 && a[i] > a[i + 1]) ||
          (a[i] < 0 && a[i + 1] >= 0)) {
          flip = true;
          temp = a[i];
          a[i] = a[i + 1];
          a[i + 1] = temp;

        }
      }
    } while (flip);
    return a;
  }

  cubicRoots(P) {
    var a = P[0];
    var b = P[1];
    var c = P[2];
    var d = P[3];

    var A = b / a;
    var B = c / a;
    var C = d / a;

    var Q, R, D, S, T, Im;

    Q = (3 * B - Math.pow(A, 2)) / 9;
    R = (9 * A * B - 27 * C - 2 * Math.pow(A, 3)) / 54;
    D = Math.pow(Q, 3) + Math.pow(R, 2);    // polynomial discriminant

    var t = Array();

    if (D >= 0)                                 // complex or duplicate roots
    {
      S = this.sgn(R + Math.sqrt(D)) * Math.pow(Math.abs(R + Math.sqrt(D)), (1 / 3));
      T = this.sgn(R - Math.sqrt(D)) * Math.pow(Math.abs(R - Math.sqrt(D)), (1 / 3));

      t[0] = -A / 3 + (S + T);                    // real root
      t[1] = -A / 3 - (S + T) / 2;                  // real part of complex root
      t[2] = -A / 3 - (S + T) / 2;                  // real part of complex root
      Im = Math.abs(Math.sqrt(3) * (S - T) / 2);    // complex part of root pair   

      /*discard complex roots*/
      if (Im != 0) {
        t[1] = -1;
        t[2] = -1;
      }

    }
    else                                          // distinct real roots
    {
      var th = Math.acos(R / Math.sqrt(-Math.pow(Q, 3)));

      t[0] = 2 * Math.sqrt(-Q) * Math.cos(th / 3) - A / 3;
      t[1] = 2 * Math.sqrt(-Q) * Math.cos((th + 2 * Math.PI) / 3) - A / 3;
      t[2] = 2 * Math.sqrt(-Q) * Math.cos((th + 4 * Math.PI) / 3) - A / 3;
      Im = 0.0;
    }

    /*discard out of spec roots*/
    for (var i = 0; i < 3; i++)
      if (t[i] < 0 || t[i] > 1.0) t[i] = -1;

    /*sort but place -1 at the end*/
    t = this.sortSpecial(t);

    console.log(t[0] + " " + t[1] + " " + t[2]);
    return t;
  }

  computeIntersectionsWithStraight(start, end) {
    var X = Array();

    var A = end[1] - start[1];	    //A=y2-y1
    var B = end[0] - start[0];	    //B=x1-x2
    var C = start[0] * (start[1] - end[1]) +
      start[1] * (end[0] - start[0]);	//C=x1*(y1-y2)+y1*(x2-x1)

    let b = this.bezierCoeffs();

    var P = Array();
    P[0] = A * b[0][0] + B * b[0][1];		/*t^3*/
    P[1] = A * b[1][0] + B * b[1][1];		/*t^2*/
    P[2] = A * b[2][0] + B * b[2][1];		/*t*/
    P[3] = A * b[3][0] + B * b[3][1] + C;	/*1*/

    var r = this.cubicRoots(P);
    let t;
    /*verify the roots are in bounds of the linear segment*/
    for (var i = 0; i < 3; i++) {
      t = r[i];

      X[0] = b[0][0] * t * t * t + b[1][0] * t * t + b[2][0] * t + b[3][0];
      X[1] = b[0][1] * t * t * t + b[1][1] * t * t + b[2][1] * t + b[3][1];

      /*above is intersection point assuming infinitely long line segment,
        make sure we are also in bounds of the line*/
      var s;
      if ((end[0] - start[0]) != 0)           /*if not vertical line*/
        s = (X[0] - start[0]) / (end[0] - start[0]);
      else
        s = (X[1] - start[1]) / (end[1] - start[1]);

      /*in bounds?*/
      if (t >= 0 && t <= 1.0 && s >= 0 && s <= 1.0) {
        return { tS: t, toS: s }
      }
    }
    return { error: "no-intersection" }
  }



  drawSegment(ctx, type, n = 200) {
    segments([...Array(n + 1).keys()].map(k => this.c((this.arclength) * k / n)), ctx, type)
  }
}