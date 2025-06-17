import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { setAuthHeaders } from "@/lib/auth-utils";
import { Task } from "@/types";
import { Calendar, Plus, CheckCircle, Circle, Trash2, Clock } from "lucide-react";

export function TaskScheduler() {
  const [taskInput, setTaskInput] = useState("");
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: async () => {
      const response = await fetch("/api/tasks", {
        headers: setAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      return response.json();
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; description?: string }) => {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...setAuthHeaders(),
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setTaskInput("");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Task> }) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...setAuthHeaders(),
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: setAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskInput.trim()) {
      createTaskMutation.mutate({
        title: taskInput.trim(),
      });
    }
  };

  const toggleTask = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      updates: { completed: !task.completed },
    });
  };

  const deleteTask = (id: number) => {
    deleteTaskMutation.mutate(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="quantum-card border-quantum-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-quantum-primary rounded-lg flex items-center justify-center">
            <Calendar className="text-quantum-dark" />
          </div>
          <span className="text-quantum-primary">Task Scheduler</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Task Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="e.g., Remind me to check logs at 5pm"
            className="quantum-surface border-quantum-border focus:border-quantum-primary resize-none"
            rows={2}
          />
          <Button
            type="submit"
            className="w-full quantum-gradient text-quantum-dark font-semibold"
            disabled={createTaskMutation.isPending || !taskInput.trim()}
          >
            {createTaskMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-quantum-dark border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </div>
            )}
          </Button>
        </form>

        {createTaskMutation.error && (
          <Alert className="border-red-500 bg-red-500/10">
            <AlertDescription className="text-red-400">
              {createTaskMutation.error.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-quantum-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : !tasks || tasks.length === 0 ? (
            <div className="text-center py-8 text-quantum-muted">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>No tasks scheduled yet</p>
              <p className="text-sm">Create your first task above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 10).map((task) => (
                <div
                  key={task.id}
                  className={`quantum-surface rounded-lg p-3 border transition-all duration-200 ${
                    task.completed 
                      ? "border-green-500/30 bg-green-500/5" 
                      : "border-quantum-border hover:border-quantum-primary"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleTask(task)}
                      className="mt-1 flex-shrink-0"
                      disabled={updateTaskMutation.isPending}
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-quantum-muted hover:text-quantum-primary" />
                      )}
                    </button>
                    
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm ${
                        task.completed 
                          ? "text-quantum-muted line-through" 
                          : "text-white"
                      }`}>
                        {task.title}
                      </p>
                      
                      {task.description && (
                        <p className="text-xs text-quantum-muted">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {formatDate(task.createdAt)}
                        </Badge>
                        {task.completed && (
                          <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500">
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTask(task.id)}
                      className="flex-shrink-0 border-red-500 text-red-400 hover:bg-red-500/10"
                      disabled={deleteTaskMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {tasks.length > 10 && (
                <p className="text-center text-sm text-quantum-muted">
                  Showing 10 of {tasks.length} tasks
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
