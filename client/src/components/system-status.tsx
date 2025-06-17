import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Server, Cpu, HardDrive, MemoryStick, Activity } from "lucide-react";

export function SystemStatus() {
  const [systemStats, setSystemStats] = useState({
    cpu: { usage: 0, label: "CPU Usage" },
    memory: { usage: 0, total: 8, used: 0, label: "Memory" },
    storage: { usage: 0, total: 100, used: 0, label: "Storage" },
    uptime: "0m",
    status: "online"
  });

  useEffect(() => {
    // Simulate real-time system stats
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.floor(Math.random() * 40) + 20 // 20-60%
        },
        memory: {
          ...prev.memory,
          used: Math.floor(Math.random() * 3) + 1.5, // 1.5-4.5GB
          usage: Math.floor(((Math.floor(Math.random() * 3) + 1.5) / 8) * 100)
        },
        storage: {
          ...prev.storage,
          used: Math.floor(Math.random() * 20) + 40, // 40-60GB
          usage: Math.floor(((Math.floor(Math.random() * 20) + 40) / 100) * 100)
        },
        uptime: `${Math.floor(Date.now() / 1000 / 60) % 60}m`
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (usage: number) => {
    if (usage < 50) return "text-green-400";
    if (usage < 80) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (usage: number) => {
    if (usage < 50) return "bg-green-500";
    if (usage < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="quantum-card border-quantum-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
            <Server className="text-quantum-dark" />
          </div>
          <span className="text-quantum-primary">System Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-quantum-primary" />
            <span className="text-sm text-quantum-muted">System Status</span>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-green-500">
            Online
          </Badge>
        </div>

        {/* CPU Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-quantum-muted" />
              <span className="text-sm text-quantum-muted">CPU Usage</span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(systemStats.cpu.usage)}`}>
              {systemStats.cpu.usage}%
            </span>
          </div>
          <div className="w-full bg-quantum-surface rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(systemStats.cpu.usage)}`}
              style={{ width: `${systemStats.cpu.usage}%` }}
            />
          </div>
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MemoryStick className="w-4 h-4 text-quantum-muted" />
              <span className="text-sm text-quantum-muted">Memory</span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(systemStats.memory.usage)}`}>
              {systemStats.memory.used.toFixed(1)}GB / {systemStats.memory.total}GB
            </span>
          </div>
          <div className="w-full bg-quantum-surface rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(systemStats.memory.usage)}`}
              style={{ width: `${systemStats.memory.usage}%` }}
            />
          </div>
        </div>

        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-quantum-muted" />
              <span className="text-sm text-quantum-muted">Storage</span>
            </div>
            <span className={`text-sm font-medium ${getStatusColor(systemStats.storage.usage)}`}>
              {systemStats.storage.used}GB / {systemStats.storage.total}GB
            </span>
          </div>
          <div className="w-full bg-quantum-surface rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(systemStats.storage.usage)}`}
              style={{ width: `${systemStats.storage.usage}%` }}
            />
          </div>
        </div>

        {/* System Info */}
        <div className="quantum-surface rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-quantum-muted">Uptime</span>
            <span className="text-quantum-primary">{systemStats.uptime}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-quantum-muted">Load Average</span>
            <span className="text-quantum-primary">0.42, 0.38, 0.35</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-quantum-muted">Processes</span>
            <span className="text-quantum-primary">156 running</span>
          </div>
        </div>

        {/* Performance Indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-quantum-primary rounded-full animate-pulse"></div>
          <span className="text-xs text-quantum-muted">Real-time monitoring active</span>
        </div>
      </CardContent>
    </Card>
  );
}
