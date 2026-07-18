import enum
import datetime
from pydantic import BaseModel, EmailStr, field_validator
from typing import List, Optional, Union, Dict

# Schemas for data handling
class Table:
    def __init__(self, name: str, content: str, description: str = None):
        self.name = name
        self.content = content
        self.description = description

class TableInfo(BaseModel):
    table_name: str
    table_description: Optional[str] = None

class TableCalculation(BaseModel):
    operation: str
    table_required: bool = True
    table_info: Optional[TableInfo] = None
    columns: List[str]

class DirectCalculation(BaseModel):
    operation: str
    table_required: bool = False
    operands: List[Union[int, float, str]]

class QuestionAnalysis(BaseModel):
    is_calculation: bool
    calculation_type: Optional[Union[TableCalculation, DirectCalculation]] = None

# Schema for account type
class AccountType(enum.Enum):
    individual = "individual"
    company = "company"

# schema for querying AI and backend
class QueryModel(BaseModel):
    question: str

# authentication schemas
class SignupRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str
    accountType: AccountType
    companyName: Optional[str] = None
    employees: Optional[int] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    rememberMe: bool = False 

# chat schemas
class ChatCreate(BaseModel):
    title: str 

class MessageCreate(BaseModel):
    type: str  # 'user' or 'assistant'
    content: str
    content_type: str = 'text'  # 'text' or 'image'
    timestamp: datetime.datetime = datetime.datetime.utcnow()

class ChatResponse(BaseModel):
    id: int
    uuid: str
    title: str
    created_at: datetime.datetime

# Document schemas
class DocumentResponse(BaseModel):
    id: str
    filename: str
    created_at: datetime.datetime
    
    class Config:
        orm_mode = True

# tax risk analysis schemas
class TaxInfo(BaseModel):
    amount: float
    isLate: bool

class CompanyInfo(BaseModel):
    name: str
    taxId: str
    taxOffice: str
    registeredAddress: str
    businessAddress: str
    incorporationDate: str
    incorporationNumber: str
    commencementDate: str
    businessNature: str
    relatedCompanies: List[str]  
    investigationTrigger: str
    investigationObjective: str
    directors: List[str]  
    shareCapital: str
    shareholders: List[str]  
    bankers: List[str]  
    accountingYearEnd: str
    externalAuditors: List[str] 
    taxConsultants: List[str]
    majorCustomer: str
    majorSuppliers: List[str]

    @field_validator('relatedCompanies', 'directors', 'shareholders', 'bankers', 'externalAuditors', 'taxConsultants', 'majorSuppliers', mode='before')
    def split_string_to_list(cls, value):
        # Split the input string by commas and strip whitespace
        return [item.strip() for item in value.split(',')] if isinstance(value, str) else value


class YearlyFinancials(BaseModel):
    grossProfit: float
    turnover: float
    costOfSale: float
    netProfit: float
    operatingExpenses: float
    financeCost: float
    taxes: Dict[str, TaxInfo]

class RiskAnalysisRequest(BaseModel):
    yearlyData: Dict[str, YearlyFinancials]
    companyInfo: CompanyInfo

class CompanyReview(BaseModel):
    review: str