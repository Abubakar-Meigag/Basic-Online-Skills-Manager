# 🏗️ Project Structure & Architecture

This guide explains the purpose of each folder and file in the Basic Online Skills Manager repository.

## 🏢 The Client (The Frontend)

_Located in the `/client/src` directory. This is everything the user sees in their browser._

### **1. `assets/`**

- **What goes here:** Static files like the CYF logo, background images, or icons.
- **Example:** `logo.png`.

### **2. `auth/`**

- **What goes here:** The logic that handles the **Magic Link**.
- **Example:** `authProvider.tsx`.

### **3. `components/`**

- **What goes here:** Reusable UI pieces. If a piece of code appears on more than one page (like the sidebar), it belongs here.
- **Example:** `Sidebar.tsx`, `Layout.tsx`.

### **4. `lib/`**

- **What goes here:** Shared rules and data dictionaries that don't draw anything themselves but tell the components what to do.
- **Example:** `statusStyles.ts` (colors), `navLinks.ts` (navigation lists).

### **5. `pages/`**

- **What goes here:** The specific destinations. These files assemble components and logic to make a full screen.
- **Example:** `CommercialDashboard.tsx`, `OutreachDashboard.tsx`.

### **6. `test/`**

- **What goes here:** Automated scripts that check if the buttons and tables work correctly.

### **7. `main.tsx`**

- **What it does:** This is the very first piece of code that runs. It connects our React "Engine" to the physical `index.html` file so the app can appear in the browser.

### **8. `App.tsx`**

- **What it does:** This is the top-level component. It acts as the building's lobby, deciding which "Page" or "Dashboard" to show based on the website address (URL).

### **9. `index.css`**

- **What it does:** This file holds our global style rules, including the Tailwind CSS directives. It ensures the whole building follows the same brand colors and fonts.

### **10. `index.html`**

- **What it does:** This is the actual physical building. It is the only HTML file that the browser loads. It contains a single empty "slot" (usually a `div` with the ID `root`) where our entire React application is injected. Without this shell, there is no space for our code to appear.

### **11. `eslint.config.js`**

- **What it is:** A set of rules for how your code should be written.
- **Why we need it:** It acts like a spell-checker for programming. It will highlight a line of code if you forget a semicolon or create a variable you never use.
- **The Benefit:** It keeps the whole team's code looking like it was written by one person.

### **12.`vite.config.ts`**

- **What it is:** Instructions for **Vite** (your build tool).
- **Why we need it:** It tells the computer how to take all your React and TypeScript files and "squash" them into a fast website that a browser can understand.

### **13. `public/`**

- **What it is:** A folder for files that don't need any processing.
- **Why we need it:** If you have an image or a file that you want to be reachable by a direct link (like `yoursite.com/favicon.svg`), you put it here.
- **The Logic:** Unlike the `src` folder, Vite doesn't change anything in here; it just copies it exactly as it is to the final website.

### **14. `dist/`**

- **What it is:** Short for "Distribution."
- **Why we need it:** When you run `npm run build`, the final, tiny version of your website is created and placed in this folder.
- **The Result:** This is the only folder that actually gets sent to the CYF hosting environment (Coolify).

---

## ⚙️ The Server (The Backend)

Located in the `/server/src` directory. This is the behind-the-scenes part that does all the work with your data.

### 1. `api/`

- **What goes here:** The "Endpoints." When the Frontend asks for data, these files process the request and send the response.

### 2. `auth/`

- **What goes here:** Security logic that verifies if a Magic Link token is real or expired.

### 3. `data/`

- **What goes here:** Everything related to the **PostgreSQL Database**.
- **Example:** `data-schema.sql` (the blueprint), `connection.ts` (the pipes).

### 4. `lib/`

- **What goes here:** Helper functions used only by the server (e.g., date formatting).

### 5. `test/`

- **What goes here:** Automated scripts that check if the **behind-the-scenes part** is working correctly.
- **Example:** `app.test.ts` (checks if the server starts correctly), `api.test.ts` (checks if the data "Pipes" are working).

### 6. `app.ts`

- **What it does:** The central Express application entry point. This is the **Switchboard** where we "mount" (plug in) our global rules:
  - **Middleware:** Security checks and data handling rules.
  - **Routers:** The directory that connects URLs to specific logic files.

### 7. `index.ts`

- **What it does:** This is the power switch for the server. Its only job is to start the Express app and tell it which **Port** (e.g., 3000) to listen to for incoming requests.

### 10. `public/`

- **What it is:** A folder for files that don't need any processing.
- **Why we need it:** If you have an image or a file that you want to be reachable by a direct link (like `yoursite.com/favicon.svg`), you put it here.
- **The Logic:** Unlike the `src` folder, Vite doesn't change anything in here; it just copies it exactly as it is to the final website.

### 11. `dist/`

- **What it is:** Short for "Distribution."
- **Why we need it:** When you run `npm run build`, the final, tiny version of your website is created and placed in this folder.
- **The Result:** This is the only folder that actually gets sent to the CYF hosting environment (Coolify).

---

## 📦 Project Configuration Files

### 1. `node_modules/`

- **What it is:** A folder containing all external tools (React, Tailwind, etc.).
- **Rule:** We **never** edit these files or upload them to GitHub.

### 2. `package.json` & `package-lock.json`

- **`package.json`**: The list of tools and shortcuts (`npm run dev`) used in the project.
- **`package-lock.json`**: A detailed receipt ensuring everyone on the team has the exact same versions.

### 3. `.gitignore`, `.env`, `.nvmrc`

- **`.gitignore`**: Tells Git which files (like secrets or `node_modules`) to keep off the internet.
- **`.env`**: The safety deposit box for secrets (like DB passwords). **Never share or commit this!**
- **`.nvmrc`**: Ensures everyone is using the same version of Node.js.

### 4. `tsconfig.json`

- **What it is:** The configuration file for TypeScript.
- **What it does:** It sets the rules for our code "Grammar." It tells the computer how strict to be when checking for mistakes and which version of JavaScript our code should be turned into.
- **Why we need it:** It ensures that every developer on the team is following the same technical rules, which prevents bugs before the code even runs.

### 5. `vitest.config.ts`

- **What it is:** The configuration file for our testing tool (**Vitest**).
- **What it does:** It sets up our "Automated Inspection" system. It tells the computer where our tests are hidden and what environment to use to run them (e.g., a "fake" browser for the client or a "node" environment for the server).
- **Why we need it:** Without this, the computer wouldn't know how to verify if our buttons and logic actually work.

### 6. `Dockerfile`

- **What it is:** A text file containing all the commands a computer needs to build an "Image" (a complete, standalone package) of our application.
- **What it does:** It tells the hosting server exactly how to set up the environment: which version of Node.js to install, which files to copy, and which command to run to start the app.
- **Why we need it:** It solves the "It works on my machine" problem. By using a Dockerfile, we ensure the app runs the same way on both local and remote hosting environmments.

### 7. `.dockerignore`

- **What it is:** A list of files that should be excluded when building the Docker image.
- **What it does:** Similar to `.gitignore`, it tells Docker: _"When you are packaging the app to send it to the cloud, do not include the heavy `node_modules` or our secret `.env` files."_
- **Why we need it:** It makes the "package" much smaller and faster to upload, and it keeps our secret passwords from being accidentally baked into the public image.

### 8. `eslint.config.js`

- **What it is:** A set of rules for how your code should be written.
- **Why we need it:** It acts like a spell-checker for programming. It will highlight a line of code if you forget a semicolon or create a variable you never use.
- **The Benefit:** It keeps the whole team's code looking like it was written by one person.

### 9. `vite.config.ts`

- **What it is:** Instructions for **Vite** (your build tool).
- **Why we need it:** It tells the computer how to take all your React and TypeScript files and "squash" them into a fast website that a browser can understand.
