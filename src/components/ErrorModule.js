import React, { useState } from "react";
import Button from "./Button";
import Card from "./Card";
import "./ErrorModule.css";

const ErrorModel = (props) => {
  const [loader, setLoader] = useState(true);

  return (
    <div>
      <div className="backdrop" onClick={props.onConfirm} />
      <Card className="modal">
        <header className="header">
          <h2>{props.title}</h2>
        </header>
        <div className="content">
          <p>{props.message}</p>
        </div>
        <footer className="actions">
          <Button onClick={props.onConfirm}>Okay</Button>
        </footer>
      </Card>
    </div>
  );
};

export default ErrorModel;
