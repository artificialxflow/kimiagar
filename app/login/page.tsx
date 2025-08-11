"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import OTPForm from "../components/Auth/OTPForm";

type AuthMode = 'login' | 'register' | 'otp';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const router = useRouter();

  const handleLogin = (userData: any) => {
    // ذخیره اطلاعات کاربر در localStorage (در LoginForm انجام شده)
    router.push("/dashboard");
  };

  const handleRegister = (userData: any) => {
    // ذخیره اطلاعات کاربر در localStorage (در RegisterForm انجام شده)
    router.push("/dashboard");
  };

  const handleSwitchToOTP = () => {
    setAuthMode('otp');
  };

  const handleSwitchToLogin = () => {
    setAuthMode('login');
  };

  const handleSwitchToRegister = () => {
    setAuthMode('register');
  };

  const handleBackToLogin = () => {
    setAuthMode('login');
    setPhoneNumber('');
  };

  // Render based on auth mode
  switch (authMode) {
    case 'register':
      return (
        <RegisterForm 
          onRegister={handleRegister}
          onSwitchToLogin={handleSwitchToLogin}
          onSwitchToOTP={handleSwitchToOTP}
        />
      );
    
    case 'otp':
      return (
        <OTPForm 
          phoneNumber={phoneNumber}
          onVerification={handleLogin}
          onBack={handleBackToLogin}
        />
      );
    
    default: // login
      return (
        <LoginForm 
          onLogin={handleLogin}
          onSwitchToOTP={handleSwitchToOTP}
          onSwitchToRegister={handleSwitchToRegister}
        />
      );
  }
} 