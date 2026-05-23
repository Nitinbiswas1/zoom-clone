"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Video, Settings, Bell, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Update time and date in real-time
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      
      // Format: 10:42 AM
      setCurrentTime(
        now.toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit", 
          hour12: true 
        })
      );
      
      // Format: Fri, May 22
      setCurrentDate(
        now.toLocaleDateString([], { 
          weekday: "short", 
          month: "short", 
          day: "numeric" 
        })
      );
    };

    updateTimeAndDate();
    const timer = setInterval(updateTimeAndDate, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#161618]/95 backdrop-blur-md border-b border-[#2D2D30] px-4 md:px-8 py-3 flex items-center justify-between text-white transition-all duration-300">
      {/* Left Area: Brand Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="bg-[#0E72ED] text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-[#0E72ED]/25 group-hover:scale-105 group-hover:bg-[#1a7ffd] transition-all duration-300">
            <Video className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            zoom
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#2A2B2F] text-slate-400 font-medium border border-slate-700/50 hidden sm:inline-block">
            Clone
          </span>
        </Link>
      </div>

      {/* Middle Area: Desktop Live Status / Clock */}
      <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400 bg-[#222326] py-1.5 px-4 rounded-full border border-slate-800 shadow-inner">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </span>
        <span className="w-px h-3 bg-slate-700" />
        <span className="text-slate-300">{currentTime}</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-300">{currentDate}</span>
      </div>

      {/* Right Area: Utility Actions & Avatar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live Clock for Mobile */}
        <div className="flex md:hidden flex-col items-end text-[10px] sm:text-xs text-slate-400 mr-2">
          <span className="font-bold text-white">{currentTime}</span>
          <span>{currentDate}</span>
        </div>

        {/* Notifications Icon */}
        <button 
          className="relative p-2 rounded-lg bg-transparent text-slate-400 hover:text-white hover:bg-[#2A2B2F] transition-all duration-200 focus:outline-none"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#0E72ED] border-2 border-[#161618]" />
        </button>

        {/* Settings Icon */}
        <button 
          className="p-2 rounded-lg bg-transparent text-slate-400 hover:text-white hover:bg-[#2A2B2F] transition-all duration-200 focus:outline-none"
          title="Settings"
        >
          <Settings className="w-5 h-5 hover:rotate-45 transition-transform duration-500" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[#2D2D30]" />

        {/* User Profile Avatar */}
        <button className="flex items-center gap-2 group p-1 pr-2 rounded-xl hover:bg-[#2A2B2F] transition-all duration-200 focus:outline-none">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#0E72ED] to-[#0A58B7] text-white font-semibold flex items-center justify-center shadow-inner hover:brightness-110 transition-all duration-200">
            NB
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#161618]" />
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors duration-200 hidden sm:block" />
        </button>
      </div>
    </nav>
  );
}
