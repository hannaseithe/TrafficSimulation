import { DRIV_TYPES, TL_STATES, VEH_TYPES } from "./types";
export class Vehicle {
    speed;
    position;
    segment;
    type;

    acc = 0;
    len = 4;
    width = 3;


    constructor(speed, position, segment) {

        this.speed = speed;
        this.position = position;
        this.segment = segment;


    }
}

export class Car extends Vehicle {
    color = "gold";
    slowed = false;
    collided = false;
    v0F; aF; bF; TF; s0F;
    constructor(speed, position, segment, driver_type) {
        super(speed, position, segment);
        this.type = VEH_TYPES.CAR;
        switch (driver_type) {
            case DRIV_TYPES.AGG:
                this.v0F = 1.3;
                this.aF = 1.3;
                this.bF = 1.3;
                this.TF = 0.7;
                this.s0F = 0.7;
                break;
            case DRIV_TYPES.RES:
                this.v0F = 1;
                this.aF = 1.3;
                this.bF = 0.7;
                this.TF = 1;
                this.s0F = 1;
                break;
            case DRIV_TYPES.REL:
                this.v0F = 0.7;
                this.aF = 0.7;
                this.bF = 1;
                this.TF = 1.3;
                this.s0F = 1.3;
                break;
            case DRIV_TYPES.DEF:
                this.v0F = 1;
                this.aF = 1;
                this.bF = 0.7;
                this.TF = 1.3;
                this.s0F = 1.3;
                break;
        }

    }
}

export class TrafficLight extends Vehicle {
    tf;
    constructor(speed, position, segment, phase) {
        super(speed, position, segment)

        this.type = VEH_TYPES.TRAFFIC_LIGHT;
        this.len = 3;
        this.tf = {
            state: TL_STATES.RED,
            counter: phase
        }

    }
}

export class Pedestrian extends Vehicle {
    direction;
    constructor(speed,position,segment,direction) {
        super(speed,position,segment);
        this.type = VEH_TYPES.PEDESTRIAN;
        this.direction = direction;
    }
}