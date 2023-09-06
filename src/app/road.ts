import { Vehicle } from './vehicle';
import { StraightSegment, BezierSegment } from './segment';
export class Road {
    length : number;
    number_veh = 5;
    max_speed;
    vehicles: Vehicle[] = [];
    segments = [];
      
      
    constructor (rand, v0){
        this.max_speed = v0;

        const  segment_config_1 = {
            start: [100,100],
            end:[400,200],
            type: 'straight',
            before: [],
            after: [1]
        }
        this.segments[0] = new StraightSegment(segment_config_1)

        const segment_config_2 = {
            start: [400,200],
            end:[800,800],
            type: 'bezier',
            before: [0],
            after: [],
            points:[[30,400],[300,300]]
        }

        this.segments[1] = new BezierSegment(segment_config_2)

        this.length = this.segments.reduce((acc, segment)=> acc + segment.arclength)

        for (let i=0; i<this.number_veh; i++) {
            let new_position = this.noCollisionPos(rand);

            this.vehicles[i] = new Vehicle(this.max_speed*rand(),new_position);
        }
        this.vehicles.sort((veh1,veh2)=>veh2.position - veh1.position)
    }

    public newVehicle(rand) {
        let new_position = 0;
        this.vehicles[this.vehicles.length] = new Vehicle(this.max_speed*rand(),new_position)
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