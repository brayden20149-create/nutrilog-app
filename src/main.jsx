import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const style = document.createElement("style");
style.textContent = `
  html, body, #root { height: 100%; margin: 0; padding: 0; background: #0b0f0b; }
  * { -webkit-tap-highlight-color: transparent; }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
