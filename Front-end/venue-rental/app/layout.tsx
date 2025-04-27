import type { Metadata } from "next";
import localFont from "next/font/local";
import { Prompt } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/common/Navbar";
import Sidebar from "@/components/common/Sidebar";
import ReduxProvider from "@/components/common/ReduxProvider";
import { Toaster } from "react-hot-toast";

const prompt = Prompt({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-prompt",
});

export const metadata: Metadata = {
  title: "Event Sphere",
  description: "Capstone-Project KMUTT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${prompt.variable}`}>
      <body className="bg-[#F2F8FF] h-screen overflow-hidden">
        <ReduxProvider>
          <Toaster position="top-center" />
          <div className="h-screen bg-[#F2F8FF] flex flex-col">
            <Navigation />
            <div className="flex flex-1 h-[calc(100vh-64px)] relative">
              <Sidebar />
              <main
                className={`flex-1 overflow-y-auto h-full flex justify-center ${prompt.className}`}
              >
                <div className="w-full max-w-6xl pb-4">{children}</div>
              </main>
            </div>
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
