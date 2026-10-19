import {setupInstall} from './src/pwa';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./index";

setupInstall();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
import './src/styles.css';
