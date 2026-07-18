import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const RiskAnalysisFlow = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [yearRange, setYearRange] = useState({ startYear: '', endYear: '' });
  const [currentYear, setCurrentYear] = useState(null);
  const [yearlyData, setYearlyData] = useState({});
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    taxId: '',
    taxOffice: '',
    registeredAddress: '',
    businessAddress: '',
    incorporationDate: '',
    incorporationNumber: '',
    commencementDate: '',
    businessNature: '',
    relatedCompanies: '',
    investigationTrigger: '',
    investigationObjective: '',
    directors: '',
    shareCapital: '',
    shareholders: '',
    bankers: '',
    accountingYearEnd: '',
    externalAuditors: '',
    taxConsultants: '',
    majorCustomer: '',
    majorSuppliers: ''
  });

  // Navigation functions
  const goToNextStep = () => setStep(prev => prev + 1);
  const goToPreviousStep = () => setStep(prev => prev - 1);

  const YearRangeForm = () => {
    // Local state to prevent re-renders of parent component
    const [localYearRange, setLocalYearRange] = useState(yearRange);

    const handleSubmit = () => {
      if (localYearRange.startYear && localYearRange.endYear) {
        const start = parseInt(localYearRange.startYear);
        const end = parseInt(localYearRange.endYear);
        if (start <= end) {
          setYearRange(localYearRange);
          setCurrentYear(start); // Set initial current year
          goToNextStep();
        }
      }
    };

    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Select Analysis Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Year</label>
                <Input 
                  type="text"
                  pattern="\d*"
                  maxLength={4}
                  value={localYearRange.startYear}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setLocalYearRange(prev => ({...prev, startYear: value}));
                  }}
                  placeholder="YYYY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Year</label>
                <Input 
                  type="text"
                  pattern="\d*"
                  maxLength={4}
                  value={localYearRange.endYear}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setLocalYearRange(prev => ({...prev, endYear: value}));
                  }}
                  placeholder="YYYY"
                />
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={handleSubmit}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CompanyInfoForm = () => {
    // Local state to prevent re-renders of parent component
    const [localCompanyInfo, setLocalCompanyInfo] = useState(companyInfo);

    const handleSubmit = () => {
      setCompanyInfo(localCompanyInfo);
      goToNextStep();
    };
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <Input
                type="text"
                value={localCompanyInfo.name}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tax Identification Number</label>
              <Input
                type="text"
                value={localCompanyInfo.taxId}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, taxId: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tax Office</label>
              <Input
                type="text"
                value={localCompanyInfo.taxOffice}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, taxOffice: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Registered Address</label>
              <Input
                type="text"
                value={localCompanyInfo.registeredAddress}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, registeredAddress: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Address</label>
              <Input
                type="text"
                value={localCompanyInfo.businessAddress}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, businessAddress: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Incorporation Date</label>
              <Input
                type="text"
                value={localCompanyInfo.incorporationDate}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, incorporationDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Incorporation Number</label>
              <Input
                type="text"
                value={localCompanyInfo.incorporationNumber}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, incorporationNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Commencement Date</label>
              <Input
                type="text"
                value={localCompanyInfo.commencementDate}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, commencementDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nature of Business</label>
              <Input
                type="text"
                value={localCompanyInfo.businessNature}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, businessNature: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Related Companies</label>
              <Input
                type="text"
                value={localCompanyInfo.relatedCompanies}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, relatedCompanies: e.target.value }))}
                placeholder="Comma separated"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Investigation Trigger</label>
              <Input
                type="text"
                value={localCompanyInfo.investigationTrigger}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, investigationTrigger: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Objective of Investigation</label>
              <Input
                type="text"
                value={localCompanyInfo.investigationObjective}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, investigationObjective: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Directors</label>
              <Input
                type="text"
                value={localCompanyInfo.directors}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, directors: e.target.value }))}
                placeholder="Comma separated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Share Capital</label>
              <Input
                type="text"
                value={localCompanyInfo.shareCapital}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, shareCapital: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Shareholders Information</label>
              <Input
                type="text"
                value={localCompanyInfo.shareholders}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, shareholders: e.target.value }))}
                placeholder="Comma separated, e.g. (Name, Nationality)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bankers</label>
              <Input
                type="text"
                value={localCompanyInfo.bankers}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, bankers: e.target.value }))}
                placeholder="Comma separated"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Accounting Year End</label>
              <Input
                type="text"
                value={localCompanyInfo.accountingYearEnd}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, accountingYearEnd: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">External Auditors</label>
              <Input
                type="text"
                value={localCompanyInfo.externalAuditors}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, externalAuditors: e.target.value }))}
                placeholder="Comma separated"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tax Consultants</label>
              <Input
                type="text"
                value={localCompanyInfo.taxConsultants}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, taxConsultants: e.target.value }))}
                placeholder="Comma separated"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Major Customer</label>
              <Input
                type="text"
                value={localCompanyInfo.majorCustomer}
                onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, majorCustomer: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Major Suppliers</label>
            <Input
              type="text"
              value={localCompanyInfo.majorSuppliers}
              onChange={(e) => setLocalCompanyInfo(prev => ({ ...prev, majorSuppliers: e.target.value }))}
              placeholder="Comma separated"
            />
          </div>
          <div className="flex justify-between space-x-4">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
              >
                Continue
              </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  const YearlyDetailsForm = () => {
    const initialFormData = yearlyData[currentYear] || {
      grossProfit: '',
      turnover: '',
      costOfSale: '',
      netProfit: '',
      operatingExpenses: '',
      financeCost: '',
      taxes: {
        companyIncome: { amount: '', isLate: false },
        education: { amount: '', isLate: false },
        capitalGains: { amount: '', isLate: false },
        withholding: { amount: '', isLate: false },
        valueAdded: { amount: '', isLate: false }
      }
    };

    const [formData, setFormData] = useState(initialFormData);
    
    const handleTaxChange = (taxType, field, value) => {
      setFormData(prev => ({
        ...prev,
        taxes: {
          ...prev.taxes,
          [taxType]: {
            ...prev.taxes[taxType],
            [field]: value
          }
        }
      }));
    };

    const saveCurrentYearData = () => {
      setYearlyData(prev => ({
        ...prev,
        [currentYear]: formData
      }));
    };

    const goToPreviousYear = () => {
      const startYear = parseInt(yearRange.startYear);
      if (currentYear > startYear) {
        saveCurrentYearData();
        const newYear = currentYear - 1;
        setCurrentYear(newYear);
        const previousYearData = yearlyData[newYear] || initialFormData;
        setFormData(previousYearData);
      }
    };

    const goToNextYear = () => {
      const endYear = parseInt(yearRange.endYear);
      if (currentYear < endYear) {
        saveCurrentYearData();
        const newYear = currentYear + 1;
        setCurrentYear(newYear);
        const nextYearData = yearlyData[newYear] || initialFormData;
        setFormData(nextYearData);
      }
    };

    const handleSubmit = async () => {
      // First save the current year's data
      const updatedYearlyData = {
        ...yearlyData,
        [currentYear]: formData
      };
      
      // Update the state
      setYearlyData(updatedYearlyData);
      
      // Submit both the updated yearly data and company info
      await onComplete(updatedYearlyData, companyInfo);
      
      // Move to next step
      setStep(4);
    };

    const startYear = parseInt(yearRange.startYear);
    const endYear = parseInt(yearRange.endYear);
    const isLastYear = currentYear >= endYear;

    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Financial Details for {currentYear}</CardTitle>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousYear}
                disabled={currentYear <= startYear}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
              </Button>
              <span className="text-sm font-medium">
                Year {currentYear - startYear + 1} of {endYear - startYear + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextYear}
                disabled={currentYear >= endYear}
              >
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['grossProfit', 'Gross Profit'],
                ['turnover', 'Turnover'],
                ['costOfSale', 'Cost of Sale'],
                ['netProfit', 'Net Profit'],
                ['operatingExpenses', 'Operating Expenses'],
                ['financeCost', 'Finance Cost']
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <Input
                    type="number"
                    value={formData[key]}
                    onChange={(e) => setFormData(prev => ({...prev, [key]: e.target.value}))}
                    placeholder="Amount"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Tax Information</h3>
              {Object.entries({
                companyIncome: 'Company Income Tax',
                education: 'Education Tax',
                capitalGains: 'Capital Gains Tax',
                withholding: 'Withholding Tax',
                valueAdded: 'Value Added Tax'
              }).map(([key, label]) => (
                <div key={key} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">{label}</label>
                    <Input
                      type="number"
                      value={formData.taxes[key].amount}
                      onChange={(e) => handleTaxChange(key, 'amount', e.target.value)}
                      placeholder="Amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Filing Status</label>
                    <Select
                      value={formData.taxes[key].isLate.toString()}
                      onValueChange={(value) => handleTaxChange(key, 'isLate', value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">On Time</SelectItem>
                        <SelectItem value="true">Late</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between space-x-4">
              <Button
                variant="outline"
                onClick={goToPreviousStep}
              >
                Back to Company Info
              </Button>
              {isLastYear ? (
                <Button onClick={handleSubmit}>
                  Submit All Data
                </Button>
              ) : (
                <Button onClick={goToNextYear}>
                  Next Year
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
};

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex justify-center mb-4 space-x-2">
      {[1, 2, 3].map((stepNumber) => (
        <div
          key={stepNumber}
          className={`w-3 h-3 rounded-full ${
            step >= stepNumber ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="p-4">
      <StepIndicator />
      {step === 1 && <YearRangeForm />}
      {step === 2 && <CompanyInfoForm />}
      {step === 3 && <YearlyDetailsForm />}
    </div>
  );

};

export default RiskAnalysisFlow;