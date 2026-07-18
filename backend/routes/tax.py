from unittest import result
from fastapi import APIRouter
from schemas import RiskAnalysisRequest
from operations.tax_risk_analysis_operations import calculate_ratios, fetch_market_trends, classify_metrics
import pandas as pd
from llm.chatgpt import generate_company_review

router = APIRouter()

@router.post("/analyze-risk")
async def analyze_risk(data: RiskAnalysisRequest):
    # Extract yearly data into a list of records

    yearly_data = data.yearlyData
    company_info = data.companyInfo

    records = []
    for year, financials in yearly_data.items():
        record = {
            'year': year,
            'grossProfit': financials.grossProfit,
            'turnover': financials.turnover,
            'costOfSale': financials.costOfSale,
            'netProfit': financials.netProfit,
            'operatingExpenses': financials.operatingExpenses,
            'financeCost': financials.financeCost,
            # Extract tax data
            'companyIncomeTax': financials.taxes['companyIncome'].amount,
            'educationTax': financials.taxes['education'].amount,
            'capitalGainsTax': financials.taxes['capitalGains'].amount,
            'withholdingTax': financials.taxes['withholding'].amount,
            'valueAddedTax': financials.taxes['valueAdded'].amount,
        }
        records.append(record)

    # Convert the list of records into a DataFrame
    company_data = pd.DataFrame(records).set_index('year')
    years = sorted(company_data.index)

    # Calculate company ratios
    company_ratios = calculate_ratios(company_data)

    # Fetch and calculate market trends
    market_trends = fetch_market_trends([int(year) for year in years])
    market_ratios = calculate_ratios(market_trends)

    # Classify financial metrics
    classifications = {}
    for column in company_data.columns:
        classifications[column] = [
            classify_metrics(
                company_data.loc[year, column],
                market_trends[column].mean(),
                market_trends[column].std()
            )
            for year in years
        ]

    # Prepare visualization data
    chart_data = []
    for year in years:
        for metric in company_data.columns:
            chart_data.append({
                'year': year,
                'metric': metric,
                'actual': float(company_data.loc[year, metric]),
                'market': float(market_trends.loc[market_trends['year'] == int(year), metric].iloc[0])
            })

    # Prepare tax compliance information
    tax_compliance = {
        year: {
            tax_type: {
                'amount': yearly_data[year].taxes[tax_type].amount,
                'compliance': 'late' if yearly_data[year].taxes[tax_type].isLate else 'on_time'
            }
            for tax_type in yearly_data[year].taxes
        }
        for year in years
    }

    # save data
    analysis_data = {
        'years': years,
        'company_metrics': company_data.to_dict('index'),
        'market_trends': market_trends.to_dict('index'),
        'company_ratios': company_ratios.to_dict('index'),
        'market_ratios': market_ratios.to_dict('index'),
        'classifications': classifications,
        'chart_data': chart_data,
        'tax_compliance': tax_compliance
    }

    # Generate the company review using OpenAI
    review = await generate_company_review(company_info, yearly_data)

    # Return the results and review
    return {
        "results": analysis_data,
        "review": review
    }
