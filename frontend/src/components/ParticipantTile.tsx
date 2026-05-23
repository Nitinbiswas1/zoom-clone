"use client";

import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Shield, X, User, Volume2 } from "lucide-react";

interface ParticipantTileProps {
  name: string;
  isHost?: boolean;
  isLocal?: boolean;
  isVideoOff: boolean;
  isMuted: boolean;
  isSpeaking?: boolean;
  stream?: MediaStream | null;
  showControls?: boolean;
  onMuteToggle?: () => void;
  onRemove?: () => void;
}

export default function ParticipantTile({
  name,
  isHost = false,
  isLocal = false,
  isVideoOff,
  isMuted,
  isSpeaking = false,
  stream = null,
  showControls = false,
  onMuteToggle,
  onRemove,
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Bind the media stream to the video tag if available
  useEffect(() => {
    if (videoRef.current) {
      if (stream && !isVideoOff) {
        videoRef.current.srcObject = stream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [stream, isVideoOff]);

  // Extract initials (e.g., "Nitin Biswas" -> "NB")
  const getInitials = (fullName: string) => {
    const parts = fullName.split(" ");
    const first = parts[0] ? parts[0][0] : "";
    const last = parts[1] ? parts[1][0] : "";
    return (first + last).toUpperCase() || "P";
  };

  return (
    <div
      className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-[#161618] border transition-all duration-300 flex items-center justify-center group shadow-lg ${
        isSpeaking
          ? "border-emerald-500 ring-2 ring-emerald-500/40 shadow-emerald-500/10 scale-[1.01]"
          : "border-slate-800/80 hover:border-slate-700/80"
      }`}
    >
      {/* 1. Live Video Stream / Simulated Video Feed */}
      {!isVideoOff && (stream || isLocal) ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video playback to prevent echo
          className="w-full h-full object-cover scale-x-[-1]" // Mirror local/webcam view for intuitive use
        />
      ) : !isVideoOff ? (
        /* Remote simulated active camera feed placeholder */
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1E2125] to-[#121417] flex items-center justify-center overflow-hidden">
          {/* Subtle live signal graphics */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,114,237,0.05),transparent)] animate-pulse" />
          <div className="text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
              <User className="w-8 h-8 animate-pulse text-[#0E72ED]" />
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Simulating video stream...
            </span>
          </div>
        </div>
      ) : null}

      {/* 2. Camera Off Avatar Placeholder */}
      {isVideoOff && (
        <div className="absolute inset-0 w-full h-full bg-[#1e2022] flex items-center justify-center select-none">
          <div className="relative">
            {/* Speaking active outer wave pulse */}
            {isSpeaking && (
              <div className="absolute inset-[-10px] rounded-full bg-emerald-500/20 animate-ping" />
            )}
            
            {/* Color Avatar Badge */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#2D3035] to-[#1A1D21] border border-slate-700/50 flex items-center justify-center text-white text-xl md:text-2xl font-extrabold shadow-xl">
              {getInitials(name)}
            </div>
          </div>
        </div>
      )}

      {/* 3. Bottom Overlay: Participant Metadata pill */}
      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 bg-[#161618]/75 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-800/80 text-[10px] sm:text-xs font-bold text-white shadow-md">
        {isHost && (
          <span title="Meeting Host">
            <Shield className="w-3.5 h-3.5 text-amber-500 fill-current" />
          </span>
        )}
        
        <span>
          {name} {isLocal ? "(Me)" : ""}
        </span>

        {/* Audio status indicator inside name tag */}
        {isMuted ? (
          <MicOff className="w-3.5 h-3.5 text-rose-500 ml-1 flex-shrink-0" />
        ) : (
          <Mic className={`w-3.5 h-3.5 ml-1 flex-shrink-0 ${isSpeaking ? "text-emerald-400" : "text-slate-400"}`} />
        )}
      </div>

      {/* 4. Speaking active mic bubble */}
      {isSpeaking && !isMuted && (
        <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-white p-1 rounded-full shadow-lg shadow-emerald-500/25">
          <Volume2 className="w-3.5 h-3.5" />
        </div>
      )}

      {/* 5. Hover Actions Overlay (Host Controls) */}
      {showControls && (
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center gap-3 z-20">
          {/* Mute/Unmute host toggle */}
          <button
            onClick={onMuteToggle}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none shadow-md ${
              isMuted
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-rose-600 hover:bg-rose-500 text-white"
            }`}
          >
            {isMuted ? "Unmute" : "Mute"}
          </button>

          {/* Remove participant host toggle */}
          {onRemove && (
            <button
              onClick={onRemove}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-all duration-200 focus:outline-none shadow-md flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  );
}
