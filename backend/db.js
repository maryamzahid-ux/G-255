const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const dbPath = path.join(__dirname, 'g255.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    is_admin INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS products (
    product_code TEXT PRIMARY KEY,
    product_name TEXT,
    frequency TEXT,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_code TEXT,
    report_date TEXT,
    status TEXT DEFAULT 'parsed',
    FOREIGN KEY(product_code) REFERENCES products(product_code)
  );

  CREATE TABLE IF NOT EXISTS trading_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    date TEXT,
    long_credit_indicators INTEGER,
    short_credit_indicators INTEGER,
    long_credit_mcap_mm REAL,
    short_credit_mcap_mm REAL,
    pct_above_200d_ma_long REAL,
    pct_below_200d_ma_short REAL,
    long_equity_indicators INTEGER,
    short_equity_indicators INTEGER,
    long_equity_mcap_mm REAL,
    short_equity_mcap_mm REAL,
    g255_return_1d REAL,
    g255_return_1w REAL,
    g255_return_1m REAL,
    g255_return_3m REAL,
    g255_return_6m REAL,
    g255_return_12m REAL,
    spx_return_1d REAL,
    spx_return_1w REAL,
    spx_return_1m REAL,
    spx_return_3m REAL,
    spx_return_6m REAL,
    spx_return_12m REAL,
    djia_return_1d REAL,
    djia_return_1w REAL,
    djia_return_1m REAL,
    djia_return_3m REAL,
    djia_return_6m REAL,
    djia_return_12m REAL,
    FOREIGN KEY(report_id) REFERENCES reports(id)
  );

  CREATE TABLE IF NOT EXISTS credit_spreads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    label TEXT,
    today_bp REAL,
    one_m_ago_bp REAL,
    three_m_ago_bp REAL,
    one_y_ago_bp REAL,
    FOREIGN KEY(report_id) REFERENCES reports(id)
  );

  CREATE TABLE IF NOT EXISTS sector_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    sector TEXT,
    rating_bucket TEXT,
    long_indicators INTEGER,
    short_indicators INTEGER,
    attractive_bonds_count INTEGER,
    long_mcap_mm REAL,
    short_mcap_mm REAL,
    FOREIGN KEY(report_id) REFERENCES reports(id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    product_code TEXT,
    sector TEXT,
    frequency TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(product_code) REFERENCES products(product_code)
  );

  CREATE TABLE IF NOT EXISTS delivery_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    report_id INTEGER,
    sent_at TEXT,
    status TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(report_id) REFERENCES reports(id)
  );

  CREATE TABLE IF NOT EXISTS daily_new_supply_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    trade_date TEXT,
    issuer_name TEXT,
    sector TEXT,
    rating TEXT,
    instrument_type TEXT,
    tenor TEXT,
    ipt_level TEXT,
    trading_model_indicator_text TEXT,
    relevering_flag INTEGER,
    FOREIGN KEY(report_id) REFERENCES reports(id)
  );

  CREATE TABLE IF NOT EXISTS weekly_new_supply_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    week_ending TEXT,
    bonds_issued INTEGER,
    issuers_count INTEGER,
    market_cap_mm REAL,
    bonds_reached_fair_value INTEGER,
    bonds_not_reached_fair_value INTEGER,
    avg_tightening_reached_bp REAL,
    avg_change_outside_bp REAL,
    key_issuers TEXT,
    FOREIGN KEY(report_id) REFERENCES reports(id)
  );

  CREATE TABLE IF NOT EXISTS monthly_new_supply_summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER,
    month TEXT,
    bonds_issued INTEGER,
    issuers_count INTEGER,
    market_cap_mm REAL,
    reached_fair_value_count INTEGER,
    not_reached_fair_value_count INTEGER,
    avg_tightening_reached_bp REAL,
    avg_change_outside_bp REAL,
    bonds_widened_after_reach INTEGER,
    FOREIGN KEY(report_id) REFERENCES reports(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    report_id INTEGER,
    message TEXT,
    created_at TEXT,
    read_at TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(report_id) REFERENCES reports(id)
  );
`);

// Seed initial users
const seedUsers = db.prepare('INSERT OR IGNORE INTO users (email, password, is_admin) VALUES (?, ?, ?)');
seedUsers.run('admin@g255.com', 'admin123', 1);
seedUsers.run('analyst@example.com', 'analyst123', 0);
seedUsers.run('pm.alpha@capital.com', 'analyst123', 0);
seedUsers.run('credit.research@fund.com', 'analyst123', 0);
seedUsers.run('j.smith@hedge.com', 'analyst123', 0);
seedUsers.run('t.jones@desk.com', 'analyst123', 0);
seedUsers.run('senior.analyst@bank.io', 'analyst123', 0);
seedUsers.run('trader.mac@global.com', 'analyst123', 0);
seedUsers.run('quant.research@firm.com', 'analyst123', 0);
seedUsers.run('fixed.income@mgmt.com', 'analyst123', 0);
seedUsers.run('l.white@asset.com', 'analyst123', 0);
seedUsers.run('r.black@ventures.com', 'analyst123', 0);

// Seed products from catalog if file exists
const catalogPath = path.join(__dirname, '..', 'sample_data', 'G255_Product_Catalog.xlsx');
if (fs.existsSync(catalogPath)) {
    const workbook = XLSX.readFile(catalogPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const products = XLSX.utils.sheet_to_json(sheet);
    
    const insertProduct = db.prepare('INSERT OR REPLACE INTO products (product_code, product_name, frequency, description) VALUES (?, ?, ?, ?)');
    products.forEach(p => {
        insertProduct.run(p.product_code, p.product_name, p.frequency, p.description);
    });
}

module.exports = db;
