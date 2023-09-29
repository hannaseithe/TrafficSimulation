let drawBackground = function (ctx) {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
let drawRoad = function (road, ctx) {
    road.segments.forEach((segment) => {
        segment.drawSegment(ctx, "road")
        if (segment.op) {
            segment.drawOP(ctx,"road")
        }
    })
}

let drawSidewalk = function (road, ctx) {
    road.swSegments.forEach((segment) => {
        segment.drawSegment(ctx, "sw", segment.zebra)
    })
}

let drawVehicles = function (road, ctx) {
    ctx.fillStyle = "orange";
    road.drawnVehicles = [];
    road.segments.forEach((segment, seg_index) => {
        segment.vehicles.forEach((vehicle, veh_index) => {
            road.drawnVehicles.push(segment.drawVehicle(vehicle, ctx, seg_index, veh_index))
        })
    })
}

let drawPedestrians = function (road, ctx) {
    ctx.fillStyle = "purple";
    road.drawnPedestrians = [];
    road.swSegments.forEach((segment, seg_index) => {
        segment.pedestrians.forEach((ped, ped_index) => {
            segment.drawPedestrian(ped, ctx, seg_index, ped_index)
        })
    })
}

let drawSpeedLimits = function (road, ctx) {
    road.speedLimits.forEach((limit) => {
        road.segments[limit.segment].drawSpeedLimit(limit.position, limit.speed, ctx)
    })
}

export function draw_init(road) {



}

export function draw(road, ctx) {
    drawBackground(ctx);
    drawRoad(road, ctx);
    drawSidewalk(road, ctx);
    drawVehicles(road, ctx);
    drawPedestrians(road, ctx);
    drawSpeedLimits(road, ctx);
}