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
let lines = []
let linesSum = []
let clearedLines = []

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
    // context.beginPath();
    // context.moveTo(dragStartLocation.x, dragStartLocation.y);
    // context.lineTo(position.x, position.y);
    // context.stroke();
    context.fillStyle = "black"
    if (dragStartLocation.x < position.x + 8) {
        context.fillRect(dragStartLocation.x, dragStartLocation.y, lineDistance(dragStartLocation, position), 1.5)
    } else {
        context.fillRect(dragStartLocation.x, dragStartLocation.y, 1.5, lineDistance(dragStartLocation, position))
    }
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
    let distance_px = lineDistance(dragStartLocation, position);
    let distance_cm = 0.02645833 * distance_px;
    let scaleElm = document.getElementById("defaultScale");
    currentCent = distance_cm * (1 / scaleElm.value)
    currentMet = ((distance_cm * 100) * (1 / scaleElm.value))
    dragStopLocation = position
    startCoordinates.push(dragStartLocation)
    endCoordinates.push(dragStopLocation)
    centimetersMeasure.push(currentCent)
    metersMeasure.push(currentMet)
    lines.push({ dxy1: dragStartLocation, dxy2: position })
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
        let sumLineStartPoint = startCoordinates[0]
        let endLineSumPosition = endCoordinates[endCoordinates.length - 1]
        if (endLineSumPosition.x > sumLineStartPoint.x + 8) {
            horizontal = sumLineStartPoint
            vertical = endLineSumPosition
            context.moveTo(sumLineStartPoint.x, sumLineStartPoint.y - 3)
            context.lineTo(endLineSumPosition.x, sumLineStartPoint.y - 3)
            context.stroke()
            context.fillStyle = "blue"
            context.fillText(`${totalMet.toFixed(2)} m`, sumLineStartPoint.x + (endLineSumPosition.x - sumLineStartPoint.x) / 2, sumLineStartPoint.y - 5)
            lines.push({
                dxy1: { x: sumLineStartPoint.x, y: sumLineStartPoint.y - 3 },
                dxy2: { x: endLineSumPosition.x, y: sumLineStartPoint.y - 3 },
                figure: {
                    total: `${totalMet.toFixed(2)}  m`,
                    position: {
                        x: sumLineStartPoint.x + (endLineSumPosition.x - sumLineStartPoint.x) / 2,
                        y: sumLineStartPoint.y - 5
                    }
                }
            })
        } else {
            context.moveTo(sumLineStartPoint.x + 5, sumLineStartPoint.y)
            context.lineTo(sumLineStartPoint.x + 5, endLineSumPosition.y)
            context.fillStyle = "blue"
            context.fillText(`${totalMet.toFixed(2)}  m`, sumLineStartPoint.x + 8, sumLineStartPoint.y + (endLineSumPosition.y - sumLineStartPoint.y) / 2)
            context.stroke()
            var textWidth = context.measureText(`${totalMet.toFixed(2)}  m`)
            lines.push({
                dxy1: { x: sumLineStartPoint.x + 5, y: sumLineStartPoint.y },
                dxy2: { x: sumLineStartPoint.x + 5, y: endLineSumPosition.y },
                figure: {
                    total: `${totalMet.toFixed(2)}  m`,
                    position: {
                        x: sumLineStartPoint.x + 8,
                        y: sumLineStartPoint.y + (endLineSumPosition.y - sumLineStartPoint.y) / 2
                    }
                }
            })
        }
    }
    centimetersMeasure = []
    metersMeasure = []
    startCoordinates = []
    endCoordinates = []
}
function clearLastLine() {
    if (lines.length) {
        const lastItem = lines[lines.length - 1]
        const verticalComponent = lastItem.dxy2.x > lastItem.dxy1.x + 8
        clearedLines.push(lastItem)
        context.clearRect(
            verticalComponent ? lastItem.dxy1.x : lastItem.dxy1.x - 2.5, verticalComponent ? lastItem.dxy1.y - 2.5 : lastItem.dxy1.y,
            (verticalComponent ? lineDistance(lastItem.dxy1, lastItem.dxy2) : 4),
            (verticalComponent ? 4 : lineDistance(lastItem.dxy1, lastItem.dxy2)))
        lines.splice(lines.length - 1, 1)
    }
}
function redoCleared() {
    if (clearedLines.length) {
        const lastItem = clearedLines[clearedLines.length - 1]
        const verticalComponent = lastItem.dxy2.x > lastItem.dxy1.x + 8
        lines.push(lastItem)
        context.fillStyle = "black"
        context.fillRect(
            lastItem.dxy1.x, lastItem.dxy1.y,
            (verticalComponent ? lineDistance(lastItem.dxy1, lastItem.dxy2) : 1.5),
            (verticalComponent ? "1.5" : lineDistance(lastItem.dxy1, lastItem.dxy2)))
        clearedLines.splice(clearedLines.length - 1, 1)
    }
}

// function changeBackgroundColor() {
//     context.save();
//     context.fillStyle = document.getElementById("backgroundColor").value;
//     context.fillRect(0, 0, canvas.width, canvas.height);
//     context.restore();
// }

function lineDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}
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
    startCoordinates = []
    endCoordinates = []
    lines = []
    linesSum = []
    clearedLines = []
    horizontalCoord = []
    verticalCoord = []
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
        clearCanvas = document.getElementById("clearCanvas"),
        calculate = document.getElementById("calcBtn"),
        undo = document.getElementById("undo"),
        redo = document.getElementById("redo");

    context.strokeStyle = strokeColor.value;
    context.fillStyle = fillColor.value;
    context.lineWidth = 1.5;

    canvas.addEventListener('mousedown', dragStart, false);
    canvas.addEventListener('mousemove', drag, false);
    canvas.addEventListener('mouseup', dragStop, false);
    clearCanvas.addEventListener("click", eraseCanvas, false);
    calculate.addEventListener("click", calculateTotal, false);
    undo.addEventListener("click", clearLastLine, false)
    redo.addEventListener("click", redoCleared, false)

}
addEventListener('load', init, false);