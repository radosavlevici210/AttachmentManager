import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Chart, registerables } from "chart.js";
import { TrendingUp, Download, Maximize2, Settings, RefreshCw } from "lucide-react";

Chart.register(...registerables);

interface AdvancedChartsProps {
  data: any[];
}

export function AdvancedCharts({ data }: AdvancedChartsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const [chartType, setChartType] = useState<string>("line");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState([1000]);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [chartTheme, setChartTheme] = useState("quantum");
  const [dataRange, setDataRange] = useState([0, 20]);
  const [isAnimating, setIsAnimating] = useState(false);

  const themes = {
    quantum: {
      primary: "#00ffcc",
      secondary: "#ff6b6b",
      tertiary: "#4ecdc4",
      background: "rgba(0, 255, 204, 0.1)",
      grid: "#333333",
      text: "#aaaaaa"
    },
    neon: {
      primary: "#ff0080",
      secondary: "#00ff80",
      tertiary: "#8000ff",
      background: "rgba(255, 0, 128, 0.1)",
      grid: "#444444",
      text: "#cccccc"
    },
    ocean: {
      primary: "#0077be",
      secondary: "#00a8cc",
      tertiary: "#7fb3d3",
      background: "rgba(0, 119, 190, 0.1)",
      grid: "#2a2a2a",
      text: "#999999"
    }
  };

  const availableColumns = data.length > 0 ? Object.keys(data[0]).filter(key => 
    data.some(row => !isNaN(parseFloat(row[key])) && isFinite(row[key]))
  ) : [];

  useEffect(() => {
    if (availableColumns.length > 0 && selectedColumns.length === 0) {
      setSelectedColumns(availableColumns.slice(0, 3));
    }
  }, [availableColumns]);

  useEffect(() => {
    if (data.length > 0 && selectedColumns.length > 0 && canvasRef.current) {
      updateChart();
    }
    
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, chartType, selectedColumns, animationSpeed, showGrid, showLegend, chartTheme, dataRange]);

  const updateChart = () => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const theme = themes[chartTheme as keyof typeof themes];
    const filteredData = data.slice(dataRange[0], dataRange[1]);
    
    const labels = filteredData.map((row, index) => 
      row.name || row.label || row.id || row.date || `Row ${index + 1}`
    );

    const datasets = selectedColumns.map((column, index) => {
      const colors = [theme.primary, theme.secondary, theme.tertiary];
      const color = colors[index % colors.length];
      
      return {
        label: column,
        data: filteredData.map(row => parseFloat(row[column]) || 0),
        borderColor: color,
        backgroundColor: index === 0 ? theme.background : `${color}20`,
        tension: chartType === "line" ? 0.4 : 0,
        fill: chartType === "area",
        pointRadius: chartType === "scatter" ? 6 : 3,
        pointHoverRadius: chartType === "scatter" ? 8 : 5,
      };
    });

    const config = {
      type: chartType as any,
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: animationSpeed[0],
          easing: 'easeInOutQuart' as const,
        },
        plugins: {
          legend: {
            display: showLegend,
            labels: {
              color: theme.text,
              font: {
                family: 'Inter, sans-serif',
                size: 12,
              },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: theme.primary,
            bodyColor: '#ffffff',
            borderColor: theme.primary,
            borderWidth: 1,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: showGrid,
              color: theme.grid,
            },
            ticks: {
              color: theme.text,
              font: {
                family: 'Inter, sans-serif',
              },
            },
          },
          x: {
            grid: {
              display: showGrid,
              color: theme.grid,
            },
            ticks: {
              color: theme.text,
              font: {
                family: 'Inter, sans-serif',
              },
              maxTicksLimit: 10,
            },
          },
        },
        interaction: {
          intersect: false,
          mode: 'index' as const,
        },
        onHover: (event, activeElements) => {
          if (canvasRef.current) {
            canvasRef.current.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
          }
        },
      },
    };

    chartRef.current = new Chart(ctx, config);
  };

  const exportChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = `quantum-chart-${Date.now()}.png`;
      link.href = url;
      link.click();
    }
  };

  const animateChart = () => {
    if (chartRef.current) {
      setIsAnimating(true);
      chartRef.current.update('active');
      setTimeout(() => setIsAnimating(false), animationSpeed[0]);
    }
  };

  const chartTypes = [
    { value: "line", label: "Line Chart" },
    { value: "bar", label: "Bar Chart" },
    { value: "area", label: "Area Chart" },
    { value: "scatter", label: "Scatter Plot" },
    { value: "bubble", label: "Bubble Chart" },
    { value: "radar", label: "Radar Chart" },
    { value: "polarArea", label: "Polar Area" },
    { value: "doughnut", label: "Doughnut Chart" },
  ];

  if (data.length === 0) {
    return (
      <Card className="quantum-card border-quantum-border">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="text-quantum-dark" />
            </div>
            <span className="text-quantum-primary">Advanced Charts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="quantum-surface rounded-lg p-8 text-center">
            <TrendingUp className="w-12 h-12 text-quantum-muted mx-auto mb-4" />
            <p className="text-quantum-muted">Upload data to create advanced visualizations</p>
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
              <TrendingUp className="text-quantum-dark" />
            </div>
            <span className="text-quantum-primary">Advanced Charts</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={animateChart}
              size="sm"
              className="quantum-surface hover:bg-quantum-border text-quantum-primary"
              disabled={isAnimating}
            >
              <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={exportChart}
              size="sm"
              className="quantum-surface hover:bg-quantum-border text-quantum-primary"
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-quantum-muted">Chart Type</Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="quantum-surface border-quantum-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="quantum-surface border-quantum-border">
                {chartTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-white hover:bg-quantum-border">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-quantum-muted">Theme</Label>
            <Select value={chartTheme} onValueChange={setChartTheme}>
              <SelectTrigger className="quantum-surface border-quantum-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="quantum-surface border-quantum-border">
                <SelectItem value="quantum" className="text-white hover:bg-quantum-border">Quantum</SelectItem>
                <SelectItem value="neon" className="text-white hover:bg-quantum-border">Neon</SelectItem>
                <SelectItem value="ocean" className="text-white hover:bg-quantum-border">Ocean</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Column Selection */}
        <div className="space-y-2">
          <Label className="text-quantum-muted">Data Columns</Label>
          <div className="flex flex-wrap gap-2">
            {availableColumns.map((column) => (
              <Badge
                key={column}
                variant={selectedColumns.includes(column) ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  selectedColumns.includes(column)
                    ? "bg-quantum-primary text-quantum-dark"
                    : "border-quantum-border text-quantum-muted hover:border-quantum-primary"
                }`}
                onClick={() => {
                  if (selectedColumns.includes(column)) {
                    setSelectedColumns(selectedColumns.filter(c => c !== column));
                  } else if (selectedColumns.length < 5) {
                    setSelectedColumns([...selectedColumns, column]);
                  }
                }}
              >
                {column}
              </Badge>
            ))}
          </div>
        </div>

        {/* Advanced Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-quantum-muted">Animation Speed: {animationSpeed[0]}ms</Label>
            <Slider
              value={animationSpeed}
              onValueChange={setAnimationSpeed}
              max={3000}
              min={100}
              step={100}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-quantum-muted">Data Range: {dataRange[0]} to {dataRange[1]}</Label>
            <Slider
              value={dataRange}
              onValueChange={setDataRange}
              max={data.length}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch id="grid" checked={showGrid} onCheckedChange={setShowGrid} />
              <Label htmlFor="grid" className="text-quantum-muted">Show Grid</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="legend" checked={showLegend} onCheckedChange={setShowLegend} />
              <Label htmlFor="legend" className="text-quantum-muted">Show Legend</Label>
            </div>
          </div>
        </div>

        {/* Chart Display */}
        <div className="quantum-surface rounded-lg p-4 h-96">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Chart Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-quantum-muted">
              Showing {dataRange[1] - dataRange[0]} of {data.length} rows
            </span>
            <span className="text-quantum-muted">
              {selectedColumns.length} columns selected
            </span>
          </div>
          <Badge variant="outline" className="text-quantum-primary border-quantum-primary">
            {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}