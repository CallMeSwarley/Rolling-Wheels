import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Rolling Wheels - SV Lohhof",
  description: "SV Lohhof Rolling Wheels - Community sports organization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="app">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
