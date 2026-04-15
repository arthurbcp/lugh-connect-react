import React from "react";
import ReactDOM from "react-dom/client";
import "lugh-connect-react/styles.css";
import "./app.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
