import { Road } from "../road";
import { StraightSegment, BezierSegment } from "../segment";
import { TrafficLight, Car, Pedestrian } from "../vehicle";
import { DRIV_TYPES } from "../types";

export class TestRoad extends Road {
    number_ped;
    constructor(rand, config) {
        super(rand,config);
        this.number_ped = config.numberPed;

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
            points: [[1100, 500], [400, 600]]
        }

        this.segments[3] = new BezierSegment(segment_config_4)

        const segment_config_5 = {
            type: 'projected',
            startT: 1,
            endT: 0,
            before: [5],
            after: [6]
        }

        this.segments[4] = this.segments[1].computeOrthogenalProjection(6, segment_config_5 );

        const segment_config_6 = {
            type: 'projected',
            startT: 1,
            endT: 0,
            before: [6],
            after: [4]
        }

        this.segments[5] = this.segments[2].computeOrthogenalProjection(6, segment_config_6 );

        const segment_config_7 = {
            type: 'projected',
            startT: 1,
            endT: 0,
            before: [4],
            after: [5]
        }

        this.segments[6] = this.segments[3].computeOrthogenalProjection(6, segment_config_7 );

        const SWsegment_config_1 = {
            type: 'projected',
            startT: 0,
            endT: 0.5,
            before: [3,16],
            after: [2,4]
        }
        this.swSegments[0] = this.segments[3].computeOrthogenalProjection(12, SWsegment_config_1 );

        const SWsegment_config_2 = {
            type: 'projected',
            startT: 0,
            endT: 0.5,
            before: [3,17],
            after: [2,5]
        }
        this.swSegments[1] = this.segments[3].computeOrthogenalProjection(-6, SWsegment_config_2 );

        const SWsegment_config_3 = {
            start: this.swSegments[0].end,
            end: this.swSegments[1].end,
            type: 'straight',
            before: [0,4],
            after: [1,5]
        }
        this.swSegments[2] = new StraightSegment(SWsegment_config_3)

        const SWsegment_config_4 = {
            start: this.swSegments[0].start,
            end: this.swSegments[1].start,
            type: 'straight',
            before: [0,16],
            after: [1,17]
        }
        this.swSegments[3] = new StraightSegment(SWsegment_config_4)

        const SWsegment_config_5 = {
            type: 'projected',
            startT: 0.5,
            endT: 1,
            before: [2,0],
            after: [6,7]
        }
        this.swSegments[4] = this.segments[3].computeOrthogenalProjection(12, SWsegment_config_5 );

        const SWsegment_config_6 = {
            type: 'projected',
            startT: 0.5,
            endT: 1,
            before: [2,1],
            after: [6,8]
        }
        this.swSegments[5] = this.segments[3].computeOrthogenalProjection(-6, SWsegment_config_6 );

        const SWsegment_config_7 = {
            start: this.swSegments[4].end,
            end: this.swSegments[5].end,
            type: 'straight',
            before: [4,7],
            after: [5,8]
        }
        this.swSegments[6] = new StraightSegment(SWsegment_config_7)

        const SWsegment_config_8 = {
            type: 'projected',
            startT: 0,
            endT: 0.5,
            before: [6,4],
            after: [9,10]
        }
        this.swSegments[7] = this.segments[1].computeOrthogenalProjection(12, SWsegment_config_8 );

        const SWsegment_config_9 = {
            type: 'projected',
            startT: 0,
            endT: 0.5,
            before: [6,5],
            after: [9,11]
        }
        this.swSegments[8] = this.segments[1].computeOrthogenalProjection(-6, SWsegment_config_9 );

        const SWsegment_config_10 = {
            start: this.swSegments[7].end,
            end: this.swSegments[8].end,
            type: 'straight',
            before: [7,10],
            after: [8,11]
        }
        this.swSegments[9] = new StraightSegment(SWsegment_config_10)

        const SWsegment_config_11 = {
            type: 'projected',
            startT: 0.5,
            endT: 1,
            before: [7,9],
            after: [13,12]
        }
        this.swSegments[10] = this.segments[1].computeOrthogenalProjection(12, SWsegment_config_11 );

        const SWsegment_config_12 = {
            type: 'projected',
            startT: 0.5,
            endT: 1,
            before: [8,9],
            after: [14,12]
        }
        this.swSegments[11] = this.segments[1].computeOrthogenalProjection(-6, SWsegment_config_12 );

        const SWsegment_config_13 = {
            start: this.swSegments[10].end,
            end: this.swSegments[11].end,
            type: 'straight',
            before: [10,13],
            after: [11,14]
        }
        this.swSegments[12] = new StraightSegment(SWsegment_config_13)

        
        const SWsegment_config_14 = {
            type: 'projected',
            startT: 0,
            endT: 0.5,
            before: [10,12],
            after: [15,16]
        }
        this.swSegments[13] = this.segments[2].computeOrthogenalProjection(12, SWsegment_config_14 );

        const SWsegment_config_15 = {
            type: 'projected',
            startT: 0,
            endT: 0.5,
            before: [11,12],
            after: [15,17]
        }
        this.swSegments[14] = this.segments[2].computeOrthogenalProjection(-6, SWsegment_config_15 );

        const SWsegment_config_16 = {
            start: this.swSegments[13].end,
            end: this.swSegments[14].end,
            type: 'straight',
            before: [13,16],
            after: [14,17]
        }
        this.swSegments[15] = new StraightSegment(SWsegment_config_16)

        const SWsegment_config_17 = {
            type: 'projected',
            startT: 0.5,
            endT: 1,
            before: [13,15],
            after: [0,3]
        }
        this.swSegments[16] = this.segments[2].computeOrthogenalProjection(12, SWsegment_config_17 );

        const SWsegment_config_18 = {
            type: 'projected',
            startT: 0.5,
            endT: 1,
            before: [14,15],
            after: [1,3]
        }
        this.swSegments[17] = this.segments[2].computeOrthogenalProjection(-6, SWsegment_config_18 );


        this.length = this.segments.reduce((acc, segment) => acc + segment.arclength, 0)

        this.zebraLink(this.segments[3], 2);
        this.zebraLink(this.segments[6], 2);
        this.zebraLink(this.segments[3], 3);
        this.zebraLink(this.segments[6], 3);
        this.zebraLink(this.segments[3], 6);
        this.zebraLink(this.segments[6], 6);
        this.zebraLink(this.segments[1], 9);
        this.zebraLink(this.segments[4], 9);
        this.zebraLink(this.segments[1], 12);
        this.zebraLink(this.segments[4], 12);
        this.zebraLink(this.segments[2], 15);
        this.zebraLink(this.segments[5], 15);


      /*   this.segments[1].vehicles.push(new TrafficLight(0, 100, 1,10))
        this.segments[4].vehicles.push(new TrafficLight(0, 100, 1,10))
        this.segments[3].vehicles.push(new TrafficLight(0, 100, 1, 300))
        this.segments[6].vehicles.push(new TrafficLight(0, 100, 1, 300))
        this.speedLimits.push({segment:0, position: 250, speed: 20})
        this.speedLimits.push({segment:1, position: 130, speed: -1})
        this.speedLimits.push({segment:2, position: 400, speed: 20})
        this.speedLimits.push({segment:3, position: 130, speed: -1}) */
        

        for (let i = 0; i < Math.min(50,this.number_veh); i++) {
            let new_segment = Math.floor(this.segments.length * rand());
            let new_position = this.noCollisionPos(rand, new_segment);

            let r = rand();

            let driver = (r > 0.75) ? DRIV_TYPES.AGG: (r > 0.5) ? DRIV_TYPES.RES : (r > 0.25) ? DRIV_TYPES.REL : DRIV_TYPES.DEF; 
            let localSpeed = this.getSpeedLimit(new_segment,new_position);
            this.segments[new_segment].vehicles.push(new Car(localSpeed * (0.5 + rand() / 2), new_position, new_segment, driver));
        }
        for (let i = 0; i < Math.min(50,this.number_ped); i++) {
            let new_segment = Math.floor(this.swSegments.length * rand());
            let new_position = this.swSegments[new_segment].arclength * rand();

            let r = rand();

            let localSpeed = 1;
            let direction = rand() > 0.5 ? 1 : -1;
            this.swSegments[new_segment].pedestrians.push(new Pedestrian(localSpeed * (0.5 + rand() / 2), new_position, new_segment, direction)); 
        }

        this.sortVehicles()
        this.update_leadVeh()
    }

    public newVehicle(rand,spawnProb) {
        let r = rand();
        let new_segment = 0;
        if (this.getVehicleNumber() < this.number_veh && rand() < spawnProb && (this.segments[new_segment].vehicles.length == 0 || this.segments[new_segment].vehicles[0].position > 30)) {
            let new_position = 0;
            r = rand();
            let driver = (r > 0.75) ? DRIV_TYPES.AGG : (r > 0.5) ? DRIV_TYPES.RES : (r > 0.25) ? DRIV_TYPES.REL : DRIV_TYPES.DEF;
            this.segments[new_segment].vehicles.unshift(new Car(this.max_speed * (rand() / 2), new_position, new_segment, driver))
        }
   }

   public newPedestrian(rand) {
    /* let r = rand();

    if (r > 0.75) {
        let new_position = 0;
        let direction = 1;
        this.swSegments[0].pedestrians.unshift(new Pedestrian(1 * (0.5 + rand() / 2), new_position, 0, direction))
    } else if (r > 0.5) {
        let new_position = this.swSegments[1].arclength;
        let direction = -1;
        this.swSegments[1].pedestrians.push(new Pedestrian(1 * (0.5 + rand() / 2), new_position, 1, direction))
    } else if (r > 0.25) {
        let new_position = this.swSegments[0].arclength;
        let direction = -1;
        this.swSegments[0].pedestrians.push(new Pedestrian(1 * (0.5 + rand() / 2), new_position, 0, direction))
    } else {
        let new_position = 0;
        let direction = 1;
        this.swSegments[1].pedestrians.unshift(new Pedestrian(1 * (0.5 + rand() / 2), new_position, 1, direction))
    } */

}
}