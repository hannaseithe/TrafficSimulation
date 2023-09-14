import { prng } from './prng';
import { Road } from './road';
import { draw } from './draw';


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



let v0 = 30;    //Wunschgeschwindigkeit
let s0 = 3;     //Mindestabstand
let T = 1;    //Folgezeit
let a = 1.5;      //Beschleunigung
let b = 2;      //komfortable Bremsverzögerung
let bmax = 3;   //max. Bremsverzögerung
let fps = 30;   //Frames per Seconds
let timewarp = 4;
let spawnProb = 0.02*timewarp;
let dt = timewarp / fps;

let road = new Road(rand, v0);

function calcAcc(s, v, vl, al, slowed) {

    let accNoise = a * (rand() * 0.02 - 0.01);

    // actual IDM model
    let slower = slowed? 0.2:1;
    //Beschleinigung auf freier Strecke
    var accFree = (v < v0) ? a * (1 - Math.pow(v / (v0*slower), 4))
        : a * (1 - v / v0);
    //s* ist Wunschabstand
    var sstar = s0 + Math.max(0., v * T + 0.5 * v * (v - vl) / Math.sqrt(a * b));
    //Anteil an Beschleunigung der durch den Wunschabstand (<GEschwindigkeitsdifferenz) und dem realen Abstand bestimmt wird
    var accInt = -a * Math.pow(sstar / Math.max(s, s0), 2);

    return (v0 < 0.00001) ? 0
        : Math.max(-bmax, accFree + accInt + accNoise);
}

//this is where the Intelligent Driver Model(IDM) is implemented
//update each vehicle with new position/speed/acceleration (PSA) based on IDM
function update_psa(road) {
    road.segments.forEach((segment) => segment.vehicles.forEach((veh, i, vehicles) => {
        let s, leadSpeed, leadAcc;

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
            
            veh.acc = calcAcc(s, veh.speed, leadSpeed, leadAcc, veh.slowed)
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
            if (veh.slowed) {
               veh.slowedCounter--;
               if (veh.slowedCounter<1) {
                veh.color="gold";
                veh.slowed=false;
               }
            }

        

    })
    )
}

function update_newVeh(road) {
    //spawn new vehicles
    if (rand() < spawnProb && (road.segments[0].vehicles.length == 0 || road.segments[0].vehicles[0].position > 30)) {
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

function onclick(event) {
    var x = event.pageX - canvasLeft,
    y = event.pageY - canvasTop;

// Collision detection between clicked offset and element.




road.drawnVehicles.forEach(function(vehicle) {
    if (y > vehicle.y - vehicle.width*3 && y < vehicle.y + vehicle.width*3
        && x > vehicle.x - vehicle.len*3 && x < vehicle.x + vehicle.len*3) {
            let clickedVehicle = road.segments[vehicle.segment].vehicles[vehicle.index]
        clickedVehicle.color = "red";
        clickedVehicle.slowed=true;
        clickedVehicle.slowedCounter=300/timewarp;
    }
});
}

let     canvasLeft = canvas.offsetLeft + canvas.clientLeft,
    canvasTop = canvas.offsetTop + canvas.clientTop;







canvas.addEventListener('click', onclick, false);
var myRun = setInterval(main_loop, 1000 / fps); 
