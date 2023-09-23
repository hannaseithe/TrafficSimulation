import { TrafficLight, Car } from './vehicle';
import { StraightSegment, BezierSegment } from './segment';
import { DRIV_TYPES, TL_STATES, VEH_TYPES } from './types';
export class Road {
    length: number;
    number_veh = 20;
    max_speed;
    b;
    segments = [];
    drawnVehicles = [];


    constructor(rand, config) {
        this.max_speed = config.maxSpeed;
        this.b = config.b;

        const segment_config_1 = {
            start: [100, 100],
            end: [400, 200],
            type: 'straight',
            before: [],
            after: [1]
        }
        this.segments[0] = new StraightSegment(segment_config_1)

        const segment_config_2 = {
            start: [400, 200],
            end: [600, 100],
            type: 'bezier',
            before: [0],
            after: [2],
            points: [[550, 250], [425, 150]]
        }

        this.segments[1] = new BezierSegment(segment_config_2)

        const segment_config_3 = {
            start: [600, 100],
            end: [800, 400],
            type: 'bezier',
            before: [1],
            after: [],
            points: [[950, 0], [500, 300]]
        }

        this.segments[2] = new BezierSegment(segment_config_3)

        this.length = this.segments.reduce((acc, segment) => acc + segment.arclength, 0)

        this.segments[1].vehicles.push(new TrafficLight(0, 100, 1,10))
        this.segments[2].vehicles.push(new TrafficLight(0, 100, 1, 400))

        for (let i = 0; i < Math.min(10,this.number_veh); i++) {
            let new_segment = Math.floor(this.segments.length * rand());
            let new_position = this.noCollisionPos(rand, new_segment);

            let r = rand();

            let driver = (r > 0.75) ? DRIV_TYPES.AGG: (r > 0.5) ? DRIV_TYPES.RES : (r > 0.25) ? DRIV_TYPES.REL : DRIV_TYPES.DEF; 

            this.segments[new_segment].vehicles.push(new Car(this.max_speed * (0.5 + rand() / 2), new_position, new_segment, driver));
        }
        this.sortVehicles()
        this.update_leadVeh()
    }

    public sortVehicles() {
        this.segments.forEach((segment) => segment.vehicles.sort((veh1, veh2) => veh1.position - veh2.position))
    }

    public newVehicle(rand) {
        let new_position = 0;
        let r = rand();
        let driver = (r > 0.75) ? DRIV_TYPES.AGG: (r > 0.5) ? DRIV_TYPES.RES : (r > 0.25) ? DRIV_TYPES.REL : DRIV_TYPES.DEF; 
        this.segments[0].vehicles.unshift(new Car(this.max_speed * (rand() / 2), new_position, 0, driver ))
    }

    public getVehicleNumber() {
        return this.segments
            .map((segment) => segment.vehicles.length)
            .reduce((acc, cur) => acc + cur, 0)
    }

    private noCollisionPos(rand, segment) {
        let testPos = this.segments[segment].arclength * rand();
        if (this.segments[segment].vehicles.every((veh) => {
            if (veh.segment == segment) {
                return Math.abs(testPos - veh.position) > 10
            }
            else return true
        })) {
            return testPos
        } else { return this.noCollisionPos(rand, segment) }
    }
    public canStop(vehicle,distance) {
        let result = ((vehicle.speed ** 2)/(2*this.b * vehicle.bF) ) < distance
        return result;
    }
    public update_leadVeh() {
        this.segments.forEach((segment, indexs, segments) => segment.vehicles.forEach((vehicle, indexv, vehicles) => {
            //mit nur einer Lane ist das natürlich trivial wenn das Array parallel auch sortiert wird, 
            //aber falls ich irgendwann mehrere Lanes will, dann braucht es das auch, daher implementiere ich das 
            //jetzt schon
            if (indexv < segment.vehicles.length - 1) {

                vehicle.lead = {
                    veh: segment.vehicles[indexv + 1],
                    relPos: 0
                }
            } else {
                let accLength = 0;
                let currentSegment = segment;
                let leadSegment = -1;
                let leaderFound = false;
                while (currentSegment.after.length > 0 && !leaderFound) {

                    if (segments[currentSegment.after[0]].vehicles.length > 0) {

                        leadSegment = currentSegment.after[0];
                        leaderFound = true
                    }
                    accLength += currentSegment.arclength;
                    currentSegment = segments[currentSegment.after[0]];
                }
                if (leaderFound) {
                    vehicle.lead = {
                        veh: segments[leadSegment].vehicles[0],
                        relPos: accLength
                    }
                } else { vehicle.lead = undefined }
            }

            if (vehicle.type == VEH_TYPES.TRAFFIC_LIGHT
                && (vehicle.tf.state == TL_STATES.GREEN || (vehicle.tf.state == TL_STATES.YELLOW && !this.canStop(vehicle.follower,vehicle.follower.lead.relPos + vehicle.position - vehicle.follower.position - vehicle.follower.len))) 
                && vehicle.follower) {
                if (vehicle.lead) {
                    vehicle.follower.lead.veh = vehicle.lead.veh;
                    vehicle.follower.lead.relPos += vehicle.lead.relPos;
                } else {
                    if ( vehicle.tf.state == TL_STATES.YELLOW) {

                    }
                    vehicle.follower.lead = undefined;
                }

            }

            if (vehicle.lead && vehicle.lead.veh.type == VEH_TYPES.TRAFFIC_LIGHT) {
                vehicle.lead.veh.follower = vehicle
            }



        }))
    }
}