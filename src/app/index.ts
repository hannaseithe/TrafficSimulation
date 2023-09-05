import { prng } from './prng';
import { Road } from './road';
import { draw } from './draw';


/*
- get Canvas etc.
- seed Random
- create Road with random initial Cars (or should I let them randomly arrive after start?)
- drawRoad
    - drawBackground
    - drawCars
- LOOP:
    -Timestep
    - For each Car REACT
    - if distance_allows randomly get new Car start 
    - Calculate new Position for Each car
        - if car over finish delete
    - drawRoad
*/

/*
get Canvas
*/
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
let ctx = canvas.getContext('2d');
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;

/*
seed Random
*/

let rand = prng("marmelaede");

/*
create Road
*/



let v0 = 10;
let s0= 3;
let T =1.4; 
let a= 2;
let b = 3;
let bmax= 3;
let fps = 30;
let timewarp = 6;
let dt = timewarp/fps;

let road = new Road(rand,v0);

function calcAcc(s,v,vl,al){ 

let accNoise = a*(rand()*0.02 - 0.01);

    // actual acceleration model

var accFree=(v<v0) ? a*(1-Math.pow(v/v0,4))
: a*(1-v/v0);
var sstar = s0 + Math.max(0.,v*T+0.5*v*(v-vl)/Math.sqrt(a*b));
var accInt=-a*Math.pow(sstar/Math.max(s,s0),2);

    // return original IDM

return (v0<0.00001) ? 0 
: Math.max(-bmax, accFree + accInt + accNoise);
}

function update(road) {
    if (rand() > 0.95 && (road.vehicles.length == 0 || road.vehicles[road.vehicles.length-1].position > 60)) {
        road.newVehicle(rand);
    }
    road.vehicles.forEach((veh,i,vehicles)=> {
        let s = i >0 ? vehicles[i-1].position - vehicles[i-1].len - veh.position : 1000000;
        let leadSpeed = i > 0 ? vehicles[i-1].speed : 0;
        let leadAcc = i > 0 ? vehicles[i-1].acc : 0;
        veh.acc = calcAcc(s,veh.speed,leadSpeed,leadAcc)
        veh.position += Math.max(0,veh.speed*dt+0.5*veh.acc*dt*dt);

        veh.speed=Math.max(veh.speed+veh.acc*dt, 0);

        if (veh.position > road.length) {
            vehicles.shift()
        }

    })
    

}

/*Loop by timestep*/

function main_loop() {
    draw(road,ctx);
    update(road);
}



/*
draw Road with vehicles
*/

/*
calculate speed of each vehicle
*/

/*
calculate new position of each vehicle
*/


var myRun =setInterval(main_loop, 1000/fps); 
