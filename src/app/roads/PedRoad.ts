import { Road } from "../road";
import { StraightSegment } from "../segment";
import { Car, Pedestrian, TrafficLight } from "../vehicle";
import { DRIV_TYPES } from "../types";

export class PedRoad extends Road {
    number_ped;
    constructor(rand, config) {
        super(rand, config);
        this.number_ped = config.numberPed;
        const segment_config_1 = {
            start: [0, 103],
            end: [1000, 103],
            type: 'straight',
            before: [],
            after: []
        }
        this.segments[0] = new StraightSegment(segment_config_1)

        const segment_config_2 = {
            start: [1000, 97],
            end: [0, 97],
            type: 'straight',
            before: [],
            after: []
        }
        this.segments[1] = new StraightSegment(segment_config_2)

        const SWsegment_config_1 = {
            start: [0, 108],
            end: [400, 108],
            type: 'straight',
            before: [],
            after: [1, 2]
        }
        this.swSegments[0] = new StraightSegment(SWsegment_config_1)

        const SWsegment_config_2 = {
            start: [400, 108],
            end: [1000, 108],
            type: 'straight',
            before: [0, 2],
            after: []
        }
        this.swSegments[1] = new StraightSegment(SWsegment_config_2)

        const SWsegment_config_3 = {
            start: [400, 108],
            end: [400, 92],
            type: 'straight',
            before: [0, 1],
            after: [3, 4]
        }
        this.swSegments[2] = new StraightSegment(SWsegment_config_3)

        const SWsegment_config_4 = {
            start: [400, 92],
            end: [0, 92],
            type: 'straight',
            before: [2, 4],
            after: []
        }
        this.swSegments[3] = new StraightSegment(SWsegment_config_4)

        const SWsegment_config_5 = {
            start: [1000, 92],
            end: [400, 92],
            type: 'straight',
            before: [],
            after: [2, 3]
        }
        this.swSegments[4] = new StraightSegment(SWsegment_config_5)

        this.zebraLink(this.segments[0], this.swSegments[2]);
        this.zebraLink(this.segments[1], this.swSegments[2]);

        this.length = this.segments.reduce((acc, segment) => acc + segment.arclength, 0)

        this.speedLimits.push({ segment: 0, position: 10, speed: 9 })
        this.segments[0].vehicles.push(new TrafficLight(0, 800, 1, 10))
        this.segments[1].vehicles.push(new TrafficLight(0, 200, 1, 10))


        for (let i = 0; i < Math.min(10, this.number_veh); i++) {
            let new_segment = Math.floor(this.segments.length * rand());
            let new_position = this.noCollisionPos(rand, new_segment);

            let r = rand();

            let driver = (r > 0.75) ? DRIV_TYPES.AGG : (r > 0.5) ? DRIV_TYPES.RES : (r > 0.25) ? DRIV_TYPES.REL : DRIV_TYPES.DEF;
            let localSpeed = this.getSpeedLimit(new_segment, new_position);
            this.segments[new_segment].vehicles.push(new Car(localSpeed * (0.5 + rand() / 2), new_position, new_segment, driver));
        }
        for (let i = 0; i < Math.min(500, this.number_ped); i++) {
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

    public newVehicle(rand, spawnProb) {
        let new_segment = Math.floor(this.segments.length * rand());
        if (this.getVehicleNumber() < this.number_veh && rand() < spawnProb && (this.segments[new_segment].vehicles.length == 0 || this.segments[new_segment].vehicles[0].position > 30)) {
            let new_position = 0;
            let r = rand();
            let driver = (r > 0.75) ? DRIV_TYPES.AGG : (r > 0.5) ? DRIV_TYPES.RES : (r > 0.25) ? DRIV_TYPES.REL : DRIV_TYPES.DEF;
            this.segments[new_segment].vehicles.unshift(new Car(this.max_speed * (rand() / 2), new_position, new_segment, driver))
        }
    }

    public newPedestrian(rand) {
        let r = rand();

        if (r > 0.75) {
            let new_position = 0;
            let direction = 1;
            this.swSegments[0].pedestrians.unshift(new Pedestrian(1 * (0.5 + rand() / 2), new_position, 0, direction))
        } else if (r > 0.5) {
            let new_position = this.swSegments[1].arclength;
            let direction = -1;
            this.swSegments[1].pedestrians.push(new Pedestrian(1 * (0.5 + rand() / 2), new_position, 1, direction))
        } else if (r > 0.25) {
            let new_position = this.swSegments[3].arclength;
            let direction = -1;
            this.swSegments[3].pedestrians.push(new Pedestrian(1 * (0.5 + rand() / 2), new_position, 3, direction))
        } else {
            let new_position = 0;
            let direction = 1;
            this.swSegments[4].pedestrians.unshift(new Pedestrian(1 * (0.5 + rand() / 2), new_position, 4, direction))
        }

    }
}