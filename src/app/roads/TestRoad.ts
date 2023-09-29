import { Road } from "../road";
import { StraightSegment, BezierSegment } from "../segment";
import { TrafficLight, Car } from "../vehicle";
import { DRIV_TYPES } from "../types";

export class TestRoad extends Road {
    constructor(rand, config) {
        super(rand,config);

        const segment_config_1 = {
            start: [100, 100],
            end: [400, 200],
            type: 'straight',
            before: [],
            after: []
        }
        this.segments[0] = new StraightSegment(segment_config_1)

        const segment_config_2 = {
            start: [400, 400],
            end: [600, 100],
            type: 'bezier',
            before: [3],
            after: [2],
            points: [[400, 250], [425, 150]]
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
            end: [400, 400],
            type: 'bezier',
            before: [2],
            after: [1],
            points: [[1000, 487], [400, 600]]
        }

        this.segments[3] = new BezierSegment(segment_config_4)

        const segment_config_5 = {
            type: 'projected',
            before: [6],
            after: [5]
        }

        this.segments[4] = this.segments[1].computeOrthogenalProjection(6, segment_config_5 );

        const segment_config_6 = {
            type: 'projected',
            before: [4],
            after: [6]
        }

        this.segments[5] = this.segments[2].computeOrthogenalProjection(6, segment_config_6 );

        const segment_config_7 = {
            type: 'projected',
            before: [5],
            after: [4]
        }

        this.segments[6] = this.segments[3].computeOrthogenalProjection(6, segment_config_7 );

        this.length = this.segments.reduce((acc, segment) => acc + segment.arclength, 0)

        this.segments[1].vehicles.push(new TrafficLight(0, 100, 1,10))
        this.segments[4].vehicles.push(new TrafficLight(0, 100, 1,10))
        this.segments[3].vehicles.push(new TrafficLight(0, 100, 1, 300))
        this.segments[6].vehicles.push(new TrafficLight(0, 100, 1, 300))
        //this.speedLimits.push({segment:0, position: 250, speed: 20})
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
        let r = rand();
        let new_segment = r > 0.5 ? 0 : 4;
        if (this.getVehicleNumber() < this.number_veh && rand() < spawnProb && (this.segments[new_segment].vehicles.length == 0 || this.segments[new_segment].vehicles[0].position > 30)) {
            let new_position = 0;
            r = rand();
            let driver = (r > 0.75) ? DRIV_TYPES.AGG : (r > 0.5) ? DRIV_TYPES.RES : (r > 0.25) ? DRIV_TYPES.REL : DRIV_TYPES.DEF;
            this.segments[new_segment].vehicles.unshift(new Car(this.max_speed * (rand() / 2), new_position, new_segment, driver))
        }
   }
}