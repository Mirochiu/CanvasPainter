export const drawLine = (canvasEle, info) => {
  const { x, y, x1, y1, color = "black", strokeWidth = 1 } = info;
  if (!canvasEle) {
    console.log("canvasEle empty");
    return;
  }
  const ctx = canvasEle.getContext("2d");
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x1, y1);
  // console.debug(`drawLine from ${x},${y} to ${x1},${y1}`);
  ctx.stroke();
  ctx.closePath();
};

export const drawRect = (canvasEle, info) => {
  const { x, y, w, h, color = "black", strokeWidth = 1 } = info;
  if (!canvasEle) {
    console.log("canvasEle empty");
    return;
  }
  const ctx = canvasEle.getContext("2d");
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.strokeRect(x, y, w, h);
  // console.debug(`drawRect with size of ${w}x${h} @ ${x},${y}`);
};

export const drawEllipse = (canvasEle, info) => {
  const { x, y, w, h, rotate = 0, color = "black", strokeWidth = 1 } = info;
  if (!canvasEle) {
    console.log("canvasEle empty");
    return;
  }
  const ctx = canvasEle.getContext("2d");
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.beginPath();
  const wrad = w / 2.0,
    hrad = h / 2.0;
  ctx.ellipse(x + wrad, y + hrad, wrad, hrad, rotate, 0, 2 * Math.PI);
  // console.debug(`drawEllipse c:${cx},${cy} ${w},${h}`);
  ctx.stroke();
  ctx.closePath();
};

export const drawText = (canvasEle, info) => {
  const {
    x,
    y,
    text,
    color = "black",
    fontSize = 20,
    fontFace,
    fontStyle = ""
  } = info;
  if (!canvasEle) {
    console.log("canvasEle empty");
    return;
  }
  // italic bold
  const ctx = canvasEle.getContext("2d");
  ctx.font = `${fontStyle} ${fontSize}px ${fontFace}`;
  //https://stackoverflow.com/questions/14836350/how-to-get-the-bounding-box-of-a-text-using-html5-canvas
  const metrics = ctx.measureText(text);
  // 讓文字位置得中心點為x,y
  const offX = metrics.width / 2.0;
  const offY =
    (metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent) / 2.0;
  const debug = false;
  if (debug) {
    ctx.strokeStyle = "red";
    // bouding box
    ctx.strokeRect(
      x - offX,
      y - offY,
      metrics.width,
      metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent
    );
    ctx.strokeRect(x - offX, y - offY, metrics.width, 1); // Text baseline
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x - offX, y - offY);
  // console.debug(`drawText '${text}' @ ${x},${y} off ${offX},${offY}`);
};

export const clearCanvas = (canvasEle) => {
  if (!canvasEle) {
    console.log("canvasEle empty");
    return;
  }
  const ctx = canvasEle.getContext("2d");
  // https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvasEle.width, canvasEle.height);
  ctx.restore();
};
