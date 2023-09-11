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
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

/*
seed Random
*/

let rand = prng("marmelaede");

/*
create Road
*/



let v0 = 10;
let s0 = 3;
let T = 1.4;
let a = 2;
let b = 3;
let bmax = 3;
let fps = 30;
let timewarp = 5;
let spawnProb = 0.01*timewarp;
let dt = timewarp / fps;

let road = new Road(rand, v0);

function calcAcc(s, v, vl, al) {

    let accNoise = a * (rand() * 0.02 - 0.01);

    // actual acceleration model

    var accFree = (v < v0) ? a * (1 - Math.pow(v / v0, 4))
        : a * (1 - v / v0);
    var sstar = s0 + Math.max(0., v * T + 0.5 * v * (v - vl) / Math.sqrt(a * b));
    var accInt = -a * Math.pow(sstar / Math.max(s, s0), 2);

    // return original IDM

    return (v0 < 0.00001) ? 0
        : Math.max(-bmax, accFree + accInt + accNoise);
}

//this is where the Intelligent Driver Model(IDM) is implemented
//update each vehicle with new position/speed/acceleration (PSA) based on IDM
function update_psa(road) {
    road.segments.forEach((segment) => segment.vehicles.forEach((veh, i, vehicles) => {
        let s, leadSpeed, leadAcc;
        console.log(segment.arclength);

            if (veh.lead.veh > -1) {
                s = vehicles[veh.lead.veh].position - vehicles[veh.lead.veh].len - veh.position;
                leadSpeed = vehicles[veh.lead.veh].speed;
                leadAcc = vehicles[veh.lead.veh].acc ;
            } else if (veh.lead.seg == -1) {
                s = 100000;
                leadSpeed = 0;
                leadAcc = 0;
            } else {
                s = veh.lead.relPos + road.segments[veh.lead.seg].vehicles[0].len - veh.position;
                leadSpeed = road.segments[veh.lead.seg].vehicles[0].speed;
                leadAcc = road.segments[veh.lead.seg].vehicles[0].acc ;
            } 
            
            veh.acc = calcAcc(s, veh.speed, leadSpeed, leadAcc)
            veh.position += Math.max(0, veh.speed * dt + 0.5 * veh.acc * dt * dt);
    
            veh.speed = Math.max(veh.speed + veh.acc * dt, 0);
    
            if (veh.position > road.segments[veh.segment].arclength) {

                //hier liegt der Wurm begraben, das habe ich noch gar nicht richtig auf die Segmentenaufteilung der Vehicles angepasst!!!
                if (road.segments[veh.segment].after.length > 0) {
                    veh.position = veh.position - road.segments[veh.segment].arclength;
                    veh.segment = segment.after[0];
                    road.segments[segment.after[0]].vehicles.unshift(veh);
                } 
                vehicles.splice(i, 1);
    
            }

        

    })
    )
}

function update_newVeh(road) {
    //spawn new vehicles
    if (rand() < spawnProb && (road.segments[0].vehicles.length == 0 || road.segments[0].vehicles[0].position > 60)) {
        road.newVehicle(rand);
    }
}

function update_leadVeh(road) {
    road.sortVehicles();
    road.update_leadVeh();
}


function update(road) {

    update_psa(road);
    update_newVeh(road);
    update_leadVeh(road);

}

/*Loop by timestep*/

function main_loop() {
    draw(road, ctx);
    update(road);
}

/*function onclick(event) {
    var x = event.pageX - canvasLeft,
    y = event.pageY - canvasTop;

// Collision detection between clicked offset and element.
canvasVehicles.forEach(function(vehicle) {
    if (y > vehicle.top && y < vehicle.top + vehicle.len
        && x > vehicle.left && x < vehicle.left + vehicle.width) {
        alert('clicked an element');
    }
});
}

let     canvasLeft = canvas.offsetLeft + canvas.clientLeft,
    canvasTop = canvas.offsetTop + canvas.clientTop,
    canvasVehicles = [];

// Add event listener for `click` events.


// Add element.
vehicles.push({
    colour: '#05EFFF',
    width: 150,
    height: 100,
    top: 20,
    left: 15
});



canvas.addEventListener('click', onclick, false);*/
var myRun = setInterval(main_loop, 1000 / fps); 
