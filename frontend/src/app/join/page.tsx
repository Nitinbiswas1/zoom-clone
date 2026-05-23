"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Video, Keyboard, User, Loader2, Volume2, VideoOff } from "lucide-react";

import { joinMeeting, saveRecentMeeting } from "../../services/api";

export default function JoinMeetingPage() {
  const router = useRouter();
  const [meetingId, setMeetingId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  
  // High-fidelity Zoom meeting preferences
  const [disableAudio, setDisableAudio] = useState(false);
  const [disableVideo, setDisableVideo] = useState(false);

  // Load saved display name on mount
  useEffect(() => {
    const savedName = localStorage.getItem("zoom_display_name");
    if (savedName) {
      setDisplayName(savedName);
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingId.trim() || !displayName.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setIsJoining(true);
    // Format meeting ID by trimming spaces
    const cleanId = meetingId.trim();

    try {
      // 1. Validate that the meeting exists in the database
      const mtgDetails = await joinMeeting(cleanId);
      
      // 2. Save display name and hardware preferences to localStorage for the meeting room
      localStorage.setItem("zoom_display_name", displayName.trim());
      localStorage.setItem("zoom_pref_audio_disabled", disableAudio ? "true" : "false");
      localStorage.setItem("zoom_pref_video_disabled", disableVideo ? "true" : "false");

      // 3. Log the participant into the backend SQLite's recent_meetings table
      await saveRecentMeeting({
        meeting_id: cleanId,
        participant_name: displayName.trim(),
      });

      toast.success("Meeting validated! Joining...");

      // 4. Redirect the client to the meeting room
      setTimeout(() => {
        router.push(`/meeting/${cleanId}`);
      }, 800);
      
    } catch (err: any) {
      console.error("Failed to join meeting:", err);
      if (err.response && err.response.status === 404) {
        toast.error("Invalid Meeting ID. The meeting does not exist.");
      } else {
        toast.error("Failed to validate meeting. Please check if backend is running.");
      }
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#161618] text-white flex flex-col justify-between font-sans relative">
      <Toaster position="top-right" />

      {/* Top Left Navigation: Back button */}
      <header className="p-4 md:p-6 w-full flex items-center justify-start absolute top-0 left-0 z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-200 bg-[#1A1D21] border border-slate-800 px-3.5 py-2 rounded-xl focus:outline-none"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      {/* Center Box: Join Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md bg-[#1A1D21] border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative">
          
          {/* Header Identity */}
          <div className="flex flex-col items-center text-center gap-2">
            <div className="bg-[#0E72ED] text-white p-3 rounded-2xl flex items-center justify-center shadow-lg shadow-[#0E72ED]/25">
              <Video className="w-6 h-6 fill-current" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-3">
              Join a Meeting
            </h2>
            <p className="text-xs text-slate-400 max-w-[280px]">
              Enter the 10-digit meeting ID and your display name to connect.
            </p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            
            {/* Input 1: Meeting ID */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="meetingId" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Meeting ID or Personal Link
              </label>
              <div className="relative flex items-center">
                <Keyboard className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  id="meetingId"
                  type="text"
                  placeholder="Enter 10-digit ID (e.g. 123-456-7890)"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  disabled={isJoining}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#222326] border border-slate-850 focus:border-[#0E72ED] text-sm text-white placeholder-slate-550 focus:outline-none transition-all duration-200 font-medium"
                />
              </div>
            </div>

            {/* Input 2: Display Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="displayName" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Your Display Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-slate-500" />
                <input
                  id="displayName"
                  type="text"
                  placeholder="Enter your screen name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isJoining}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#222326] border border-slate-850 focus:border-[#0E72ED] text-sm text-white placeholder-slate-550 focus:outline-none transition-all duration-200 font-medium"
                />
              </div>
            </div>

            {/* Hardware Preference Toggles (Classic Zoom Client style checkboxes) */}
            <div className="flex flex-col gap-3.5 border-t border-slate-800/80 pt-4 mt-2">
              <label className="flex items-center gap-3 group cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={disableAudio}
                  onChange={() => setDisableAudio(!disableAudio)}
                  disabled={isJoining}
                  className="rounded-md border-slate-800 bg-[#222326] text-[#0E72ED] focus:ring-[#0E72ED] w-4.5 h-4.5 transition-all duration-150"
                />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                  Don't connect to audio
                </span>
              </label>

              <label className="flex items-center gap-3 group cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={disableVideo}
                  onChange={() => setDisableVideo(!disableVideo)}
                  disabled={isJoining}
                  className="rounded-md border-slate-800 bg-[#222326] text-[#0E72ED] focus:ring-[#0E72ED] w-4.5 h-4.5 transition-all duration-150"
                />
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors duration-150 flex items-center gap-1.5">
                  <VideoOff className="w-3.5 h-3.5 text-slate-400" />
                  Turn off my video
                </span>
              </label>
            </div>

            {/* Action Trigger */}
            <button
              type="submit"
              disabled={isJoining || !meetingId.trim() || !displayName.trim()}
              className="w-full py-3 mt-4 rounded-xl bg-[#0E72ED] hover:bg-[#1a7ffd] disabled:bg-[#1F2E40] disabled:text-slate-500 text-white font-bold text-sm shadow-lg shadow-[#0E72ED]/10 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Join"
              )}
            </button>

          </form>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-[10px] text-slate-650">
        Zoom Clone Platform • Google Deepmind Team Assignment
      </footer>
    </div>
  );
}
