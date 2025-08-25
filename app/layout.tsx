import React from "react";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { PriceProvider } from "./contexts/PriceContext";

export const metadata = {
  title: "کیمیاگر",
  description: "پروژه مدیریت طلا و کیف پول دیجیتال",
};

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body style={{ fontFamily: 'Vazirmatn, system-ui, sans-serif', background: '#fff', margin: 0 }}>
        <AuthProvider>
          <PriceProvider>
            {children}
          </PriceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
