import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User, Mail, Key, Atom } from "lucide-react";

export function AuthPanel() {
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoginMode) {
      login({ email: formData.email, password: formData.password });
    } else {
      register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentError = isLoginMode ? loginError : registerError;
  const isLoading = isLoginMode ? isLoggingIn : isRegistering;

  return (
    <div className="min-h-screen bg-gradient-to-br from-quantum-dark via-quantum-surface to-quantum-dark flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-quantum-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-quantum-primary/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="quantum-card border-quantum-border shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-quantum-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Lock className="w-8 h-8 text-quantum-dark" />
            </div>
            <h2 className="text-2xl font-bold text-quantum-primary mb-2">Secure Access</h2>
            <p className="text-quantum-muted">Enter your credentials to access the dashboard</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex bg-quantum-surface rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsLoginMode(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLoginMode
                    ? "bg-quantum-primary text-quantum-dark"
                    : "text-quantum-muted hover:text-white"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLoginMode(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLoginMode
                    ? "bg-quantum-primary text-quantum-dark"
                    : "text-quantum-muted hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-quantum-muted">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-quantum-muted" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={(e) => updateField("username", e.target.value)}
                      className="pl-10 quantum-surface border-quantum-border focus:border-quantum-primary"
                      required={!isLoginMode}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-quantum-muted">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-quantum-muted" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="pl-10 quantum-surface border-quantum-border focus:border-quantum-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-quantum-muted">Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-quantum-muted" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className="pl-10 quantum-surface border-quantum-border focus:border-quantum-primary"
                    required
                  />
                </div>
              </div>
              
              {currentError && (
                <Alert className="border-red-500 bg-red-500/10">
                  <AlertDescription className="text-red-400">
                    {currentError.message}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full quantum-gradient hover:opacity-90 text-quantum-dark font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-quantum-dark border-t-transparent rounded-full animate-spin"></div>
                    <span>{isLoginMode ? "Logging in..." : "Creating account..."}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>{isLoginMode ? "Unlock Dashboard" : "Create Account"}</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8 text-quantum-muted text-sm">
          <p>&copy; 2025 Quantum Intelligence Dashboard. All rights reserved.</p>
          <p className="text-xs mt-2">Advanced AI-powered data analysis platform</p>
        </div>
      </div>
    </div>
  );
}
