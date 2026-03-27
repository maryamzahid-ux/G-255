const express = require('express');
const cors = require('cors');
const multer = require('multer');
const XLSX = require('xlsx');
const db = require('./db');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// API ROUTES
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password);
    if (user) {
        res.json({ id: user.id, email: user.email, isAdmin: !!user.is_admin });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
});

app.get('/api/reports', (req, res) => {
    const { userId } = req.query;
    let query = `
        SELECT r.*, p.product_name 
        FROM reports r 
        JOIN products p ON r.product_code = p.product_code 
    `;
    let params = [];
    if (userId) {
        query += ` JOIN subscriptions s ON r.product_code = s.product_code WHERE s.user_id = ? `;
        params.push(userId);
    }
    query += ` ORDER BY r.report_date DESC `;
    const reports = db.prepare(query).all(...params);
    res.json(reports);
});

app.get('/api/reports/:id', (req, res) => {
    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    let data = { ...report };
    if (report.product_code === 'TRADE_SUMMARY_DAILY') {
        data.summary = db.prepare('SELECT * FROM trading_summaries WHERE report_id = ?').get(report.id);
        data.spreads = db.prepare('SELECT * FROM credit_spreads WHERE report_id = ?').all(report.id);
    } else if (report.product_code === 'NEW_SUPPLY_DAILY' || report.product_code === 'ISSUER_EARNINGS_QUARTERLY') {
        data.issues = db.prepare('SELECT * FROM daily_new_supply_issues WHERE report_id = ?').all(report.id);
    } else if (report.product_code === 'NEW_SUPPLY_WEEKLY') {
        data.weekly = db.prepare('SELECT * FROM weekly_new_supply_summaries WHERE report_id = ?').all(report.id);
        data.monthly = db.prepare('SELECT * FROM monthly_new_supply_summaries WHERE report_id = ?').all(report.id);
    } else {
        data.snapshots = db.prepare('SELECT * FROM sector_snapshots WHERE report_id = ?').all(report.id);
    }
    res.json(data);
});

app.get('/api/subscriptions/:userId', (req, res) => {
    const subs = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').all(req.params.userId);
    res.json(subs);
});

app.post('/api/subscriptions/sync', (req, res) => {
    const { user_id, products } = req.body;
    db.transaction(() => {
        db.prepare('DELETE FROM subscriptions WHERE user_id = ?').run(user_id);
        const insert = db.prepare('INSERT INTO subscriptions (user_id, product_code) VALUES (?, ?)');
        products.forEach(p => insert.run(user_id, p));
    })();
    res.json({ success: true });
});

app.post('/api/subscriptions', (req, res) => {
    const { user_id, product_code } = req.body;
    if (!user_id || !product_code) return res.status(400).json({ error: 'Missing fields' });
    const existing = db.prepare('SELECT id FROM subscriptions WHERE user_id = ? AND product_code = ?').get(user_id, product_code);
    if (existing) return res.json({ success: true, message: 'Already subscribed' });
    db.prepare('INSERT INTO subscriptions (user_id, product_code) VALUES (?, ?)').run(user_id, product_code);
    res.json({ success: true });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
    const { product_code, report_date } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    const workbook = XLSX.readFile(file.path);
    const result = db.transaction(() => {
        const reportStmt = db.prepare('INSERT INTO reports (product_code, report_date) VALUES (?, ?)');
        const report = reportStmt.run(product_code, report_date);
        const reportId = report.lastInsertRowid;
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (product_code === 'TRADE_SUMMARY_DAILY') {
            const dataRow = rawData[1];
            const insertSummary = db.prepare(`
                INSERT INTO trading_summaries (
                    report_id, date, long_credit_indicators, short_credit_indicators, 
                    long_credit_mcap_mm, short_credit_mcap_mm, pct_above_200d_ma_long, pct_below_200d_ma_short,
                    long_equity_indicators, short_equity_indicators, long_equity_mcap_mm, short_equity_mcap_mm,
                    g255_return_1d, g255_return_1w, g255_return_1m, g255_return_3m, g255_return_6m, g255_return_12m,
                    spx_return_1d, spx_return_1w, spx_return_1m, spx_return_3m, spx_return_6m, spx_return_12m,
                    djia_return_1d, djia_return_1w, djia_return_1m, djia_return_3m, djia_return_6m, djia_return_12m
                ) VALUES (${Array(30).fill('?').join(',')})
            `);
            let spreadsStarted = false;
            insertSummary.run(reportId, ...dataRow.slice(0, 29));
            for(let i=2; i<rawData.length; i++) {
                if (rawData[i][0] === 'CREDIT_SPREADS') { spreadsStarted = true; continue; }
                if (spreadsStarted && rawData[i].length > 1 && rawData[i][0] !== 'label') {
                    db.prepare('INSERT INTO credit_spreads (report_id, label, today_bp, one_m_ago_bp, three_m_ago_bp, one_y_ago_bp) VALUES (?, ?, ?, ?, ?, ?)')
                      .run(reportId, rawData[i][0], rawData[i][1], rawData[i][2], rawData[i][3], rawData[i][4]);
                }
            }
        } else if (product_code === 'ISSUER_EARNINGS_QUARTERLY') {
            const issues = XLSX.utils.sheet_to_json(sheet);
            const insertIssue = db.prepare(`INSERT INTO daily_new_supply_issues (report_id, trade_date, issuer_name, sector, rating, instrument_type, tenor, ipt_level, trading_model_indicator_text, relevering_flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            issues.forEach(i => insertIssue.run(reportId, i.trade_date, i.issuer_name, i.sector, i.rating, i.instrument_type, i.tenor, i.ipt_level, i.trading_model_indicator_text, i.relevering_flag === 'TRUE' || i.relevering_flag === true ? 1 : 0));
        } else if (product_code === 'NEW_SUPPLY_DAILY') {
            const issues = XLSX.utils.sheet_to_json(sheet);
            const insertIssue = db.prepare(`INSERT INTO daily_new_supply_issues (report_id, trade_date, issuer_name, sector, rating, instrument_type, tenor, ipt_level, trading_model_indicator_text, relevering_flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            issues.forEach(i => insertIssue.run(reportId, i.trade_date, i.issuer_name, i.sector, i.rating, i.instrument_type, i.tenor, i.ipt_level, i.trading_model_indicator_text, i.relevering_flag === 'TRUE' || i.relevering_flag === true ? 1 : 0));
        } else if (product_code === 'NEW_SUPPLY_WEEKLY') {
            const wSheet = XLSX.utils.sheet_to_json(workbook.Sheets['weekly_summary']);
            const insertW = db.prepare(`INSERT INTO weekly_new_supply_summaries (report_id, week_ending, bonds_issued, issuers_count, market_cap_mm, bonds_reached_fair_value, bonds_not_reached_fair_value, avg_tightening_reached_bp, avg_change_outside_bp, key_issuers) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            wSheet.forEach(w => insertW.run(reportId, w.week_ending, w.bonds_issued, w.issuers_count, w.market_cap_mm, w.bonds_reached_fair_value, w.bonds_not_reached_fair_value, w.avg_tightening_reached_bp, w.avg_change_outside_bp, w.key_issuers));
            const mSheet = XLSX.utils.sheet_to_json(workbook.Sheets['monthly_summary']);
            const insertM = db.prepare(`INSERT INTO monthly_new_supply_summaries (report_id, month, bonds_issued, issuers_count, market_cap_mm, reached_fair_value_count, not_reached_fair_value_count, avg_tightening_reached_bp, avg_change_outside_bp, bonds_widened_after_reach) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            mSheet.forEach(m => insertM.run(reportId, m.month, m.bonds_issued, m.issuers_count, m.market_cap_mm, m.reached_fair_value_count, m.not_reached_fair_value_count, m.avg_tightening_reached_bp, m.avg_change_outside_bp, m.bonds_widened_after_reach));
        } else {
            const snapshots = XLSX.utils.sheet_to_json(sheet);
            const insertSnapshot = db.prepare(`
                INSERT INTO sector_snapshots (
                    report_id, sector, rating_bucket, long_indicators, short_indicators, 
                    attractive_bonds_count, long_mcap_mm, short_mcap_mm
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            snapshots.forEach(s => {
                insertSnapshot.run(reportId, s.sector, s.rating_bucket, s.long_indicators, s.short_indicators, s.attractive_bonds_count, s.long_mcap_mm, s.short_mcap_mm);
            });
        }
        return reportId;
    })();
    res.json({ success: true, reportId: result });
});

app.post('/api/admin/generate-deliveries', (req, res) => {
    const { report_id } = req.body;
    const report = db.prepare('SELECT r.*, p.product_name FROM reports r JOIN products p ON r.product_code = p.product_code WHERE r.id = ?').get(report_id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    const subscribers = db.prepare('SELECT user_id FROM subscriptions WHERE product_code = ?').all(report.product_code);
    const insertLog = db.prepare('INSERT INTO delivery_log (user_id, report_id, sent_at, status) VALUES (?, ?, ?, ?)');
    const insertNotif = db.prepare('INSERT INTO notifications (user_id, report_id, message, created_at, read_at) VALUES (?, ?, ?, ?, NULL)');
    const now = new Date().toISOString();
    subscribers.forEach(s => {
        insertLog.run(s.user_id, report_id, now, 'simulated');
        insertNotif.run(s.user_id, report_id, `New report delivered: ${report.product_name} (${report.report_date})`, now);
    });
    res.json({ success: true, count: subscribers.length });
});

app.get('/api/notifications/:userId', (req, res) => {
    const notifs = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.params.userId);
    res.json(notifs);
});

app.post('/api/notifications/:id/read', (req, res) => {
    db.prepare('UPDATE notifications SET read_at = ? WHERE id = ?').run(new Date().toISOString(), req.params.id);
    res.json({ success: true });
});

app.get('/api/delivery-logs/:userId', (req, res) => {
    const logs = db.prepare(`
        SELECT l.*, r.report_date, p.product_name, p.product_code
        FROM delivery_log l
        JOIN reports r ON l.report_id = r.id
        JOIN products p ON r.product_code = p.product_code
        WHERE l.user_id = ?
        ORDER BY l.sent_at DESC
        LIMIT 5
    `).all(req.params.userId);
    res.json(logs);
});

app.delete('/api/admin/subscriptions/:id', (req, res) => {
    db.prepare('DELETE FROM subscriptions WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

app.get('/api/admin/delivery-logs', (req, res) => {
    const logs = db.prepare(`
        SELECT l.*, u.email, r.product_code, r.report_date, p.product_name
        FROM delivery_log l
        JOIN users u ON l.user_id = u.id
        JOIN reports r ON l.report_id = r.id
        JOIN products p ON r.product_code = p.product_code
        ORDER BY l.sent_at DESC
    `).all();
    res.json(logs);
});

app.get('/api/admin/subscribers', (req, res) => {
    const users = db.prepare('SELECT id, email, is_admin FROM users WHERE is_admin = 0').all();
    const subs = db.prepare(`
        SELECT s.id, s.user_id, p.product_name, p.product_code 
        FROM subscriptions s
        JOIN products p ON s.product_code = p.product_code
    `).all();
    
    const result = users.map(u => {
        return {
            ...u,
            subscriptions: subs.filter(s => s.user_id === u.id)
        };
    });
    res.json(result);
});

// STATIC ASSETS
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

// Fallback to SPA
app.get('*any', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`System active at http://localhost:${PORT}`);
});
