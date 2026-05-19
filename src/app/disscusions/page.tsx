"use client";
import {
  MessageSquare,
  Flame,
  Clock,
} from "lucide-react";

const categories = [
  {
    title: "SUPERCARS",
    threads: 284,
    image:
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1200",
  },
  {
    title: "MODS",
    threads: 531,
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1200",
  },
  {
    title: "TRACK DAYS",
    threads: 167,
    image:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1200",
  },
  {
    title: "EV",
    threads: 93,
    image:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=1200",
  },
];

const threads = [
  {
    title: "WHICH ENGINE IS MORE ICONIC — RB26 OR 2JZ?",
    user: "@SpeedKing",
    category: "Supercars",
    comments: 234,
    time: "2h",
    hot: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=speed",
  },
  {
    title: "BEST BUDGET COILOVERS UNDER $800 FOR DAILY DRIVING?",
    user: "@GarageGuru",
    category: "Mods",
    comments: 87,
    time: "2h",
    hot: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=garage",
  },
  {
    title: "LAGUNA SECA TRACK DAY — WHO'S IN FOR JULY?",
    user: "@RaceQueen",
    category: "Track Days",
    comments: 45,
    time: "2h",
    hot: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=race",
  },
  {
    title: "PORSCHE TAYCAN VS MODEL S PLAID — REAL WORLD RANGE TEST",
    user: "@EVHunter",
    category: "EV",
    comments: 102,
    time: "4h",
    hot: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ev",
  },
];

export default function DiscussionsPage() {
  return (
    <main className="bg-black">
        <div className="min-h-screen bg-black text-white pb-28 px-5 pt-6 md:max-w-[70%] lg:max-w-[50%] mx-auto">
      <h1 className="text-2xl md:text-3xl font-black md:leading-[60px] mb-6">
        GARAGE <span className="text-orange-600">TALK</span>
      </h1>

      {/* Categories */}
      <section className="grid grid-cols-2 gap-4 mb-8">
        {categories.map((item) => (
          <button
            key={item.title}
            className="relative h-[120px] rounded-2xl overflow-hidden bg-zinc-900 text-left"
          >
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover opacity-45"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

            <div className="absolute left-4 bottom-4">
              <h2 className="text-sm md:text-xl font-bold">{item.title}</h2>
              <p className="text-orange-600 text-xs md:text-sm font-bold">
                {item.threads} threads
              </p>
            </div>
          </button>
        ))}
      </section>

      {/* Header */}
      <section className="flex items-center justify-between mb-5">
        <h2 className="text-sm md:text-xl font-black text-zinc-400 tracking-wide">
          ACTIVE THREADS
        </h2>

        <div className="flex gap-2">
          <button className="p-1 md:px-4 md:py-2 rounded-md bg-orange-600/30 text-orange-600 text-[10px] md:text-xs font-black">
            HOT
          </button>
          <button className="p-1 md:px-4 md:py-2 rounded-md bg-zinc-800 text-zinc-400 text-[10px] md:text-xs font-black">
            NEW
          </button>
        </div>
      </section>

      {/* Threads */}
      <section className="space-y-4">
        {threads.map((thread) => (
          <div
            key={thread.title}
            className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5"
          >
            <div className="flex justify-between gap-4">
              <h3 className="font-black text-[10px] md:text-base">
                {thread.title}
              </h3>

              {thread.hot && (
                <Flame className="text-orange-600 fill-orange-600" size={20} />
              )}
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <img
                  src={thread.avatar}
                  alt={thread.user}
                  className="md:w-8 md:h-8 w-4 h-4 rounded-full"
                />

                <p className="text-[10px] md:text-sm text-zinc-400 truncate">
                  {thread.user}
                </p>

                <span className="text-zinc-600">·</span>

                <p className="text-[10px] md:text-sm text-orange-600 font-bold truncate">
                  {thread.category}
                </p>
              </div>

              <div className="flex items-center gap-2 text-zinc-400 text-[10px] md:text-sm">
                <span className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  {thread.comments}
                </span>

                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {thread.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </section>
      </div>
    </main>
  );
}