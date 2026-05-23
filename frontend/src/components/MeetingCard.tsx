"use client";

import React, { useState } from "react";
import { Calendar, Clock, Copy, Check, Video } from "lucide-react";

interface MeetingCardProps {
  title: string;
  meetingId: string;
  scheduledTime?: string | null;
  duration?: number | null;
  onJoin: () => void;
}

export default function MeetingCard({
  title,
  meetingId,
  scheduledTime,
  duration,
  onJoin,
}: MeetingCardProps) {
  const [copied, setCopied] = useState(false);

  // Parse date and time if available
  let month = "MTG";
  let day = "--";
  let formattedTime = "Not Scheduled";
  let formattedDate = "";

  if (scheduledTime) {
    try {
      const dateObj = new Date(scheduledTime);
      if (!isNaN(dateObj.getTime())) {
        month = dateObj.toLocaleDateString([], { month: "short" }).toUpperCase();
        day = dateObj.toLocaleDateString([], { day: "numeric" });
        
        // Format: Friday, May 22 at 3:30 PM
        formattedDate = dateObj.toLocaleDateString([], {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        formattedTime = dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch (e) {
      console.error("Error parsing scheduledTime:", e);
    }
  }

  // Copy shareable meeting link to clipboard
  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering any card click handlers
    const shareableUrl = `${window.location.origin}/meeting/${meetingId}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-[#1A1D21] border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 hover:bg-[#1E2125] gap-4">
      {/* Left: Calendar Badge & Meeting details */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Calendar Badge */}
        {scheduledTime ? (
          <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-[#2A2B2F] border border-slate-700/50 overflow-hidden shadow-md flex-shrink-0">
            <div className="w-full bg-[#0E72ED] text-[10px] font-bold text-center py-0.5 text-white tracking-wider">
              {month}
            </div>
            <div className="text-lg font-extrabold text-white leading-none py-1.5">
              {day}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-[#2A2B2F] border border-slate-700/50 text-[#FF742E] shadow-md flex-shrink-0">
            <Video className="w-6 h-6 fill-current" />
          </div>
        )}

        {/* Meeting Information */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-white truncate leading-snug tracking-tight mb-1">
            {title}
          </h4>
          
          {/* Metadata Subgrid */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 bg-[#222326] px-2 py-0.5 rounded border border-slate-800">
              ID: {meetingId}
            </span>
            
            {scheduledTime && (
              <>
                <span className="text-slate-500">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#0E72ED]" />
                  {formattedDate}, {formattedTime}
                </span>
              </>
            )}

            {duration && (
              <>
                <span className="text-slate-500">•</span>
                <span className="bg-[#2D2D30]/30 px-2 py-0.5 rounded text-slate-300">
                  {duration} mins
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t border-slate-800/50 sm:border-t-0 pt-3 sm:pt-0">
        {/* Copy Invite Link */}
        <button
          onClick={handleCopyLink}
          className={`p-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-[#2A2B2F] hover:border-slate-700 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 text-xs font-semibold focus:outline-none`}
          title="Copy Invitation Link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 animate-scale" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        {/* Join button */}
        <button
          onClick={onJoin}
          className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#0E72ED] hover:bg-[#1a7ffd] text-white text-xs font-bold shadow-md shadow-[#0E72ED]/20 hover:shadow-[#0E72ED]/30 transition-all duration-200 active:scale-98 flex items-center justify-center gap-1.5 focus:outline-none"
        >
          <Video className="w-4 h-4 fill-current" />
          Join
        </button>
      </div>
    </div>
  );
}
