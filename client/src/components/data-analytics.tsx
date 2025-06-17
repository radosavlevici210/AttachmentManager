import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, TrendingUp, Filter, Download, BarChart3 } from "lucide-react";

interface DataAnalyticsProps {
  data: any[];
}

export function DataAnalytics({ data }: DataAnalyticsProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const numericColumns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(key => 
      data.some(row => !isNaN(parseFloat(row[key])) && isFinite(row[key]))
    );
  }, [data]);

  const allColumns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!filterValue) return data;
    return data.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(filterValue.toLowerCase())
      )
    );
  }, [data, filterValue]);

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      // Handle numeric sorting
      if (!isNaN(parseFloat(aVal)) && !isNaN(parseFloat(bVal))) {
        const numA = parseFloat(aVal);
        const numB = parseFloat(bVal);
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      
      // Handle string sorting
      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      if (sortDirection === "asc") {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  const statistics = useMemo(() => {
    if (!selectedColumn || data.length === 0) return null;
    
    const values = data.map(row => parseFloat(row[selectedColumn])).filter(val => !isNaN(val));
    if (values.length === 0) return null;
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    const mean = sum / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)];
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      count: values.length,
      sum: sum.toFixed(2),
      mean: mean.toFixed(2),
      median: median.toFixed(2),
      min: Math.min(...values).toFixed(2),
      max: Math.max(...values).toFixed(2),
      stdDev: stdDev.toFixed(2),
      variance: variance.toFixed(2)
    };
  }, [data, selectedColumn]);

  const correlationMatrix = useMemo(() => {
    if (numericColumns.length < 2) return null;
    
    const matrix: { [key: string]: { [key: string]: number } } = {};
    
    numericColumns.forEach(col1 => {
      matrix[col1] = {};
      numericColumns.forEach(col2 => {
        const values1 = data.map(row => parseFloat(row[col1])).filter(val => !isNaN(val));
        const values2 = data.map(row => parseFloat(row[col2])).filter(val => !isNaN(val));
        
        if (values1.length !== values2.length) {
          matrix[col1][col2] = 0;
          return;
        }
        
        const mean1 = values1.reduce((acc, val) => acc + val, 0) / values1.length;
        const mean2 = values2.reduce((acc, val) => acc + val, 0) / values2.length;
        
        const numerator = values1.reduce((acc, val1, idx) => 
          acc + (val1 - mean1) * (values2[idx] - mean2), 0
        );
        
        const denominator = Math.sqrt(
          values1.reduce((acc, val) => acc + Math.pow(val - mean1, 2), 0) *
          values2.reduce((acc, val) => acc + Math.pow(val - mean2, 2), 0)
        );
        
        matrix[col1][col2] = denominator === 0 ? 0 : numerator / denominator;
      });
    });
    
    return matrix;
  }, [data, numericColumns]);

  const exportAnalytics = () => {
    const analyticsData = {
      summary: {
        totalRows: data.length,
        filteredRows: sortedData.length,
        columns: allColumns.length,
        numericColumns: numericColumns.length
      },
      statistics: selectedColumn ? statistics : null,
      correlationMatrix,
      data: sortedData.slice(0, 1000) // Limit export size
    };
    
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `analytics-report-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (data.length === 0) {
    return (
      <Card className="quantum-card border-quantum-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
              <Calculator className="text-quantum-dark" />
            </div>
            <span className="text-quantum-primary">Data Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="quantum-surface rounded-lg p-8 text-center">
            <Calculator className="w-12 h-12 text-quantum-muted mx-auto mb-4" />
            <p className="text-quantum-muted">Upload data to start advanced analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="quantum-card border-quantum-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
              <Calculator className="text-quantum-dark" />
            </div>
            <span className="text-quantum-primary">Data Analytics</span>
          </CardTitle>
          <Button
            onClick={exportAnalytics}
            size="sm"
            className="quantum-surface hover:bg-quantum-border text-quantum-primary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="quantum-surface rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-quantum-primary">{data.length}</div>
            <div className="text-xs text-quantum-muted">Total Rows</div>
          </div>
          <div className="quantum-surface rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-quantum-primary">{allColumns.length}</div>
            <div className="text-xs text-quantum-muted">Columns</div>
          </div>
          <div className="quantum-surface rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-quantum-primary">{numericColumns.length}</div>
            <div className="text-xs text-quantum-muted">Numeric</div>
          </div>
          <div className="quantum-surface rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-quantum-primary">{sortedData.length}</div>
            <div className="text-xs text-quantum-muted">Filtered</div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-quantum-muted">Filter Data</Label>
            <Input
              placeholder="Search all columns..."
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="quantum-surface border-quantum-border focus:border-quantum-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-quantum-muted">Sort By</Label>
            <Select value={sortColumn} onValueChange={setSortColumn}>
              <SelectTrigger className="quantum-surface border-quantum-border">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent className="quantum-surface border-quantum-border">
                <SelectItem value="" className="text-white hover:bg-quantum-border">None</SelectItem>
                {allColumns.map(column => (
                  <SelectItem key={column} value={column} className="text-white hover:bg-quantum-border">
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-quantum-muted">Direction</Label>
            <Select value={sortDirection} onValueChange={(value: "asc" | "desc") => setSortDirection(value)}>
              <SelectTrigger className="quantum-surface border-quantum-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="quantum-surface border-quantum-border">
                <SelectItem value="asc" className="text-white hover:bg-quantum-border">Ascending</SelectItem>
                <SelectItem value="desc" className="text-white hover:bg-quantum-border">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Statistics Panel */}
        {numericColumns.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-quantum-muted">Statistical Analysis</Label>
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger className="quantum-surface border-quantum-border">
                  <SelectValue placeholder="Select numeric column" />
                </SelectTrigger>
                <SelectContent className="quantum-surface border-quantum-border">
                  {numericColumns.map(column => (
                    <SelectItem key={column} value={column} className="text-white hover:bg-quantum-border">
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {statistics && (
              <div className="quantum-surface rounded-lg p-4">
                <h4 className="text-sm font-semibold text-quantum-primary mb-3">
                  Statistics for {selectedColumn}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-quantum-muted">Count:</span>
                    <span className="text-white ml-2">{statistics.count}</span>
                  </div>
                  <div>
                    <span className="text-quantum-muted">Mean:</span>
                    <span className="text-white ml-2">{statistics.mean}</span>
                  </div>
                  <div>
                    <span className="text-quantum-muted">Median:</span>
                    <span className="text-white ml-2">{statistics.median}</span>
                  </div>
                  <div>
                    <span className="text-quantum-muted">Std Dev:</span>
                    <span className="text-white ml-2">{statistics.stdDev}</span>
                  </div>
                  <div>
                    <span className="text-quantum-muted">Min:</span>
                    <span className="text-white ml-2">{statistics.min}</span>
                  </div>
                  <div>
                    <span className="text-quantum-muted">Max:</span>
                    <span className="text-white ml-2">{statistics.max}</span>
                  </div>
                  <div>
                    <span className="text-quantum-muted">Sum:</span>
                    <span className="text-white ml-2">{statistics.sum}</span>
                  </div>
                  <div>
                    <span className="text-quantum-muted">Variance:</span>
                    <span className="text-white ml-2">{statistics.variance}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Correlation Matrix */}
        {correlationMatrix && numericColumns.length > 1 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-quantum-primary">Correlation Matrix</h4>
            <div className="quantum-surface rounded-lg p-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-quantum-border">
                    <TableHead className="text-quantum-primary">Column</TableHead>
                    {numericColumns.map(col => (
                      <TableHead key={col} className="text-quantum-primary text-center">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {numericColumns.map(row => (
                    <TableRow key={row} className="border-quantum-border">
                      <TableCell className="font-medium text-quantum-primary">{row}</TableCell>
                      {numericColumns.map(col => {
                        const correlation = correlationMatrix[row][col];
                        return (
                          <TableCell key={col} className="text-center">
                            <Badge
                              variant="outline"
                              className={`${
                                Math.abs(correlation) > 0.7
                                  ? "border-green-500 text-green-400"
                                  : Math.abs(correlation) > 0.3
                                  ? "border-yellow-500 text-yellow-400"
                                  : "border-gray-500 text-gray-400"
                              }`}
                            >
                              {correlation.toFixed(2)}
                            </Badge>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Data Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-quantum-primary">Data Preview</h4>
            <Badge variant="outline" className="text-quantum-primary border-quantum-primary">
              {sortedData.length} rows
            </Badge>
          </div>
          <div className="quantum-surface rounded-lg overflow-hidden">
            <div className="max-h-64 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 quantum-surface">
                  <TableRow className="border-quantum-border">
                    {allColumns.slice(0, 8).map(header => (
                      <TableHead key={header} className="text-quantum-primary font-semibold">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.slice(0, 10).map((row, index) => (
                    <TableRow key={index} className="border-quantum-border hover:bg-quantum-card">
                      {allColumns.slice(0, 8).map(column => (
                        <TableCell key={column} className="text-quantum-muted">
                          {String(row[column]).slice(0, 30)}
                          {String(row[column]).length > 30 && "..."}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {sortedData.length > 10 && (
              <div className="p-3 text-center text-sm text-quantum-muted border-t border-quantum-border">
                Showing 10 of {sortedData.length} filtered rows
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}