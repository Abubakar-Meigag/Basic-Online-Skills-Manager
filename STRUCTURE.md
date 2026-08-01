# 🏗️ Project Structure & Architecture

This guide explains the purpose of each folder and file in the Basic Online Skills Manager repository.

## 🏢 The Client (The Frontend)

_Located in the `/client/src` directory. This is everything the user sees in their browser._

#### **1. `assets/`**

- **What goes here:** Static files like the CYF logo, background images, or icons.
- **Example:** `logo.png`.

#### **2. `auth/`**

- **What goes here:** The logic that handles the **Magic Link**.
- **Example:** `authProvider.tsx`.

#### **3. `components/`**

- **What goes here:** Reusable UI pieces. If a piece of code appears on more than one page (like the sidebar), it belongs here.
- **Example:** `Sidebar.tsx`, `Layout.tsx`.

#### **4. `lib/`**

- **What goes here:** Shared rules and data dictionaries that don't draw anything themselves but tell the components what to do.
- **Example:** `statusStyles.ts` (colors), `navLinks.ts` (navigation lists).

#### **5. `pages/`**

- **What goes here:** The specific destinations. These files assemble components and logic to make a full screen.
- **Example:** `CommercialDashboard.tsx`, `OutreachDashboard.tsx`.

#### **6. `test/`**

- **What goes here:** Automated scripts that check if the buttons and tables work correctly.

---

## ⚙️ The Server (The Backend)

Located in the `/server/src` directory. This is the behind-the-scenes part that does all the work with your data.

#### **1. `api/`**

- **What goes here:** The "Endpoints." When the Frontend asks for data, these files process the request and send the response.

#### **2. `auth/`**

- **What goes here:** Security logic that verifies if a Magic Link token is real or expired.

#### **3. `data/`**

- **What goes here:** Everything related to the **PostgreSQL Database**.
- **Example:** `data-schema.sql` (the blueprint), `connection.ts` (the pipes).

#### **4. `lib/`**

- **What goes here:** Helper functions used only by the server (e.g., date formatting).

#### **5. `test/`**

- **What goes here:** Automated scripts that check if the **behind-the-scenes part** is working correctly.
- **Example:** `app.test.ts` (checks if the server starts correctly), `api.test.ts` (checks if the data "Pipes" are working).

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

### 4. `index.html`, `main.tsx`, `App.tsx`

- **`index.html`**: The empty building where the app lives.
- **`main.tsx`**: The power switch that plugs React into the HTML.
- **`App.tsx`**: The main lobby that decides which page to show the user.
