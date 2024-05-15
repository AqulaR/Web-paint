"use strict";

// Variables
// References
let canvas = document.getElementById("canvas");
let rect = canvas.getBoundingClientRect();
const resizediv = document.getElementById("resizediv");
const divcanvas = document.getElementById("canvasdiv");
const canvasMask = document.getElementById("canvas-mask");
const ctx = canvas.getContext("2d");
const ctxMask = canvasMask.getContext("2d");
const colorInput = document.getElementById("color-input");
const sizeInput = document.getElementById("size-input");
const strokeInput = document.getElementById("stroke-input");
// Settings
let color = "black";
let size = 20;
let stroke = false;
let scale = 1;
// Other
let drawing = false;
let changesArray = [];
let changesPosition = -1;
const changesArrayLimit = 15;
const mousePos = {
  x: null,
  y: null,
  xDown: null,
  yDown: null,
};
const TOOLS = {
  BRUSH: "brush",
  HIGHLIGHTER: "highlighter",
  ERASER: "eraser",
  LINE: "line",
  SQUARE: "square",
  CIRCLE: "circle",
  SQUAREF: "squaref",
  CIRCLEF: "circlef",
  TRIANGLE: "triangle",
  TRIANGLEF: "trianglef",
  FILL: "fill",
};
let tool = TOOLS.BRUSH;
let colorP = 0;

// Event Listeners

// Normal canvas
// Mobile
canvas.addEventListener("touchstart", drawStart);
canvas.addEventListener("touchmove", draw);
canvas.addEventListener("touchend", drawEnd);
// Desktop
canvas.addEventListener("mousedown", drawStart);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", drawEnd);
canvas.addEventListener("mouseout", drawEnd);
// Canvas mask
// Mobile
canvasMask.addEventListener("touchstart", drawStart);
canvasMask.addEventListener("touchmove", draw);
canvasMask.addEventListener("touchend", drawEnd);
// Desktop
canvasMask.addEventListener("mousedown", drawStart);
canvasMask.addEventListener("mousemove", draw);
canvasMask.addEventListener("mouseup", drawEnd);
canvasMask.addEventListener("mouseout", drawEnd);

// Functions

function rgbToHex(col)
{
  if(col.charAt(0)=='r')
  {
    col=col.replace('rgb(','').replace(')','').split(',');
    var r=parseInt(col[0], 10).toString(16);
    var g=parseInt(col[1], 10).toString(16);
    var b=parseInt(col[2], 10).toString(16);
    r=r.length==1?'0'+r:r;
    g=g.length==1?'0'+g:g;
    b=b.length==1?'0'+b:b;
    var colHex='#'+r+g+b;
    return colHex;
  }
}

colorInput.addEventListener("change", (event) => {
  document.getElementById("color_now").style.backgroundColor = colorInput.value;
  colorP = 0;
  console.log(colorInput.value);
});

document.addEventListener("DOMContentLoaded", () => {
  colorInput.value = "black";
});

function setColor(e) {
  colorP = rgbToHex(e.style.backgroundColor);
  console.log(colorP);
  document.getElementById("color_now").style.backgroundColor = colorP;
}

function changeWH() {
  let inpw = document.getElementById("w-input").value;
  let inph = document.getElementById("h-input").value;
  
  divcanvas.style.minWidth = `${parseInt(inpw) * scale.toFixed(2)}px`;
  divcanvas.style.minHeight = `${parseInt(inph) * scale.toFixed(2)}px`;

  canvas = document.getElementById("canvas");
  rect = canvas.getBoundingClientRect();

  document.getElementById("sizewh_dwn").innerHTML = `${parseInt(divcanvas.style.minWidth)} x ${parseInt(divcanvas.style.minHeight)} пикс.`;

  resizediv.style.width = `${(parseInt(inpw) + 10) * scale.toFixed(2)}px`;
  resizediv.style.height = `${(parseInt(inph) + 12) * scale.toFixed(2)}px`;

  resizeFix(inpw, inph);
}

function resize_canvas(e) {
  let el_width = parseInt(e.style.width) - 10;
  let el_height = parseInt(e.style.height) - 12;

  // e.style.width = el_width;
  // e.style.height = el_height;
  // console.log(`${el_width}, ${el_height}`);
  // console.log("dsad");

  // divcanvas.style.minHeight = `${el_height + 20}px`
  // divcanvas.style.minWidth = `${el_width + 20}px`

  divcanvas.style.minHeight = `${parseInt(resizediv.style.height) * scale.toFixed(2)}px`;
  divcanvas.style.minWidth = `${parseInt(resizediv.style.width) * scale.toFixed(2)}px`;
  
  canvas = document.getElementById("canvas");
  rect = canvas.getBoundingClientRect();

  document.getElementById("w-input").value = parseInt(divcanvas.style.minWidth);
  document.getElementById("h-input").value = parseInt(divcanvas.style.minHeight);

  document.getElementById("sizewh_dwn").innerHTML = `${parseInt(divcanvas.style.minWidth)} x ${parseInt(divcanvas.style.minHeight)} пикс.`;

  resizeFix(el_width, el_height);
}

function drawStart(e) {
  drawing = true;
  // mousePos.xDown = e.clientX - rect.left;
  // mousePos.yDown = e.clientY - rect.top;
  mousePos.xDown = (e.clientX - rect.left) / scale;
  mousePos.yDown = (e.clientY - rect.top) / scale;
  // mousePos.xDown = e.x - canvas.offsetLeft;
  //   = e.y - canvas.offsetTop;
  // console.log(mousePos.xDown);

  // console.log(
  //   `Позиция курсора: x=${e.clientX - rect.left}, y=${
  //     e.clientY - rect.top
  //   }, scale = ${scale}`
  // );
  // console.log(
  //   `Позиция курсора new: x=${(e.clientX - rect.left) / scale}, y=${
  //     (e.clientY - rect.top) / scale
  //   }`
  // );

  colorP == 0 ? color = colorInput.value : color = colorP;
  
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctxMask.strokeStyle = color;
  size = sizeInput.value;
  // stroke = strokeInput.checked;
  switch (tool) {
    case TOOLS.BRUSH:
    case TOOLS.HIGHLIGHTER:
    case TOOLS.ERASER:
      ctx.beginPath();
      ctx.moveTo(mousePos.xDown, mousePos.yDown);
    case TOOLS.CIRCLE:
    case TOOLS.SQUARE:
    case TOOLS.CIRCLEF:
    case TOOLS.SQUAREF:
    case TOOLS.TRIANGLE:
    case TOOLS.TRIANGLEF:
    case TOOLS.LINE:
      ctx.lineWidth = size;
      break;
    case TOOLS.FILL:
      // console.log(e.x, e.y);
      flood_fill(e.x, e.y, hexToRgba(color));
      break;
  }
  draw(e);
}

function draw(e) {
  ctxMask.clearRect(0, 0, canvasMask.width, canvasMask.height); // Clears the mask
  // const rect = canvas.getBoundingClientRect();
  mousePos.x = (e.clientX - rect.left) / scale;
  mousePos.y = (e.clientY - rect.top) / scale;
  if (drawing) {
    const w = mousePos.x - mousePos.xDown;
    const h = mousePos.y - mousePos.yDown;
    switch (tool) {
      case TOOLS.ERASER:
        ctx.strokeStyle = "white";
      case TOOLS.BRUSH:
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.strokeStyle = color;
        break;
      case TOOLS.HIGHLIGHTER:
        ctx.globalAlpha = 0.01;
        ctx.strokeStyle = color;
        console.log(color + "01");
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.strokeStyle = color;
        ctx.globalAlpha = 1;
        break;
      case TOOLS.LINE:
        ctxMask.strokeStyle = color;
        ctxMask.beginPath();
        ctxMask.moveTo(mousePos.xDown, mousePos.yDown);
        ctxMask.lineTo(mousePos.x, mousePos.y);
        ctxMask.stroke();
        ctxMask.closePath();
        break;
      case TOOLS.SQUARE:
        ctxMask.strokeStyle = color;
        ctxMask.strokeRect(mousePos.xDown, mousePos.yDown, w, h);
        break;
      case TOOLS.CIRCLE:
        ctxMask.strokeStyle = color;
        ctxMask.beginPath();
        ctxMask.ellipse(
          mousePos.xDown + w / 2,
          mousePos.yDown + h / 2,
          Math.abs(w / 2),
          Math.abs(h / 2),
          0,
          0,
          Math.PI * 2
        );
        ctxMask.stroke();
        ctxMask.closePath();
        break;
      case TOOLS.SQUAREF:
        ctxMask.fillStyle = color;
        ctxMask.fillRect(mousePos.xDown, mousePos.yDown, w, h);
        break;
      case TOOLS.CIRCLEF:
        ctxMask.fillStyle = color;
        ctxMask.beginPath();
        ctxMask.ellipse(
          mousePos.xDown + w / 2,
          mousePos.yDown + h / 2,
          Math.abs(w / 2),
          Math.abs(h / 2),
          0,
          0,
          Math.PI * 2
        );
        ctxMask.fill();
        ctxMask.closePath();
        break;
      case TOOLS.TRIANGLE:
        ctxMask.strokeStyle = color;
        ctxMask.beginPath();
        ctxMask.moveTo(mousePos.xDown, mousePos.yDown);
        ctxMask.lineTo(mousePos.x, mousePos.y);
        ctxMask.lineTo(mousePos.xDown * 2 - mousePos.x, mousePos.y);
        ctxMask.closePath();
        ctxMask.stroke();
        break;
      case TOOLS.TRIANGLEF:
        ctxMask.fillStyle = color;
        ctxMask.beginPath();
        ctxMask.moveTo(mousePos.xDown, mousePos.yDown);
        ctxMask.lineTo(mousePos.x, mousePos.y);
        ctxMask.lineTo(mousePos.xDown * 2 - mousePos.x, mousePos.y);
        ctxMask.closePath();
        ctxMask.fill();
        break;
    }
  }
}

function drawEnd(e) {
  drawing = false;
  ctx.closePath();
  if (e.type != "mouseout") {
    switch (tool) {
      case TOOLS.LINE:
        ctx.beginPath();
        ctx.moveTo(mousePos.xDown, mousePos.yDown);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.closePath();
        break;
      case TOOLS.SQUARE:
        ctx.strokeRect(
          mousePos.xDown,
          mousePos.yDown,
          mousePos.x - mousePos.xDown,
          mousePos.y - mousePos.yDown
        )
        break;
      case TOOLS.CIRCLE:
        ctx.beginPath();
        ctx.ellipse(
          mousePos.xDown + (mousePos.x - mousePos.xDown) / 2,
          mousePos.yDown + (mousePos.y - mousePos.yDown) / 2,
          Math.abs((mousePos.x - mousePos.xDown) / 2),
          Math.abs((mousePos.y - mousePos.yDown) / 2),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.closePath();
        break;
      case TOOLS.SQUAREF:
        ctx.fillRect(
          mousePos.xDown,
          mousePos.yDown,
          mousePos.x - mousePos.xDown,
          mousePos.y - mousePos.yDown
        );
        break;
      case TOOLS.CIRCLEF:
        ctx.beginPath();
        ctx.ellipse(
          mousePos.xDown + (mousePos.x - mousePos.xDown) / 2,
          mousePos.yDown + (mousePos.y - mousePos.yDown) / 2,
          Math.abs((mousePos.x - mousePos.xDown) / 2),
          Math.abs((mousePos.y - mousePos.yDown) / 2),
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.closePath();
        break;
      case TOOLS.TRIANGLE:
        ctx.beginPath();
        ctx.moveTo(mousePos.xDown, mousePos.yDown);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.lineTo(mousePos.xDown * 2 - mousePos.x, mousePos.y);
        ctx.closePath();
        ctx.stroke();
        break;
      case TOOLS.TRIANGLEF:
        ctx.beginPath();
        ctx.moveTo(mousePos.xDown, mousePos.yDown);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.lineTo(mousePos.xDown * 2 - mousePos.x, mousePos.y);
        ctx.closePath();
        ctx.fill();
        break;
    }
    if (changesPosition != changesArray.length - 1) {
      changesArray.splice(changesPosition + 1);
    }
    changesArray.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (changesArray.length >= changesArrayLimit) {
      changesArray.splice(0, 1);
    } else {
      changesPosition++;
    };
  }
}

function getColor(x, y) {
  const pixel = ctx.getImageData(x, y, 1, 1);
  const data = pixel.data;
  return [data[0], data[1], data[2], data[3]];
}

function hexToRgba(hex) {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  }
}

function fillArea(x, y, fillColor) {
  const currentColor = getColor(x - canvas.offsetLeft, y - canvas.offsetTop);
  if (
    currentColor[0] === fillColor[0] &&
    currentColor[1] === fillColor[1] &&
    currentColor[2] === fillColor[2] &&
    currentColor[3] === fillColor[3]
  )
    return;
  let stack = [[x, y]];
  while (stack.length) {
    const position = stack.pop();
    const px = position[0];
    const py = position[1];
    const pixelColor = getColor(px - canvas.offsetLeft, py - canvas.offsetTop);
    if (
      currentColor[0] === pixelColor[0] &&
      currentColor[1] === pixelColor[1] &&
      currentColor[2] === pixelColor[2] &&
      currentColor[3] === pixelColor[3]
    ) {
      ctx.fillStyle = "rgb(" + fillColor.join(",") + ")";
      ctx.fillRect(px - canvas.offsetLeft, py - canvas.offsetTop, 4, 4);
      if (px - canvas.offsetLeft > 0) stack.push([px - 4, py]);
      if (px - canvas.offsetLeft < canvas.width - 5) stack.push([px + 4, py]);
      if (py - canvas.offsetTop > 0) stack.push([px, py - 4]);
      if (py - canvas.offsetTop < canvas.height - 5) stack.push([px, py + 4]);
    }
  }
}

function undo() {
  changesPosition--;
  if (changesPosition < 0) {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    changesPosition = -1;
  } else ctx.putImageData(changesArray[changesPosition], 0, 0);
}

function redo() {
  changesPosition++;
  if (changesPosition < changesArray.length)
    ctx.putImageData(changesArray[changesPosition], 0, 0);
  else changesPosition = changesArray.length - 1;
}

function saveImage() {
  const url = canvas.toDataURL("image/png");
  const reference = document.createElement("a");
  reference.href = url;
  reference.download = "imageWebPaint.png";
  document.body.appendChild(reference);
  reference.click();
  document.body.removeChild(reference);
}

// function loadImage() {
//   const input = document.createElement("input");
//   input.type = "file";
//   input.accept = "image/*";
//   input.onchange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = (ev) => {
//       const image = new Image();
//       image.src = ev.target.result;
//       image.onload = () => {
//         clearCanvas();
//         ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
//       };
//     };
//   };
//   input.click();
// }

function clearCanvas() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  changesArray = [];
  changesPosition = -1;
}

function clearResize() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Tools
function changeTool(newTool) {
  tool = newTool;
  if (
    newTool == TOOLS.LINE ||
    newTool == TOOLS.SQUARE ||
    newTool == TOOLS.CIRCLE ||
    newTool == TOOLS.SQUAREF ||
    newTool == TOOLS.CIRCLEF ||
    newTool == TOOLS.TRIANGLE ||
    newTool == TOOLS.TRIANGLEF
  ) {
    canvasMask.style.display = "block";
  } else canvasMask.style.display = "none";
}

// Resize Fix
function resizeFix(w, h) {
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const canvasRect = canvas.getBoundingClientRect();
  if (w && h) {
    canvas.width = w;
    canvas.height = h;
    canvasMask.width = w - 4;
    canvasMask.height = h - 2;
    canvasMask.style.width = w - 4 + "px";
    canvasMask.style.height = h - 2 + "px";
  } else {
    canvas.width = canvasRect.width;
    canvas.height = canvasRect.height;
    canvasMask.width = canvasRect.width;
    canvasMask.height = canvasRect.height;
    canvasMask.style.width = canvasRect.width + "px";
    canvasMask.style.height = canvasRect.height + "px";
  }
  // Resize image
  clearResize();
  ctx.putImageData(image, 0, 0);

  canvas = document.getElementById("canvas");
  rect = canvas.getBoundingClientRect();

  // resizediv.style.minWidth = w;
  // resizediv.style.minHeight = h;
}
// window.addEventListener("resize", resizeFix);
resizeFix();
clearCanvas();

// Other functionalities
// Options bar highlight
const options = document.querySelectorAll(".option");
options.forEach((op) => {
  if (op.classList.contains("option-nohighlight")) return;
  op.addEventListener("click", function () {
    options.forEach((option) => option.classList.toggle("selected", false));
    this.classList.add("selected");
  });
});

// fast flood /////////////////////////////////////////////////////////////////

function flood_fill(original_x, original_y, color) {
  const original_color = getColor(original_x - canvas.offsetLeft, original_y - canvas.offsetTop);
  const new_color = {
    r: original_color[0],
    g: original_color[1],
    b: original_color[2],
    a: original_color[3],
  };

  let x = original_x;
  let y = original_y;
  let boundary_pixels = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // first we go up until we find a boundary
  let linear_cords = (y * canvas.width + x) * 4;
  var done = false;
  while (y >= 0 && !done) {
    var new_linear_cords = ((y - 1) * canvas.width + x) * 4;
    if (
      boundary_pixels.data[new_linear_cords] == new_color.r &&
      boundary_pixels.data[new_linear_cords + 1] == new_color.g &&
      boundary_pixels.data[new_linear_cords + 2] == new_color.b &&
      boundary_pixels.data[new_linear_cords + 3] == new_color.a
    ) {
      y = y - 1;
      linear_cords = new_linear_cords;
    } else {
      done = true;
    }
  }
  // then we loop around until we get back to the starting point
  var path = [{ x: x, y: y }];
  var first_iteration = true;
  var iteration_count = 0;
  var orientation = 1; // 0:^, 1:<-, 2:v, 3:->
  while (
    !(
      path[path.length - 1].x == path[0].x &&
      path[path.length - 1].y == path[0].y
    ) ||
    first_iteration
  ) {
    iteration_count++;
    first_iteration = false;
    var got_it = false;

    if (path.length >= 2) {
      if (path[path.length - 1].y - path[path.length - 2].y < 0) {
        orientation = 0;
        //console.log( "^" ) ;
      } else if (path[path.length - 1].x - path[path.length - 2].x < 0) {
        orientation = 1;
        //console.log( "<-" ) ;
      } else if (path[path.length - 1].y - path[path.length - 2].y > 0) {
        orientation = 2;
        //console.log( "v" ) ;
      } else if (path[path.length - 1].x - path[path.length - 2].x > 0) {
        orientation = 3;
        //console.log( "->" ) ;
      } else {
        //console.log( "we shouldn't be here" ) ;
      }
    }

    for (var look_at = 0; !got_it && look_at <= 3; look_at++) {
      var both = (orientation + look_at) % 4;
      if (both == 0) {
        // we try right
        if (!got_it && x + 1 < canvas.width) {
          linear_cords = (y * canvas.width + (x + 1)) * 4;
          if (
            boundary_pixels.data[linear_cords] == new_color.r &&
            boundary_pixels.data[linear_cords + 1] == new_color.g &&
            boundary_pixels.data[linear_cords + 2] == new_color.b &&
            boundary_pixels.data[linear_cords + 3] == new_color.a
          ) {
            got_it = true;
            x = x + 1;
          }
        }
      } else if (both == 1) {
        // we try up
        if (!got_it && y - 1 >= 0) {
          linear_cords = ((y - 1) * canvas.width + x) * 4;
          if (
            boundary_pixels.data[linear_cords] == new_color.r &&
            boundary_pixels.data[linear_cords + 1] == new_color.g &&
            boundary_pixels.data[linear_cords + 2] == new_color.b &&
            boundary_pixels.data[linear_cords + 3] == new_color.a
          ) {
            got_it = true;
            y = y - 1;
          }
        }
      } else if (both == 2) {
        // we try left
        if (!got_it && x - 1 >= 0) {
          linear_cords = (y * canvas.width + (x - 1)) * 4;
          if (
            boundary_pixels.data[linear_cords] == new_color.r &&
            boundary_pixels.data[linear_cords + 1] == new_color.g &&
            boundary_pixels.data[linear_cords + 2] == new_color.b &&
            boundary_pixels.data[linear_cords + 3] == new_color.a
          ) {
            got_it = true;
            x = x - 1;
          }
        }
      } else if (both == 3) {
        // we try down
        if (!got_it && y + 1 < canvas.height) {
          linear_cords = ((y + 1) * canvas.width + x) * 4;
          if (
            boundary_pixels.data[linear_cords] == new_color.r &&
            boundary_pixels.data[linear_cords + 1] == new_color.g &&
            boundary_pixels.data[linear_cords + 2] == new_color.b &&
            boundary_pixels.data[linear_cords + 3] == new_color.a
          ) {
            got_it = true;
            y = y + 1;
          }
        }
      }
    }

    if (got_it) {
      path.push({ x: x, y: y });
    }
  }

  draw_quadratic_curve(path, ctx, color, 1, color);
}

function draw_quadratic_curve(path, ctx, color, thickness, fill_color) {
  color = "rgba( " + color.r + "," + color.g + "," + color.b + "," + color.a + ")";
  fill_color = "rgba( " + fill_color.r + "," + fill_color.g + "," + fill_color.b + "," + fill_color.a + ")";
  ctx.strokeStyle = color;
  ctx.fillStyle = fill_color;
  ctx.lineWidth = thickness;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  //ctx.fillStyle = fill_color ;

  if (path.length > 0) {
    // just in case
    if (path.length < 3) {
      var b = path[0];
      ctx.beginPath();
      ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0);
      ctx.fill();
      ctx.closePath();

      //return ;
    } else {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (var i = 1; i < path.length - 2; i++) {
        var c = (path[i].x + path[i + 1].x) / 2;
        var d = (path[i].y + path[i + 1].y) / 2;
        ctx.quadraticCurveTo(path[i].x, path[i].y, c, d);
      }

      // the last 2 points are special
      ctx.quadraticCurveTo(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
      ctx.stroke();
    }
  }
  if (fill_color !== false) {
    ctx.fill();
  }
}

function roll_dwn(el) {
  let target = document.getElementById(el.dataset.target);
  // console.log(target);
  target.classList.toggle("roll_show");
  // console.log(target.classList.toggle("roll_show"));
  // target.style.display == "flex" ? target.style.display == "none" : target.style.display == "flex";
}

// let sliderEl = document.querySelector(".inprldwn");

document.getElementById("size-input").addEventListener("input", (event) => {
  document.getElementById("size_text").innerHTML = `${event.target.value}px`;
})

window.onclick = function(event) {
  if (!event.target.matches('.roll_down') && !event.target.matches('.roll_dwn_con') && !event.target.matches('.inprldwn')) {
    let dropdowns = document.getElementsByClassName("roll_dwn_con");
    for (let i = 0; i < dropdowns.length; i++) {
      if (dropdowns[i].classList.contains('roll_show')) {
        dropdowns[i].classList.remove('roll_show');
      }
    }
  }
}


// scaling

function resize(e) {
  if (scale.toFixed(2) > 0.1 && scale < 3 || (e == "+" && scale.toFixed(2) == 0.1) || (e == "-" && scale.toFixed(2) == 3.0)) {
    e == "+" ? (scale += 0.1) : (scale -= 0.1);
  
    resizediv.style.transform = `scale(${scale.toFixed(2)})`;
    resizediv.style["-o-transform"] = `scale(${scale.toFixed(2)})`;
    resizediv.style["-webkit-transform"] = `scale(${scale.toFixed(2)})`;
    resizediv.style["-moz-transform"] = `scale(${scale.toFixed(2)})`;
  
    // console.log(divcanvas.offsetWidth * scale, divcanvas.offsetHeight * scale); 
    // divcanvas.style.width = `${resizediv.offsetWidth * scale + 100}px`;
    // divcanvas.style.height = `${resizediv.offsetHeight * scale + 50}px`;
    // console.log(e);
  
    // divcanvas.style.transform = `scale(${scale.toFixed(2)})`;
    // divcanvas.style["-o-transform"] = `scale(${scale.toFixed(2)})`;
    // divcanvas.style["-webkit-transform"] = `scale(${scale.toFixed(2)})`;
    // divcanvas.style["-moz-transform"] = `scale(${scale.toFixed(2)})`;
  
    divcanvas.style.minHeight = `${parseInt(resizediv.style.height) * scale.toFixed(2)}px`;
    divcanvas.style.minWidth = `${parseInt(resizediv.style.width) * scale.toFixed(2)}px`;
  
    
    canvas = document.getElementById("canvas");
    rect = canvas.getBoundingClientRect();
  
    document.getElementById("first_opt_scale").innerHTML = `${Math.round(scale * 100)}% &#9660;`;
    document.querySelector("#scale-input").value = Math.round(scale * 100);
    
    document.getElementById("scale_select").value = "nan";
  } else {
    console.log("out of range, ", scale.toFixed(2));
  }
}


document.querySelector("#scale-input").addEventListener("input", (event) => {
  document.getElementById("first_opt_scale").innerHTML = `${event.target.value}% &#9660;`
  scale = Number(event.target.value/100);
  // console.log(Number(event.target.value/100));
  resizediv.style.transform = `scale(${scale.toFixed(2)})`;
  resizediv.style["-o-transform"] = `scale(${scale.toFixed(2)})`;
  resizediv.style["-webkit-transform"] = `scale(${scale.toFixed(2)})`;
  resizediv.style["-moz-transform"] = `scale(${scale.toFixed(2)})`;

  divcanvas.style.minHeight = `${parseInt(resizediv.style.height) * scale.toFixed(2)}px`;
  divcanvas.style.minWidth = `${parseInt(resizediv.style.width) * scale.toFixed(2)}px`;

  canvas = document.getElementById("canvas");
  rect = canvas.getBoundingClientRect();

  document.getElementById("scale_select").value = "nan";
})

function updateScaleNum(el) {
  if (el.value != "nan") {
    let val = el.value;
    document.getElementById("first_opt_scale").innerHTML = `${val * 100}% &#9660;`;
    document.querySelector("#scale-input").value = val * 100;
    scale = Number(val);
    // console.log(Number(val));
    resizediv.style.transform = `scale(${scale.toFixed(2)})`;
    resizediv.style["-o-transform"] = `scale(${scale.toFixed(2)})`;
    resizediv.style["-webkit-transform"] = `scale(${scale.toFixed(2)})`;
    resizediv.style["-moz-transform"] = `scale(${scale.toFixed(2)})`;
  
    divcanvas.style.minHeight = `${parseInt(resizediv.style.height) * scale.toFixed(2)}px`;
    divcanvas.style.minWidth = `${parseInt(resizediv.style.width) * scale.toFixed(2)}px`;
  
    canvas = document.getElementById("canvas");
    rect = canvas.getBoundingClientRect();
  }
}

function scrollFix() {
  let el_width = parseInt(resizediv.style.width) - 10;
  let el_height = parseInt(resizediv.style.height) - 12;

  resizeFix(el_width, el_height)
}

function open_palette() {
  document.getElementById("color-input").click();
  console.log(document.getElementById("color-input"));
}