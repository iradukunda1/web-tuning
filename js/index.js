// const canvas = document.querySelector('#canvas')
// canvas.style.background = url('image_sal4vg.jpg')
var canvas,
    context,
    dragging = false,
    dragStartLocation,
    dragStopLocation,
    snapshot,
    currentCent = 0,
    currentMet = 0,
    totalCent = 0.00,
    totalMet = 0.00;
let centimetersMeasure = []
let metersMeasure = []
let startCoordinates = []
let endCoordinates = []

function getCanvasCoordinates(event) {
    var x = event.clientX - canvas.getBoundingClientRect().left,
        y = event.clientY - canvas.getBoundingClientRect().top;
    return { x: x, y: y };
}

function takeSnapshot() {
    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreSnapshot() {
    context.putImageData(snapshot, 0, 0);
}

function drawLine(position) {
    context.beginPath();
    context.moveTo(dragStartLocation.x, dragStartLocation.y);
    context.lineTo(position.x, position.y);
    context.stroke();

    let distance_px = lineDistance(dragStartLocation, position);
    let distance_cm = 0.02645833 * distance_px;
    displayMeasures(distance_cm);
}

function displayMeasures(cm_values) {
    scaleElm = document.getElementById("defaultScale");
    cm_Elm = document.getElementById("centimeters");
    m_Elm = document.getElementById("meters");

    meters = ((cm_values * 100) * (1 / scaleElm.value))

    currentCent = cm_values * (1 / scaleElm.value);
    currentMet = meters;

    cm_Elm.value = currentCent;
    m_Elm.value = meters;
}

function lineDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}


function draw(position) {
    drawLine(position);
}

function dragStart(event) {
    dragging = true;
    dragStartLocation = getCanvasCoordinates(event);
    takeSnapshot();
}

function drag(event) {
    var position;
    if (dragging === true) {
        restoreSnapshot();
        position = getCanvasCoordinates(event);
        draw(position);
    }
}

function dragStop(event) {
    dragging = false;
    restoreSnapshot();
    var position = getCanvasCoordinates(event);
    draw(position);
    dragStopLocation = position
    startCoordinates.push(dragStartLocation)
    endCoordinates.push(dragStopLocation)
    let distance_px = lineDistance(dragStartLocation, position);
    let distance_cm = 0.02645833 * distance_px;
    let scaleElm = document.getElementById("defaultScale");
    currentCent = distance_cm * (1 / scaleElm.value)
    currentMet = ((distance_cm * 100) * (1 / scaleElm.value))
    centimetersMeasure.push(currentCent)
    metersMeasure.push(currentMet)
}

function calculateTotal() {
    if (metersMeasure.length && centimetersMeasure.length) {
        var totalMeters = 0.00;
        metersMeasure.forEach((meter) => {
            totalMeters = totalMeters + meter
        })
        totalMet = totalMeters
        var totalCentimeters = 0.00;
        centimetersMeasure.forEach((meter) => {
            totalCentimeters = totalCentimeters + meter
        })
        totalCentimet = totalCentimeters
        context.beginPath()
        if (endCoordinates[endCoordinates.length - 1].x > startCoordinates[0].x + 8) {
            context.moveTo(startCoordinates[0].x, startCoordinates[0].y - 3)
            context.lineTo(endCoordinates[endCoordinates.length - 1].x, startCoordinates[0].y - 3)
            context.stroke()
            context.fillText(`${totalMet.toFixed(2)} m`, startCoordinates[0].x + (endCoordinates[endCoordinates.length - 1].x - startCoordinates[0].x) / 2, startCoordinates[0].y - 5)
        } else {
            context.moveTo(startCoordinates[0].x + 5, startCoordinates[0].y)
            context.lineTo(startCoordinates[0].x + 5, endCoordinates[endCoordinates.length - 1].y)
            context.fillText(`${totalMet.toFixed(2)}  m`, startCoordinates[0].x + 8, startCoordinates[0].y + (endCoordinates[endCoordinates.length - 1].y - startCoordinates[0].y) / 2)
            context.stroke()
        }
    }

    centimetersMeasure = []
    metersMeasure = []
    startCoordinates = []
    endCoordinates = []
}

// function changeBackgroundColor() {
//     context.save();
//     context.fillStyle = document.getElementById("backgroundColor").value;
//     context.fillRect(0, 0, canvas.width, canvas.height);
//     context.restore();
// }

function eraseCanvas() {
    cm_Elm = document.getElementById("centimeters");
    m_Elm = document.getElementById("meters");
    dragStartLocation = ""
    dragStopLocation = ""
    currentCent = 0
    currentMet = 0
    cm_Elm.value = ""
    m_Elm.value = ""
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// var image = new Image();
// image.addEventListener('load', (){
//     context.drawImage(this, 0, 0, canvas.width, canvas.height);
// }, false)
// image.src = "image_sal4vg.jpg";
function init() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;
    var fillColor = document.getElementById("fillColor"),
        clearCanvas = document.getElementById("clearCanvas");
    calculate = document.getElementById("calcBtn");

    context.strokeStyle = strokeColor.value;
    context.fillStyle = fillColor.value;
    context.lineWidth = 1.5;


    canvas.addEventListener('mousedown', dragStart, false);
    canvas.addEventListener('mousemove', drag, false);
    canvas.addEventListener('mouseup', dragStop, false);
    clearCanvas.addEventListener("click", eraseCanvas, false);
    calculate.addEventListener("click", calculateTotal, false);

}
addEventListener('load', init, false);