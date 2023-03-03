let drawBackground = function (ctx) {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
let drawRoad = function (road, ctx) {
    road.segments.forEach((segment) => {
        if (segment.type = "straight") {
            ctx.beginPath();
            ctx.moveTo(...segment.start);
            ctx.lineTo(...segment.end);
            ctx.stroke();
        }
    })

}
let drawVehicles = function (road, ctx) {
    ctx.fillStyle = "red";
    road.vehicles.forEach((vehicle) => {

        ctx.beginPath();
        ctx.arc(vehicle.position, 100, 10, 0, 2 * Math.PI);
        ctx.fill();
    })

}

export function draw(road,ctx) {
    drawBackground(ctx);
    drawRoad(road,ctx);
    drawVehicles(road,ctx)
}