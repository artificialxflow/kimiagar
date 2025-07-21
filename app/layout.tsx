import React from "react";
import "./globals.css";

export const metadata = {
  title: "کیمیاگر",
  description: "پروژه مدیریت طلا و کیف پول دیجیتال",
};

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <html lang="fa" dir="rtl">
      <body style={{ fontFamily: 'Tahoma, Arial, sans-serif', background: '#fff', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
