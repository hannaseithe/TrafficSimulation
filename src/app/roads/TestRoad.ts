import { Road } from "../road";
import { StraightSegment, BezierSegment } from "../segment";
import { TrafficLight, Car } from "../vehicle";
import { DRIV_TYPES } from "../types";

export class TestRoad extends Road {
    constructor(rand, config) {
        super(rand,config);

        const SWsegment_config_1 = {
            start: [0, 108],
            end: [400, 108],
            type: 'straight',
            before: [],
            after: [1,2]
        }
        this.swSegments[0] = new StraightSegment(SWsegment_config_1);
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
            after: [3],
            points: [[950, 0], [500, 300]]
        }

        this.segments[2] = new BezierSegment(segment_config_3)

        const segment_config_4 = {
            start: [800, 400],
            end: [300, 400],
            type: 'bezier',
            before: [2],
            after: [],
            points: [[1000, 485], [400, 400]]
        }

        this.segments[3] = new BezierSegment(segment_config_4)

        this.length = this.segments.reduce((acc, segment) => acc + segment.arclength, 0)

        this.zebraLink(this.segments[0], this.swSegments[0]);

        this.segments[1].vehicles.push(new TrafficLight(0, 100, 1,10))
        this.segments[3].vehicles.push(new TrafficLight(0, 100, 1, 300))
        this.speedLimits.push({segment:0, position: 250, speed: 20})
        this.speedLimits.push({segment:1, position: 130, speed: -1})
        this.speedLimits.push({segment:2, position: 400, speed: 20})
        this.speedLimits.push({segment:3, position: 130, speed: -1})
        

        for (let i = 0; i < Math.min(10,this.number_veh); i++) {
            let new_segment = Math.floor(this.segments.length * rand());
            let new_position = this.noCollisionPos(rand, new_segment);

            let r = rand();

            let driver = (r > 0.75) ? DRIV_TYPES.AGG: (r > 0.5) ? DRIV_TYPES.RES : (r > 0.25) ? DRIV_TYPES.REL : DRIV_TYPES.DEF; 
            let localSpeed = this.getSpeedLimit(new_segment,new_position);
            this.segments[new_segment].vehicles.push(new Car(localSpeed * (0.5 + rand() / 2), new_position, new_segment, driver));
        }
        this.sortVehicles()
        this.update_leadVeh()
    }

    public newVehicle(rand,spawnProb) {
        let new_segment = Math.floor(this.segments.length * rand());
        if (this.getVehicleNumber() < this.number_veh && rand() < spawnProb && (this.segments[new_segment].vehicles.length == 0 || this.segments[new_segment].vehicles[0].position > 30)) {
            let new_position = 0;
            let r = rand();
            let driver = (r > 0.75) ? DRIV_TYPES.AGG : (r > 0.5) ? DRIV_TYPES.RES : (r > 0.25) ? DRIV_TYPES.REL : DRIV_TYPES.DEF;
            this.segments[new_segment].vehicles.unshift(new Car(this.max_speed * (rand() / 2), new_position, new_segment, driver))
        }
   }
}