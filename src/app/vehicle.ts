export class Vehicle {
    speed;
    position;
    segment;
    type;
    tf;
    acc = 0;
    len = 4;
    width = 3;
    color = "gold";
    slowed = false;
    collided = false;
    constructor (speed,position,segment,type){
        
        this.speed = speed;
        this.position = position;
        this.segment = segment;
        this.type = type;

        if (type == "traffic-light") {
            this.len = 3;
            this.tf = {
                state: "red"
            }
        }
    }
}