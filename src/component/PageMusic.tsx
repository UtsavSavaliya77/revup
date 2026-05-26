"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const pageSongs: Record<string, string> = {
  "/feed": "/audio/a.mp3",
  "/garage": "/audio/b.mp3",
  "/upload": "/audio/c.mp3",
  "/profile": "/audio/a.mp3",
  "/disscusions": "/audio/b.mp3",
  "/polls": "/audio/c.mp3",
};

export default function PageMusic() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const song = pageSongs[pathname];

    if (!audio) return;

    if (!song) {
      audio.pause();
      audio.src = "";
      return;
    }

    audio.pause();
    audio.src = song;
    // audio.volume = 0.3;
    audio.load();
    audio.play().catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = () => {
      if (!document.hidden && pageSongs[pathname]) {
        audio.play().catch(() => {});
      }
    };

    const pauseAudio = () => {
      audio.pause();
    };

    const handleVisibilityChange = () => {
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

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", pauseAudio);
    window.addEventListener("focus", playAudio);
    window.addEventListener("reels-open", handleReelsOpen);
    window.addEventListener("reels-close", handleReelsClose);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", pauseAudio);
      window.removeEventListener("focus", playAudio);
      window.removeEventListener("reels-open", handleReelsOpen);
      window.removeEventListener("reels-close", handleReelsClose);
    };
  }, [pathname]);

  return <audio ref={audioRef} loop />;
}