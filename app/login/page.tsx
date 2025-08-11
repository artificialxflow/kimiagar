"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../components/Auth/LoginForm";
import OTPForm from "../components/Auth/OTPForm";

export default function LoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  const handleLogin = (userData: any) => {
    setIsAuthenticated(true);
    // ذخیره اطلاعات کاربر در localStorage (در LoginForm انجام شده)
    router.push("/dashboard");
  };

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setShowOTP(true);
  };

  const handleOTPVerification = (userData: any) => {
    setIsAuthenticated(true);
    router.push("/dashboard");
  };

  const handleBackToLogin = () => {
    setShowOTP(false);
    setPhoneNumber('');
    setUserData(null);
  };

  if (showOTP) {
    return (
      <OTPForm 
        phoneNumber={phoneNumber}
        onVerification={handleOTPVerification}
        onBack={handleBackToLogin}
      />
    );
  }

  return <LoginForm onLogin={handleLogin} onPhoneSubmit={handlePhoneSubmit} />;
} 