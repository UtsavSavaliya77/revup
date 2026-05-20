"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

export default function AppHeader() {
  const { user } = useUser();

  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [username, setUsername] = useState<string>(user?.username || "user");

  const loadProfile = async () => {
    try {
      const res = await fetch("/api/profile", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data?.profile) {
        setAvatar(data.profile.avatar || null);
        setUsername(data.profile.username || "user");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadProfile();

    const handleProfileUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        avatar?: string | null;
        username?: string;
      }>;
    
      if (customEvent.detail) {
        setAvatar(customEvent.detail.avatar || null);
        setUsername(customEvent.detail.username || "user");
        return;
      }
    
      loadProfile();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    setAvatar(user?.avatar || null);
    setUsername(user?.username || "user");
  }, [user]);

  const profileImage =
    avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || "user"}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505] border-b border-zinc-900">
      <div className="h-16 flex items-center justify-center relative">
        <h1 className="text-2xl font-black tracking-widest">
          REV<span className="text-orange-600">UP</span>
        </h1>

        <Link href="/profile" className="absolute right-5">
          <img
            src={profileImage}
            alt="profile"
            className="w-11 h-11 rounded-full object-cover border-2 border-orange-600"
          />
        </Link>
      </div>

      <div className="h-36 hidden items-center justify-center border-t border-zinc-900">
        <div className="relative w-32 h-16">
          <div className="absolute inset-0 rounded-t-full border-[14px] border-zinc-800 border-b-0" />

          <div
            className="absolute inset-0 rounded-t-full border-[14px] border-orange-600 border-b-0"
            style={{
              clipPath: "polygon(0 0, 150% 0, 70% 70%, 0 110%)",
            }}
          />

          <div
            className="absolute left-1/2 bottom-1 w-15 h-1 bg-white origin-left rounded-full shadow-[0_0_12px_white]"
            style={{
              transform: "rotate(-25deg)",
            }}
          />

          <div className="absolute bottom-[-5px] left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-[#050505] bg-orange-600" />

          <div className="absolute bottom-[-21px] left-1/2 -translate-x-1/2 text-center">
            <p className="text-xs text-zinc-400 tracking-widest">
              <span className="text-2xl font-black text-orange-600 leading-none">
                84
              </span>
              LIVE
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}