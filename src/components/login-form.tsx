"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

// Define credentials directly in the component (consider moving to env variables for better security)
const ADMIN_USERNAME = "tarihci20";
const ADMIN_PASSWORD = "aci2406717";

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // State for remember me checkbox
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate API call delay (optional)
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        toast({
           title: "Giriş Başarılı!",
           description: "Yönetim paneline yönlendiriliyorsunuz.",
           variant: "default",
           action: <LogIn className="h-5 w-5 text-primary" />,
        });

        // Store authentication status based on rememberMe
        if (typeof window !== 'undefined') {
          if (rememberMe) {
             localStorage.setItem('isAdminAuthenticated', 'true'); // Use localStorage for persistence
             sessionStorage.removeItem('isAdminAuthenticated'); // Clear sessionStorage if remembered
          } else {
             sessionStorage.setItem('isAdminAuthenticated', 'true'); // Use sessionStorage for current session only
             localStorage.removeItem('isAdminAuthenticated'); // Clear localStorage if not remembered
          }
        }

        onLoginSuccess();
      } else {
        setError('Geçersiz kullanıcı adı veya şifre.');
        toast({
          title: "Giriş Başarısız!",
          description: "Kullanıcı adı veya şifreniz yanlış.",
          variant: "destructive",
          action: <AlertTriangle className="h-5 w-5" />,
        });
        setIsLoading(false);
      }
      // No need to reset loading state on success, as the component will unmount/re-render
    }, 500); // Simulate network latency
  };

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Admin Girişi</CardTitle>
        <CardDescription>Yönetim paneline erişmek için giriş yapın.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Kullanıcı Adı</Label>
            <Input
              id="username"
              type="text"
              placeholder="Kullanıcı adınız"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              type="password"
              placeholder="Şifreniz"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
             />
            <Label
              htmlFor="remember-me"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Beni Hatırla
            </Label>
          </div>
          {error && (
            <p className="text-sm text-destructive flex items-center">
               <AlertTriangle className="mr-1 h-4 w-4" /> {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
                 <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Giriş Yapılıyor...
                 </>
            ) : (
               <>
                 <LogIn className="mr-2 h-4 w-4" /> Giriş Yap
               </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
