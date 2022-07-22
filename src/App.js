import React, { useEffect, useState, useRef } from "react";
import "./styles.css";
import { clearCanvas } from "./DrawUtils";
import MenuBar from "./MenuBar";
import ActionBar from "./ActionBar";
import ObjectCreatingCanvas from "./ObjectCreatingCanvas";
import { CompactPicker } from "react-color";
import {
  isText,
  isOverObject,
  drawObjectsOnCanvas,
  unflatObjects,
  VerticalAlignHandlers,
  HorizontalAlignHandlers
} from "./ObjectUtils";
import { useModal } from "react-hooks-use-modal";
import ModalForText from "./ModalForText";

export default function App() {
  const [curMenu, setMenu] = useState(null);
  const [curActionBar, setActionBar] = useState([]);
  const [loadedSteps, setLoadedSteps] = useState(0);
  const [steps, setSteps] = useState([]);
  const [redoSteps, setRedoSteps] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [moveAction, setMoveAction] = useState(null);
  const [alignAction, setAlignAction] = useState(null);
  const [deleteAction, setDeleteAction] = useState(null);
  const inputFile = useRef(null);
  const [displayColorPicker, showColorPicker] = useState(null);

  // 顯示滑鼠位置
  useEffect(() => {
    const onMouseMove = (event) => {
      const { pageX: x, pageY: y } = event;
      const l = document.querySelectorAll(".mousePosition");
      l.forEach((ele) => {
        ele.textContent = `(${x},${y})`;
      });
    };
    console.debug("register mousemove");
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  const SingleSelectionMenu = {
    title: "One",
    isExclusiveMode: true,
    hide: true
  };

  const MultipleSelectionMenu = {
    title: "MutipleSelect",
    isExclusiveMode: true,
    keepSelected: true
  };

  const getSelectedObjects = () => {
    return expandSteps(steps)
      .filter((s) => selectedIds.includes(s.id))
      .reverse();
  };

  // 移動物件的處理, 這部份是一種workaround
  // 因為直接在onClicked裡頭寫會抓不到當前的selectedIds的內容,導致無法正常跑
  // 但是改寫成useEffect就能夠抓到當前的selectedIds的內容
  useEffect(() => {
    if (moveAction) {
      // console.debug("moveSelected", moveAction);
      const { x, y } = moveAction.offset;
      const origin = getSelectedObjects();
      if (origin.length < 1) return;
      const updated = origin.map((o) => o.setOffset(x, y));
      // console.debug("ori", origin, "=> new", updated);
      setSteps(steps.concat([updated]));
      setRedoSteps([]);
    }
  }, [moveAction]);

  useEffect(() => {
    if (deleteAction) {
      // console.debug("deleteSelected", deleteAction);
      const origin = getSelectedObjects();
      if (origin.length < 1) return;
      const updated = origin.map((o) => o.setAttribute("delete"));
      // console.debug("ori", origin, "=> new", updated);
      setSelectedIds([]);
      setSteps(steps.concat([updated]));
      setRedoSteps([]);
    }
  }, [deleteAction]);

  useEffect(() => {
    if (alignAction) {
      const debug = false;
      if (debug) console.debug("alignSelected", alignAction);
      const { vertical, horizontal } = alignAction.alignedBy;
      const origin = getSelectedObjects();
      if (origin.length < 1) return;
      const vhdl = VerticalAlignHandlers[vertical];
      const hhdl = HorizontalAlignHandlers[horizontal];
      let updated = null;
      if (vhdl) updated = vhdl(origin, debug);
      else if (hhdl) updated = hhdl(origin, debug);
      if (debug) console.debug("ori", origin, "=> new", updated);
      if (updated == null) {
        console.error(
          `cannot align action with vertical:${vertical}, horizontal:${horizontal}`
        );
        return;
      }
      setSteps(steps.concat([updated]));
      setRedoSteps([]);
    }
  }, [alignAction]);

  // 處理顯示第二層功能列ActionBar
  // TODO 只選擇一個時,要依照物件類型顯示Action
  useEffect(() => {
    if (selectedIds.length === 1) {
      const selected = getSelectedObjects()[0];
      // console.debug(`selected type: ${selected.type}`);
      setActionBar([
        `selected is ${selected.getName()}@${selected.l},${selected.t} size:${
          selected.w
        }x${selected.h}`,
        ...CommonSelectionActions
      ]);
    } else if (selectedIds.length > 0) {
      setActionBar([
        `selected #:${selectedIds.length}`,
        ...CommonSelectionActions,
        " ",
        ...CommonAlignmentActions
      ]);
    } else {
      setActionBar(null);
    }
  }, [selectedIds]);

  // 展開指定的步驟,會將步驟反過來排序
  const expandSteps = (steps) => {
    //console.debug(JSON.stringify(steps, null, 2));
    if (!Array.isArray(steps)) return null;
    const deletedList = [];
    return steps
      .flat()
      .reverse()
      .filter((obj, pos, arr) => {
        const { id, deleted } = obj;
        if (deleted) {
          deletedList.push(id);
          return false;
        }
        if (deletedList.includes(id)) return false;
        // 如果是同id的第一個就保留
        const idx = arr.findIndex((e) => e.id === id);
        return idx === pos;
      });
  };

  // 若步驟有變就重繪畫面
  useEffect(() => {
    const canvas = document.getElementById("abc123");
    if (canvas) {
      clearCanvas(canvas);
      drawObjectsOnCanvas(canvas, expandSteps(steps));
    }
  }, [steps]);

  const isUndoable = () => steps.length > loadedSteps;

  const anyObjectExist = () => expandSteps(steps).length > 0;

  const isRedoable = () => redoSteps.length > 0;

  const undo = () => {
    if (isUndoable()) {
      const lastOfSteps = steps[steps.length - 1];
      const restOfSteps = steps.slice(0, steps.length - 1);
      setSteps(restOfSteps);
      setRedoSteps([lastOfSteps].concat(redoSteps));
    }
  };

  const redo = () => {
    if (isRedoable()) {
      const fisrtOfRedoSteps = redoSteps[0];
      const restOfRedoSteps = redoSteps.slice(1, redoSteps.length);
      setSteps(steps.concat([fisrtOfRedoSteps]));
      // fisrtOfRedoSteps這裡需要用[]包裹是因為concat的特性, 如果給陣列被會當成打算分別加入每個元素
      // 會造成多選物件一起刪除後,redo,再undo會造成物件一個個被分別undo回來的bug
      setRedoSteps(restOfRedoSteps);
    }
  };

  const onMenuClicked = (m) => {
    if (typeof m !== "object") return;
    if (typeof m.onClicked === "function") {
      m.onClicked();
    }
    // 例如已選一個物件時, 按多選選單按鈕, 目前會重置選取的項目
    if (!m.keepSelected || curMenu?.title === m?.title) setSelectedIds([]);
    // isExclusiveMode, 就是會變成按壓下去的狀態, 再按一次會變回原本得狀態
    if (m.isExclusiveMode) setMenu(m.title === curMenu?.title ? null : m);
    else setMenu(null);
  };

  const SelectionHandlers = {
    MutipleSelect: (obj) => {
      if (!obj) return;
      // console.debug(`ms - ${obj.id}`);
      setSelectedIds((selectedIds) =>
        // 使用者點擊的物件不在列表就加入; 反之，維持原樣
        selectedIds.indexOf(obj.id) === -1
          ? selectedIds.concat(obj.id)
          : selectedIds
      );
    },
    One: (obj) => {
      // console.debug(obj ? `selected:${obj.id}` : "canceled");
      // 使用者沒點擊在物件上(e.g.空白區域),則取消單一選取
      setSelectedIds(obj ? [obj.id] : []);
    }
  };

  const getSelectionHandler = () => {
    if (curMenu === null) return SelectionHandlers["One"];
    return SelectionHandlers[curMenu.title];
  };

  const onCanvasClicked = (e) => {
    const handler = getSelectionHandler();
    if (handler) {
      const isTouched = isOverObject(e.x, e.y);
      const target = expandSteps(steps).find(isTouched);
      handler(target);
    }
  };

  const onObjectCreated = (o) => {
    // console.debug("onObjectCreated", o);
    setSteps(steps.concat(o));
    setRedoSteps([]);
    setMenu(null); // 完成一個物件之後自動取消
    setSelectedIds([o.id]); // 自動變成選取狀態
  };

  const CommonAlignmentActions = [
    {
      title: "ToTop",
      onClicked: setAlignAction,
      alignedBy: { vertical: "start" }
    },
    {
      title: "VerticalCenter",
      onClicked: setAlignAction,
      alignedBy: { vertical: "center" }
    },
    {
      title: "ToBottom",
      onClicked: setAlignAction,
      alignedBy: { vertical: "end" }
    },
    {
      title: "ToLeft",
      onClicked: setAlignAction,
      alignedBy: { horizontal: "start" }
    },
    {
      title: "HorizontalCenter",
      onClicked: setAlignAction,
      alignedBy: { horizontal: "center" }
    },
    {
      title: "ToRight",
      onClicked: setAlignAction,
      alignedBy: { horizontal: "end" }
    }
  ];

  const CommonSelectionActions = [
    {
      title: "←",
      onClicked: setMoveAction,
      offset: { x: -5, y: 0 }
    },
    {
      title: "→",
      onClicked: setMoveAction,
      offset: { x: 5, y: 0 }
    },
    {
      title: "↑",
      onClicked: setMoveAction,
      offset: { x: 0, y: -5 }
    },
    {
      title: "↓",
      onClicked: setMoveAction,
      offset: { x: 0, y: 5 }
    },
    {
      title: "Del",
      onClicked: setDeleteAction
    },
    {
      title: "Color",
      onClicked: (_, { pageX, pageY }) => {
        showColorPicker({ x: pageX, y: pageY });
      }
    }
  ];

  const saveAsFile = () => {
    // console.debug("SaveAsFile");
    const concreteSteps = expandSteps(steps).reverse();
    // https://stackoverflow.com/questions/19721439
    const downloadObjectAsJson = (exportObj, exportName = "export") => {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(exportObj));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${exportName}.pob`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    };
    downloadObjectAsJson({
      header: "POB",
      version: 1,
      objectNum: concreteSteps.length,
      objectData: concreteSteps
    });
    // TODO flat the concreateSteps
    // clear the steps
    setLoadedSteps(concreteSteps.length);
    setSteps(concreteSteps);
    setRedoSteps([]);
  };

  const saveCanvasAsImage = () => {
    const canvas = document.getElementById("abc123");
    if (!canvas) {
      alert("cannot find the canvas element");
      return;
    }
    // 因為我們沒有設定image的底色,表示底色是透明,所以像是Chrome就會預設使用png作為toDataURL()輸出結果
    const downloadAsImage = (canvasEle, exportName = "export") => {
      // https://riptutorial.com/html5-canvas/example/31763/save-canvas-to-image-file
      // https://developer.mozilla.org/zh-TW/docs/Web/API/HTMLCanvasElement/toDataURL
      const dataURI = canvasEle.toDataURL();
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataURI);
      downloadAnchorNode.setAttribute("download", exportName);
      // 由於沒有指定副檔名,端看瀏覽器是否會依照內容自行加上副檔名
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    };
    downloadAsImage(canvas);
  };

  const printCanvas = () => {
    const canvas = document.getElementById("abc123");
    if (!canvas) {
      alert("cannot find the canvas element");
      return;
    }
    const printImage = (canvasEle) => {
      // https://stackoverflow.com/questions/2909033
      const dataURI = canvasEle.toDataURL();
      var hdl = window.open("about:blank", "_new");
      hdl.document.open();
      hdl.document.write(
        [
          "<html>",
          "   <head>",
          "   </head>",
          '   <body onload="window.print()" onafterprint="window.close()">',
          '       <img src="' + dataURI + '"/>',
          "   </body>",
          "</html>"
        ].join("")
      );
      hdl.document.close();
    };
    printImage(canvas);
  };

  const onFileSelectedForLoad = (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log("no file selected");
      return;
    }
    console.debug(`file:'${file.name}' size:${file.size} type:${file.type}`);
    const processFileContent = (e) => {
      console.debug("processFileContent", e.loaded, e.total);
      const reader = e.target;
      try {
        const { header, version, objectNum, objectData } = JSON.parse(
          reader.result
        );
        if (header !== "POB") throw new Error("invalid pob header");
        if (version !== 1) throw new Error("invalid pob version");
        if (!Array.isArray(objectData))
          throw new Error("not found objects in pob file");
        if (objectNum !== objectData.length)
          throw new Error("mismatch in the header and objects");
        const unflattedSteps = unflatObjects(objectData);
        // setup the steps
        setLoadedSteps(unflattedSteps.length);
        setSteps(unflattedSteps);
        setRedoSteps([]);
        console.debug("loading finished");
      } catch (e) {
        alert(`File content corrupted! ${e.message}`);
        console.error("file content error:", e);
      }
    };
    // https://developer.mozilla.org/zh-TW/docs/Web/API/Blob
    const reader = new FileReader();
    reader.addEventListener("loadend", processFileContent);
    reader.addEventListener("error", (err) => {
      alert("Cannot handle the file you choose");
      console.debug("read file error", err);
    });
    reader.readAsText(file, "utf-8");
  };

  const MainMenu = [
    { title: "Line", isExclusiveMode: true, type: 1 },
    { title: "Rectangle", isExclusiveMode: true, type: 2 },
    {
      title: "Ellipse",
      isExclusiveMode: true,
      type: 3
    },
    { title: "Text", isExclusiveMode: true, type: 4 },
    { title: "Undo", onClicked: undo, onEnabled: isUndoable },
    { title: "Redo", onClicked: redo, onEnabled: isRedoable },
    SingleSelectionMenu,
    MultipleSelectionMenu,
    { title: "Save", onClicked: saveAsFile, onEnabled: isUndoable },
    {
      title: "Load",
      onClicked: () => inputFile.current.click(),
      onEnabled: () => true
    },
    {
      title: "AsImg",
      onClicked: saveCanvasAsImage,
      onEnabled: anyObjectExist
    },
    {
      title: "Print",
      onClicked: printCanvas,
      onEnabled: anyObjectExist
    }
  ];

  const [pickedColor, setPickedColor] = useState("red");

  useEffect(() => {
    if (pickedColor) {
      //console.debug("pickedColor", pickedColor);
      const origin = getSelectedObjects();
      if (origin.length < 1) return;
      const updated = origin.map((o) => o.setColor(pickedColor));
      // console.debug("ori", origin, "=> new", updated);
      setSteps(steps.concat([updated]));
      setRedoSteps([]);
    }
  }, [pickedColor]);

  const onColorPicked = (color) => {
    setPickedColor(color.hex);
    console.debug("color changed", color.hex);
    showColorPicker(null);
  };

  const onColorPickerDismiss = () => {
    showColorPicker(null);
  };

  const [modal4text, openModal4Text, closeModal4Text] = useModal("root", {
    preventScroll: true,
    closeOnOverlayClick: false
  });

  const [defaultValueOfmodal4text, setSelectedText] = useState(null);

  const onCavnasDoubleClicked = (e) => {
    //console.debug("onCavnasDoubleClicked");
    if (selectedIds.length !== 1) return;
    const target = getSelectedObjects()[0];
    if (isText(target)) {
      // console.debug("change text ori:", target.text);
      setSelectedText(target.text);
      openModal4Text();
    }
  };

  const onTextInputed = ({ text }) => {
    setSelectedText(null);
    const origin = getSelectedObjects()[0];
    // console.debug("onTextInputed", text, origin);
    if (isText(origin) && text !== origin.text) {
      const updated = origin.setText(text);
      // console.debug("ori", origin, "=> new", updated);
      setSteps(steps.concat(updated));
      setRedoSteps([]);
      // TODO - force update the object info
    }
    closeModal4Text();
  };

  const popover = {
    position: "absolute",
    zIndex: "2",
    borderRadius: "5px",
    boxShadow: "5px 5px 3px 0 rgba(0,0,0,.3)"
  };
  const cover = {
    position: "fixed",
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px"
  };

  return (
    <div className="App">
      <h1>Painter</h1>
      <MenuBar
        menu={MainMenu}
        selected={curMenu}
        onMenuClicked={onMenuClicked}
      ></MenuBar>
      {/*
      隱藏檔案按鈕
      https://stackoverflow.com/questions/37457128
      */}
      <input
        type="file"
        ref={inputFile}
        style={{ display: "none" }}
        onChange={onFileSelectedForLoad}
        accept=".pob"
      />
      <ActionBar actions={curActionBar}></ActionBar>
      {displayColorPicker && (
        <div
          style={{
            ...popover,
            left: displayColorPicker.x,
            top: displayColorPicker.y
          }}
        >
          <div style={cover} onClick={onColorPickerDismiss} />
          <CompactPicker
            color={pickedColor}
            onChangeComplete={onColorPicked}
          ></CompactPicker>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          border: "dotted 1px #cccccc"
        }}
      >
        <ObjectCreatingCanvas
          style={{
            backgroundColor: "yellow"
          }}
          width="300px"
          height="200px"
          objectType={curMenu?.type} // 要創建的ObectType
          onNewObject={onObjectCreated}
          onClicked={onCanvasClicked}
          onDoubleClick={onCavnasDoubleClicked}
        ></ObjectCreatingCanvas>
        <p
          className="mousePosition"
          style={{ fontSize: "8pt", margin: 0, alignSelf: "flex-end" }}
        ></p>
      </div>
      <ModalForText
        ModalComponent={modal4text}
        onOkay={onTextInputed}
        onCancel={closeModal4Text}
        title="Change the text"
        content="Please input text you want to change"
        defaultValue={defaultValueOfmodal4text}
      ></ModalForText>
    </div>
  );
}
