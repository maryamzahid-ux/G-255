# G–255 Insight Portal - Executive Review Guide

This guide explains how to test the **G-255 Research Delivery Engine** from a clean slate. The platform is designed to ingest systematic raw data from Excel, parse it into an institutional-grade archive, and deliver it securely to subscribed analysts.

## 🔑 Access Credentials

| Portal | URL | Email | Password |
| :--- | :--- | :--- | :--- |
| **Analyst Portal** | [http://localhost:3001/](http://localhost:3001/) | `analyst@example.com` | `analyst123` |
| **Admin Portal** | [http://localhost:3001/admin](http://localhost:3001/admin) | `admin@g255.com` | `admin123` |

---

## 🛠️ Testing Workflow (From Scratch)

### 1. The Admin Setup (Data Ingestion)
1. Navigate to the **Admin Portal** ([/admin](http://localhost:3001/admin)).
2. In the **G-255 Output Ingestion** section:
   - Select a **Product Type** (e.g., *Trade Indicators Summary*).
   - Click "Select G-255 Excel Output" and choose the corresponding sample file from the `sample_data/` folder (see mapping below).
   - Select a **System Date** (e.g., `2026-03-27`).
   - Click **Initiate Parsing**.
3. Once parsed, the report appears in the **Delivery Engine Control** table (right side).
4. Click **Execute Delivery** to "ship" the report to all subscribed users.

### 2. The Analyst Experience (Research Consumption)
1. Navigate to the **Analyst Portal** ([/](http://localhost:3001/)).
2. Log in. Initially, your dashboard will be empty because you have no active subscriptions.
3. Go to **My Subscriptions** in the sidebar.
4. **Subscribe** to the products you want to track.
5. Return to the **Dashboard**. You will now see the "Visual Analytics" (Charts) and any reports delivered for the current date.
6. Click **View Report** to enter the high-density Research Archive.

---

## 📊 Sample Excel File Mapping

Use these files located in the `sample_data/` directory for testing each product:

| Product Name | Product Code | Recommended Sample File |
| :--- | :--- | :--- |
| **Trade Indicators Summary** | `TRADE_SUMMARY_DAILY` | `G255_Trading_Summary_2026-03-18.xlsx` |
| **Credit Market Valuation** | `CREDIT_VALUATION_DAILY` | `G255_Credit_Market_Valuation.xlsx` |
| **Daily Equity Signals** | `EQUITY_SIGNALS_DAILY` | `G255_Equity_Sector_Signals.xlsx` |
| **Combined Credit & Equity** | `COMBINED_INDICATORS_DAILY` | `G255_Credit_Equity_Combined.xlsx` |
| **Weekly New Issue Summary** | `NEW_SUPPLY_WEEKLY` | `G255_Weekly_New_Supply_Recap_2026-03-16.xlsx` |
| **Quarterly Earnings Synthesis** | `ISSUER_EARNINGS_QUARTERLY` | `G255_Q1_Earnings_Snapshot.xlsx` |

---

## 💎 Key Features for Review
- **Automatic Ingestion**: The system automatically detects schema differences (Daily vs Weekly vs Quarterly) and generates the appropriate visual module.
- **Deep-Linking**: Notifications and Dashboard alerts link directly to specific report IDs.
- **Micro-Analytics**: Real-time trend sparklines on the dashboard reflect systematic confidence.
- **Secure Archive**: Historical reports are stored in a relational database (`g255.db`) and served via a unified Research Archive.

---
*Generated for G-255 Systematic Engine POC Review*
