import React from "react";
import "./ActionBar.css";

const ActionBar = ({ name = "ActionBar", actions, onActionClicked }) => {
  const getClickHandler = (act) => (event) => {
    if (act && typeof act.onClicked === "function") {
      return act.onClicked({ ...act, triggerTime: Date.now() }, event);
    }
    if (typeof onActionClicked === "function") {
      return onActionClicked(act);
    }
  };
  return (
    <div className="ActionBar">
      {Array.isArray(actions) &&
        actions.map((act, idx) => {
          if (typeof act === "string") {
            return <div key={`${name}#${idx}`}>{act}</div>;
          } else {
            return (
              <button key={`${name}#${idx}`} onClick={getClickHandler(act)}>
                {`${act.title}`}
              </button>
            );
          }
        })}
    </div>
  );
};

export default ActionBar;
