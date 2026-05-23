"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Calendar, Clock, Type, AlignLeft, Loader2, Video } from "lucide-react";

import { scheduleMeeting } from "../../services/api";

export default function ScheduleMeetingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [duration, setDuration] = useState(30); // Default 30 mins
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a meeting title.");
      return;
    }
    if (!scheduledTime) {
      toast.error("Please choose a date and time.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Submit scheduled meeting details to backend SQLite
      await scheduleMeeting({
        title: title.trim(),
        description: description.trim() || null,
        scheduled_time: new Date(scheduledTime).toISOString(),
        duration: Number(duration),
        created_by: "Nitin Biswas (Host)",
      });

      toast.success("Meeting scheduled successfully!");

      // 2. Redirect to the homepage dashboard
      setTimeout(() => {
        router.push("/");
      }, 1000);

    } catch (err: any) {
      console.error("Failed to schedule meeting:", err);
      toast.error("Failed to schedule meeting. Verify backend connection.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#161618] text-white flex flex-col justify-between font-sans relative">
      <Toaster position="top-right" />

      {/* Header with Navigation Back button */}
      <header className="p-4 md:p-6 w-full flex items-center justify-start absolute top-0 left-0 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-200 bg-[#1A1D21] border border-slate-800 px-3.5 py-2 rounded-xl focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </header>

      {/* Main Form Center Layout */}
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-lg bg-[#1A1D21] border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative">
          
          {/* Roster Header */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="bg-[#0E72ED] text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-[#0E72ED]/20">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-3">
              Schedule a Meeting
            </h2>
            <p className="text-xs text-slate-400 max-w-[320px]">
              Set up details for your next session. It will instantly show up on your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Input 1: Title */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Meeting Topic / Title
              </label>
              <div className="relative flex items-center">
                <Type className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Weekly Standup / Design Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#222326] border border-slate-850 focus:border-[#0E72ED] text-sm text-white placeholder-slate-550 focus:outline-none transition-all duration-200 font-medium"
                />
              </div>
            </div>

            {/* Input 2: Description */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Description / Agenda <span className="text-[10px] text-slate-550 capitalize">(Optional)</span>
              </label>
              <div className="relative flex items-start">
                <AlignLeft className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <textarea
                  id="description"
                  rows={2}
                  placeholder="Introduce agendas or session summaries..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#222326] border border-slate-850 focus:border-[#0E72ED] text-sm text-white placeholder-slate-550 focus:outline-none transition-all duration-200 font-medium resize-none"
                />
              </div>
            </div>

            {/* Row Layout for Time and Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Input 3: Date & Time */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="scheduledTime" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Date and Time
                </label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3.5 w-4 h-4 text-slate-500 z-10 pointer-events-none" />
                  <input
                    id="scheduledTime"
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#222326] border border-slate-850 focus:border-[#0E72ED] text-sm text-white focus:outline-none transition-all duration-200 font-medium z-0"
                  />
                </div>
              </div>

              {/* Input 4: Duration Selector */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="duration" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Duration
                </label>
                <div className="relative flex items-center">
                  <Clock className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#222326] border border-slate-850 focus:border-[#0E72ED] text-sm text-white focus:outline-none transition-all duration-200 font-medium appearance-none cursor-pointer"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Action trigger button */}
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !scheduledTime}
              className="w-full py-3 mt-4 rounded-xl bg-[#0E72ED] hover:bg-[#1a7ffd] disabled:bg-[#1F2E40] disabled:text-slate-500 text-white font-bold text-sm shadow-lg shadow-[#0E72ED]/10 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 fill-current" />
                  Schedule Meeting
                </>
              )}
            </button>

          </form>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-[10px] text-slate-650">
        Zoom Clone Platform • Google Deepmind Team Assignment
      </footer>
    </div>
  );
}
