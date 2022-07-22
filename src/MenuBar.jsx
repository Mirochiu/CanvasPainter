import React from "react";

const MenuBar = ({ name = "MenuBar", menu, onMenuClicked, selected }) => {
  return (
    <div className="MenuBar">
      {Array.isArray(menu) &&
        menu
          .filter((m) => !m.hide)
          .map((m, i) => {
            return (
              <button
                key={`${name}#${i}`}
                onClick={() => onMenuClicked(m)}
                style={
                  selected?.title === m.title
                    ? { borderStyle: "inset" }
                    : undefined
                }
                disabled={
                  typeof m.onEnabled === "function" ? !m.onEnabled() : undefined
                }
              >
                {m.title}
              </button>
            );
          })}
    </div>
  );
};

export default MenuBar;
