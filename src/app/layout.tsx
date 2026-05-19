"use client";

import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import AppHeader from "@/component/AppHeader";
import BottomNav from "@/component/BottomNav";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideLayout =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/reels";

  const hideLayout1 =
    pathname === "/login" ||
    pathname === "/signup";
 
  return (
    <html lang="en">
      <body className="bg-[#050505] text-white">
        <UserProvider>
          {!hideLayout && <AppHeader />}

          <main className={hideLayout ? "min-h-screen" : "pt-15 pb-20 min-h-screen"}>
            {children}
          </main>

          {!hideLayout1 && <BottomNav />}
        </UserProvider>
      </body>
    </html>
  );
}