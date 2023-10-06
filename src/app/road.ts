import { TrafficLight, Car, Pedestrian } from './vehicle';
import { StraightSegment, BezierSegment } from './segment';
import { DRIV_TYPES, TL_STATES, VEH_TYPES } from './types';
export class Road {
    length: number;
    number_veh;
    max_speed;
    b;
    segments = [];
    swSegments = [];
    zebras = [];
    drawnVehicles = [];
    speedLimits = [];


    constructor(rand, config) {
        this.max_speed = config.maxSpeed;
        this.b = config.b;
        this.number_veh = config.numberVeh;

    }

    public sortVehicles() {
        this.segments.forEach((segment) => segment.vehicles.sort((veh1, veh2) => veh1.position - veh2.position))
    }

    public sortPed() {
        this.swSegments.forEach((segment) => segment.pedestrians.sort((ped1, ped2) => ped1.position - ped2.position))
    }

    public newVehicle(rand, spawnProb) {}

    public newPedestrian(rand) {
    }

    public getVehicleNumber() {
        return this.segments
            .map((segment) => segment.vehicles.length)
            .reduce((acc, cur) => acc + cur, 0)
    }

    public getPedestrianNumber() {
        return this.swSegments
            .map((segment) => segment.pedestrians.length)
            .reduce((acc, cur) => acc + cur, 0)
    }

    public zebraLink(segment, zIndex) {
        let swSegment = this.swSegments[zIndex];
        let par = segment.computeIntersectionsWithStraight(swSegment.start,swSegment.end,swSegment);
        let aLS = segment.arcLength(par.tS);
        swSegment.zebra = true;
        swSegment.zebraSegments.push(segment);
        segment.zebraLinks.push({zIndex: zIndex, position: aLS})
    }

    public isAfterZebra(segment) {
        if (segment.after.length > 0) {
            return segment.after.find((index) => this.swSegments[index].zebra)
        }
        return -1
    }

    public isBeforeZebra(segment) {
        if (segment.before.length > 0) {
            return segment.before.find((index) => this.swSegments[index].zebra)
        }
        return -1
    }

    public noCollisionPos(rand, segment) {
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
    public getSpeedLimit(segment,position) {
        if (this.speedLimits.length == 0) {return this.max_speed}
        else { 
            let speedLimit = this.max_speed;
            this.speedLimits.every((limit, i, limits)=> {
                if (limit.segment > segment || (limit.segment == segment && limit.position > position)) { return false}
                speedLimit = limit.speed == -1 ? this.max_speed : limit.speed
                return true;
            })
            return speedLimit
        }
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