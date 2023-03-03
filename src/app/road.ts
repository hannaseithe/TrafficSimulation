import { Vehicle } from './vehicle';
export class Road {
    length = 1000;
    number_veh = 5;
    max_speed;
    vehicles: Vehicle[] = [];
    segments = [{
        type: "straight",
        start: [0,100],
        end: [1000,100]
    }]
    constructor (rand, v0){
        this.max_speed = v0;
        for (let i=0; i<this.number_veh; i++) {
            let new_position = this.noCollisionPos(rand);

            this.vehicles[i] = new Vehicle(this.max_speed*rand(),new_position);
        }
        this.vehicles.sort((veh1,veh2)=>veh2.position - veh1.position)
    }

    private noCollisionPos(rand) {
        let testPos = this.length * rand();
        if (this.vehicles.every((veh) => Math.abs(testPos - veh.position) > 10)) {
            return testPos
        } else { return this.noCollisionPos(rand)}
    }

    private sortVehicles() {

    }
}