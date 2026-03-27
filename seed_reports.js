const db = require('./backend/db');
const XLSX = require('xlsx');
const path = require('path');

function parseAndSeed(pCode, fileName, reportDate) {
    const filePath = path.join(__dirname, 'sample_data', fileName);
    if (!require('fs').existsSync(filePath)) {
        console.error(`File NOT found: ${filePath}`);
        return;
    }
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    db.transaction(() => {
        // Hierarchical cleanup to avoid FK violations
        const subquery = 'SELECT id FROM reports WHERE product_code = ? AND report_date = ?';
        db.prepare(`DELETE FROM trading_summaries WHERE report_id IN (${subquery})`).run(pCode, reportDate);
        db.prepare(`DELETE FROM credit_spreads WHERE report_id IN (${subquery})`).run(pCode, reportDate);
        db.prepare(`DELETE FROM sector_snapshots WHERE report_id IN (${subquery})`).run(pCode, reportDate);
        db.prepare(`DELETE FROM daily_new_supply_issues WHERE report_id IN (${subquery})`).run(pCode, reportDate);
        db.prepare(`DELETE FROM weekly_new_supply_summaries WHERE report_id IN (${subquery})`).run(pCode, reportDate);
        db.prepare(`DELETE FROM monthly_new_supply_summaries WHERE report_id IN (${subquery})`).run(pCode, reportDate);
        db.prepare(`DELETE FROM delivery_log WHERE report_id IN (${subquery})`).run(pCode, reportDate);
        db.prepare(`DELETE FROM notifications WHERE report_id IN (${subquery})`).run(pCode, reportDate);
        db.prepare('DELETE FROM reports WHERE product_code = ? AND report_date = ?').run(pCode, reportDate);

        const insertReport = db.prepare('INSERT INTO reports (product_code, report_date, status) VALUES (?, ?, ?)');
        const reportId = insertReport.run(pCode, reportDate, 'processed').lastInsertRowid;

        const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (pCode === 'TRADE_SUMMARY_DAILY') {
            const dataRow = rawData[1];
            if (dataRow && dataRow.length > 20) {
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
            }
        } else if (pCode === 'ISSUER_EARNINGS_QUARTERLY') {
            const issues = XLSX.utils.sheet_to_json(sheet);
            const insertIssue = db.prepare(`INSERT INTO daily_new_supply_issues (report_id, trade_date, issuer_name, sector, rating, instrument_type, tenor, ipt_level, trading_model_indicator_text, relevering_flag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            issues.forEach(i => insertIssue.run(reportId, i.trade_date, i.issuer_name, i.sector, i.rating, i.instrument_type, i.tenor, i.ipt_level, i.trading_model_indicator_text, i.relevering_flag === 'TRUE' || i.relevering_flag === true ? 1 : 0));
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
    })();
}

const products = [
    { code: 'TRADE_SUMMARY_DAILY', file: 'G255_Daily_Trade_Summary.xlsx' },
    { code: 'CREDIT_VALUATION_DAILY', file: 'G255_Credit_Market_Valuation.xlsx' },
    { code: 'EQUITY_SIGNAL_CHART', file: 'G255_Equity_Sector_Signals.xlsx' },
    { code: 'CREDIT_EQUITY_INDICATORS', file: 'G255_Credit_Equity_Combined.xlsx' },
    { code: 'WEEKLY_SECTOR_CREDIT', file: 'G255_Weekly_Sector_Summary.xlsx' },
    { code: 'ISSUER_EARNINGS_QUARTERLY', file: 'G255_Q1_Earnings_Snapshot.xlsx' }
];

products.forEach(p => {
    console.log(`Seeding ${p.code}...`);
    parseAndSeed(p.code, p.file, '2026-03-27');
});

console.log('Database seeded with proper G-255 report data! 🚀');
process.exit(0);
