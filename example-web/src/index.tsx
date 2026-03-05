import React from "react";
import {createRoot} from "react-dom/client";
import {AppRegistry} from "react-native";
import App from "./App";

// Register the app
AppRegistry.registerComponent("ViewShotWebExample", () => App);

// Get the root element
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Root element not found");
}
