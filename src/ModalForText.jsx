import React, { useRef } from "react";

const ModalForText = ({
  ModalComponent,
  onOkay,
  onCancel,
  title,
  content,
  defaultValue
}) => {
  const inputRef = useRef(null);
  const onTextInputed = () => onOkay({ text: inputRef.current.value });
  const processLinebreak = (multiLine) =>
    multiLine &&
    multiLine.split("\n").map((l, i, a) =>
      i !== a.length - 1 ? (
        l
      ) : (
        <React.Fragment key={`line-${i}`}>
          {l}
          <br />
        </React.Fragment>
      )
    );
  return (
    <ModalComponent>
      <div style={{ backgroundColor: "white" }}>
        <h1>{title || "Text needed"}</h1>
        <p>
          {(typeof content === "string" && processLinebreak(content)) ||
            "Please input text you want to draw:"}
        </p>
        <input type="text" ref={inputRef} defaultValue={defaultValue}></input>
        <button onClick={onTextInputed}>ok</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </ModalComponent>
  );
};

export default ModalForText;
