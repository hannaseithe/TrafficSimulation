let drawBackground = function (ctx) {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
let drawRoad = function (road, ctx) {
    road.segments.forEach((segment) => {
        segment.drawSegment(ctx)
    })
}

let drawVehicles = function (road, ctx) {
    ctx.fillStyle = "orange";
    road.segments.forEach((segment) => {
        segment.vehicles.forEach((vehicle) => {
            segment.drawVehicle(vehicle, ctx)
    })
})
}

export function draw_init(road) {


    
}

export function draw(road,ctx) {
    drawBackground(ctx);
    drawRoad(road,ctx);
    drawVehicles(road,ctx)
}