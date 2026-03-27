const XLSX = require('xlsx');
const path = require('path');

// 1. G-255 Trade Indicators Summary (TRADE_SUMMARY_DAILY)
function generateTradeSummary() {
    const data = [
        ["date", "long_credit_indicators", "short_credit_indicators", "long_credit_mcap_mm", "short_credit_mcap_mm", "%_above_200d_ma_long", "%_below_200d_ma_short", "long_equity_indicators", "short_equity_indicators", "long_equity_mcap_mm", "short_equity_mcap_mm", "g255_return_1d", "g255_return_1w", "g255_return_1m", "g255_return_3m", "g255_return_6m", "g255_return_12m", "spx_return_1d", "spx_return_1w", "spx_return_1m", "spx_return_3m", "spx_return_6m", "spx_return_12m", "djia_return_1d", "djia_return_1w", "djia_return_1m", "djia_return_3m", "djia_return_6m", "djia_return_12m"],
        ["2026-03-27", 312, 122, 512000, 205000, 78.4, 22.1, 52, 12, 18500000, 3900000, 0.0021, 0.0084, 0.0245, 0.0610, 0.1240, 0.2010, 0.0012, 0.0055, 0.0198, 0.0520, 0.0980, 0.1650, 0.0009, 0.0042, 0.0145, 0.0410, 0.0790, 0.1320]
    ];
    const spreadHeader = ["label", "spread_today_bp", "spread_1m_ago_bp", "spread_3m_ago_bp", "spread_1y_ago_bp"];
    const spreads = [
        ["US HY 10Y", 412.4, 435.2, 410.8, 455.0],
        ["US IG 10Y", 108.5, 118.5, 110.2, 125.4],
        ["Euro HY", 388.2, 408.4, 385.6, 420.1],
        ["EM Sovereigns", 341.5, 352.1, 338.5, 368.2]
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.sheet_add_aoa(ws, [[]], {origin: -1});
    XLSX.utils.sheet_add_aoa(ws, [["CREDIT_SPREADS"]], {origin: -1});
    XLSX.utils.sheet_add_aoa(ws, [spreadHeader], {origin: -1});
    XLSX.utils.sheet_add_aoa(ws, spreads, {origin: -1});
    XLSX.utils.book_append_sheet(wb, ws, "Summary");
    XLSX.writeFile(wb, path.join(__dirname, 'G255_Daily_Trade_Summary.xlsx'));
}

// 2. G-255 Credit Market Valuation (CREDIT_VALUATION_DAILY)
function generateCreditValuation() {
    const data = [
        ["sector", "rating_bucket", "long_indicators", "short_indicators", "attractive_bonds_count", "long_mcap_mm", "short_mcap_mm"],
        ["Financials", "AA- / A+", 42, 8, 12, 125000, 12400],
        ["TMT", "BBB+ / BBB-", 28, 45, 5, 45600, 52100],
        ["Energy", "BBB / BB+", 15, 52, 2, 22100, 65400],
        ["Industrials", "A / A-", 38, 14, 9, 58200, 15600],
        ["Consumer", "BBB+ / BBB", 31, 22, 6, 49800, 31200],
        ["Healthcare", "AA / A", 24, 18, 5, 42100, 31500]
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Valuation");
    XLSX.writeFile(wb, path.join(__dirname, 'G255_Credit_Market_Valuation.xlsx'));
}

// 3. G-255 Equity Sector Trade Indicator Chart (EQUITY_SIGNAL_CHART)
// For this POC, we'll reuse sector mapping but with equity indicators
function generateEquitySignals() {
    const data = [
        ["sector", "rating_bucket", "long_indicators", "short_indicators", "attractive_bonds_count", "long_mcap_mm", "short_mcap_mm"],
        ["Tech (Large Cap)", "Overweight", 85, 12, 28, 1245000, 150000],
        ["Energy", "Neutral", 42, 38, 15, 456000, 420000],
        ["Staples", "Underweight", 15, 62, 5, 210000, 520000],
        ["Discretionary", "Overweight", 68, 24, 22, 895000, 310000],
        ["Financials", "Market Weight", 45, 42, 18, 750000, 680000]
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "EquitySignals");
    XLSX.writeFile(wb, path.join(__dirname, 'G255_Equity_Sector_Signals.xlsx'));
}

// 4. G-255 Credit and Equity Market Indicators (CREDIT_EQUITY_INDICATORS)
function generateCombinedIndicators() {
    const data = [
        ["sector", "rating_bucket", "long_indicators", "short_indicators", "attractive_bonds_count", "long_mcap_mm", "short_mcap_mm"],
        ["Cross-Asset Core", "Bullish", 152, 45, 32, 18500, 4200],
        ["Growth Basket", "Neutral", 88, 72, 14, 25600, 21400],
        ["Value Basket", "Bullish", 124, 38, 25, 42100, 12500],
        ["Defensive Basket", "Bearish", 22, 95, 4, 8500, 32100]
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "MixedIndicators");
    XLSX.writeFile(wb, path.join(__dirname, 'G255_Credit_Equity_Combined.xlsx'));
}

// 5. Weekly Sector Credit Summary (WEEKLY_SECTOR_CREDIT)
function generateWeeklySector() {
    const data = [
        ["sector", "rating_bucket", "long_indicators", "short_indicators", "attractive_bonds_count", "long_mcap_mm", "short_mcap_mm"],
        ["Financials (W)", "A Bucket", 215, 42, 45, 625000, 58000],
        ["Energy (W)", "BBB Bucket", 124, 185, 12, 154000, 215000],
        ["Tech (W)", "A Bucket", 312, 65, 82, 856000, 124000],
        ["Retail (W)", "HY Bucket", 45, 212, 8, 42000, 185000]
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "WeeklySummary");
    XLSX.writeFile(wb, path.join(__dirname, 'G255_Weekly_Sector_Summary.xlsx'));
}

// 6. G-255 Issuer Earnings Snapshot (ISSUER_EARNINGS_QUARTERLY)
function generateIssuerEarnings() {
    // We'll reuse the New Supply Daily table structure for simplicity in POC,
    // but with earnings specific data labels.
    const data = [
        ["trade_date", "issuer_name", "sector", "rating", "instrument_type", "tenor", "ipt_level", "trading_model_indicator_text", "relevering_flag"],
        ["2026-Q1", "JPM", "Financials", "A+", "EPS Beat", "+12%", "6.52 vs 5.80", "Bullish Momentum Post-Earnings", "FALSE"],
        ["2026-Q1", "AAPL", "Tech", "AA", "EPS Beat", "+5%", "2.10 vs 2.02", "Stable Guidance", "FALSE"],
        ["2026-Q1", "TSLA", "Auto", "BBB", "EPS Miss", "-8%", "0.45 vs 0.62", "Margin Pressure Alert", "TRUE"],
        ["2026-Q1", "XOM", "Energy", "AA-", "EPS Beat", "+15%", "4.20 vs 3.65", "Strong Cashflow Reinvestment", "FALSE"]
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Earnings");
    XLSX.writeFile(wb, path.join(__dirname, 'G255_Q1_Earnings_Snapshot.xlsx'));
}

// 7. Product Catalog
function generateCatalog() {
    const data = [
        ["product_code", "product_name", "frequency", "description"],
        ["TRADE_SUMMARY_DAILY", "G-255 Trade Indicators Summary", "Daily", "Core systematic synthesis of credit and equity signals."],
        ["CREDIT_VALUATION_DAILY", "G-255 Credit Market Valuation", "Daily", "Sector-level credit valuation and indicator monitoring."],
        ["EQUITY_SIGNAL_CHART", "G-255 Equity Sector Trade Indicator Chart", "Weekly", "Technical momentum tracking for equity sectors."],
        ["CREDIT_EQUITY_INDICATORS", "G-255 Credit and Equity Market Indicators", "Daily", "Combined cross-asset systematic indicators."],
        ["WEEKLY_SECTOR_CREDIT", "Weekly Sector Credit Summary", "Weekly", "Deep-dive into weekly credit trends and rating transitions."],
        ["ISSUER_EARNINGS_QUARTERLY", "G-255 Issuer Earnings Snapshot", "Quarterly", "Systematic fundamental tracking of issuer performance."]
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Catalog");
    XLSX.writeFile(wb, path.join(__dirname, 'G255_Product_Catalog.xlsx'));
}

generateTradeSummary();
generateCreditValuation();
generateEquitySignals();
generateCombinedIndicators();
generateWeeklySector();
generateIssuerEarnings();
generateCatalog();

console.log('All G-255 Sample Data Generated Successfully! ✨');
