var dragging = !1,
    dragStartLocation,
    dragStopLocation,
    snapshot,
    undo,
    redo,
    currentCent = 0,
    currentMet = 0,
    tool_default = 'line',
    tool_select,
    areaFigure,
    totalMet = 0.00;
let indexNum = -1;
let centimetersMeasure = [];
let metersMeasure = [];
let startCoordinates = [];
let endCoordinates = [];
let lines = [];
let linesSum = [];
let clearedLines = [];
// let clearedMeter = [];
// let clearedStratCoordinate = [];
// let clearedEndCoordinate = [];
let linesArray = [];
let xPts = [];
let yPts = [];
let pointsCurve = [];
let restoreArray = [];
let clearArray = [];
var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
canvas.width = 1200;
canvas.height = 800;
document.body.appendChild(canvas);
var image_url = "../images/image_sal4vg.jpg"
    // const imageLoader = document.querySelector('.imageLoader')
    // imageLoader.addEventListener('change', uploadImage)

// function uploadImage() {
//     const curFiles = imageLoader.files;
//     image_url = imageLoader.value
//     imageLoader.value = null
//     var images;
//     for (const file of curFiles) {
//         images = window.URL.createObjectURL(image_url)
//     }
//     console.log(images)
//         // drawImageCanv(image_url)
// }

function drawImageCanv(image_url = 'null') {
    var img = new Image();
    img.crossOrigin = 'anonymous' || null;
    img.src = image_url != 'null' ? image_url : ""
    img.onload = function() {
        var scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        var x = (canvas.width / 2) - (img.width / 2) * scale;
        var y = (canvas.height / 2) - (img.height / 2) * scale;
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
        img.style.display = 'none';
    };
}

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
    context.fillStyle = "black";
    context.lineWidth = 1.4;
    context.moveTo(dragStartLocation.x, dragStartLocation.y);
    context.lineTo(position.x, position.y);
    context.stroke();
}

function displayMeasures(cm_values) {
    scaleElm = document.getElementById("defaultScale");
    cm_Elm = document.getElementById("centimeters");
    m_Elm = document.getElementById("meters");

    meters = ((cm_values * 100) * (1 / scaleElm.value));

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
    dragStartLocation = currentPosition;
    xPts.push(dragStartLocation.x);
    yPts.push(dragStartLocation.y);
    startCoordinates.push(dragStartLocation);
    context.beginPath();
    context.lineCap = "round";
    context.moveTo(currentPosition.x, currentPosition.y);
    if (tool_default == "line") takeSnapshot();
}

function mouseMove(evt) {
    if (dragging === 1) {
        var currentPosition = getMousePos(canvas, evt);
        let distance_px = lineDistance(dragStartLocation, currentPosition);
        let distance_cm = 0.02645833 * distance_px;
        if (tool_default == "pencil") {
            canvas.style.cursor = "crosshair";
            context.shadowColor = "rgba(0,0,0,.5)";
            context.shadowBlur = 1.6;
            context.lineWidth = 1.4;
            context.strokeStyle = "black";
            context.lineJoin = 'round';
            pointsCurve.push({ x: currentPosition.x, y: currentPosition.y });
            context.quadraticCurveTo(currentPosition.x, currentPosition.y, currentPosition.x, currentPosition.y);
            context.stroke();
        } else {
            canvas.style.cursor = "default";
            restoreSnapshot();
            draw(currentPosition);
        }
        store(currentPosition.x, currentPosition.y);
        displayMeasures(distance_cm);
    }
}

function mouseUp(evt) {
    if (dragging) {
        dragging = !1;
        var position = getMousePos(canvas, evt);
        if (tool_default == "line") {
            draw(position)
        } else {
            context.lineWidth = 1.4;
            // if (pointsCurve.length) bzCurve(pointsCurve, 0.2, 2);
            pointsCurve = []
        }

        if (evt.type == 'mouseout' || evt.type == 'mouseup' || evt.type == 'touchend') {
            restoreArray.push(context.getImageData(0, 0, canvas.width, canvas.height));
            indexNum = indexNum + 1;
        }
        let distance_px = lineDistance(dragStartLocation, position);
        let distance_cm = 0.02645833 * distance_px;
        let scaleElm = document.getElementById("defaultScale");
        currentCent = distance_cm * (1 / scaleElm.value);
        currentMet = ((distance_cm * 100) * (1 / scaleElm.value));
        dragStopLocation = position;
        xPts.push(dragStopLocation.x);
        yPts.push(dragStopLocation.y);
        // console.log("X" ,xPts,"Y",yPts)
        endCoordinates.push(dragStopLocation);
        centimetersMeasure.push(currentCent);
        metersMeasure.push(currentMet);
        lines.push({ dxy1: dragStartLocation, dxy2: position });
        store()
    }
    evt.preventDefault()

}

function gradient(a, b) {
    return (b.y - a.y) / (b.x - a.x);
}

function bzCurve(points, f, t) {

    if (typeof(f) == 'undefined') f = 0.3;
    if (typeof(t) == 'undefined') t = 0.6;

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);

    var m = 0;
    var dx1 = 0;
    var dy1 = 0;

    var preP = points[0];
    for (var i = 1; i < points.length; i++) {
        var curP = points[i];
        nexP = points[i + 1];
        if (nexP) {
            m = gradient(preP, nexP);
            dx2 = (nexP.x - curP.x) * -f;
            dy2 = dx2 * m * t;
        } else {
            dx2 = 0;
            dy2 = 0;
        }
        context.bezierCurveTo(preP.x - dx1, preP.y - dy1, curP.x + dx2, curP.y + dy2, curP.x, curP.y);
        dx1 = dx2;
        dy1 = dy2;
        preP = curP;
    }
    context.stroke();
}

function store(x, y) {
    var line = {
        "x": x,
        "y": y
    };
    linesArray.push(line);
}

function calculateTotal() {
    if (metersMeasure.length && centimetersMeasure.length) {
        var totalMeters = 0.00;
        metersMeasure.forEach((meter) => {
            totalMeters = meter != undefined ? totalMeters + meter : totalMeters + 0
        });
        totalMet = totalMeters;
        var totalCentimeters = 0.00;
        centimetersMeasure.forEach((centimeter) => {
            totalCentimeters = centimeter != undefined ? totalCentimeters + centimeter : totalCentimeters + 0
        });
        totalCentimet = totalCentimeters;
        context.beginPath();
        let sumLineStartPoint = startCoordinates[0].length && startCoordinates[0] ? startCoordinates[1] : startCoordinates[0];
        let endLineSumPosition = endCoordinates && endCoordinates[endCoordinates.length - 1];
        const xDistance = Math.abs(endLineSumPosition.x - sumLineStartPoint.x);
        const yDistance = Math.abs(endLineSumPosition.y - sumLineStartPoint.y);
        if (xDistance > yDistance) {
            // context.moveTo(sumLineStartPoint.x, sumLineStartPoint.y - 3);
            // context.lineTo(endLineSumPosition.x, sumLineStartPoint.y - 3);
            // context.stroke();
            context.fillStyle = "blue";
            context.font = "15px times new roman";
            context.fillText(`${totalMet.toFixed(2)} m`, sumLineStartPoint.x + (endLineSumPosition.x - sumLineStartPoint.x) / 2, sumLineStartPoint.y - 5);
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
            // context.moveTo(sumLineStartPoint.x + 5, sumLineStartPoint.y);
            // context.lineTo(sumLineStartPoint.x + 5, endLineSumPosition.y);
            context.fillStyle = "blue";
            context.font = "15px times new roman";
            context.fillText(`${totalMet.toFixed(2)}  m`, sumLineStartPoint.x + 8, sumLineStartPoint.y + (endLineSumPosition.y - sumLineStartPoint.y) / 2);
            context.stroke();
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
        centimetersMeasure = [];
        metersMeasure = [];
        startCoordinates = [];
        endCoordinates = []
    }
    let area = Math.ceil(Math.abs(calculateArea()));
    var digits = ("" + area).split("").map(Number);
    digits.splice(digits.length - 1, 1)
    digits.splice(digits.length - 1, 1)
    areaFigure.value = Math.ceil(digits.join().replaceAll(',', '') / 4) + " " + "m2";
}

function dist(x1, y1, x2, y2) {
    x2 -= x1;
    y2 -= y1;
    return Math.sqrt((x2 * x2) + (y2 * y2));
}

function clearLastLine() {
    if (indexNum <= 0) {
        eraseCanvas()
    } else {
        let restoreLen = restoreArray.length - 1;
        indexNum = indexNum - 1;
        clearArray.push(restoreArray[restoreLen]);
        restoreArray.splice(restoreLen, 1);
        context.putImageData(restoreArray[indexNum], 0, 0);
    }
    // if (lines.length) {
    //     const lastItem = lines[lines.length - 1];
    //     var lengthLine;
    //     clearedLines.push(lastItem);
    //     const xDistance = Math.abs(lastItem.dxy2.x - lastItem.dxy1.x);
    //     const yDistance = Math.abs(lastItem.dxy2.y - lastItem.dxy1.y);
    //     if (lastItem.figure) {
    //         var textWidth = context.measureText(lastItem.figure.total.toString());
    //         var textHeight = textWidth.actualBoundingBoxDescent - textWidth.actualBoundingBoxAscent;
    //         context.clearRect(lastItem.figure.position.x, lastItem.figure.position.y, textWidth.width, textHeight)
    //     }else {
    //         context.clearRect(
    //             xDistance > yDistance ? lastItem.dxy1.x : lastItem.dxy1.x - 2.5, xDistance > yDistance ? lastItem.dxy1.y - 2.5 : lastItem.dxy1.y,
    //             (xDistance > yDistance ? lineDistance(lastItem.dxy1, lastItem.dxy2) + 1 : 4),
    //             (xDistance > yDistance ? 4 : lineDistance(lastItem.dxy1, lastItem.dxy2)));
    //     }
    //     if (xDistance > yDistance) {
    //         if (Math.ceil(lastItem.dxy1.x) > Math.ceil(lastItem.dxy2.x)) {
    //             var temp;
    //             temp = lastItem.dxy1.x;
    //             lastItem.dxy1.x = lastItem.dxy2.x;
    //             lastItem.dxy2.x = temp
    //         }
    //     } else {
    //         if (Math.ceil(lastItem.dxy1.y) > Math.ceil(lastItem.dxy2.y)) {
    //             var temp;
    //             temp = lastItem.dxy1.y;
    //             lastItem.dxy1.y = lastItem.dxy2.y;
    //             lastItem.dxy2.y = temp
    //         }
    //     }
    //     // lengthLine = dist(lastItem.dxy1.x,lastItem.dxy1.y,lastItem.dxy2.x,lastItem.dxy2.y);
    //     // context.translate(lastItem.dxy1.x,lastItem.dxy1.y);
    //     // context.rotate(Math.atan2(lastItem.dxy2.y-lastItem.dxy1.y,lastItem.dxy2.x-lastItem.dxy1.x));
    //     // context.clearRect(0,0,lengthLine,3.5);
    //
    //     clearedMeter.push(metersMeasure[metersMeasure.length - 1]);
    //     metersMeasure.splice(metersMeasure.length - 1, 1);
    //     clearedStratCoordinate.push(startCoordinates[startCoordinates.length - 1]);
    //     clearedEndCoordinate.push(endCoordinates[endCoordinates.length - 1]);
    //     startCoordinates.splice(startCoordinates.length - 1, 1);
    //     endCoordinates.splice(endCoordinates.length - 1, 1);
    //     lines.splice(lines.length - 1, 1)
    // }
}

function redoCleared() {
    if (clearArray.length) {
        const cleanLength = clearArray.length - 1;
        const restoreLength = restoreArray.length - 1;
        indexNum += 1;
        restoreArray.push(clearArray[cleanLength]);
        clearArray.splice(restoreLength, 1);
        context.putImageData(restoreArray[indexNum], 0, 0);
    }
    // if (clearedLines.length) {
    //     const lastItem = clearedLines[clearedLines.length - 1];
    //     let mx = lastItem.dxy2.x - lastItem.dxy1.x;
    //     let my = lastItem.dxy2.y - lastItem.dxy1.y;
    //     const xDistance = Math.abs(lastItem.dxy2.x - lastItem.dxy1.x);
    //     const yDistance = Math.abs(lastItem.dxy2.y - lastItem.dxy1.y);
    //     lines.push(lastItem);
    //     if (lastItem.figure) {
    //         context.fillStyle = "blue";
    //         context.font = "15px times new roman";
    //         context.fillText(lastItem.figure.total, lastItem.figure.position.x, lastItem.figure.position.y)
    //     } else {
    //         context.strokeStyle = "black";
    //         context.fillStyle = "black";
    //         context.fillRect(
    //             lastItem.dxy1.x, lastItem.dxy1.y,
    //             (xDistance > yDistance ? lineDistance(lastItem.dxy1, lastItem.dxy2) : 1.5),
    //             (xDistance > yDistance ? "1.5" : lineDistance(lastItem.dxy1, lastItem.dxy2)));
    //     }
    //     if (xDistance > yDistance) {
    //         if (Math.ceil(lastItem.dxy1.x) > Math.ceil(lastItem.dxy2.x)) {
    //             var temp;
    //             temp = lastItem.dxy1.x;
    //             lastItem.dxy1.x = lastItem.dxy2.x;
    //             lastItem.dxy2.x = temp
    //         }
    //     } else {
    //         if (Math.ceil(lastItem.dxy1.y) > Math.ceil(lastItem.dxy2.y)) {
    //             var temp;
    //             temp = lastItem.dxy1.y;
    //             lastItem.dxy1.y = lastItem.dxy2.y;
    //             lastItem.dxy2.y = temp
    //         }
    //     }
    //     // if (xDistance > yDistance) {
    //     //     context.beginPath();
    //     //     context.moveTo(lastItem.dxy1.x, lastItem.dxy1.y)
    //     //     context.lineTo(
    //     //         lastItem.dxy1.x + lineDistance(lastItem.dxy1, lastItem.dxy2) * Math.cos(Math.atan(my / mx)),
    //     //         (lastItem.dxy1.y + lineDistance(lastItem.dxy1, lastItem.dxy2) * Math.sin(Math.atan(my / mx))))
    //     //     context.stroke()
    //     // }else{
    //     //     context.beginPath();
    //     //     context.moveTo(lastItem.dxy1.x, lastItem.dxy1.y)
    //     //     context.lineTo(
    //     //         lastItem.dxy2.x + lineDistance(lastItem.dxy1, lastItem.dxy2) * Math.cos(Math.atan( my / mx )),
    //     //         (lastItem.dxy2.y + lineDistance(lastItem.dxy1, lastItem.dxy2) * Math.sin(Math.atan( my / mx ))))
    //     //     context.stroke()
    //     // }
    //     endCoordinates.push(clearedEndCoordinate[clearedEndCoordinate.length - 1] != undefined ? clearedEndCoordinate[clearedEndCoordinate.length - 1] : endCoordinates.splice(0, 1));
    //     startCoordinates.push(clearedStratCoordinate[clearedStratCoordinate.length - 1] != undefined ? clearedStratCoordinate[clearedStratCoordinate.length - 1] : startCoordinates.splice(0, 1));
    //     clearedStratCoordinate.splice(clearedStratCoordinate.length - 1, 1);
    //     clearedEndCoordinate.splice(clearedEndCoordinate.length - 1, 1);
    //     metersMeasure.push(clearedMeter[clearedMeter.length - 1]);
    //     clearedMeter.splice(clearedMeter.length - 1, 1);
    //     clearedLines.splice(clearedLines.length - 1, 1)
    // }
}

function lineDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

function calculateArea() {
    let xPt = [];
    let yPt = [];
    xPt.push((xPts[0] + xPts[xPts.length - 1]) / 2);
    yPt.push((yPts[0] + yPts[yPts.length - 1]) / 2);
    xPts.pop();
    xPts.shift();
    yPts.pop();
    yPts.shift();
    const pointLength = xPts.length;
    for (var i = 0; i < pointLength / 2; i++) {
        xPt.push((xPts[0] + xPts[1]));
        xPts.splice(0, 2);
        yPt.push((yPts[0] + yPts[1]));
        yPts.splice(0, 2)
    }
    return polygonArea(xPt, yPt, yPt.length)
}

function polygonArea(X, Y, numPoints) {
    let area = 0;
    let j = numPoints - 1;

    for (let i = 0; i < numPoints; i++) {
        j = (i + 1) % numPoints;

        area += X[i] * Y[j];
        area -= Y[i] * X[j];
        // area += (X[j] + X[i]) * (Y[j] - Y[i]);
        // j = i;
    }
    let scaleElm = document.getElementById("defaultScale");
    let area_cm = 0.02645833 * area;
    area = ((area_cm * 100) * (1 / scaleElm.value));
    area /= 2;
    return (area < 0 ? -area : area);
}

function eraseCanvas() {
    cm_Elm = document.getElementById("centimeters");
    m_Elm = document.getElementById("meters");
    dragStartLocation = 0;
    dragStopLocation = 0;
    currentCent = 0;
    currentMet = 0;
    cm_Elm.value = "";
    m_Elm.value = "";
    context.clearRect(0, 0, canvas.width, canvas.height);
    indexNum = -1;
    restoreArray = [];
    clearArray = [];
    startCoordinates = [];
    endCoordinates = [];
    lines = [];
    linesSum = [];
    clearedLines = [];
    xPts = [];
    yPts = [];
    areaFigure.value = "";
    drawImageCanv(image_url)
}

function init() {
    undo = document.getElementById("undo");
    redo = document.getElementById("redo");
    tool_select = document.getElementById("dtool");
    clearCanvas = document.getElementById("clearCanvas"),
        calculate = document.getElementById("calcBtn");
    areaFigure = document.getElementById("totalArea");

    context.lineWidth = 1.5;

    canvas.addEventListener('touchend', mouseUp, !1);
    canvas.addEventListener('touchstart', mouseDown, !1);
    canvas.addEventListener('touchmove', mouseMove, !1);
    canvas.addEventListener('mouseout', mouseUp, !1);
    canvas.addEventListener('mousedown', function() {
        mouseDown(event)
    }, !1);
    canvas.addEventListener('mousemove', function() {
        mouseMove(event)
    }, !1);
    canvas.addEventListener('mouseup', mouseUp, !1);
    clearCanvas.addEventListener("click", eraseCanvas, !1);
    calculate.addEventListener("click", calculateTotal, !1);
    undo.addEventListener("click", clearLastLine, !1);
    redo.addEventListener("click", redoCleared, !1);
    tool_select.addEventListener("change", () => {
        tool_default = tool_select.value
    }, !1);
    opacity();
    drawImageCanv(image_url)
}

function opacity() {
    requestAnimationFrame(opacity);
    if (clearArray.length) {
        redo.style.cursor = "pointer";
        redo.style.opacity = "1"
    } else {
        redo.style.cursor = "not-allowed";
        redo.style.opacity = ".4"
    }
    if (restoreArray.length) {
        clearCanvas.style.cursor = "pointer";
        clearCanvas.style.opacity = "1";
        undo.style.cursor = "pointer";
        undo.style.opacity = "1"
    } else {
        clearCanvas.style.opacity = ".4";
        clearCanvas.style.cursor = "not-allowed";
        undo.style.cursor = "not-allowed";
        undo.style.opacity = ".4"
    }
    if (xPts.length) {
        calculate.style.cursor = "pointer"
        calculate.style.opacity = "1"
        calculate.style.pointerEvents = "all"
    } else {
        calculate.style.cursor = "not-allowed"
        calculate.style.pointerEvents = "none"
        calculate.style.opacity = ".4"
    }
    if (image_url == null) {
        imageLoader.style.display = "none"
    }
}

addEventListener('load', init, !1);