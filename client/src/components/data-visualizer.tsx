import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, BarChart3, PieChart, ScatterChart } from "lucide-react";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface DataVisualizerProps {
  data: any[];
}

export function DataVisualizer({ data }: DataVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<string>("line");
  const [numericColumns, setNumericColumns] = useState<string[]>([]);

  useEffect(() => {
    if (data.length > 0) {
      // Find numeric columns
      const headers = Object.keys(data[0]);
      const numeric = headers.filter(header => 
        data.some(row => !isNaN(parseFloat(row[header])) && isFinite(row[header]))
      );
      setNumericColumns(numeric);
    }
  }, [data]);

  useEffect(() => {
    if (data.length > 0 && numericColumns.length > 0 && canvasRef.current) {
      updateChart();
    }
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, chartType, numericColumns]);

  const updateChart = () => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const labels = data.slice(0, 20).map((row, index) => 
      row.name || row.label || row.id || `Row ${index + 1}`
    );
    
    const datasets = numericColumns.slice(0, 3).map((column, index) => ({
      label: column,
      data: data.slice(0, 20).map(row => parseFloat(row[column]) || 0),
      borderColor: index === 0 ? "#00ffcc" : index === 1 ? "#ff6b6b" : "#4ecdc4",
      backgroundColor: index === 0 ? "rgba(0, 255, 204, 0.1)" : index === 1 ? "rgba(255, 107, 107, 0.1)" : "rgba(78, 205, 196, 0.1)",
      tension: 0.4,
      fill: chartType === "area",
    }));

    const config = {
      type: chartType as any,
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#00ffcc",
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: "#333333",
            },
            ticks: {
              color: "#aaaaaa",
            },
          },
          x: {
            grid: {
              color: "#333333",
            },
            ticks: {
              color: "#aaaaaa",
            },
          },
        },
      },
    };

    chartRef.current = new Chart(ctx, config);
  };

  const chartTypes = [
    { value: "line", label: "Line Chart", icon: LineChart },
    { value: "bar", label: "Bar Chart", icon: BarChart3 },
    { value: "pie", label: "Pie Chart", icon: PieChart },
    { value: "scatter", label: "Scatter Plot", icon: ScatterChart },
  ];

  return (
    <Card className="quantum-card border-quantum-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
              <LineChart className="text-quantum-dark" />
            </div>
            <span className="text-quantum-primary">Data Visualization</span>
          </CardTitle>
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-40 quantum-surface border-quantum-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="quantum-surface border-quantum-border">
              {chartTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-quantum-border">
                  <div className="flex items-center space-x-2">
                    <type.icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="quantum-surface rounded-lg p-8 text-center">
            <LineChart className="w-12 h-12 text-quantum-muted mx-auto mb-4" />
            <p className="text-quantum-muted">Upload a file to start visualizing your data</p>
          </div>
        ) : numericColumns.length === 0 ? (
          <div className="quantum-surface rounded-lg p-8 text-center">
            <p className="text-quantum-muted">No numeric columns found for visualization</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-quantum-muted">Visualizing columns:</span>
              {numericColumns.slice(0, 3).map((column) => (
                <Badge key={column} variant="outline" className="text-quantum-primary border-quantum-primary">
                  {column}
                </Badge>
              ))}
            </div>
            <div className="quantum-surface rounded-lg p-4 h-64">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
            <p className="text-xs text-quantum-muted text-center">
              Showing first 20 rows • {data.length} total rows
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
