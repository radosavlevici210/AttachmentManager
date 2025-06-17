import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { setAuthHeaders } from "@/lib/auth-utils";
import { SystemLog } from "@/types";
import { Brain, Download, Eye, Fan, Upload, FileText } from "lucide-react";

export function MemoryTools() {
  const [showMemoryDialog, setShowMemoryDialog] = useState(false);
  
  const { data: logs, refetch: refetchLogs } = useQuery<SystemLog[]>({
    queryKey: ["/api/logs"],
    queryFn: async () => {
      const response = await fetch("/api/logs?limit=100", {
        headers: setAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch logs");
      return response.json();
    },
  });

  const exportMemory = () => {
    const memoryData = {
      logs: logs || [],
      exportDate: new Date().toISOString(),
      version: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(memoryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum_memory_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = async () => {
    // This would typically be a DELETE request to clear logs
    // For now, we'll just refetch to simulate clearing
    refetchLogs();
  };

  const importMemory = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            console.log('Imported memory data:', data);
            // Handle imported data here
          } catch (error) {
            console.error('Error parsing imported file:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatLogLevel = (level: string) => {
    const colors = {
      info: "bg-blue-500/20 text-blue-400 border-blue-500",
      warn: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
      error: "bg-red-500/20 text-red-400 border-red-500",
      success: "bg-green-500/20 text-green-400 border-green-500"
    };
    return colors[level as keyof typeof colors] || colors.info;
  };

  return (
    <Card className="quantum-card border-quantum-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
            <Brain className="text-quantum-dark" />
          </div>
          <span className="text-quantum-primary">Memory Tools</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={exportMemory}
            className="quantum-surface hover:bg-quantum-border p-3 h-auto flex flex-col items-center space-y-1 text-quantum-primary"
          >
            <Download className="w-5 h-5" />
            <span className="text-sm">Export</span>
          </Button>
          
          <Dialog open={showMemoryDialog} onOpenChange={setShowMemoryDialog}>
            <DialogTrigger asChild>
              <Button className="quantum-surface hover:bg-quantum-border p-3 h-auto flex flex-col items-center space-y-1 text-quantum-primary">
                <Eye className="w-5 h-5" />
                <span className="text-sm">View</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="quantum-surface border-quantum-border max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-quantum-primary">System Memory</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-96 w-full">
                <div className="space-y-3">
                  {logs && logs.length > 0 ? (
                    logs.map((log) => (
                      <div key={log.id} className="quantum-card rounded-lg p-3 border border-quantum-border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={formatLogLevel(log.level)}>
                            {log.level.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-quantum-muted">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-quantum-muted">{log.message}</p>
                        {log.metadata && (
                          <pre className="text-xs text-quantum-muted mt-2 overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-quantum-muted">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p>No system logs available</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
          
          <Button
            onClick={clearLogs}
            className="quantum-surface hover:bg-quantum-border p-3 h-auto flex flex-col items-center space-y-1 text-quantum-primary"
          >
            <Fan className="w-5 h-5" />
            <span className="text-sm">Clear</span>
          </Button>
          
          <Button
            onClick={importMemory}
            className="quantum-surface hover:bg-quantum-border p-3 h-auto flex flex-col items-center space-y-1 text-quantum-primary"
          >
            <Upload className="w-5 h-5" />
            <span className="text-sm">Import</span>
          </Button>
        </div>
        
        {logs && logs.length > 0 && (
          <div className="mt-4 p-3 quantum-surface rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-quantum-muted">Memory Status:</span>
              <Badge variant="outline" className="text-quantum-primary border-quantum-primary">
                {logs.length} entries
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
