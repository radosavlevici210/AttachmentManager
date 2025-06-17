import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Atom, User, LogOut, Activity } from "lucide-react";
import { FileProcessor } from "@/components/file-processor";
import { UrlFetcher } from "@/components/url-fetcher";
import { DataVisualizer } from "@/components/data-visualizer";
import { AiAssistant } from "@/components/ai-assistant";
import { MemoryTools } from "@/components/memory-tools";
import { TaskScheduler } from "@/components/task-scheduler";
import { SystemStatus } from "@/components/system-status";
import { VoiceAssistant } from "@/components/voice-assistant";
import { AdvancedCharts } from "@/components/advanced-charts";
import { DataAnalytics } from "@/components/data-analytics";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedData, setSelectedData] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-quantum-dark to-quantum-surface">
      {/* Navigation Header */}
      <nav className="quantum-surface border-b-2 border-quantum-primary shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center animate-pulse-glow">
                <Atom className="text-quantum-dark text-xl" />
              </div>
              <h1 className="text-xl font-bold text-quantum-primary">Quantum Intelligence Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-quantum-muted">
                <span className="text-sm">Status: <span className="text-quantum-primary">Online</span></span>
                <div className="w-2 h-2 bg-quantum-primary rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-quantum-primary" />
                <span className="text-sm text-quantum-muted">{user?.username}</span>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="border-quantum-border hover:bg-quantum-border text-quantum-primary"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="quantum-gradient text-quantum-dark border-0">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-2">Welcome to Quantum Intelligence</h2>
              <p className="opacity-80">Advanced data analysis and AI-powered insights at your fingertips</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Data Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* URL Fetcher */}
            <UrlFetcher />
            
            {/* File Processor */}
            <FileProcessor onDataChange={setSelectedData} />
            
            {/* Data Visualization */}
            <DataVisualizer data={selectedData} />
            
            {/* Advanced Charts */}
            <AdvancedCharts data={selectedData} />
            
            {/* Data Analytics */}
            <DataAnalytics data={selectedData} />
          </div>

          {/* Right Column - AI Assistant & Tools */}
          <div className="space-y-6">
            {/* AI Assistant */}
            <AiAssistant data={selectedData} />
            
            {/* Voice Assistant */}
            <VoiceAssistant />
            
            {/* Memory Tools */}
            <MemoryTools />
            
            {/* Task Scheduler */}
            <TaskScheduler />
            
            {/* System Status */}
            <SystemStatus />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="quantum-surface border-t border-quantum-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-quantum-muted">
            <p className="text-sm">&copy; 2025 Quantum Intelligence Dashboard. All rights reserved.</p>
            <p className="text-xs mt-2">Advanced AI-powered data analysis platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
