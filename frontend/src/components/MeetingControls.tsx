"use client";

import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  MessageSquare,
  Share2,
  ChevronUp,
  LogOut,
  Shield,
  Disc,
} from "lucide-react";

interface MeetingControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  onMuteToggle: () => void;
  onVideoToggle: () => void;
  participantCount: number;
  showParticipants: boolean;
  onParticipantsToggle: () => void;
  showChat: boolean;
  onChatToggle: () => void;
  isSharingScreen?: boolean;
  onShareScreenToggle?: () => void;
  onLeave: () => void;
  isHost?: boolean;
  onMuteAll?: () => void;
}

export default function MeetingControls({
  isMuted,
  isVideoOff,
  onMuteToggle,
  onVideoToggle,
  participantCount,
  showParticipants,
  onParticipantsToggle,
  showChat,
  onChatToggle,
  isSharingScreen = false,
  onShareScreenToggle,
  onLeave,
  isHost = false,
  onMuteAll,
}: MeetingControlsProps) {
  return (
    <div className="w-full bg-[#1C1C1E] border-t border-[#2D2D30] px-2 sm:px-4 py-2 sm:py-3 md:py-4 flex items-center justify-between gap-2 overflow-x-auto text-white select-none relative z-50">
      
      {/* Left Group: Audio & Video Triggers (with Caret Menus) */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-1 sm:flex-initial">
        
        {/* Mute Button */}
        <div className="flex items-center group">
          <button
            onClick={onMuteToggle}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg hover:bg-[#2A2B2F] active:scale-95 transition-all duration-200 focus:outline-none ${
              isMuted ? "text-rose-500" : "text-slate-300 hover:text-white"
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            <span className="text-[9px] font-bold mt-1 hidden sm:inline">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>
          
          <button 
            className="h-12 px-1 rounded-r-lg hover:bg-[#2A2B2F] text-slate-500 hover:text-white transition-colors duration-150 focus:outline-none hidden xs:block"
            title="Audio Settings"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>

        {/* Video Button */}
        <div className="flex items-center group">
          <button
            onClick={onVideoToggle}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-lg hover:bg-[#2A2B2F] active:scale-95 transition-all duration-200 focus:outline-none ${
              isVideoOff ? "text-rose-500" : "text-slate-300 hover:text-white"
            }`}
            title={isVideoOff ? "Start Camera" : "Stop Camera"}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <Video className="w-5 h-5 fill-current" />
            )}
            <span className="text-[9px] font-bold mt-1 hidden sm:inline">
              {isVideoOff ? "Start Video" : "Stop Video"}
            </span>
          </button>
          
          <button 
            className="h-12 px-1 rounded-r-lg hover:bg-[#2A2B2F] text-slate-500 hover:text-white transition-colors duration-150 focus:outline-none hidden xs:block"
            title="Video Settings"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>

        {/* Mute All shortcut for Host on mobile/tablet */}
        {isHost && onMuteAll && (
          <button
            onClick={onMuteAll}
            className="hidden md:flex flex-col items-center justify-center w-14 h-12 rounded-lg hover:bg-rose-950/30 border border-rose-900/30 text-rose-400 hover:text-rose-300 transition-all duration-150 focus:outline-none"
            title="Mute Everyone"
          >
            <MicOff className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-1">Mute All</span>
          </button>
        )}

      </div>

      {/* Middle Group: Collaboration and Meeting Panels */}
      <div className="flex items-center gap-1 sm:gap-3 justify-center">
        
        {/* Security badge (Classic Zoom item) */}
        <button
          className="hidden md:flex flex-col items-center justify-center w-16 h-12 rounded-lg text-slate-300 hover:text-white hover:bg-[#2A2B2F] transition-all duration-150 focus:outline-none"
          title="Meeting Security"
        >
          <Shield className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1">Security</span>
        </button>

        {/* Participants Panel Button */}
        <button
          onClick={onParticipantsToggle}
          className={`relative flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-all duration-200 focus:outline-none ${
            showParticipants
              ? "bg-[#0E72ED] text-white"
              : "text-slate-300 hover:text-white hover:bg-[#2A2B2F]"
          }`}
          title="Toggle Participants Panel"
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1 hidden xs:inline">Participants</span>
          
          {/* Real-time participant counter badge */}
          <span className="absolute top-1 right-2.5 bg-[#FF742E] text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow">
            {participantCount}
          </span>
        </button>

        {/* Chat Panel Button */}
        <button
          onClick={onChatToggle}
          className={`relative flex flex-col items-center justify-center w-16 h-12 rounded-lg transition-all duration-200 focus:outline-none ${
            showChat
              ? "bg-[#0E72ED] text-white"
              : "text-slate-300 hover:text-white hover:bg-[#2A2B2F]"
          }`}
          title="Toggle Chat Panel"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1 hidden xs:inline">Chat</span>
        </button>

        {/* Share Screen Button (Zoom Signature Green Card) */}
        <button
          onClick={onShareScreenToggle}
          className={`flex flex-col items-center justify-center w-16 h-12 rounded-lg border transition-all duration-200 focus:outline-none ${
            isSharingScreen
              ? "bg-emerald-600 border-emerald-500 text-white"
              : "border-emerald-500/40 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20 active:scale-95"
          }`}
          title="Share Screen"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-1 hidden sm:inline">
            {isSharingScreen ? "Sharing" : "Share"}
          </span>
        </button>

        {/* Record Shortcut (Classic Zoom item) */}
        <button
          className="hidden sm:flex flex-col items-center justify-center w-16 h-12 rounded-lg text-slate-300 hover:text-white hover:bg-[#2A2B2F] transition-all duration-150 focus:outline-none"
          title="Record Meeting"
        >
          <Disc className="w-5 h-5 text-rose-500" />
          <span className="text-[9px] font-bold mt-1">Record</span>
        </button>

      </div>

      {/* Right Group: Exit Trigger */}
      <div className="flex items-center flex-1 sm:flex-initial justify-end">
        
        {/* RED Exit/Leave/End Trigger */}
        <button
          onClick={onLeave}
          className="px-4 py-2 rounded-xl bg-[#E02828] hover:bg-[#F23B3B] text-white text-xs font-black shadow shadow-red-950 active:scale-95 transition-all duration-150 focus:outline-none flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5 fill-current" />
          <span>{isHost ? "End" : "Leave"}</span>
        </button>

      </div>

    </div>
  );
}
