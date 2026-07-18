from config import openai, logger

class SectionGenerator:
    def __init__(self):
        self.system_message = {
            "role": "system",
            "content": "You are an expert tax investigator writing a detailed company task risk review."
        }
    
    async def _generate_section(self, prompt: str, max_tokens: int = 3000) -> str:
        """
        Generic method to generate a section using OpenAI API
        """
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    self.system_message,
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=max_tokens
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Error generating section: {e}")
            raise Exception(f"Failed to generate section: {str(e)}")

    async def generate_background_section(self, company_info: dict) -> str:
        """Generate the background information section of the review."""
        prompt = f"""Based on the following company information, fill out a detailed background section:

        1.0 Background Information
            1.1 Company Name
            1.2 Tax Identification No
            1.3 Tax Office
            1.4 Registered Address
            1.5 Business Address
            1.6 Incorporation Date
            1.7 Company's Incorporation No
            1.8 Commencement Date
            1.9 Nature of Business
            1.10 Related Companies
            1.11 Directors
            1.12 Share Capital
            1.13 Shareholders Information
            1.14 Bankers
            1.15 Accounting Year End
            1.16 External Auditors
            1.17 Tax Consultants
            1.18 Period Covered
            1.19 Major Customer
            1.20 Major Suppliers   

        Company Information:
        {company_info}
        """
        return await self._generate_section(prompt)

    async def generate_company_overview_section(self, company_info: dict) -> str:
        """Generate the company overview and investigation trigger sections."""
        prompt = f"""Based on the company information provided, create a detailed overview section including:

        2.0 The Company 
            Provide a summary of the company's operations, business focus, and background.

        3.0 Investigation Trigger
            Write the investigation Trigger. 
        3.1 Objective of Investigation
            Explain why this investigation is being conducted and the intended outcomes.
            
        Company Information:
        {company_info}
        """
        return await self._generate_section(prompt)

    async def generate_financial_highlights_section(self, yearly_data: dict) -> str:
        """Generate the financial highlights section with ratios."""
        prompt = f"""Analyze the following financial data and create a detailed financial highlights section:

        4.0 Highlights for the Past 5 Years
            
        Yearly Financial Data:
        {yearly_data}

        Provide an introductory summary for this section.
        
        - Include a table of financial data over the period showing key figures such as revenue, gross profit, net profit, operating expenses, finance costs, etc.
        - Follow the table with a **detailed financial analysis**:
            - Identify significant trends, fluctuations, or stability in each financial metric.
            - Analyze each key area (e.g., revenue growth, profit margins, cost structure) with specific commentary on how these trends align or contrast with market standards.
            - Evaluate how these financials impact the company’s tax obligations and compliance risk, highlighting any red flags.

        4.1 Financial Ratio Analysis:
            - 4.11 Gross Profit/Turnover
            - 4.12 Cost of Sales/Turnover
            - 4.13 Net Profit/Turnover
            - 4.14 Operating Expenses/Turnover
            - 4.15 Finance Cost/Turnover

        Please provide detailed analysis and commentary on the trends and ratios.
        """
        return await self._generate_section(prompt)

    async def generate_taxation_history_section(self, yearly_data: dict) -> str:
        """Generate the taxation history section."""
        prompt = f"""Based on the company information, create a comprehensive taxation history section covering:

        5.0 Taxation History
            - 5.1 Company Income Tax
            - 5.2 Education Tax
            - 5.3 Capital Gains Tax
            - 5.4 Withholding Tax
            - 5.5 Value Added Tax
            
        Company Taxation Information:
        {yearly_data}

        Please provide detailed analysis and commentary on the trends and values.
        """
        return await self._generate_section(prompt)

    async def generate_investigation_focus_section(self, company_info: dict, yearly_data: dict) -> str:
        """Generate the investigation focus section."""
        prompt = f"""Based on the company information and financial data, analyze and detail the following areas. Feel freen to offer advice where necessary also:

        6.0 Area of Investigation Focus
            Offer detailed guidance for the investigation team, specifying areas to probe based on prior analysis. The work on each subsection also
            - 6.1 Turnover
            - 6.2 Cost of Sales
            - 6.3 Expenses
            - 6.4 Finance Cost
            - 6.5 Exchange Losses
            - 6.6 Inventory
            - 6.7 Lease
            - 6.8 Capital Allowance
            - 6.9 VAT
            - 6.10 WHT
            - 6.11 Payables
            - 6.12 Receivables
            - 6.13 Related Party Transactions
            - 6.14 Post-Audit Matters
            - 6.15 Minimum Tax
            - 6.16 OTHER ADVICE
            
        Company Information:
        {company_info}
        
        Financial Data:
        {yearly_data}
        """
        return await self._generate_section(prompt)

    async def generate_conclusion_section(self, company_info: dict, yearly_data: dict) -> str:
        """Generate the conclusion section."""
        prompt = f"""Based on all the information provided, generate a comprehensive conclusion:

        7.0 Conclusion
        Summarize the key findings, risks, and recommended follow-up actions.
        
        Company Information:
        {company_info}
        
        Financial Data:
        {yearly_data}
        """
        return await self._generate_section(prompt)