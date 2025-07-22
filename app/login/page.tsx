"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../components/Auth/LoginForm";

export default function LoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  const handleLogin = (userData: any) => {
    setIsAuthenticated(true);
    // ذخیره اطلاعات کاربر در localStorage (در LoginForm انجام شده)
    router.push("/dashboard");
  };

  return <LoginForm onLogin={handleLogin} />;
} 