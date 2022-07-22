import { drawLine, drawRect, drawEllipse, drawText } from "./DrawUtils";

let g_id = 0;
const getNewObjectId = () => {
  g_id = g_id + 1;
  return g_id;
};

const getDist = (a, b) => {
  return a < b ? b - a : a - b;
};

export const getNameByType = (t) => {
  switch (t) {
    case 1:
      return "Line";
    case 2:
      return "Rect";
    case 3:
      return "Ellipse";
    case 4:
      return "Text";
    default:
  }
};

export const isText = (o) => {
  return typeof o === "object" && o.type === 4;
};

export const toLine = (p1, p2, style = {}) => {
  const { color = "black" } = style;
  const minX = Math.min(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  return {
    type: 1,
    id: getNewObjectId(),
    x: p1.x,
    y: p1.y,
    x1: p2.x,
    y1: p2.y,
    t: minY,
    l: minX,
    w: getDist(p1.x, p2.x),
    h: getDist(p1.y, p2.y),
    deleted: false,
    color,
    Top: function () {
      return this.t;
    },
    Left: function () {
      return this.l;
    },
    Right: function () {
      return this.l + this.w;
    },
    Bottom: function () {
      return this.t + this.h;
    },
    Width: function () {
      return this.w;
    },
    Height: function () {
      return this.h;
    },
    setOffset: function (offX, offY) {
      let copy = Object.assign({}, this);
      if (offX) {
        copy.x += offX;
        copy.x1 += offX;
        copy.l += offX;
      }
      if (offY) {
        copy.y += offY;
        copy.y1 += offY;
        copy.t += offY;
      }
      return copy;
    },
    getName: function () {
      return getNameByType(this.type);
    },
    setColor: function (c) {
      let copy = Object.assign({}, this);
      copy.color = c;
      return copy;
    },
    setAttribute: function (attr) {
      let copy = Object.assign({}, this);
      if (attr === "delete") copy.deleted = true;
      return copy;
    }
  };
};

export const toRect = (p1, p2, style = {}) => {
  const { color = "black" } = style;
  const minX = Math.min(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  return {
    type: 2,
    id: getNewObjectId(),
    x: minX,
    y: minY,
    t: minY,
    l: minX,
    w: getDist(p1.x, p2.x),
    h: getDist(p1.y, p2.y),
    deleted: false,
    color,
    Top: function () {
      return this.t;
    },
    Left: function () {
      return this.l;
    },
    Right: function () {
      return this.l + this.w;
    },
    Bottom: function () {
      return this.t + this.h;
    },
    Width: function () {
      return this.w;
    },
    Height: function () {
      return this.h;
    },
    setOffset: function (offX, offY) {
      let copy = Object.assign({}, this);
      if (offX) {
        copy.x += offX;
        copy.l += offX;
      }
      if (offY) {
        copy.y += offY;
        copy.t += offY;
      }
      return copy;
    },
    getName: function () {
      return getNameByType(this.type);
    },
    setColor: function (c) {
      let copy = Object.assign({}, this);
      copy.color = c;
      return copy;
    },
    setAttribute: function (attr) {
      let copy = Object.assign({}, this);
      if (attr === "delete") copy.deleted = true;
      return copy;
    }
  };
};

export const toEllipse = (p1, p2, style = {}) => {
  const { color = "black" } = style;
  const minX = Math.min(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  return {
    type: 3,
    id: getNewObjectId(),
    x: minX,
    y: minY,
    t: minY,
    l: minX,
    w: getDist(p1.x, p2.x),
    h: getDist(p1.y, p2.y),
    deleted: false,
    color,
    Top: function () {
      return this.t;
    },
    Left: function () {
      return this.l;
    },
    Right: function () {
      return this.l + this.w;
    },
    Bottom: function () {
      return this.t + this.h;
    },
    Width: function () {
      return this.w;
    },
    Height: function () {
      return this.h;
    },
    setOffset: function (offX, offY) {
      let copy = Object.assign({}, this);
      if (offX) {
        copy.x += offX;
        copy.l += offX;
      }
      if (offY) {
        copy.t += offY;
        copy.y += offY;
      }
      return copy;
    },
    getName: function () {
      return getNameByType(this.type);
    },
    setColor: function (c) {
      let copy = Object.assign({}, this);
      copy.color = c;
      return copy;
    },
    setAttribute: function (attr) {
      let copy = Object.assign({}, this);
      if (attr === "delete") copy.deleted = true;
      return copy;
    }
  };
};

export const computeBoundingBox = (x, y, text, font) => {
  let t = y,
    l = x,
    w = 0,
    h = 0;
  // This is a workaround solution:
  // In order to get the bounding box, we should attach
  // the canvas for drawing
  const ele = document.getElementById("abc123");
  if (ele) {
    const c = ele.getContext("2d");
    if (c) {
      c.font = font;
      const m = c.measureText(text);
      w = m.width;
      h = m.actualBoundingBoxAscent - m.actualBoundingBoxDescent;
      l = x - w / 2.0;
      t = y - h / 2.0;
      // console.debug("computeBoundingBox", x, y, l, t, w, h);
    }
  }
  return { t, l, w, h };
};

export const toText = (x, y, text, style = {}) => {
  const { color = "black", fontSize = 20, fontFace, fontStyle = "" } = style;
  const font = `${fontStyle} ${fontSize}px ${fontFace}`;
  const boundingBox = computeBoundingBox(x, y, text, font);
  return {
    type: 4,
    id: getNewObjectId(),
    x,
    y,
    text,
    fontSize,
    fontFace,
    fontStyle,
    ...boundingBox,
    deleted: false,
    color,
    getFont: function () {
      return `${this.fontStyle} ${this.fontSize}px ${this.fontFace}`;
    },
    Top: function () {
      return this.t;
    },
    Left: function () {
      return this.l;
    },
    Right: function () {
      return this.l + this.w;
    },
    Bottom: function () {
      return this.t + this.h;
    },
    Width: function () {
      return this.w;
    },
    Height: function () {
      return this.h;
    },
    setOffset: function (offX, offY) {
      let copy = Object.assign({}, this);
      if (offX) {
        copy.x += offX;
        copy.l += offX;
      }
      if (offY) {
        copy.y += offY;
        copy.t += offY;
      }
      return copy;
    },
    getName: function () {
      return getNameByType(this.type);
    },
    setColor: function (c) {
      let copy = Object.assign({}, this);
      copy.color = c;
      return copy;
    },
    setText: function (t) {
      let copy = Object.assign({}, this);
      copy.text = t;
      //console.debug("cp", JSON.stringify(copy, undefined, 2));
      const b = computeBoundingBox(this.x, this.y, t, this.getFont());
      Object.assign(copy, b);
      //console.debug("bb", JSON.stringify(copy, undefined, 2));
      return copy;
    },
    setAttribute: function (attr) {
      let copy = Object.assign({}, this);
      if (attr === "delete") copy.deleted = true;
      return copy;
    }
  };
};

export const isOverObject = (x, y) => (o) => {
  const ret = x >= o.l && x <= o.l + o.w && y >= o.t && y <= o.t + o.h;
  //console.debug(`isOverObject ${ret} (${o.x},${o.y},${o.w},${o.h})`);
  return ret;
};

// TODO: not a good impl
export const unflatObjects = (jsonData) => {
  if (!Array.isArray(jsonData)) throw new Error("invalid jsonData");
  return jsonData.map((o) => {
    switch (o.type) {
      case 1:
        return toLine(
          { x: o.x, y: o.y },
          { x: o.x1, y: o.y1 },
          { color: o.color }
        );
      case 2:
        return toRect(
          { x: o.x, y: o.y },
          { x: o.x + o.w, y: o.y + o.h },
          { color: o.color }
        );
      case 3:
        return toEllipse(
          { x: o.x, y: o.y },
          { x: o.x + o.w, y: o.y + o.h },
          { color: o.color }
        );
      case 4:
        return toText(o.x, o.y, o.text, {
          color: o.color,
          fontSize: o.fontSize,
          fontFace: o.fontFace,
          fontStyle: o.fontStyle
        });
      default:
        console.error(`unknown type:${o.type}`);
        return null;
    }
  });
};

export const drawObjectsOnCanvas = (canvas, objOrObjList) => {
  let list = objOrObjList;
  if (typeof objOrObjList === "object" && !Array.isArray(objOrObjList)) {
    list = [objOrObjList];
  }
  if (!Array.isArray(list)) {
    console.error("invalid argument: objOrObjList");
    return;
  }
  list.forEach((o) => {
    switch (o.type) {
      case 1:
        drawLine(canvas, o);
        break;
      case 2:
        drawRect(canvas, o);
        break;
      case 3:
        drawEllipse(canvas, o);
        break;
      case 4:
        drawText(canvas, o);
        break;
      default:
        console.error(`unknown type:${o.type}`);
    }
  });
};

const computeLeftBound = (p, i) => Math.min(p, i.Left());
const computeRightBound = (p, i) => Math.max(p, i.Right());
const computeTopBound = (p, i) => Math.min(p, i.Top());
const computeBottomBound = (p, i) => Math.max(p, i.Bottom());

export const VerticalAlignHandlers = {
  start: (arr, debug) => {
    const min = arr.reduce(computeTopBound, arr[0].Top());
    if (debug) console.debug("vStart", min);
    return arr.map((o, idx) => {
      const offset = min - o.Top();
      if (debug) console.debug(`  [${o.id}]: ${o.Top()} ${offset}`);
      return o.setOffset(0, offset);
    });
  },
  end: (arr, debug) => {
    const max = arr.reduce(computeBottomBound, arr[0].Bottom());
    if (debug) console.debug("vEnd", max);
    return arr.map((o, idx) => {
      const offset = max - o.Bottom();
      if (debug) console.debug(`  [${o.id}]: ${o.Bottom()}, ${offset}`);
      return o.setOffset(0, offset);
    });
  },
  center: (arr, debug) => {
    const min = arr.reduce(computeTopBound, arr[0].Top());
    const max = arr.reduce(computeBottomBound, arr[0].Bottom());
    const center = (max - min) / 2.0 + min;
    if (debug) console.debug(`vCenter ${min}-${max}=>${center}`);
    return arr.map((o, idx) => {
      const offset = center - o.Top() - o.Height() / 2.0;
      if (debug)
        console.debug(`  [${o.id}]: ${o.Top()}<->${o.Bottom()}, ${offset}`);
      return o.setOffset(0, offset);
    });
  }
};

export const HorizontalAlignHandlers = {
  start: (arr, debug) => {
    const min = arr.reduce(computeLeftBound, arr[0].Left());
    if (debug) console.debug("hStart", min);
    return arr.map((o, idx) => {
      const offset = min - o.Left();
      if (debug) console.debug(`  [${o.id}]: ${o.Left()} ${offset}`);
      return o.setOffset(offset);
    });
  },
  end: (arr, debug) => {
    const max = arr.reduce(computeRightBound, arr[0].Right());
    if (debug) console.debug("hEnd", max);
    return arr.map((o, idx) => {
      const offset = max - o.Right();
      if (debug) console.debug(`  [${o.id}]: ${o.Right()} ${offset}`);
      return o.setOffset(offset);
    });
  },
  center: (arr, debug) => {
    const min = arr.reduce(computeLeftBound, arr[0].Left());
    const max = arr.reduce(computeRightBound, arr[0].Right());
    const center = (max - min) / 2.0 + min;
    if (debug) console.debug(`hCenter ${min}-${max}=>${center}`);
    // the positions of object and center line are shown below:
    // LeftObj  ----   centerLine ---- centerObj
    // we should move the object to left, offset < 0
    // => offset = centerLine - centerObj
    return arr.map((o, idx) => {
      const offset = center - o.Left() - o.Width() / 2.0;
      if (debug)
        console.debug(`  [${o.id}]: ${o.Left()}-${o.Right()}, ${offset}`);
      return o.setOffset(offset);
    });
  }
};
