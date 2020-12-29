var dragging = !1,
    dragStartLocation,
    dragStopLocation,
    snapshot,
    undo,
    redo,
    currentCent = 0,
    currentMet = 0,
    totalCent = 0.00,
    mx = 0,
    my = 0,
    angle = 0,
    curveCont_x,
    curveCont_y,
    tool,
    tool_select,
    tool_default = 'line',
    tools = {},
    totalMet = 0.00;
let centimetersMeasure = []
let metersMeasure = []
let startCoordinates = []
let endCoordinates = []
let lines = []
let linesSum = []
let clearedLines = []
let clearedMeter = []
let clearedStratCoordinate = []
let clearedEndCoordinate = []
let xPts =[]
let yPts = []

var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;

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
    // const xDistance = Math.abs(position.x - dragStartLocation.x)
    // const yDistance = Math.abs(position.y - dragStartLocation.y)
    context.beginPath();
    context.moveTo(dragStartLocation.x, dragStartLocation.y);
    // context.quadraticCurveTo(curveCont_x,curveCont_y, position.x, position.y);
    context.lineTo(position.x, position.y);
    // context.lineCap = 'round';
    context.stroke();
    context.fillStyle = "black"
    // if (xDistance > yDistance) {
    //     if (Math.ceil(dragStartLocation.x) > Math.ceil(position.x)) {
    //     context.fillRect(position.x, position.y, lineDistance(position, dragStartLocation), 1.5)
    //     }else{
    //     context.fillRect(dragStartLocation.x, dragStartLocation.y, lineDistance(dragStartLocation, position), 1.5)
    //     }
    // } else {
    //     if (Math.ceil(dragStartLocation.y) > Math.ceil(position.y)) {
    //     context.fillRect(position.x, position.y, 1.5, lineDistance(position, dragStartLocation))
    //     }else{
    //     context.fillRect(dragStartLocation.x, dragStartLocation.y, 1.5, lineDistance(dragStartLocation , position))            
    //     }
    // }
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
    // const xDistance = Math.abs(position.x - dragStartLocation.x)
    // const yDistance = Math.abs(position.y - dragStartLocation.y)
    // if (xDistance > yDistance) {
    //     curveCont_x= (position.x + dragStartLocation.x) / 2
    //     curveCont_y = Math.ceil(position.x) > Math.ceil(dragStartLocation.x) ? ((position.y + dragStartLocation.y / 2) - lineDistance(position, dragStartLocation) /2 ) : ((position.y + dragStartLocation.y / 2) + lineDistance(dragStartLocation,position) /2 )
    // }else{
    //     curveCont_x = Math.ceil(position.y) > Math.ceil(dragStartLocation.y) ? ((position.x + dragStartLocation.x) / 2) + lineDistance(dragStartLocation,position) /2  : ((position.x + dragStartLocation.x) / 2) - ( position.x + dragStartLocation.x) /2
    //     curveCont_y = (position.y + dragStartLocation.y) /2
    // }
    drawLine(position);
}

function dragStart(event) {
    dragging = 1;
    var position = getCanvasCoordinates(event);
    dragStartLocation = position
    startCoordinates.push(dragStartLocation)
    xPts.push(dragStartLocation.x)
    yPts.push(dragStartLocation.y)
    takeSnapshot();

}

function drag(event) {
    var position;
    if (dragging === 1) {
        restoreSnapshot();
        position = getCanvasCoordinates(event);
        draw(position);
    }
}

function dragStop(event) {
    dragging = !1;
    restoreSnapshot();
    var position = getCanvasCoordinates(event);
    draw(position);
    let distance_px = lineDistance(dragStartLocation, position);
    let distance_cm = 0.02645833 * distance_px;
    let scaleElm = document.getElementById("defaultScale");
    currentCent = distance_cm * (1 / scaleElm.value)
    currentMet = ((distance_cm * 100) * (1 / scaleElm.value))
    dragStopLocation = position
    endCoordinates.push(dragStopLocation)
    xPts.push(dragStopLocation.x)
    yPts.push(dragStopLocation.y)
    centimetersMeasure.push(currentCent)
    metersMeasure.push(currentMet)
    lines.push({ dxy1: dragStartLocation, dxy2: position })
}

function calculateTotal() {
    if (metersMeasure.length && centimetersMeasure.length) {
        var totalMeters = 0.00;
        metersMeasure.forEach((meter) => {
            totalMeters = meter != undefined ? totalMeters + meter : totalMeters + 0
        })
        totalMet = totalMeters
        var totalCentimeters = 0.00;
        centimetersMeasure.forEach((centimeter) => {
            totalCentimeters = centimeter != undefined ? totalCentimeters + centimeter : totalCentimeters + 0
        })
        totalCentimet = totalCentimeters
        context.beginPath()
        let sumLineStartPoint = startCoordinates[0].length ? startCoordinates[1] : startCoordinates[0]
        let endLineSumPosition = endCoordinates[endCoordinates.length - 1]
        const xDistance = Math.abs(endLineSumPosition.x - sumLineStartPoint.x)
        const yDistance = Math.abs(endLineSumPosition.y - sumLineStartPoint.y)
        if (xDistance > yDistance) {
            context.moveTo(sumLineStartPoint.x, sumLineStartPoint.y - 3)
            context.lineTo(endLineSumPosition.x, sumLineStartPoint.y - 3)
            context.stroke()
            context.fillStyle = "blue"
            context.font = "15px times new roman"
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
            context.font = "15px times new roman"
            context.fillText(`${totalMet.toFixed(2)}  m`, sumLineStartPoint.x + 8, sumLineStartPoint.y + (endLineSumPosition.y - sumLineStartPoint.y) / 2)
            context.stroke()
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
        centimetersMeasure = []
        metersMeasure = []
        startCoordinates = []
        endCoordinates = []
    }
    console.log(Math.abs(calculateArea()))
}
function clearLastLine() {
    if (lines.length) {
        const lastItem = lines[lines.length - 1]
        clearedLines.push(lastItem)
        const xDistance = Math.abs(lastItem.dxy2.x - lastItem.dxy1.x)
        const yDistance = Math.abs(lastItem.dxy2.y - lastItem.dxy1.y)
        if (lastItem.figure) {
            var textWidth = context.measureText(lastItem.figure.total.toString())
            var textHeight = textWidth.actualBoundingBoxDescent - textWidth.actualBoundingBoxAscent
            context.clearRect(lastItem.figure.position.x, lastItem.figure.position.y, textWidth.width, textHeight)
        }
        if (xDistance > yDistance) {
            if (Math.ceil(lastItem.dxy1.x) > Math.ceil(lastItem.dxy2.x)) {
                var temp
                temp = lastItem.dxy1.x     
                lastItem.dxy1.x =  lastItem.dxy2.x
                lastItem.dxy2.x = temp
            }
        }else{
            if (Math.ceil(lastItem.dxy1.y) > Math.ceil(lastItem.dxy2.y)) {
                var temp
                temp = lastItem.dxy1.y     
                lastItem.dxy1.y =  lastItem.dxy2.y
                lastItem.dxy2.y = temp
            }
        }
        context.clearRect(
            xDistance > yDistance ? lastItem.dxy1.x : lastItem.dxy1.x - 2.5, xDistance > yDistance ? lastItem.dxy1.y - 2.5 : lastItem.dxy1.y,
            (xDistance > yDistance ? lineDistance(lastItem.dxy1, lastItem.dxy2) + 1 : 4),
            (xDistance > yDistance ? 4 : lineDistance(lastItem.dxy1, lastItem.dxy2)))
        clearedMeter.push(metersMeasure[metersMeasure.length - 1])
        metersMeasure.splice(metersMeasure.length - 1, 1)
        clearedStratCoordinate.push(startCoordinates[startCoordinates.length - 1])
        clearedEndCoordinate.push(endCoordinates[endCoordinates.length - 1])
        startCoordinates.splice(startCoordinates.length - 1, 1)
        endCoordinates.splice(endCoordinates.length - 1, 1)
        lines.splice(lines.length - 1, 1)
    }
}
function redoCleared() {
    if (clearedLines.length) {
        const lastItem = clearedLines[clearedLines.length - 1]
        const mx = lastItem.dxy2.x - lastItem.dxy1.x
        const my = lastItem.dxy2.y - lastItem.dxy1.y
        const xDistance = Math.abs(lastItem.dxy2.x - lastItem.dxy1.x)
        const yDistance = Math.abs(lastItem.dxy2.y - lastItem.dxy1.y)
        lines.push(lastItem)
        if (lastItem.figure) {
            context.fillStyle = "blue"
            context.font = "15px times new roman"
            context.fillText(lastItem.figure.total, lastItem.figure.position.x, lastItem.figure.position.y)
        }
        context.fillStyle = "black"
        context.fillRect(
            lastItem.dxy1.x, lastItem.dxy1.y,
            (xDistance > yDistance ? lineDistance(lastItem.dxy1, lastItem.dxy2) : 1.5),
            (xDistance > yDistance ? "1.5" : lineDistance(lastItem.dxy1, lastItem.dxy2)))
        // if (xDistance > yDistance) {
        //     context.beginPath();
        //     context.moveTo(lastItem.dxy1.x, lastItem.dxy1.y)
        //     context.lineTo(
        //         lastItem.dxy1.x + lineDistance(lastItem.dxy1, lastItem.dxy2) * Math.cos(Math.atan(my / mx)),
        //         (lastItem.dxy1.y + lineDistance(lastItem.dxy1, lastItem.dxy2) * Math.sin(Math.atan(my / mx))))
        //     context.stroke()
        // } 
        endCoordinates.push(clearedEndCoordinate[clearedEndCoordinate.length - 1] != undefined ? clearedEndCoordinate[clearedEndCoordinate.length - 1] : endCoordinates.splice(0, 1))
        startCoordinates.push(clearedStratCoordinate[clearedStratCoordinate.length - 1] != undefined ? clearedStratCoordinate[clearedStratCoordinate.length - 1] : startCoordinates.splice(0, 1))
        clearedStratCoordinate.splice(clearedStratCoordinate.length - 1, 1)
        clearedEndCoordinate.splice(clearedEndCoordinate.length - 1, 1)
        metersMeasure.push(clearedMeter[clearedMeter.length - 1])
        clearedMeter.splice(clearedMeter.length - 1, 1)
        clearedLines.splice(clearedLines.length - 1, 1)
    }
}

// function changeBackgroundColor() {
//     context.save();
//     context.fillStyle = document.getElementById("backgroundColor").value;
//     context.fillRect(0, 0, canvas.width, canvas.height);
//     context.restore();
// }

function polygonArea(X, Y, numPoints){ 
       let area = 0;  
       let j = numPoints-1; 

        for (let i=0; i<numPoints; i++){
             area +=  (X[j]+X[i]) * (Y[j]-Y[i]); 
             j = i;  
        }
    return area/2;
}

function lineDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function calculateArea(){
    var xPt = []
    var yPt = []
    xPt.push((xPts[0] + xPts[xPts.length-1])/2)
    yPt.push((yPts[0] + yPts[yPts.length-1])/2)
    xPts.splice(xPts.length-1,1)
    xPts.splice(0,1)
    yPts.splice(yPts.length-1,1)
    yPts.splice(0,1)
    const pointLength = xPts.length
    for (var i = 0; i < pointLength / 2; i++) {
        xPt.push((xPts[0] + xPts[1])/2)
        xPts.splice(0,2)
        yPt.push((yPts[0] + yPts[1])/2)
        yPts.splice(0,2)
    }
   return polygonArea(xPt,yPt,yPt.length)
}

function eraseCanvas() {
    cm_Elm = document.getElementById("centimeters");
    m_Elm = document.getElementById("meters");
    dragStartLocation = 0
    dragStopLocation = 0
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

}

// var image = new Image();
// image.addEventListener('load', (){
//     context.drawImage(this, 0, 0, canvas.width, canvas.height);
// }, !1)
// image.src = "image_sal4vg.jpg";

function ev_tool_change(ev) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
      console.log(tools)
    }
}

function init() {
    undo = document.getElementById("undo");
    redo = document.getElementById("redo");
    tool_select = document.getElementById("dtool");
    var fillColor = document.getElementById("fillColor"),
        clearCanvas = document.getElementById("clearCanvas"),
        calculate = document.getElementById("calcBtn");

    context.strokeStyle = strokeColor.value;
    context.fillStyle = fillColor.value;
    context.lineWidth = 1.5;

    canvas.addEventListener('mousedown', dragStart, !1);
    canvas.addEventListener('mousemove', drag, !1);
    canvas.addEventListener('mouseup', dragStop, !1);
    clearCanvas.addEventListener("click", eraseCanvas, !1);
    calculate.addEventListener("click", calculateTotal, !1);
    undo.addEventListener("click", clearLastLine, !1);
    redo.addEventListener("click", redoCleared, !1);
    tool_select.addEventListener("change", ev_tool_change, !1);
    opacity();

    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }
}
function opacity() {
    requestAnimationFrame(opacity)
    if (clearedLines.length) {
        redo.style.pointerEvents = "all"
        redo.style.opacity = "1"
    } else {
        redo.style.pointerEvents = "none"
        redo.style.opacity = ".4"
    }
    if (lines.length) {
        clearCanvas.style.pointerEvents = "all"
        clearCanvas.style.opacity = "1"
        undo.style.pointerEvents = "all"
        undo.style.opacity = "1"
    } else {
        clearCanvas.style.opacity = ".4"
        clearCanvas.style.pointerEvents = "none"
        undo.style.pointerEvents = "none"
        undo.style.opacity = ".4"
    }
}

addEventListener('load', init, !1);