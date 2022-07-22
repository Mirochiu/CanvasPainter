import React, { useRef } from "react";

// https://www.cluemediator.com/draw-a-rectangle-on-canvas-using-react#atcaitc
const Canvas = ({ onClicked, ...rest }) => {
  const canvasRef = useRef(null);
  const handleMouseDown = (e) => {
    if (typeof onClicked !== "function") return;
    // https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas
    const element = canvasRef.current;
    const position = element.getBoundingClientRect();
    const scaleRatio = {
      width: position.width / element.width,
      height: position.height / element.height
    };
    // TODO - handle the padding or margin
    const event = {
      canvas: element,
      x: Math.floor((e.clientX - position.left) / scaleRatio.width),
      y: Math.floor((e.clientY - position.top) / scaleRatio.height)
    };
    onClicked(event);
  };
  return (
    <canvas {...rest} ref={canvasRef} onMouseDown={handleMouseDown}></canvas>
  );
};

export default Canvas;
