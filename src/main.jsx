import React from "react";
import { createRoot } from "react-dom/client";
import NutriLog from "./NutriLog.jsx";

const style = document.createElement("style");

style.textContent = `
  html,
  body,
  #root {
    height: 100%;
    margin: 0;
    padding: 0;
    background: #0b0f0b;
  }

  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    overscroll-behavior: none;
  }
`;

document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NutriLog />
  </React.StrictMode>
);