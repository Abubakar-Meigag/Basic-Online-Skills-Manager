import { StrictMode } from "react";
// This is like a Quality Control Inspector. It doesn't show up on the screen, but it checks your code in the background to make sure you aren't using old,
// buggy ways of doing things.
import { createRoot } from "react-dom/client";
// This is the Injection Tool. It is the specific tool designed to take a React app and "mount" it into an HTML page.
import { BrowserRouter } from "react-router-dom";
// This is the Map System. It allows Alice's browser to handle URLs (like /login or /dashboard) without the whole page refreshing.
import "./index.css";
// This is the "Phone Call" that tells the browser: "Hey, while you're loading this JavaScript, go and fetch the CSS too."
import App from "./App.tsx";
// This is your Main Blueprint. It contains the whole "House" (the components) you want to build.

createRoot(document.getElementById("root")!).render(
  // document.getElementById("root"): React is saying: "I am looking through the HTML document to find the <div> that has the ID 'root'."
  // The ! (The Bang): This is a TypeScript secret. It tells the computer: "I promise you that a 'root' div exists in the HTML. Don't worry, just keep going."
  // createRoot(...): This creates the React Home Base at that exact spot in the HTML.
  // .render(...): This is the command to "Start the Show." It takes everything inside the parentheses and draws it inside that root div.
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
  // The Hierarchy (The Nesting): Notice how they are wrapped inside each other like Russian Nesting Dolls:
  // The Inspector (StrictMode) wraps everything to check for errors.
  // The Map (BrowserRouter) wraps the app so every page knows how to use the URL bar.
  // Finally, at the center, is your App (App.tsx).
);
