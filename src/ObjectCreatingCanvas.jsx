import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { useModal } from "react-hooks-use-modal";
import ModalForText from "./ModalForText";
import { toEllipse, toLine, toRect, toText } from "./ObjectUtils";

const ObjectCreatingCanvas = ({
  objectType,
  onNewObject,
  onClicked,
  onDoubleClick,
  ...rest
}) => {
  const [dots, setDots] = useState([]);
  const [modal, open, close] = useModal("root", {
    preventScroll: true,
    closeOnOverlayClick: false
  });
  const clearDots = () => {
    setDots([]);
  };
  useEffect(clearDots, [objectType]);
  const handleCreatingNewObject = (e) => {
    if (!objectType) return;
    switch (objectType) {
      case 1:
        if (dots.length === 0) {
          setDots([{ x: e.x, y: e.y }]);
        } else {
          const o = toLine(e, dots[0]);
          onNewObject(o);
          clearDots();
        }
        break;
      case 2:
        if (dots.length === 0) {
          setDots([{ x: e.x, y: e.y }]);
        } else {
          const o = toRect(e, dots[0]);
          onNewObject(o);
          clearDots();
        }
        break;
      case 3:
        if (dots.length === 0) {
          setDots([{ x: e.x, y: e.y }]);
        } else {
          const o = toEllipse(e, dots[0]);
          onNewObject(o);
          clearDots();
        }
        break;
      case 4: // text
        setDots([{ x: e.x, y: e.y }]);
        open();
        break;
      default:
        console.debug(`handleCreatingNewObject unkown type:${objectType}`);
    }
  };

  const closeModalForText = () => {
    close();
    clearDots();
  };

  const handleCreatingTextObject = (res) => {
    const { x, y } = dots[0];
    const { text } = res;
    // 不允許空字串
    if (typeof res.text === "string" && res.text.length > 0) {
      const o = toText(x, y, text);
      onNewObject(o);
    }
    closeModalForText();
  };

  return (
    <>
      <Canvas
        {...rest}
        id="abc123"
        onClicked={(e) => {
          // 如果paren有要處理事件,就註冊onClicked事件
          // 最後會判別回傳值來決定是否內建事件處理
          if (typeof onClicked === "function") {
            if (onClicked(e) !== undefined) return;
          }
          handleCreatingNewObject(e);
        }}
        onDoubleClick={onDoubleClick}
      ></Canvas>
      <ModalForText
        ModalComponent={modal}
        onOkay={handleCreatingTextObject}
        onCancel={closeModalForText}
      ></ModalForText>
    </>
  );
};

export default ObjectCreatingCanvas;
