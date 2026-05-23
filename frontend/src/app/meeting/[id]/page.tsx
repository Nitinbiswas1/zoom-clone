"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  Shield,
  Grid,
  MessageSquare,
  Send,
  Users,
  MicOff,
  Mic,
  UserMinus,
  Loader2,
  Lock,
  Clock
} from "lucide-react";

import { joinMeeting, saveRecentMeeting } from "../../../services/api";
import { Meeting } from "../../../types/meeting";
import ParticipantTile from "../../../components/ParticipantTile";
import MeetingControls from "../../../components/MeetingControls";

interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
}

export default function MeetingRoomPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  // Meeting details and validation
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [localName, setLocalName] = useState("Nitin");
  const [isHost, setIsHost] = useState(false);

  // Hardware states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Layout states (Panels)
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  // Active speaking simulation
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Interactive panels state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Simulated Remote participants list
  const [remoteParticipants, setRemoteParticipants] = useState([
    { id: "alex", name: "Alex", isHost: false, isMuted: false, isVideoOff: false },
    { id: "sarah", name: "Sarah", isHost: false, isMuted: true, isVideoOff: false },
    { id: "john", name: "John", isHost: false, isMuted: false, isVideoOff: true },
  ]);

  // Load name, preferences, and validate meeting on mount
  useEffect(() => {
    const validateRoom = async () => {
      try {
        const mtg = await joinMeeting(id);
        setMeeting(mtg);

        // Load name from localStorage
        const savedName = localStorage.getItem("zoom_display_name");
        const finalName = savedName || "Nitin";
        setLocalName(finalName);

        // Determine if local participant is the host (creator matches localName or default creator label)
        if (mtg.created_by.includes(finalName) || mtg.created_by.includes("Host")) {
          setIsHost(true);
        }

        // Set initial hardware preferences
        const audioDisabled = localStorage.getItem("zoom_pref_audio_disabled") === "true";
        const videoDisabled = localStorage.getItem("zoom_pref_video_disabled") === "true";
        setIsMuted(audioDisabled);
        setIsVideoOff(videoDisabled);

        // Seed initial chat greetings
        setChatMessages([
          { id: 1, sender: "Sarah", text: "Hi Nitin, glad you set up this session! The video works great.", time: "Just now" },
          { id: 2, sender: "John", text: "Hello everyone! Ready for the presentation.", time: "Just now" },
        ]);

      } catch (err) {
        console.error("Failed to load meeting:", err);
        toast.error("Invalid Meeting ID. Redirecting to home...");
        setTimeout(() => router.push("/"), 2000);
      } finally {
        setLoading(false);
      }
    };

    validateRoom();
  }, [id, router]);

  // Meeting clock timer tick
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading]);

  // Simulated Active Speaker loop
  useEffect(() => {
    if (loading) return;
    const speakers = ["local", "sarah", "john", "alex"];
    const speakerInterval = setInterval(() => {
      const rand = Math.random();
      // 70% chance someone is speaking
      if (rand < 0.7) {
        const randIndex = Math.floor(Math.random() * speakers.length);
        const speaker = speakers[randIndex];

        // Muted speakers can't speak
        if (speaker === "local" && isMuted) {
          setActiveSpeaker(null);
          return;
        }
        const remoteMatch = remoteParticipants.find(p => p.id === speaker);
        if (remoteMatch && remoteMatch.isMuted) {
          setActiveSpeaker(null);
          return;
        }

        setActiveSpeaker(speaker);
      } else {
        setActiveSpeaker(null);
      }
    }, 4500);

    return () => clearInterval(speakerInterval);
  }, [loading, isMuted, remoteParticipants]);

  // Capture local media stream (camera and microphone)
  useEffect(() => {
    if (loading) return;
    let activeStream: MediaStream | null = null;

    const requestWebcam = async () => {
      // Only request stream if video is turned ON
      if (!isVideoOff) {
        try {
          const userStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          activeStream = userStream;
          setStream(userStream);

          // Sync initial microphone mute preference directly to hardware track
          userStream.getAudioTracks().forEach((track) => {
            track.enabled = !isMuted;
          });
        } catch (err) {
          console.warn("Media devices denied: camera/mic not available.", err);
          // Fallback to avatar if user denies or lacks camera
          setIsVideoOff(true);
        }
      } else {
        // If video is toggled OFF, stop current camera tracks
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    };

    requestWebcam();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [loading, isVideoOff]);

  // Format Elapsed Timer: 00:04:12
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (val: number) => String(val).padStart(2, "0");

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  // Toggle Microphone Track
  const handleMuteToggle = () => {
    const nextMuteState = !isMuted;
    setIsMuted(nextMuteState);
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuteState;
      });
    }
    // Cancel speaking if local is muted
    if (nextMuteState && activeSpeaker === "local") {
      setActiveSpeaker(null);
    }
  };

  // Toggle Video Camera Track
  const handleVideoToggle = () => {
    setIsVideoOff(!isVideoOff);
  };

  // Screen Sharing Simulation Toggle
  const handleShareScreenToggle = () => {
    const nextShareState = !isSharingScreen;
    setIsSharingScreen(nextShareState);
    if (nextShareState) {
      toast.success("You are now sharing your screen!");
    } else {
      toast.success("Screen sharing stopped.");
    }
  };

  // Host Control: Mute All participants
  const handleMuteAll = () => {
    if (!isHost) return;
    setRemoteParticipants((prev) =>
      prev.map((p) => ({ ...p, isMuted: true }))
    );
    toast.success("All participants have been muted.");
  };

  // Host Control: Toggle individual mute
  const handleRemoteMuteToggle = (participantId: string) => {
    setRemoteParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId ? { ...p, isMuted: !p.isMuted } : p
      )
    );
    toast.success("Participant mute state updated.");
  };

  // Host Control: Remove individual participant
  const handleRemoteRemove = (participantId: string) => {
    const target = remoteParticipants.find(p => p.id === participantId);
    setRemoteParticipants((prev) => prev.filter((p) => p.id !== participantId));
    toast.error(`${target?.name || "Participant"} removed from the meeting.`);
  };

  // Send Chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: Date.now(),
      sender: localName,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, msg]);
    setNewMessage("");

    // Auto-scroll chat to bottom
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#121214] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#0E72ED]" />
        <p className="text-sm font-bold tracking-wide">Connecting to Zoom Meeting...</p>
      </div>
    );
  }

  // Count active grid tiles: Local (Me) + Remotes
  const totalTiles = 1 + remoteParticipants.length;

  return (
    <div className="h-screen bg-[#121214] text-white flex flex-col justify-between overflow-hidden font-sans select-none">
      <Toaster position="top-right" />

      {/* Top Header: Meeting details & Timer */}
      <header className="bg-[#1C1C1E] border-b border-[#2D2D30] px-3 sm:px-6 py-2.5 flex items-center justify-between z-10">

        {/* Left: Secure Lock Badge & Title */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/50 px-2.5 py-1.5 rounded-lg shadow-inner">
            <Lock className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Encrypted</span>
          </div>
          <span className="w-px h-4 bg-slate-800 hidden xs:inline" />
          <h1 className="text-sm font-black text-slate-200 truncate max-w-[150px] xs:max-w-[220px] sm:max-w-md">
            {meeting?.title || "Zoom Meeting"}
          </h1>
        </div>

        {/* Center: Live active meeting duration */}
        <div className="bg-[#161618] border border-slate-850 px-3.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-[#0E72ED]" />
          <span>{formatTimer(elapsedSeconds)}</span>
        </div>

        {/* Right: Gallery View indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:inline">
            Active Layout
          </span>
          <div className="p-2 rounded-lg bg-[#2A2B2F] border border-slate-800 text-[#0E72ED] flex items-center gap-1.5 text-xs font-bold">
            <Grid className="w-4 h-4" />
            <span>Gallery</span>
          </div>
        </div>

      </header>

      {/* Main Container: Video Grid & Panels Side-by-Side */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Gallery Video Workspace */}
        <div className="flex-1 flex flex-col justify-center p-4 md:p-6 overflow-y-auto">

          {/* Simulated Screen share display overlay */}
          {isSharingScreen ? (
            <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-3xl overflow-hidden bg-gradient-to-br from-[#121417] to-slate-950 border-2 border-emerald-500 shadow-2xl flex flex-col items-center justify-center gap-4">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent)] animate-pulse" />
              <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Sharing Screen
              </div>
              <Users className="w-16 h-16 text-emerald-400 animate-pulse" />
              <div className="text-center">
                <p className="text-base font-black text-white">Nitin Biswas is presenting</p>
                <p className="text-xs text-slate-500 mt-1">Other participants are viewing your shared workspace</p>
              </div>
            </div>
          ) : (
            /* Standard Grid Layout responsive grids */
            <div
              className={`grid gap-4 md:gap-6 w-full max-w-5xl mx-auto items-center justify-center ${totalTiles === 1
                  ? "grid-cols-1 max-w-xl"
                  : totalTiles === 2
                    ? "grid-cols-1 md:grid-cols-2 max-w-4xl"
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                }`}
            >
              {/* Tile 1: Local Participant (Me) */}
              <ParticipantTile
                name={localName}
                isHost={isHost}
                isLocal={true}
                isVideoOff={isVideoOff}
                isMuted={isMuted}
                isSpeaking={activeSpeaker === "local"}
                stream={stream}
              />

              {/* Tiles: Remote Simulated Peers */}
              {remoteParticipants.map((peer) => (
                <ParticipantTile
                  key={peer.id}
                  name={peer.name}
                  isHost={peer.isHost}
                  isVideoOff={peer.isVideoOff}
                  isMuted={peer.isMuted}
                  isSpeaking={activeSpeaker === peer.id}
                  showControls={isHost} // Show action panel only if local user is host
                  onMuteToggle={() => handleRemoteMuteToggle(peer.id)}
                  onRemove={() => handleRemoteRemove(peer.id)}
                />
              ))}
            </div>
          )}

        </div>

        {/* Collapsible Sidebar Overlay: Chat and Participants */}
        {(showParticipants || showChat) && (
          <aside className="absolute inset-0 z-50 w-full md:relative md:inset-auto md:w-80 md:z-20 bg-[#1C1C1E] border-l border-[#2D2D30] flex flex-col h-full shadow-2xl">

            {/* Sidebar Header */}
            <div className="p-4 border-b border-[#2D2D30] flex items-center justify-between bg-[#161618]">
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                {showParticipants ? <Users className="w-4 h-4 text-[#0E72ED]" /> : <MessageSquare className="w-4 h-4 text-[#FF742E]" />}
                {showParticipants ? "Participants" : "Chat Room"}
              </h3>

              <button
                onClick={() => {
                  setShowParticipants(false);
                  setShowChat(false);
                }}
                className="text-xs font-bold text-slate-500 hover:text-white px-2 py-1 hover:bg-[#2A2B2F] rounded-lg transition-colors focus:outline-none"
              >
                Close
              </button>
            </div>

            {/* Sidebar content: 1. Participants List */}
            {showParticipants && (
              <div className="flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="p-4 flex flex-col gap-3.5">

                  {/* Local Entry (Me) */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#222326] border border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#0E72ED] text-white text-xs font-bold flex items-center justify-center">
                        Me
                      </div>
                      <span className="text-xs font-bold text-slate-250 truncate max-w-[120px]">
                        {localName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-500" /> : <Mic className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Remote Entries */}
                  {remoteParticipants.map((peer) => (
                    <div key={peer.id} className="flex items-center justify-between p-2 rounded-xl bg-[#222326]/50 border border-slate-850 hover:bg-[#222326] transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center">
                          {peer.name.split(" ").map(x => x[0]).join("")}
                        </div>
                        <span className="text-xs font-bold text-slate-350 truncate max-w-[120px]">
                          {peer.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        {peer.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-500" /> : <Mic className="w-3.5 h-3.5" />}
                        {isHost && (
                          <button
                            onClick={() => handleRemoteRemove(peer.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-500 hover:bg-[#2A2B2F] transition-colors focus:outline-none"
                            title="Remove Participant"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                </div>

                {/* Host Control Actions at sidebar footer */}
                {isHost && (
                  <div className="p-4 border-t border-[#2D2D30] bg-[#161618] flex flex-col gap-2">
                    <button
                      onClick={handleMuteAll}
                      className="w-full py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold shadow transition-colors focus:outline-none"
                    >
                      Mute Everyone
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sidebar content: 2. Chat Feed */}
            {showChat && (
              <div className="flex-1 flex flex-col overflow-hidden">

                {/* Message Log */}
                <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="flex flex-col gap-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#0E72ED]">{msg.sender}</span>
                        <span className="text-[8px] text-slate-500">{msg.time}</span>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-[#222326] border border-slate-800 text-xs text-slate-300 leading-normal">
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>

                {/* Send Inputs */}
                <form onSubmit={handleSendChat} className="p-3 border-t border-[#2D2D30] bg-[#161618] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#222326] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0E72ED] transition-all font-medium"
                  />
                  <button
                    type="submit"
                    className="p-2.5 rounded-xl bg-[#0E72ED] hover:bg-[#1a7ffd] text-white flex items-center justify-center focus:outline-none active:scale-95 transition-transform"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>
            )}

          </aside>
        )}

      </div>

      {/* Bottom Bar: Action Controllers */}
      <MeetingControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onMuteToggle={handleMuteToggle}
        onVideoToggle={handleVideoToggle}
        participantCount={totalTiles}
        showParticipants={showParticipants}
        onParticipantsToggle={() => {
          setShowParticipants(!showParticipants);
          setShowChat(false); // Only open one sidebar at a time
        }}
        showChat={showChat}
        onChatToggle={() => {
          setShowChat(!showChat);
          setShowParticipants(false); // Only open one sidebar at a time
        }}
        isSharingScreen={isSharingScreen}
        onShareScreenToggle={handleShareScreenToggle}
        onLeave={() => {
          // Close local stream on exit
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
          toast.success("Leaving meeting room...");
          router.push("/");
        }}
        isHost={isHost}
        onMuteAll={handleMuteAll}
      />

    </div>
  );
}
