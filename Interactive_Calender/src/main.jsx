import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Deliberately NOT wrapped in <React.StrictMode>. StrictMode intentionally
// double-invokes render (and, on mount, effects) in development to help
// surface impure components — which is exactly backwards for this app:
// the whole point here is showing an accurate, human-readable render count,
// and StrictMode's double-invocation would inflate every count and make
// genuinely optimized code look like it's "re-rendering constantly."
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
