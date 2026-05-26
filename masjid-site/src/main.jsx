import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.log("main.jsx loaded"); // quick sanity log

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
