import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { setAuthHeaders } from "@/lib/auth-utils";
import { Link, Download, Globe, CheckCircle, AlertCircle } from "lucide-react";

export function UrlFetcher() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<any>(null);

  const fetchUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch("/api/fetch-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...setAuthHeaders(),
        },
        body: JSON.stringify({ url }),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      fetchUrlMutation.mutate(url.trim());
    }
  };

  return (
    <Card className="quantum-card border-quantum-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
            <Link className="text-quantum-dark" />
          </div>
          <span className="text-quantum-primary">Website Analyzer</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="quantum-surface border-quantum-border focus:border-quantum-primary"
            required
          />
          <Button
            type="submit"
            className="quantum-gradient text-quantum-dark font-semibold"
            disabled={fetchUrlMutation.isPending}
          >
            {fetchUrlMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-quantum-dark border-t-transparent rounded-full animate-spin"></div>
                <span>Fetching...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Fetch Website</span>
              </div>
            )}
          </Button>
        </form>

        {fetchUrlMutation.error && (
          <Alert className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {fetchUrlMutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-quantum-muted">Successfully fetched:</span>
              <Badge variant="outline" className="text-quantum-primary border-quantum-primary">
                {result.url}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-quantum-primary mb-2">AI Analysis:</h4>
                <div className="quantum-surface rounded-lg p-3 text-sm text-quantum-muted">
                  {result.analysis}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-quantum-primary mb-2">Content Preview:</h4>
                <Textarea
                  value={result.content}
                  readOnly
                  className="quantum-surface border-quantum-border font-mono text-xs"
                  rows={8}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
