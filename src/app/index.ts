import { prng } from './prng';
import { draw } from './draw';
import { VEH_TYPES, TL_STATES } from './types';
import { TestRoad } from './roads/TestRoad';
import { PedRoad } from './roads/PedRoad';


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



let v0 = 50;    //Wunschgeschwindigkeit
let s0 = 2;     //Mindestabstand
let T = 1.8;    //Folgezeit
let a = 2;      //Beschleunigung
let b = 3;      //komfortable Bremsverzögerung
let bmax = 8;   //max. Bremsverzögerung
let fps = 30;   //Frames per Seconds
let numberVeh = 5;
let numberPed = 10;
let timewarp = 20;
let spawnProb = 0.02 * timewarp;
let dt = timewarp / fps;
let phaseLength = 4.5;

let roadConfig = {
    maxSpeed: v0,
    b: b,
    numberVeh: numberVeh,
    numberPed: numberPed
}

let road = new PedRoad(rand, roadConfig);

//this is where the Intelligent Driver Model(IDM) is implemented
function calcAcc(road, veh, s, v, vl, al) {

    let accNoise = (a*veh.aF) * (rand() * 0.02 - 0.01);

    // actual IDM model
    let slower = veh.slowed ? 0.01 : 1;
    let localSpeed = road.getSpeedLimit(veh.segment,veh.position);
    //Beschleinigung auf freier Strecke
    var accFree = (v < (localSpeed*veh.v0F)) ? (a*veh.aF) * (1 - Math.pow(v / ((localSpeed*veh.v0F) * slower), 4))
        : (a*veh.aF) * (1 - v / (localSpeed*veh.v0F));
    //s* ist Wunschabstand
    var sstar = (s0*veh.s0F) + Math.max(0, v * (T*veh.TF) + 0.5 * v * (v - vl) / Math.sqrt((a*veh.aF) * (b*veh.bF)));
    //Anteil an Beschleunigung der durch den Wunschabstand (<Geschwindigkeitsdifferenz) und dem realen Abstand bestimmt wird
    var accInt = -(a*veh.aF) * Math.pow(sstar / Math.max(s, (s0*veh.s0F)), 2);

    return ((localSpeed*veh.v0F) < 0.00001) ? 0
        : Math.max(-bmax, accFree + accInt + accNoise);
}


//update each vehicle with new position/speed/acceleration (PSA) based on IDM
function update_psa(road) {
    road.segments.forEach((segment) => segment.vehicles.forEach((veh, i, vehicles) => {
        if (!veh.collided && veh.type == VEH_TYPES.CAR) {
            let s, leadSpeed, leadAcc;
            let leadVeh;

            if (veh.lead) {

                leadVeh = veh.lead.veh;
                s = veh.lead.relPos + leadVeh.position - leadVeh.len - veh.position;
                leadSpeed = leadVeh.speed;
                leadAcc = leadVeh.acc;

            } else {
                s = 100000;
                leadSpeed = 0;
                leadAcc = 0;
            }

            veh.acc = calcAcc(road, veh, s, veh.speed, leadSpeed, leadAcc)
            veh.position += Math.max(0, veh.speed * dt + 0.5 * veh.acc * dt * dt);

            veh.speed = Math.max(veh.speed + veh.acc * dt, 0);

            //move to next segment

            if (veh.position > road.segments[veh.segment].arclength) {

                //das muss umgestaltet werden wenn mehr als ein Segment hier zusammen laufen
                // dann muss man die neuen Autos in der Reihenfolge in der sie im neuen Segment treffen
                //in einem Zwischenschritt einordnen (sprich gesucht ist Zeitspanne des Wegstücks bis Ende altes
                //Segment). Und dann davon ausgehend eventuelle Kollisionen überprüfen


                if (road.segments[veh.segment].after.length > 0) {
                    veh.position = veh.position - road.segments[veh.segment].arclength;
                    veh.segment = segment.after[0];
                    road.segments[segment.after[0]].vehicles.unshift(veh);
                }
                vehicles.splice(i, 1);

            }
            if (veh.slowed) {
                veh.slowedCounter--;
                if (veh.slowedCounter < 1) {
                    veh.color = "gold";
                    veh.slowed = false;
                }
            }
        }
        if (veh.type == VEH_TYPES.TRAFFIC_LIGHT) {
            if (veh.tf.counter == 0) {
                veh.tf.state = (veh.tf.state == TL_STATES.GREEN) ? TL_STATES.YELLOW : (veh.tf.state == TL_STATES.YELLOW)? TL_STATES.RED : TL_STATES.GREEN
            }
            if (veh.tf.state == TL_STATES.YELLOW) {
                let localSpeed = road.getSpeedLimit(veh.segment, veh.position)
                veh.tf.counter = (veh.tf.counter - 1) % (Math.floor(Math.max(1,0.36*localSpeed -1.97) *fps))
            } else {
                veh.tf.counter = (veh.tf.counter - 1) % (phaseLength *fps)
            }
            
        }
    })
    )
    road.segments.forEach((segment) => segment.vehicles.forEach((veh, i, vehicles) => {
        //testing for collision
        if (veh.type == VEH_TYPES.CAR && veh.lead && veh.lead.veh.type == VEH_TYPES.CAR
            && veh.lead.veh.segment == veh.segment
            && veh.position > veh.lead.veh.position - veh.lead.veh.len) {
            veh.speed = 0;
            veh.lead.speed = 0;
            veh.collided = veh.lead.veh.collided = true
        }
    }))
    road.swSegments.forEach((segment) => segment.pedestrians.forEach((ped, i, pedestrians)=> {
        ped.position += ped.direction *(ped.speed * dt + 0.5 * ped.acc * dt * dt);

        if (ped.position > road.swSegments[ped.segment].arclength) {
            if (segment.after.length > 0) {
                ped.position = ped.position - road.swSegments[ped.segment].arclength;
                ped.segment = segment.after[0];
                road.swSegments[segment.after[0]].pedestrians.unshift(ped);
            }
            pedestrians.splice(i, 1);

        }
        if (ped.position < 0) {
            if (segment.before.length > 0) {
                let beforeIndex = segment.before[0]
                ped.position = road.swSegments[beforeIndex].arclength + ped.position;
                ped.segment = segment.before[0];
                road.swSegments[segment.before[0]].pedestrians.push(ped);
            }
            pedestrians.splice(i, 1);

        }

        //veh.speed = Math.max(veh.speed + veh.acc * dt, 0);  
    }))
}

function update_newVeh(road) {
    //spawn new vehicles
    let veh_num = road.getVehicleNumber();
    if (veh_num < road.number_veh && rand() < spawnProb && (road.segments[0].vehicles.length == 0 || road.segments[0].vehicles[0].position > 30)) {
        road.newVehicle(rand);
    }
}

function update_newPed(road) {
    //spawn new vehicles
    let ped_num = road.getPedestrianNumber();
    if (ped_num < road.number_ped && rand() < spawnProb ) {
        road.newPedestrian(rand);
    }
}

function update_leadVeh(road) {
    road.sortVehicles();
    road.update_leadVeh();
}

function update_ped(road) {
    update_newPed(road);
    road.sortPed()
}


function update(road) {

    update_psa(road);
    update_newVeh(road);
    update_leadVeh(road);
    update_ped(road)

}

/*Loop by timestep*/

function main_loop() {
    draw(road, ctx);
    update(road);
}

function onclick(event) {
    let x = event.pageX - canvasLeft,
        y = event.pageY - canvasTop;


    road.drawnVehicles.forEach(function (vehicle) {
        if (y > vehicle.y - vehicle.veh.width * 3 && y < vehicle.y + vehicle.veh.width * 3
            && x > vehicle.x - vehicle.veh.len * 3 && x < vehicle.x + vehicle.veh.len * 3) {
            let clickedVehicle = vehicle.veh;
            if (clickedVehicle.type == VEH_TYPES.CAR) {
                clickedVehicle.color = "red";
                clickedVehicle.slowed = true;
                clickedVehicle.slowedCounter = 300 / timewarp;
            } else if (clickedVehicle.type == VEH_TYPES.TRAFFIC_LIGHT) {
                clickedVehicle.tf.state = (clickedVehicle.tf.state == TL_STATES.GREEN) ? TL_STATES.YELLOW : (clickedVehicle.tf.state == TL_STATES.YELLOW)? TL_STATES.RED : TL_STATES.GREEN;
                if (clickedVehicle.tf.state == TL_STATES.YELLOW) {
                    let localSpeed = road.getSpeedLimit(clickedVehicle.segment, clickedVehicle.position)
                    clickedVehicle.tf.counter = (Math.floor(Math.max(1,0.36*localSpeed - 1.97) *fps))
                }
                clickedVehicle.tf.counter = phaseLength * fps
            }

        }
    });
}

let canvasLeft = canvas.offsetLeft + canvas.clientLeft,
    canvasTop = canvas.offsetTop + canvas.clientTop;







canvas.addEventListener('click', onclick, false);
var myRun = setInterval(main_loop, 1000 / fps); 
