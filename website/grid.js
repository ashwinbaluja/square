const gridcolor = "rgba(0,0,0,1)"
const fillcolor = "rgba(0,255,255,1)"
const fillpreviewcolor = "rgba(0,255,255,.3)"
const polyborder = "rgba(0,0,0,1)"


let w = 0
let h = 0
const dcanvas = document.getElementById("grid")
const canvas = document.createElement("canvas")
const icanvas = document.getElementById("icanvas")

const cctx = canvas.getContext("2d")
const ictx = icanvas.getContext("2d")
const dctx = dcanvas.getContext("2d")
const cursor = document.getElementById("cursor")
const finish = document.getElementById("addpoly")

cctx.strokeStyle = gridcolor;

const xdiv = 30;
const qmax = 10;

function getInnerSize(elem) {
    return [parseFloat(window.getComputedStyle(elem).width),
            parseFloat(window.getComputedStyle(elem).height)]
};

function updateCanvasSize(dom, canvases) {
    for (let c of canvases) {
        let [cW, cH] = getInnerSize(dom);
        w = cW 
        h = cH
        c.width = cW;
        c.height = cH;
    }
};

function drawGrid(canvas, ctx) {
    let spacing = w / xdiv;
    console.log(spacing, w / xdiv)
    ctx.beginPath()
    for (let i = 1; i < xdiv; i++) {
        ctx.moveTo(Math.round(i * spacing) + .5, 0);
        ctx.lineTo(Math.round(i * spacing) + .5, h);
        ctx.stroke()
    }
    for (let i = 1; i < xdiv / 2; i++) {
        ctx.moveTo(0, Math.round(i * spacing) + .5);
        ctx.lineTo(w, Math.round(i * spacing) + .5);
        ctx.stroke()
    }

};
var queue = [];
function mouseTracker(e, dcanvas, cursor) {
    var rect = dcanvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    const spacing = w / xdiv;
    x = Math.round((x / dcanvas.width) * xdiv) * spacing
    y = Math.round((y / dcanvas.height) * (xdiv / 2)) * spacing

    if (queue[queue.length - 1] != [x, y]) {
        queue.push([x, y])
    }
    if (queue.length > qmax) {
        queue = queue.slice(queue.length - (qmax + 1),queue.length-1)
    }
}

var polytracker = [];
var polys = [];

function polySetup(e, dcanvas) {
    let rect = dcanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const spacing = w / xdiv;
    x = Math.round((x / dcanvas.width) * xdiv) * spacing
    y = Math.round((y / dcanvas.height) * (xdiv / 2)) * spacing
    polytracker.push([x/w, y/h])
}

function polyCreate(icanvas) {
    polys.push(polytracker)
    polytracker = []
}

function singlePoly(poly, icanvas, ictx, color, stroke) {
    console.log(poly)
    ictx.beginPath()
    ictx.fillStyle = color;
    ictx.strokeStyle = polyborder;
    ictx.moveTo(poly[0][0] * w, poly[0][1] * h)

    for (let point of poly.slice(1,poly.length)) {
        ictx.lineTo(point[0] * w, point[1] * h)
    }
    ictx.closePath()
    if (stroke) {
        ictx.stroke()
    }
    ictx.fill()
}

function polyDraw(icanvas, ictx) {
    let w = icanvas.width,
        h = icanvas.height;

    for (let poly of polys) {
        singlePoly(poly, icanvas, ictx, fillcolor, true)
    }
}

function moveCursor() {
    if (queue.length > 0) {
        let pos = queue.shift()
        cursor.style.marginLeft = pos[0]
        cursor.style.marginTop = pos[1]
        if (polytracker.length >= 2) {
            console.log('run')
            ictx.clearRect(0, 0, w, h);
            singlePoly(polytracker.concat([[pos[0] / w, pos[1] / h]]), icanvas, ictx, fillpreviewcolor, false)
            redraw()
        }
    }
}

let mousetimer = window.setInterval(moveCursor, 10)

function redraw() {
    dctx.drawImage(canvas, 0, 0);
}

dcanvas.addEventListener('mousemove', e => {
    mouseTracker(e, dcanvas, cursor);
    redraw();
})

dcanvas.addEventListener('click', e => {
    polySetup(e, dcanvas);
})

dcanvas.addEventListener('mouseout', e => {
    cursor.style.opacity = 0;
    mousetimer = clearInterval(mousetimer)
})
dcanvas.addEventListener('mouseenter', e => {
    cursor.style.opacity = 1;
    mousetimer - window.setInterval(moveCursor, 10)
})

finish.addEventListener('click', e => {
    polyCreate();
    polyDraw(canvas, cctx)
    drawGrid(canvas, cctx);
    redraw();
    ictx.clearRect(0, 0, w, h);

})


window.addEventListener('resize', ()=>{
    updateCanvasSize(dcanvas, [canvas, icanvas, dcanvas]);
    polyDraw(canvas, cctx);
    drawGrid(canvas, cctx);
    redraw();
});

updateCanvasSize(dcanvas, [canvas, icanvas, dcanvas]);
drawGrid(canvas, cctx)
redraw()