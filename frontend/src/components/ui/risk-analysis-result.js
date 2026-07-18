import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const RiskAnalysisResults = ({ results }) => {
  const {
    years,
    company_metrics,
    market_trends,
    company_ratios,
    market_ratios,
    classifications,
    chart_data,
    tax_compliance
  } = results;

  const [selectedMetric, setSelectedMetric] = React.useState('grossProfit');
  const [selectedRatio, setSelectedRatio] = React.useState('Gross_Profit_Margin');

  const metrics = useMemo(() => [
    'grossProfit',
    'turnover',
    'costOfSale',
    'netProfit',
    'operatingExpenses',
    'financeCost'
  ], []);

  const ratios = useMemo(() => [
    'Gross_Profit_Margin',
    'Cost_of_Sale_Ratio',
    'Net_Profit_Margin',
    'Operating_Expense_Ratio',
    'Finance_Cost_Ratio'
  ], []);

  const formatMetricName = (metric) => {
    return metric
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatRatioName = (ratio) => {
    return ratio
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format the ratios data for the LineChart
  const ratiosChartData = useMemo(() => {
    return years.map((year, index) => {
      const yearData = {
        year: year
      };
      
      // Add company ratios for this year
      if (company_ratios[year]) {
        Object.entries(company_ratios[year]).forEach(([ratio, value]) => {
          yearData[`Company_${ratio}`] = value;
        });
      }
      
      // Add market ratios for this year using the string index
      const marketYear = market_ratios[index];
      if (marketYear) {
        Object.entries(marketYear).forEach(([ratio, value]) => {
          yearData[`Market_${ratio}`] = value;
        });
      }
      
      return yearData;
    });
  }, [years, company_ratios, market_ratios]);

  // Filter chart data for selected metric
  const filteredChartData = React.useMemo(() => {
    return chart_data.filter(item => item.metric === selectedMetric);
  }, [chart_data, selectedMetric]);

  const getRatioStatus = (companyValue, marketValue) => {
    const difference = ((companyValue - marketValue) / marketValue) * 100;
    if (difference > 20) return 'high';
    if (difference < -20) return 'low';
    return 'medium';
  };

  return (
    <div className="space-y-6">
      {/* Performance Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="metrics">
            <TabsList>
              <TabsTrigger value="metrics">Metrics Comparison</TabsTrigger>
              <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
            </TabsList>
            
            <TabsContent value="metrics">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Select Metric:</span>
                  <Select
                    value={selectedMetric}
                    onValueChange={setSelectedMetric}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue>{formatMetricName(selectedMetric)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {metrics.map((metric) => (
                        <SelectItem key={metric} value={metric}>
                          {formatMetricName(metric)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year"
                        tickFormatter={(value) => `${value}`}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          formatValue(value),
                          name === 'actual' ? 'Company' : 'Market Average'
                        ]}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Legend 
                        formatter={(value) => value === 'actual' ? 'Company' : 'Market Average'}
                      />
                      <Bar 
                        name="Company" 
                        dataKey="actual" 
                        fill="#8884d8"
                      />
                      <Bar 
                        name="Market Average" 
                        dataKey="market" 
                        fill="orange"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ratios">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">Select Ratio:</span>
                  <Select
                    value={selectedRatio}
                    onValueChange={setSelectedRatio}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue>{formatRatioName(selectedRatio)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {ratios.map((ratio) => (
                        <SelectItem key={ratio} value={ratio}>
                          {formatRatioName(ratio)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div style={{ height: '300px' }}>
                  <h2>{formatRatioName(selectedRatio)} Chart</h2>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ratiosChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, 'dataMax + 10']} />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${formatValue(value)}%`, 
                          name.replace(/(Company|Market)_/g, '').replace(/_/g, ' ')
                        ]}
                      />
                      <Legend 
                        formatter={(value) => value.replace(/(Company|Market)_/g, '').replace(/_/g, ' ')}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={`Company_${selectedRatio}`} 
                        name={`Company ${formatRatioName(selectedRatio)}`} 
                        stroke="#8884d8"
                      />
                      <Line 
                        type="monotone" 
                        dataKey={`Market_${selectedRatio}`} 
                        name={`Market ${formatRatioName(selectedRatio)}`} 
                        stroke="orange"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>


          </Tabs>
        </CardContent>
      </Card>

      {/* Financial Ratios Table */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Ratio</th>
                  {years.map(year => (
                    <React.Fragment key={year}>
                      <th className="p-2 text-right">Company ({year})</th>
                      <th className="p-2 text-right">Market ({year})</th>
                      <th className="p-2 text-center">Status</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ratios.map(ratio => (
                  <tr key={ratio} className="border-b">
                    <td className="p-2 font-medium">{formatRatioName(ratio)}</td>
                    {years.map(year => {
                      const companyValue = company_ratios[year][ratio];
                      const marketValue = market_ratios[years.indexOf(year)][ratio];
                      const status = getRatioStatus(companyValue, marketValue);
                      
                      return (
                        <React.Fragment key={year}>
                          <td className="p-2 text-right">
                            {formatValue(companyValue)}%
                          </td>
                          <td className="p-2 text-right">
                            {formatValue(marketValue)}%
                          </td>
                          <td className="p-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              status === 'low' 
                                ? 'bg-red-100 text-red-800' 
                                : status === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {status}
                            </span>
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Metric</th>
                  {years.map(year => (
                    <React.Fragment key={year}>
                      <th className="p-2 text-right">Company ({year})</th>
                      <th className="p-2 text-right">Market ({year})</th>
                      <th className="p-2 text-center">Status</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map(metric => (
                  <tr key={metric} className="border-b">
                    <td className="p-2 font-medium">{formatMetricName(metric)}</td>
                    {years.map(year => (
                      <React.Fragment key={year}>
                        <td className="p-2 text-right">
                          {formatValue(company_metrics[year][metric])}
                        </td>
                        <td className="p-2 text-right">
                          {formatValue(market_trends[years.indexOf(year)][metric])}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            classifications[metric][years.indexOf(year)] === 'low' 
                              ? 'bg-red-100 text-red-800' 
                              : classifications[metric][years.indexOf(year)] === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {classifications[metric][years.indexOf(year)]}
                          </span>
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tax Compliance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Compliance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Tax Type</th>
                  {years.map(year => (
                    <React.Fragment key={year}>
                      <th className="p-2 text-right">Amount ({year})</th>
                      <th className="p-2 text-center">Status</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(tax_compliance[years[0]]).map(([taxType, _]) => (
                  <tr key={taxType} className="border-b">
                    <td className="p-2 font-medium">{formatMetricName(taxType)}</td>
                    {years.map(year => (
                      <React.Fragment key={year}>
                        <td className="p-2 text-right">
                          {formatValue(tax_compliance[year][taxType].amount)}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tax_compliance[year][taxType].compliance === 'on_time'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {tax_compliance[year][taxType].compliance.replace(/_/g, ' ')}
                          </span>
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAnalysisResults;