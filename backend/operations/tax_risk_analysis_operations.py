import pandas as pd
import numpy as np
from typing import List

def calculate_ratios(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate financial ratios from raw data."""
    ratios = pd.DataFrame()
    ratios['Gross_Profit_Margin'] = (df['grossProfit'] / df['turnover']) * 100
    ratios['Cost_of_Sale_Ratio'] = (df['costOfSale'] / df['turnover']) * 100
    ratios['Net_Profit_Margin'] = (df['netProfit'] / df['turnover']) * 100
    ratios['Operating_Expense_Ratio'] = (df['operatingExpenses'] / df['turnover']) * 100
    ratios['Finance_Cost_Ratio'] = (df['financeCost'] / df['turnover']) * 100
    return ratios

def fetch_market_trends(years: List[int]) -> pd.DataFrame:
    """Fetch market trends data for comparison."""
    # Simulate market data for financial metrics
    market_data = {
        'year': years,
        'grossProfit': np.random.normal(1000000, 200000, len(years)),
        'turnover': np.random.normal(5000000, 500000, len(years)),
        'costOfSale': np.random.normal(3000000, 300000, len(years)),
        'netProfit': np.random.normal(800000, 150000, len(years)),
        'operatingExpenses': np.random.normal(1200000, 180000, len(years)),
        'financeCost': np.random.normal(200000, 40000, len(years)),
        # Simulated tax data
        'companyIncomeTax': np.random.normal(250000, 50000, len(years)),
        'educationTax': np.random.normal(100000, 20000, len(years)),
        'capitalGainsTax': np.random.normal(50000, 10000, len(years)),
        'withholdingTax': np.random.normal(75000, 15000, len(years)),
        'valueAddedTax': np.random.normal(300000, 60000, len(years)),
    }
    return pd.DataFrame(market_data)

def classify_metrics(company_value: float, market_mean: float, market_std: float) -> str:
    """Classify a metric as low, average, or high compared to market."""
    z_score = (company_value - market_mean) / market_std
    if z_score < -1:
        return "low"
    elif z_score > 1:
        return "high"
    else:
        return "average"