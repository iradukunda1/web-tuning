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
let linesArray = []
let xPts = []
let yPts = []

var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;


function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}

function takeSnapshot() {
    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreSnapshot() {
    context.putImageData(snapshot, 0, 0);
}

function drawLine(position) {
    context.beginPath();
    context.fillStyle = "black"
    context.lineWidth = 1.4 
    context.moveTo(dragStartLocation.x, dragStartLocation.y);
    context.lineTo(position.x, position.y);
    context.lineCap = 'round';
    context.stroke();
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

function mouseDown(evt) {
    dragging = 1;
    var currentPosition = getMousePos(canvas, evt);
    dragStartLocation = currentPosition    
    xPts.push(dragStartLocation.x)
    yPts.push(dragStartLocation.y)
    startCoordinates.push(dragStartLocation)
    context.moveTo(currentPosition.x, currentPosition.y)
    context.beginPath();
    context.lineCap = "round";
    if (tool_default == "line") takeSnapshot();
}

function mouseMove(evt) {
    if (dragging === 1) {
        var currentPosition = getMousePos(canvas, evt);
        let distance_px = lineDistance(dragStartLocation, currentPosition);
        let distance_cm = 0.02645833 * distance_px;
        if (tool_default == "pencil") {
            context.shadowColor = "rgba(0,0,0,.5)"
            context.lineWidth = 0.2
            context.shadowBlur = 1
            context.lineTo(currentPosition.x, currentPosition.y)
            context.stroke();
        }else{            
            restoreSnapshot();
            draw(currentPosition);   
        }
        store(currentPosition.x, currentPosition.y);
        displayMeasures(distance_cm);
    }
}

function mouseUp(evt) {
    dragging = !1;
    var position = getMousePos(canvas, evt);
    if (tool_default == "line") restoreSnapshot(), draw(position);
    let distance_px = lineDistance(dragStartLocation, position);
    let distance_cm = 0.02645833 * distance_px;
    let scaleElm = document.getElementById("defaultScale");
    currentCent = distance_cm * (1 / scaleElm.value)
    currentMet = ((distance_cm * 100) * (1 / scaleElm.value))
    dragStopLocation = position    
    xPts.push(dragStopLocation.x)
    yPts.push(dragStopLocation.y)
    endCoordinates.push(dragStopLocation)
    centimetersMeasure.push(currentCent)
    metersMeasure.push(currentMet)
    lines.push({ dxy1: dragStartLocation, dxy2: position })    
    store()
}

function store(x,y){
    var line = {
        "x": x,
        "y": y
    }
    linesArray.push(line);
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
        let mx = lastItem.dxy2.x - lastItem.dxy1.x
        let my = lastItem.dxy2.y - lastItem.dxy1.y
        const xDistance = Math.abs(lastItem.dxy2.x - lastItem.dxy1.x)
        const yDistance = Math.abs(lastItem.dxy2.y - lastItem.dxy1.y)
        lines.push(lastItem)
        if (lastItem.figure) {
            context.fillStyle = "blue"
            context.font = "15px times new roman"
            context.fillText(lastItem.figure.total, lastItem.figure.position.x, lastItem.figure.position.y)
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
        context.strokeStyle= "black"
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
        // }else{
        //     context.beginPath();
        //     context.moveTo(lastItem.dxy1.x, lastItem.dxy1.y)
        //     context.lineTo(
        //         lastItem.dxy2.x + lineDistance(lastItem.dxy1, lastItem.dxy2) * Math.cos(Math.atan( my / mx )),
        //         (lastItem.dxy2.y + lineDistance(lastItem.dxy1, lastItem.dxy2) * Math.sin(Math.atan( my / mx ))))
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

function init() {
    undo = document.getElementById("undo");
    redo = document.getElementById("redo");
    tool_select = document.getElementById("dtool");
    var fillColor = document.getElementById("fillColor"),
        clearCanvas = document.getElementById("clearCanvas"),
        calculate = document.getElementById("calcBtn");

    context.lineWidth = 1.5;

    canvas.addEventListener('mousedown',function(){mouseDown(event)}, !1);
    canvas.addEventListener('mousemove',function(){mouseMove(event)}, !1);
    canvas.addEventListener('mouseup', mouseUp, !1);
    clearCanvas.addEventListener("click", eraseCanvas, !1);
    calculate.addEventListener("click", calculateTotal, !1);
    undo.addEventListener("click", clearLastLine, !1);
    redo.addEventListener("click", redoCleared, !1);
    tool_select.addEventListener("change", ()=> {
        tool_default = tool_select.value
    },!1);
    opacity();
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