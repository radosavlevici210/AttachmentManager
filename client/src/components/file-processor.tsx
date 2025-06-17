import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { setAuthHeaders } from "@/lib/auth-utils";
import { FileData } from "@/types";
import { FileUp, Upload, File, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import Papa from "papaparse";

interface FileProcessorProps {
  onDataChange: (data: any[]) => void;
}

export function FileProcessor({ onDataChange }: FileProcessorProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files, refetch: refetchFiles } = useQuery<FileData[]>({
    queryKey: ["/api/files"],
    queryFn: async () => {
      const response = await fetch("/api/files", {
        headers: setAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch files");
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: setAuthHeaders(),
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      refetchFiles();
      processFile(data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
        headers: setAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
    },
    onSuccess: () => {
      refetchFiles();
      setSelectedFile(null);
      setParsedData([]);
      onDataChange([]);
    },
  });

  const processFile = (file: FileData) => {
    setSelectedFile(file);
    
    if (file.mimeType === "text/csv" || file.originalName.endsWith(".csv")) {
      Papa.parse(file.content || "", {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setParsedData(results.data);
          onDataChange(results.data);
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
        }
      });
    } else if (file.mimeType === "application/json" || file.originalName.endsWith(".json")) {
      try {
        const jsonData = JSON.parse(file.content || "[]");
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        setParsedData(dataArray);
        onDataChange(dataArray);
      } catch (error) {
        console.error("JSON parsing error:", error);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadMutation.mutate(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="quantum-card border-quantum-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
            <FileUp className="text-quantum-dark" />
          </div>
          <span className="text-quantum-primary">File Processor</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer ${
            dragActive
              ? "border-quantum-primary bg-quantum-primary/10"
              : "border-quantum-border hover:border-quantum-primary"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.json,.txt,.html,.zip"
            onChange={handleFileSelect}
          />
          <Upload className="w-12 h-12 text-quantum-muted mx-auto mb-4" />
          <p className="text-quantum-muted mb-2">Drag and drop files here, or click to browse</p>
          <p className="text-sm text-quantum-muted">Supports CSV, JSON, TXT, HTML, ZIP files</p>
          <Button className="mt-4 bg-quantum-surface hover:bg-quantum-border text-quantum-primary">
            Choose Files
          </Button>
        </div>

        {uploadMutation.isPending && (
          <div className="flex items-center space-x-2 text-quantum-primary">
            <div className="w-4 h-4 border-2 border-quantum-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Uploading file...</span>
          </div>
        )}

        {uploadMutation.error && (
          <Alert className="border-red-500 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {uploadMutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* File List */}
        {files && files.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-quantum-primary">Uploaded Files:</h4>
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFile?.id === file.id
                      ? "bg-quantum-primary/20 border border-quantum-primary"
                      : "quantum-surface hover:bg-quantum-border"
                  }`}
                  onClick={() => processFile(file)}
                >
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-quantum-primary" />
                    <div>
                      <p className="text-sm font-medium text-white">{file.originalName}</p>
                      <p className="text-xs text-quantum-muted">
                        {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedFile?.id === file.id && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(file.id);
                      }}
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Preview */}
        {parsedData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-quantum-primary">Data Preview:</h4>
              <Badge variant="outline" className="text-quantum-primary border-quantum-primary">
                {parsedData.length} rows
              </Badge>
            </div>
            <div className="quantum-surface rounded-lg p-4 overflow-x-auto max-h-64">
              <Table>
                <TableHeader>
                  <TableRow className="border-quantum-border">
                    {Object.keys(parsedData[0] || {}).map((header) => (
                      <TableHead key={header} className="text-quantum-primary font-semibold">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.slice(0, 5).map((row, index) => (
                    <TableRow key={index} className="border-quantum-border hover:bg-quantum-card">
                      {Object.values(row).map((value: any, cellIndex) => (
                        <TableCell key={cellIndex} className="text-quantum-muted">
                          {String(value).slice(0, 50)}
                          {String(value).length > 50 && "..."}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedData.length > 5 && (
                <p className="text-quantum-muted text-sm mt-3 text-center">
                  Showing 5 of {parsedData.length} rows
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
