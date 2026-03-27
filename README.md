# G-255 Credit & Equity Research Platform (POC)

A high-performance Proof of Concept that converts systematic Excel research outputs into an institutional-grade web experience with subscriber-based distribution.

## 🚀 Tech Stack
-   **Frontend**: React + Vite + Tailwind CSS v4 (Modern, institutional aesthetic).
-   **Backend**: Node.js + Express (Robust API and ingestion engine).
-   **Database**: SQLite (Relational management with `better-sqlite3`).
-   **Parsing**: SheetJS (`xlsx`) for complex Excel-to-Web mapping.

## 📦 Project Structure
-   `/backend`: API server, SQLite database, and ingestion logic.
-   `/frontend`: Modern React application with Tailwind v4.
-   `/sample_data`: Realistic G-255 Excel research outputs for testing.

## 🛠️ How to Run

### 1. Ingest Sample Data
The `sample_data` folder contains already generated files. If you need to re-generate them:
```bash
cd sample_data
node generate_sample_data.js
```

### 2. Start Backend
```bash
cd backend
npm install (if not done)
npm start
```
*Port: http://localhost:3001*

### 3. Start Frontend
```bash
cd frontend
npm install (if not done)
npm run dev
```
*Port: http://localhost:5173 (standard Vite)*

## 🔐 Credentials
-   **Admin**: `admin@g255.com` / `admin123`
-   **Subscriber**: `analyst@example.com` / `analyst123`

## 📋 POC Walkthrough
1.  **Ingestion**: Log in as Admin -> Go to **Admin Portal** -> Upload `G255_Trading_Summary_2026-03-18.xlsx` from the `sample_data` folder.
2.  **Web Report**: Go to **Dashboard** or **Detailed Reports** to view the parsed institutional data (not raw Excel).
3.  **Subscribing**: Log in as Subscriber -> Go to **My Subscriptions** -> Toggle products like "G-255 Trade Indicators Summary".
4.  **Distribution**: Go back to Admin Portal -> Click **Execute Delivery** on an uploaded report -> View the **Distribution Log** to see simulated user deliveries.

---
*Developed for Google Antigravity - POC Environment*
