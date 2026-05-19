"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    MessageSquare,
    PlusSquare,
    BarChart3,
    Car,
} from "lucide-react";

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        {
            href: "/feed",
            label: "FEED",
            icon: Home,
        },
        {
            href: "/disscusions",
            label: "DISCUSSIONS",
            icon: MessageSquare,
        },
        {
            href: "/upload",
            label: "UPLOAD",
            icon: PlusSquare,
        },
        {
            href: "/polls",
            label: "POLLS",
            icon: BarChart3,
        },
        {
            href: "/garage",
            label: "GARAGE",
            icon: Car,
        },
        {
            href:"/reels",
            label: "REELS",
            icon: Home,
        }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-[#0b0b0b] border-t border-zinc-900 flex items-center justify-center">
            <div className="flex gap-3 md:gap-14">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center ${
                                active ? "text-orange-600" : "text-zinc-500"
                            }`}
                        >
                            <Icon />
                            <span className="text-[8px] md:text-[10px] mt-1">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}