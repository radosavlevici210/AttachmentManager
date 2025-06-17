import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, User, Mail, Key, Atom } from "lucide-react";

export default function Login() {
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    register(registerForm);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-quantum-dark via-quantum-surface to-quantum-dark p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-quantum-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-quantum-primary/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-quantum-primary rounded-xl flex items-center justify-center animate-pulse-glow">
            <Atom className="w-6 h-6 text-quantum-dark" />
          </div>
          <h1 className="text-2xl font-bold text-quantum-primary">Quantum Intelligence Dashboard</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="quantum-card border-quantum-border shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-quantum-primary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
              <Lock className="w-10 h-10 text-quantum-dark" />
            </div>
            <CardTitle className="text-2xl font-bold text-quantum-primary">Secure Access</CardTitle>
            <p className="text-quantum-muted">Enter your credentials to access the dashboard</p>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-quantum-surface">
                <TabsTrigger value="login" className="data-[state=active]:bg-quantum-primary data-[state=active]:text-quantum-dark">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-quantum-primary data-[state=active]:text-quantum-dark">
                  Register
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-quantum-muted">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-quantum-muted" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
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
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 quantum-surface border-quantum-border focus:border-quantum-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  {loginError && (
                    <Alert className="border-red-500 bg-red-500/10">
                      <AlertDescription className="text-red-400">
                        {loginError.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full quantum-gradient hover:opacity-90 text-quantum-dark font-semibold"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-quantum-dark border-t-transparent rounded-full animate-spin"></div>
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Unlock Dashboard</span>
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-quantum-muted">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-quantum-muted" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        className="pl-10 quantum-surface border-quantum-border focus:border-quantum-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-quantum-muted">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-quantum-muted" />
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="pl-10 quantum-surface border-quantum-border focus:border-quantum-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-quantum-muted">Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-quantum-muted" />
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Enter your password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="pl-10 quantum-surface border-quantum-border focus:border-quantum-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  {registerError && (
                    <Alert className="border-red-500 bg-red-500/10">
                      <AlertDescription className="text-red-400">
                        {registerError.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full quantum-gradient hover:opacity-90 text-quantum-dark font-semibold"
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-quantum-dark border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Create Account</span>
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
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
