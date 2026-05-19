"use client";

import { useState } from "react";
import { BarChart3, Clock3 } from "lucide-react";

const polls = [
  {
    id: 1,
    question: "Manual or automatic — in a sports car?",
    totalVotes: 6286,
    options: [
      { label: "Automatic — faster lap times", votes: 1886 },
      { label: "PDK / DCT — best of both", votes: 1006 },
      { label: "Manual — always", votes: 3394 },
    ],
  },
  {
    id: 2,
    question: "What’s the greatest JDM engine ever made?",
    totalVotes: 7418,
    options: [
      { label: "2JZ-GTE (Supra)", votes: 3264 },
      { label: "EJ20 (Impreza WRX STI)", votes: 1335 },
      { label: "SR20DET (Silvia)", votes: 964 },
      { label: "RB26DETT (Skyline GT-R)", votes: 1855 },
    ],
  },
  {
    id: 3,
    question: "Best weekend canyon car?",
    totalVotes: 3920,
    options: [
      { label: "Mazda MX-5 Miata", votes: 1411 },
      { label: "Porsche Cayman", votes: 1294 },
      { label: "Toyota GR86", votes: 843 },
      { label: "BMW M2", votes: 372 },
    ],
  },
  {
    id: 4,
    question: "Which mod comes first?",
    totalVotes: 5084,
    options: [
      { label: "Wheels and tires", votes: 2237 },
      { label: "Exhaust", votes: 1373 },
      { label: "Suspension", votes: 1067 },
      { label: "Tune", votes: 407 },
    ],
  },
  {
    id: 5,
    question: "Dream garage pick?",
    totalVotes: 8641,
    options: [
      { label: "Nissan Skyline GT-R", votes: 2765 },
      { label: "Toyota Supra MK4", votes: 3024 },
      { label: "Porsche 911 GT3", votes: 2247 },
      { label: "Honda NSX", votes: 605 },
    ],
  },
];

type PollType = {
  id: number;
  question: string;
  totalVotes: number;
  options: {
    label: string;
    votes: number;
  }[];
};

function PollCard({ poll }: { poll: PollType }) {
  const [selected, setSelected] = useState<number | null>(null);

  const hasVoted = selected !== null;

  const displayedOptions = poll.options.map((option, index) => ({
    ...option,
    votes: option.votes + (selected === index ? 1 : 0),
  }));

  const totalVotes = poll.totalVotes + (hasVoted ? 1 : 0);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#111] p-6 shadow-xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h2 className="max-w-[75%] text-[12px] md:text-lg font-bold md:font-black uppercase tracking-tight text-white">
          {poll.question}
        </h2>

        <div className="flex items-center gap-1 rounded-md bg-orange-950/60 px-3 py-1 text-[8px] md:text-[10px] font-semibold text-orange-500">
          <Clock3 size={14} />
          24h left
        </div>
      </div>

      <div className="space-y-4">
        {displayedOptions.map((option, index) => {
          const percent = Math.round((option.votes / totalVotes) * 100);

          const isSelected = selected === index;

          return (
            <button
              key={option.label}
              disabled={hasVoted}
              onClick={() => setSelected(index)}
              className={`relative w-full overflow-hidden rounded-xl border text-left transition-all duration-300 ${
                isSelected
                  ? "border-orange-500 bg-orange-950/40"
                  : "border-neutral-800 bg-[#151515] hover:border-orange-500/60"
              } ${hasVoted ? "cursor-default" : "cursor-pointer"}`}
            >
              {hasVoted && (
                <div
                  className={`absolute inset-y-0 left-0 ${
                    isSelected ? "bg-orange-600/30" : "bg-neutral-700/40"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              )}

              <div className="relative flex min-h-[60px] items-center justify-between px-5 py-4">
                <span
                  className={`font-bold text-xs md:text-sm ${
                    isSelected ? "text-orange-500" : "text-white"
                  }`}
                >
                  {option.label}
                </span>

                {hasVoted && (
                  <span
                    className={`font-bold ${
                      isSelected ? "text-orange-500" : "text-slate-300"
                    }`}
                  >
                    {percent}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {hasVoted ? (
        <div className="mt-5 text-right text-sm uppercase tracking-[0.2em] text-slate-300">
          {totalVotes.toLocaleString()} votes
        </div>
      ) : (
        <div className="mt-5 text-right text-xs md:text-sm text-slate-500">
          Select an option to reveal results
        </div>
      )}
    </div>
  );
}

export default function PollPage() {
  return (
    <main className="min-h-screen bg-[#070707] px-5 py-10 text-white">
      <div className="mx-auto max-w-xl">
        <header className="mb-10 flex items-center justify-between">
          <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight">
            Community <span className="text-orange-500">Polls</span>
          </h1>

          <div className="rounded-full bg-neutral-900 p-2 md:p-4 text-orange-500">
            <BarChart3 size={20} />
          </div>
        </header>

        <section className="space-y-8">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </section>
      </div>
    </main>
  );
}