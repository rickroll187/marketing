import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import TestInput from "./TestInput";

// TEMPORARY: Switch between App and TestInput for debugging
const ComponentToRender = TestInput; // Change to App to restore normal functionality

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ComponentToRender />
);
