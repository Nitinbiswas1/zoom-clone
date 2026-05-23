"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Video, Plus, Calendar, Loader2 } from "lucide-react";

interface ActionCardsProps {
  onNewMeeting: () => Promise<void>;
  isCreatingInstant: boolean;
}

export default function ActionCards({ onNewMeeting, isCreatingInstant }: ActionCardsProps) {
  const router = useRouter();

  const cards = [
    {
      title: "New Meeting",
      description: "Start an instant meeting",
      icon: isCreatingInstant ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <Video className="w-8 h-8 fill-current" />
      ),
      colorClass: "bg-[#FF742E] hover:bg-[#ff8647] shadow-[#FF742E]/25",
      onClick: onNewMeeting,
      disabled: isCreatingInstant,
    },
    {
      title: "Join Meeting",
      description: "Join via meeting ID or link",
      icon: <Plus className="w-8 h-8" />,
      colorClass: "bg-[#0E72ED] hover:bg-[#1a7ffd] shadow-[#0E72ED]/25",
      onClick: () => router.push("/join"),
      disabled: isCreatingInstant,
    },
    {
      title: "Schedule",
      description: "Plan a future meeting",
      icon: <Calendar className="w-8 h-8" />,
      colorClass: "bg-[#0E72ED] hover:bg-[#1a7ffd] shadow-[#0E72ED]/25",
      onClick: () => router.push("/schedule"),
      disabled: isCreatingInstant,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
      {cards.map((card, idx) => (
        <button
          key={idx}
          onClick={card.onClick}
          disabled={card.disabled}
          className={`flex flex-col items-start p-6 rounded-3xl bg-[#1A1D21] border border-slate-800 text-left transition-all duration-300 transform hover:-translate-y-1.5 hover:border-slate-700/80 hover:bg-[#202327] group focus:outline-none ${
            card.disabled ? "opacity-60 cursor-not-allowed select-none" : "cursor-pointer"
          }`}
        >
          {/* Icon Container */}
          <div
            className={`p-4 rounded-2xl text-white ${card.colorClass} shadow-lg transition-transform duration-300 group-hover:scale-110 flex items-center justify-center`}
          >
            {card.icon}
          </div>

          {/* Text Details */}
          <h3 className="text-lg font-bold text-white mt-6 mb-1 tracking-tight group-hover:text-[#0E72ED] transition-colors duration-200">
            {card.title}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed font-normal">
            {card.description}
          </p>
        </button>
      ))}
    </div>
  );
}
