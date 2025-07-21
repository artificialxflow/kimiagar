import React from "react";
import "./globals.css";

export const metadata = {
  title: "کیمیاگر",
  description: "پروژه مدیریت طلا و کیف پول دیجیتال",
};

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="icon" type="image/svg+xml" href="/app/favicon.svg" />
      </head>
      <body style={{ fontFamily: 'Tahoma, Arial, sans-serif', background: '#fff', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
