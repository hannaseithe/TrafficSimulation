export class Vehicle {
    speed;
    position;
    segment;
    acc = 0;
    len = 4;
    constructor (speed,position,segment){
        this.speed = speed;
        this.position = position;
        this.segment = segment;
    }
}