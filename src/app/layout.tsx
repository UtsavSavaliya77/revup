"use client";

import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import AppHeader from "@/component/AppHeader";
import BottomNav from "@/component/BottomNav";
import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";
import PageMusic from "@/component/PageMusic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);

  const hideLayout =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/reels";

  const hideLayout1 =
    pathname === "/login" ||
    pathname === "/signup";

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
    
      const isBlockedPage =
        pathname === "/login" ||
        pathname === "/signup" ||
        pathname === "/reels";
    
      const playAudio = () => {
        if (!document.hidden && !isBlockedPage) {
          audio.volume = 0.1;
          audio.play().catch(() => {});
        }
      };
    
      const pauseAudio = () => {
        audio.pause();
      };
    
      if (isBlockedPage) {
        pauseAudio();
        audio.currentTime = 0;
        return;
      }
    
      playAudio();
    
      const handleVisibility = () => {
        if (document.hidden) {
          pauseAudio();
        } else {
          playAudio();
        }
      };
    
      const handleReelsOpen = () => {
        pauseAudio();
      };
    
      const handleReelsClose = () => {
        playAudio();
      };
    
      document.addEventListener("visibilitychange", handleVisibility);
      window.addEventListener("blur", pauseAudio);
      window.addEventListener("focus", playAudio);
      window.addEventListener("reels-open", handleReelsOpen);
      window.addEventListener("reels-close", handleReelsClose);
    
      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
        window.removeEventListener("blur", pauseAudio);
        window.removeEventListener("focus", playAudio);
        window.removeEventListener("reels-open", handleReelsOpen);
        window.removeEventListener("reels-close", handleReelsClose);
      };
    }, [pathname]);

  return (
    <html lang="en">
      <body className="bg-[#050505] text-white">
        <UserProvider>
          {!hideLayout && <AppHeader />}

          <main
            className={
              hideLayout
                ? "min-h-screen"
                : "pt-15 pb-20 min-h-screen"
            }
          >
            {children}
          </main>

          {!hideLayout1 && <BottomNav />}
          {/* <PageMusic/> */}
          <audio ref={audioRef} loop>
            <source src="/audio/audio1.mp3" type="audio/mpeg" />
          </audio>
        </UserProvider>
      </body>
    </html>
  );
}