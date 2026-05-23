"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
    Home as HomeIcon,
    Calendar,
    MessageSquare,
    MoreHorizontal,
    Settings,
    Search,
    ChevronLeft,
    ChevronRight,
    History,
    ChevronDown,
    Info,
    ExternalLink,
    Copy,
    Check,
    Loader2,
    Video,
    RotateCw,
    Pencil,
    Plus,
    Filter,
    AtSign,
    Hash,
    Star,
    Users,
    Bot,
    Monitor,
    X,
    Headphones,
    Volume2,
    Mic,
} from "lucide-react";

import {
    getUpcomingMeetings,
    getRecentMeetings,
    createInstantMeeting,
    saveRecentMeeting,
} from "../services/api";
import { Meeting, RecentMeeting } from "../types/meeting";

export default function ZoomWorkplaceHome() {
    const router = useRouter();
    const [upcoming, setUpcoming] = useState<Meeting[]>([]);
    const [loadingUpcoming, setLoadingUpcoming] = useState(true);
    const [recent, setRecent] = useState<RecentMeeting[]>([]);
    const [loadingRecent, setLoadingRecent] = useState(true);
    const [timelineTab, setTimelineTab] = useState<"upcoming" | "recent">("upcoming");
    const [isCreatingInstant, setIsCreatingInstant] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Tab State & PMI State
    const [activeTab, setActiveTab] = useState<"home" | "meetings" | "chat">("home");
    const [showInvitation, setShowInvitation] = useState(false);
    const [pmiValue, setPmiValue] = useState("299 692 7046");

    // Settings modal state
    const [showSettings, setShowSettings] = useState(false);
    const [settingsTab, setSettingsTab] = useState<"general" | "audio" | "video" | "chat">("general");
    const [settingsPos, setSettingsPos] = useState({ x: 280, y: 80 });
    const [speakerVol, setSpeakerVol] = useState(60);
    const [muteMicOnJoin, setMuteMicOnJoin] = useState(true);
    const [videoOffOnJoin, setVideoOffOnJoin] = useState(true);
    const [selectedTheme, setSelectedTheme] = useState("classic");
    const [autoCall, setAutoCall] = useState(false);
    const [msgGrouping, setMsgGrouping] = useState("combine");
    const [sectionBehavior, setSectionBehavior] = useState("multiple");
    const dragRef = useRef({ isDragging: false, offsetX: 0, offsetY: 0 });

    // Theme color palettes
    const themes: Record<string, { bg: string; panel: string; panelBorder: string; headerBorder: string }> = {
        classic: { bg: "#EBEDF0", panel: "#FFFFFF", panelBorder: "#DFE3E8", headerBorder: "rgba(209,213,219,0.3)" },
        bloom: { bg: "#E0ECFA", panel: "#F5F8FF", panelBorder: "#C8D8F0", headerBorder: "rgba(180,200,230,0.4)" },
        agave: { bg: "#DDE9E3", panel: "#F0F7F3", panelBorder: "#C0D8C8", headerBorder: "rgba(160,190,170,0.4)" },
        rose: { bg: "#EEDDE5", panel: "#FFF5F8", panelBorder: "#E0C0D0", headerBorder: "rgba(200,160,180,0.4)" },
    };
    const theme = themes[selectedTheme] || themes.classic;

    // Drag handlers for settings window
    const handleSettingsDragStart = useCallback((e: React.MouseEvent) => {
        dragRef.current = { isDragging: true, offsetX: e.clientX - settingsPos.x, offsetY: e.clientY - settingsPos.y };
    }, [settingsPos]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!dragRef.current.isDragging) return;
            setSettingsPos({ x: e.clientX - dragRef.current.offsetX, y: e.clientY - dragRef.current.offsetY });
        };
        const handleMouseUp = () => { dragRef.current.isDragging = false; };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
    }, []);

    // Time & Date Display
    const [timeStr, setTimeStr] = useState("");
    const [dateStr, setDateStr] = useState("");

    // Sync real-time clock to match standard 12-hour AM/PM and long weekday formats
    useEffect(() => {
        const updateTimeAndCalendar = () => {
            const now = new Date();

            // Time format: "7:40 PM"
            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const minutes = now.getMinutes().toString().padStart(2, '0');
            setTimeStr(`${hours}:${minutes} ${ampm}`);

            // Date format: "Saturday, May 23"
            const formattedDate = now.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
            });
            setDateStr(formattedDate);
        };

        updateTimeAndCalendar();
        const interval = setInterval(updateTimeAndCalendar, 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch scheduled meetings on mount
    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const data = await getUpcomingMeetings();
                setUpcoming(data);
            } catch (err) {
                console.error("Failed to load upcoming meetings:", err);
            } finally {
                setLoadingUpcoming(false);
            }
        };
        const fetchRecent = async () => {
            try {
                const data = await getRecentMeetings();
                setRecent(data);
            } catch (err) {
                console.error("Failed to load recent meetings:", err);
            } finally {
                setLoadingRecent(false);
            }
        };
        fetchUpcoming();
        fetchRecent();
    }, []);

    // Handler: Start New Instant Meeting
    const handleNewMeeting = async () => {
        setIsCreatingInstant(true);
        try {
            const newMtg = await createInstantMeeting({
                title: "Instant Meeting",
                created_by: "Nitin Biswas (Host)",
            });

            await saveRecentMeeting({
                meeting_id: newMtg.meeting_id,
                participant_name: "Nitin Biswas (Host)",
            });

            toast.success("Starting instant meeting...");
            router.push(`/meeting/${newMtg.meeting_id}`);
        } catch (err) {
            console.error("Error creating instant meeting:", err);
            toast.error("Failed to start instant meeting. Verify backend connection.");
            setIsCreatingInstant(false);
        }
    };

    // Copy invitation helper
    const handleCopyLink = (e: React.MouseEvent, meetingId: string) => {
        e.stopPropagation();
        const inviteUrl = `${window.location.origin}/meeting/${meetingId}`;
        navigator.clipboard.writeText(inviteUrl);
        setCopiedId(meetingId);
        toast.success("Meeting link copied!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="h-screen w-screen text-slate-800 flex flex-col md:flex-row font-sans overflow-hidden select-none" style={{ backgroundColor: theme.bg }}>
            <Toaster position="top-right" />

            {/* LEFT VERTICAL TAB BAR (Desktop) / BOTTOM TAB BAR (Mobile) */}
            <aside className="w-full h-[65px] md:w-[92px] md:h-screen flex flex-row md:flex-col items-center justify-around md:justify-between px-2 md:px-0 pb-[env(safe-area-inset-bottom)] md:pb-4 flex-shrink-0 grow-0 border-t border-[#D1D5DB]/30 md:border-t-0 z-50 order-last md:order-first fixed bottom-0 md:relative" style={{ backgroundColor: theme.bg }}>
                    
                    <div className="flex flex-row md:flex-col items-center gap-1 sm:gap-2 w-full justify-around md:justify-start md:w-full h-full md:h-auto">

                        {/* Brand Logo Header Area (aligns with 52px right header on Desktop, hidden on Mobile) */}
                        <div className="hidden md:flex h-[52px] w-full flex-col justify-center text-left leading-none antialiased select-none pl-[14px] pt-1 mb-2">
                            <span className="font-bold text-[10.5px] text-[#2D3136] tracking-tight leading-none ml-[1px]">zoom</span>
                            <span className="font-medium text-[16px] text-[#2D3136] tracking-tight leading-none mt-0.5">Workplace</span>
                        </div>

                        {/* Tab: Home */}
                        <div
                            onClick={() => setActiveTab("home")}
                            className={`flex flex-col items-center justify-center w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-[12px] md:rounded-[14px] cursor-pointer transition-all duration-200 ${
                                activeTab === "home"
                                    ? "bg-white text-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                                    : "hover:bg-[#E3E8EC] text-[#5C6470]"
                            }`}
                        >
                            <HomeIcon className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] fill-current" strokeWidth={1.5} />
                            <span className={`text-[10px] md:text-[11px] mt-1 select-none ${activeTab === "home" ? "font-semibold text-slate-800" : "font-medium text-slate-600"}`}>Home</span>
                        </div>

                        {/* Tab: Meetings */}
                        <div
                            onClick={() => setActiveTab("meetings")}
                            className={`flex flex-col items-center justify-center w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-[12px] md:rounded-[14px] cursor-pointer transition-all duration-200 ${
                                activeTab === "meetings"
                                    ? "bg-white text-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                                    : "hover:bg-[#E3E8EC] text-[#5C6470]"
                            }`}
                        >
                            <Video className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" strokeWidth={1.5} />
                            <span className={`text-[10px] md:text-[11px] mt-1 select-none ${activeTab === "meetings" ? "font-semibold text-slate-800" : "font-medium text-slate-600"}`}>Meetings</span>
                        </div>

                        {/* Tab: Chat */}
                        <div
                            onClick={() => setActiveTab("chat")}
                            className={`flex flex-col items-center justify-center w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-[12px] md:rounded-[14px] cursor-pointer transition-all duration-200 ${
                                activeTab === "chat"
                                    ? "bg-white text-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
                                    : "hover:bg-[#E3E8EC] text-[#5C6470]"
                            }`}
                        >
                            <MessageSquare className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" strokeWidth={1.5} />
                            <span className={`text-[10px] md:text-[11px] mt-1 select-none ${activeTab === "chat" ? "font-semibold text-slate-800" : "font-medium text-slate-600"}`}>Chat</span>
                        </div>

                        {/* Tab: More (Hidden on very small screens, shown otherwise) */}
                        <div className="hidden xs:flex flex-col items-center justify-center w-[50px] h-[50px] md:w-[60px] md:h-[60px] rounded-[12px] md:rounded-[14px] cursor-pointer hover:bg-[#E3E8EC] text-[#5C6470] transition-all duration-200">
                            <MoreHorizontal className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" strokeWidth={1.5} />
                            <span className="text-[10px] md:text-[11px] mt-1 font-medium text-slate-600 select-none">More</span>
                        </div>
                        
                        {/* Settings Trigger inside mobile flex-row */}
                        <button
                            onClick={() => { setShowSettings(!showSettings); setSettingsTab("general"); }}
                            className={`w-[50px] h-[50px] md:hidden rounded-[12px] hover:bg-slate-300/40 transition-all flex flex-col items-center justify-center focus:outline-none ${showSettings ? "bg-[#ECF4FD] text-[#0E71EB]" : "text-slate-550 hover:text-slate-800"}`}
                        >
                            <Settings className="w-[18px] h-[18px]" strokeWidth={1.5} />
                            <span className="text-[10px] mt-1 font-medium text-slate-600 select-none">Settings</span>
                        </button>

                    </div>

                    {/* Settings Trigger at Bottom (Desktop only) */}
                    <button
                        onClick={() => { setShowSettings(!showSettings); setSettingsTab("general"); }}
                        className={`hidden md:flex w-10 h-10 rounded-xl hover:bg-slate-300/40 transition-all items-center justify-center focus:outline-none ${showSettings ? "bg-[#ECF4FD] text-[#0E71EB]" : "text-slate-550 hover:text-slate-800"}`}
                    >
                        <Settings className="w-4.5 h-4.5" />
                    </button>

            </aside>

            {/* RIGHT AREA: Header + Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden pb-[65px] md:pb-0 relative">
                
                {/* TOP HEADER */}
                <header className="h-[52px] flex items-center justify-between px-3 md:px-5 border-b flex-shrink-0 relative z-12 w-full" style={{ backgroundColor: theme.bg, borderBottomColor: theme.headerBorder }}>

                        {/* Left: Navigation Arrows */}
                        <div className="flex items-center gap-1.5 text-slate-450">
                            <button className="p-1 rounded hover:bg-slate-350/40 text-slate-500 transition-colors focus:outline-none">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="p-1 rounded hover:bg-slate-350/40 text-slate-500 transition-colors focus:outline-none">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button className="p-1 rounded hover:bg-slate-350/40 text-slate-500 transition-colors focus:outline-none ml-1">
                                <History className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Center: Search */}
                        <div className="relative w-[313.797px] max-w-[440px] h-[40px] p-[4px] flex-grow flex-shrink hidden md:block antialiased select-none ml-4 mr-4">
                            <Search className="absolute left-3.5 top-[13px] w-3.5 h-3.5 text-[#686F79]" />
                            <input
                                type="text"
                                readOnly
                                placeholder="Search ⌘ + K"
                                className="w-full h-full pl-9 pr-4 rounded-lg bg-[#DDE0E7]/60 hover:bg-[#DDE0E7] text-[#686F79] text-xs border border-transparent focus:outline-none placeholder-[#686F79] font-medium cursor-pointer transition-colors leading-[16px]"
                            />
                        </div>

                        {/* Right: Pro Trigger & Profile avatar */}
                        <div className="flex items-center gap-3">
                            <button className="bg-[#0E71EB] hover:bg-[#0b5fca] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition-colors focus:outline-none">
                                Upgrade to Pro
                            </button>

                            {/* Avatar with active green status bubble */}
                            <div className="relative w-7 h-7 rounded-full bg-[#0E71EB] text-white font-extrabold text-xs flex items-center justify-center shadow">
                                N
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border" style={{ borderColor: theme.bg }} />
                            </div>
                        </div>

                    </header>

                    {/* MAIN DISPLAY WORKSPACE */}
                {activeTab === "home" ? (
                    <main className="flex-1 overflow-hidden relative z-10 p-2 pl-0" style={{ backgroundColor: theme.bg }}>

                        {/* Inner Dashboard Wrapper */}
                        <div className="w-full h-full rounded-xl shadow-sm border border-[#D1D5DB]/30 flex flex-col items-center justify-start pt-[6vh] pb-8 px-3 sm:px-6 md:px-0 overflow-y-auto antialiased cursor-default select-none" style={{ backgroundColor: theme.panel }}>

                            {/* Centered Clock Widget */}
                            <div className="text-center mb-8">
                                <h2 className="text-[40px] font-semibold text-[#1C1F23] tracking-tight leading-none select-text antialiased block">
                                    {timeStr}
                                </h2>
                                <p className="text-[15px] font-medium text-[#6E7680] mt-3 leading-none select-text antialiased block">
                                    {dateStr}
                                </p>
                            </div>

                            {/* Central SQUIRCLES Grid */}
                            <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-10 md:gap-14 mb-10 md:mb-16 cursor-default antialiased select-none px-4">

                                {/* Button 1: New Meeting (Orange Squircle with slashed camera) */}
                                <div className="flex flex-col items-center group">
                                    <button
                                        onClick={handleNewMeeting}
                                        disabled={isCreatingInstant}
                                        className="w-[55px] h-[55px] rounded-[20px] bg-[#FF742E] hover:bg-[#e06325] hover:-translate-y-1 text-white flex items-center justify-center shadow-none transition-all duration-200 cursor-pointer border-none focus:outline-none mb-2.5 antialiased"
                                    >
                                        {isCreatingInstant ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <svg className="w-[36px] h-[36px]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <mask id="slash-mask">
                                                    <rect x="0" y="0" width="24" height="24" fill="white" />
                                                    <path d="M4 20 L20 4" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                                                </mask>
                                                <g mask="url(#slash-mask)">
                                                    <rect x="3" y="7" width="11" height="10" rx="2" />
                                                    <path d="M15 9.5 L20.5 6 V18 L15 14.5 Z" />
                                                </g>
                                                <path d="M4 20 L20 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        )}
                                    </button>
                                    <span className="text-[14px] font-medium text-[#6E7680] mt-0 flex items-center gap-0.5 cursor-pointer hover:text-slate-900 leading-none whitespace-nowrap">
                                        New meeting
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 stroke-[2.5]" />
                                    </span>
                                </div>

                                {/* Button 2: Join Meeting (Blue Squircle with plus in white ring) */}
                                <div className="flex flex-col items-center group -ml-6">
                                    <button
                                        onClick={() => router.push("/join")}
                                        className="w-[55px] h-[55px] rounded-[20px] bg-[#0E71EB] hover:bg-[#0b5fca] hover:-translate-y-1 text-white flex items-center justify-center shadow-none transition-all duration-200 cursor-pointer border-none focus:outline-none mb-2.5 antialiased"
                                    >
                                        <svg className="w-[37px] h-[37px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="4.5" y="4.5" width="15" height="15" rx="4.5" fill="white" />
                                            <path d="M12 8 V16 M8 12 H16" stroke="#0E71EB" strokeWidth="1.3" strokeLinecap="round" />
                                        </svg>
                                    </button>
                                    <span className="text-[14px] font-medium text-[#6E7680] mt-0 cursor-pointer hover:text-slate-900 leading-none whitespace-nowrap">
                                        Join
                                    </span>
                                </div>

                                {/* Button 3: Schedule Meeting (Blue Squircle with notebook calendar sheet) */}
                                <div className="flex flex-col items-center group">
                                    <button
                                        onClick={() => router.push("/schedule")}
                                        className="w-[55px] h-[55px] rounded-[20px] bg-[#0E71EB] hover:bg-[#0b5fca] hover:-translate-y-1 text-white flex items-center justify-center shadow-none transition-all duration-200 cursor-pointer border-none focus:outline-none mb-2.5 antialiased"
                                    >
                                        <svg className="w-[38px] h-[38px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="4.5" y="5.5" width="15" height="14" rx="3.5" fill="white" />
                                            <path d="M8.5 6 V3.5 C8.5 2.5, 9.5 2.5, 9.5 3.5 V6 M14.5 6 V3.5 C14.5 2.5, 15.5 2.5, 15.5 3.5 V6" stroke="#4A5568" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                                            <text x="12" y="15" fill="#0E71EB" fontSize="8" fontWeight="800" textAnchor="middle" dominantBaseline="middle" fontFamily="system-ui, -apple-system, sans-serif">
                                                19
                                            </text>
                                        </svg>
                                    </button>
                                    <span className="text-[14px] font-medium text-[#6E7680] mt-0 cursor-pointer hover:text-slate-900 leading-none whitespace-nowrap">
                                        Schedule
                                    </span>
                                </div>

                            </div>

                            {/* Bottom Section: Aligned Timeline Card Widget */}
                            <div className="w-full max-w-[840px] border border-[#E2E8F0] rounded-xl flex flex-col bg-white shadow-sm antialiased mx-auto">

                                {/* warning alert: Connect calendar */}
                                <div className="flex items-center gap-2 bg-[#F8FAFF] border border-[#D0E2FA] px-1.5 py-4 mt-2.5 mb-1 rounded-lg text-[14px] text-slate-700 tracking-tight">
                                    <div className="w-[16px] h-[16px] rounded-full border border-[#0E71EB] flex items-center justify-center flex-shrink-0">
                                        <span className="text-[#0E71EB] font-bold text-[9px] leading-none">i</span>
                                    </div>
                                    <div className="flex-1 leading-snug">
                                        You haven't connected your calendar yet. <span className="text-[#0E71EB] hover:underline cursor-pointer">Connect now</span> to manage all your meetings and events in one place.
                                    </div>
                                </div>

                                {/* Calendar Date Header */}
                                <div className="px-5 pt-4 pb-1 flex items-center justify-center relative bg-white mt-1 border-b border-transparent">
                                    <button className="flex items-center gap-1.5 text-[13px] font-bold text-[#1C1F23] hover:bg-slate-50 px-2 py-1 transition-colors focus:outline-none">
                                        Today, {dateStr.split(",")[1]?.trim() || "May 23"}
                                        <ChevronDown className="w-[14px] h-[14px] text-[#6E7680] stroke-[2.5]" />
                                    </button>
                                    <button className="absolute right-5 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                                        <ExternalLink className="w-[15px] h-[15px]" />
                                    </button>
                                </div>

                                {/* Sub-toolbar controls */}
                                <div className="px-5 py-2.5 border-b border-t border-[#DFE3E8] bg-white flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => setTimelineTab("upcoming")}
                                            className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors focus:outline-none h-[30px] ${timelineTab === "upcoming" ? "bg-slate-100 text-[#1C1F23]" : "text-[#6E7680] hover:bg-slate-50"}`}>
                                            Upcoming
                                        </button>
                                        <button 
                                            onClick={() => setTimelineTab("recent")}
                                            className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-colors focus:outline-none h-[30px] ${timelineTab === "recent" ? "bg-slate-100 text-[#1C1F23]" : "text-[#6E7680] hover:bg-slate-50"}`}>
                                            Recent
                                        </button>
                                    </div>
                                    <button className="text-[#6E7680] hover:text-slate-900 focus:outline-none transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Timeline content feed (Scrollable) */}
                                <div className="bg-white min-h-[340px] flex flex-col rounded-b-xl">

                                    {timelineTab === "upcoming" ? (
                                        loadingUpcoming ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-450 gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin text-[#0E71EB]" />
                                            <span className="text-xs font-semibold">Synchronizing timeline...</span>
                                        </div>
                                    ) : upcoming.length > 0 ? (
                                        /* RENDER ACTIVE scheduled rows */
                                        <div className="flex flex-col divide-y divide-slate-100 p-2">
                                            {upcoming.map((mtg) => {
                                                const dateObj = new Date(mtg.scheduled_time);
                                                const startStr = dateObj.toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false,
                                                });

                                                const endObj = new Date(dateObj.getTime() + (mtg.duration || 30) * 60 * 1000);
                                                const endStr = endObj.toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false,
                                                });

                                                return (
                                                    <div
                                                        key={mtg.id}
                                                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-2.5 hover:bg-slate-50/50 transition-all rounded-xl gap-3 group"
                                                    >
                                                        {/* Time display */}
                                                        <div className="flex items-center gap-2.5 flex-shrink-0 text-left">
                                                            <div className="flex flex-col">
                                                                <span className="text-[12px] font-black text-slate-800 tracking-tight">
                                                                    {startStr}
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 font-medium">
                                                                    to {endStr}
                                                                </span>
                                                            </div>
                                                            <span className="w-1 h-7 rounded-full bg-[#0E71EB]" />
                                                        </div>

                                                        {/* Title & Meeting ID */}
                                                        <div className="flex-1 text-left min-w-0">
                                                            <h4 className="text-[12.5px] font-bold text-slate-800 truncate group-hover:text-[#0E71EB] transition-colors leading-tight">
                                                                {mtg.title}
                                                            </h4>
                                                            <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5">
                                                                Meeting ID: {mtg.meeting_id}
                                                            </p>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto justify-end">
                                                            <button
                                                                onClick={(e) => handleCopyLink(e, mtg.meeting_id)}
                                                                className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-850 rounded-lg shadow-sm transition-colors focus:outline-none"
                                                                title="Copy Invite Link"
                                                            >
                                                                {copiedId === mtg.meeting_id ? (
                                                                    <Check className="w-3 h-3 text-emerald-600 animate-scale" />
                                                                ) : (
                                                                    <Copy className="w-3 h-3" />
                                                                )}
                                                            </button>

                                                            <button
                                                                onClick={() => router.push(`/meeting/${mtg.meeting_id}`)}
                                                                className="px-3 py-1 bg-[#0E71EB] hover:bg-[#0b5fca] text-white text-[10px] font-bold rounded-lg shadow-sm transition-all focus:outline-none active:scale-97 flex items-center gap-1"
                                                            >
                                                                <Video className="w-3 h-3 fill-current" />
                                                                Start
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* RENDER ZOOM DESKTOP BEACH EMPTY STATE pastel illustration */
                                        <div className="flex-1 flex flex-col items-center justify-center pt-[40px] pb-[70px] text-center gap-3 select-none">
                                            {/* Beach Umbrella and Chair SVG in soft Zoom Workplace pastel colors */}
                                            <svg className="w-[120px] h-[120px]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                {/* Pastel shadow ground */}
                                                <ellipse cx="50" cy="75" rx="25" ry="4" fill="#EEF2F6" />
                                                {/* Umbrella Pole */}
                                                <path d="M54 36 L47 73" stroke="#B4C2D6" strokeWidth="1.8" strokeLinecap="round" />
                                                {/* Umbrella canopy */}
                                                <path d="M54 36 Q 40 40 25 50 Q 50 48 78 50 Q 65 40 54 36 Z" fill="#D8E2F2" stroke="#A9BAD4" strokeWidth="1.5" strokeLinejoin="round" />
                                                <path d="M54 36 C 45 42 35 47 25 50" stroke="#A9BAD4" strokeWidth="1.5" />
                                                <path d="M54 36 C 52 44 48 48 44 51" stroke="#A9BAD4" strokeWidth="1.5" />
                                                <path d="M54 36 C 63 42 70 47 78 50" stroke="#A9BAD4" strokeWidth="1.5" />
                                                {/* Little beach chair under the umbrella */}
                                                <path d="M49 61 L55 61 L53 66 L47 66 Z" fill="#FFFFFF" stroke="#B4C2D6" strokeWidth="1.2" strokeLinejoin="round" />
                                                <path d="M49 61 L46 68 M55 61 L58 68 M47 66 L46 68 M53 66 L58 68" stroke="#B4C2D6" strokeWidth="1.2" strokeLinecap="round" />
                                            </svg>

                                            <h3 className="text-[12px] font-medium text-slate-500 leading-tight">
                                                No meetings scheduled.
                                            </h3>
                                        </div>
                                    )
                                ) : (
                                    loadingRecent ? (
                                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-450 gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin text-[#0E71EB]" />
                                                <span className="text-xs font-semibold">Loading recent...</span>
                                            </div>
                                        ) : recent.length > 0 ? (
                                            <div className="flex flex-col divide-y divide-slate-100 p-2">
                                                {recent.map((mtg) => {
                                                    const joinObj = new Date(mtg.joined_at);
                                                    const joinStr = joinObj.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + joinObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                    return (
                                                        <div key={mtg.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-2.5 hover:bg-slate-50/50 transition-all rounded-xl gap-3 group">
                                                            <div className="flex items-center gap-2.5 flex-shrink-0 text-left">
                                                                <span className="w-1 h-7 rounded-full bg-[#0E71EB]" />
                                                            </div>
                                                            <div className="flex-1 text-left min-w-0">
                                                                <h4 className="text-[12.5px] font-bold text-slate-800 truncate group-hover:text-[#0E71EB] transition-colors leading-tight">Meeting ID: {mtg.meeting_id}</h4>
                                                                <p className="text-[9.5px] text-slate-500 font-semibold mt-0.5">Joined on {joinStr}</p>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 flex-shrink-0 w-full sm:w-auto justify-end">
                                                                <button onClick={() => router.push(`/join`)} className="px-3 py-1 bg-white border border-[#DFE3E8] hover:bg-slate-50 text-slate-700 text-[10px] font-bold rounded-lg shadow-sm transition-all focus:outline-none flex items-center gap-1">
                                                                    <RotateCw className="w-3 h-3" />
                                                                    Join Again
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col items-center justify-center pt-[40px] pb-[70px] text-center gap-3 select-none">
                                                <History className="w-10 h-10 text-[#6E7680] opacity-40 mb-2" />
                                                <h3 className="text-[12px] font-medium text-slate-500 leading-tight">No recent meetings.</h3>
                                            </div>
                                        )
                                    )}

                                </div>
                            </div>
                        </div>
                    </main>
                ) : activeTab === "chat" ? (
                    <main className="flex-1 bg-white overflow-hidden flex select-text">
                        {/* Left panel: Team Chat sidebar */}
                        <div className="w-[240px] bg-white border-r border-[#DFE3E8] flex flex-col flex-shrink-0">
                            {/* Header row */}
                            <div className="h-[48px] px-4 flex items-center justify-between border-b border-[#DFE3E8] bg-white select-none">
                                <button className="flex items-center gap-1 text-[14px] font-semibold text-slate-800 hover:text-slate-950 transition-colors focus:outline-none">
                                    Team Chat
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                                <div className="flex items-center gap-1">
                                    <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 transition-colors focus:outline-none">
                                        <Filter className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="w-6 h-6 rounded-full bg-[#0E71EB] hover:bg-[#0b5fca] text-white flex items-center justify-center transition-colors focus:outline-none">
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Filter tab row */}
                            <div className="px-3 py-2 flex items-center gap-1 border-b border-[#DFE3E8]">
                                <button className="px-2.5 py-1 rounded-full bg-[#0E71EB] text-white text-[11px] font-semibold focus:outline-none">All</button>
                                <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors focus:outline-none"><AtSign className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors focus:outline-none"><MessageSquare className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors focus:outline-none"><Hash className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors focus:outline-none"><Monitor className="w-3.5 h-3.5" /></button>
                                <button className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors focus:outline-none"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                            </div>

                            {/* Collapsible sections */}
                            <div className="flex-1 overflow-y-auto py-2 px-3">
                                {/* Starred */}
                                <button className="w-full flex items-center gap-2 py-1.5 px-1 text-[13px] font-medium text-slate-700 hover:bg-slate-50 rounded-md transition-colors focus:outline-none">
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                    <Star className="w-3.5 h-3.5 text-slate-400" />
                                    Starred
                                </button>

                                {/* DMs and channels */}
                                <button className="w-full flex items-center gap-2 py-1.5 px-1 text-[13px] font-medium text-slate-700 hover:bg-slate-50 rounded-md transition-colors focus:outline-none">
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    DMs and channels
                                </button>

                                {/* Apps */}
                                <button className="w-full flex items-center gap-2 py-1.5 px-1 text-[13px] font-medium text-slate-700 hover:bg-slate-50 rounded-md transition-colors focus:outline-none">
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                    <Bot className="w-3.5 h-3.5 text-slate-400" />
                                    Apps
                                </button>
                            </div>
                        </div>

                        {/* Right main panel: Empty state */}
                        <div className="flex-1 bg-white flex flex-col items-center justify-center">
                            {/* Chat bubble illustration */}
                            <svg className="w-32 h-32 mb-4" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Speech bubble */}
                                <path
                                    d="M30 45 C30 28, 45 18, 65 18 C85 18, 100 28, 100 45 C100 62, 85 72, 65 72 C60 72, 55 71, 51 69 L35 78 L40 65 C34 59, 30 52, 30 45Z"
                                    fill="#B8D4F0"
                                />
                                {/* Three dots */}
                                <circle cx="52" cy="45" r="4" fill="white" />
                                <circle cx="65" cy="45" r="4" fill="white" />
                                <circle cx="78" cy="45" r="4" fill="white" />
                                {/* Shadow/depth */}
                                <path
                                    d="M35 50 C35 33, 48 23, 67 23 C86 23, 95 33, 95 48 C95 63, 82 73, 63 73 C58 73, 53 72, 49 70 L38 77 L42 67 C38 62, 35 56, 35 50Z"
                                    fill="#A4C8E8"
                                    opacity="0.3"
                                />
                            </svg>
                            <p className="text-[14px] text-slate-400 font-normal select-none">
                                Start chatting by clicking or creating a chat on the left panel.
                            </p>
                        </div>
                    </main>
                ) : (
                    <main className="flex-1 bg-white overflow-hidden flex select-text">
                        {/* Left panel (Upcoming List) */}
                        <div className="w-[280px] bg-white border-r border-[#DFE3E8] flex flex-col flex-shrink-0">
                            {/* Header row */}
                            <div className="h-[52px] px-4 flex items-center justify-between border-b border-[#DFE3E8] bg-white select-none">
                                <button
                                    onClick={() => {
                                        toast.success("Meetings list updated");
                                    }}
                                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer focus:outline-none"
                                    title="Refresh"
                                >
                                    <RotateCw className="w-3.5 h-3.5" />
                                </button>
                                <div className="bg-white border border-[#DFE3E8] rounded-full px-5 py-1 text-[11px] font-semibold text-[#0E71EB] shadow-sm select-none">
                                    Upcoming
                                </div>
                                <div className="w-6" /> {/* spacer for visual symmetry */}
                            </div>

                            {/* Active PMI Block */}
                            <div className="p-4 bg-white">
                                <div className="bg-[#0E71EB] text-white p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg shadow-[#0E71EB]/15 cursor-pointer select-none">
                                    <h3 className="text-[20px] font-bold tracking-wide select-text">
                                        {pmiValue}
                                    </h3>
                                    <p className="text-[10px] text-white/80 font-medium mt-1 uppercase tracking-wider">
                                        My Personal Meeting ID (PMI)
                                    </p>
                                </div>
                            </div>

                            {/* Empty Placeholder */}
                            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 bg-white">
                                <p className="text-[13px] text-slate-400 font-medium select-none">
                                    No upcoming meetings
                                </p>
                            </div>

                            {/* Bottom Add Calendar bar */}
                            <div
                                onClick={() => toast("Calendar sync is coming soon!")}
                                className="h-11 border-t border-[#DFE3E8] hover:bg-slate-50 flex items-center justify-center gap-1.5 text-[12px] text-[#0E71EB] font-semibold cursor-pointer select-none"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                Add a calendar
                            </div>
                        </div>

                        {/* Right detail panel */}
                        <div className="flex-1 bg-white p-10 overflow-y-auto flex flex-col">
                            <h1 className="text-[28px] font-semibold text-[#232333] mb-1 select-text">
                                My Personal Meeting ID (PMI)
                            </h1>
                            <p className="text-[14px] text-slate-500 mb-6 select-text">
                                {pmiValue}
                            </p>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 mb-6 select-none">
                                <button
                                    onClick={() => router.push(`/meeting/${pmiValue.replace(/\s+/g, "")}`)}
                                    className="bg-[#0E71EB] hover:bg-[#0b5fca] text-white text-[13px] font-bold px-5 py-2 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer focus:outline-none"
                                >
                                    Start
                                </button>

                                <button
                                    onClick={() => {
                                        const inviteText = `nitinbiswas is inviting you to a scheduled Zoom meeting.\n\nTopic: My Personal Meeting ID (PMI)\n\nJoin Zoom Meeting:\n${window.location.origin}/meeting/${pmiValue.replace(/\s+/g, "")}\n\nMeeting ID: ${pmiValue}`;
                                        navigator.clipboard.writeText(inviteText);
                                        toast.success("Meeting invitation copied to clipboard!");
                                    }}
                                    className="border border-[#DFE3E8] hover:bg-slate-50 text-slate-700 text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer focus:outline-none transition-colors"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    Copy Invitation
                                </button>

                                <button
                                    onClick={() => {
                                        const newVal = prompt("Edit your Personal Meeting ID (PMI):", pmiValue);
                                        if (newVal !== null && newVal.trim() !== "") {
                                            setPmiValue(newVal.trim());
                                            toast.success("PMI updated successfully!");
                                        }
                                    }}
                                    className="border border-[#DFE3E8] hover:bg-slate-50 text-slate-700 text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer focus:outline-none transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                            </div>

                            {/* Details toggle link */}
                            <div className="mb-4">
                                <button
                                    onClick={() => setShowInvitation(!showInvitation)}
                                    className="text-[#0E71EB] hover:underline text-[13px] font-semibold focus:outline-none cursor-pointer"
                                >
                                    {showInvitation ? "Hide Meeting Invitation" : "Show Meeting Invitation"}
                                </button>
                            </div>

                            {/* Invitation Details Block */}
                            {showInvitation && (
                                <div className="border border-[#DFE3E8] rounded-xl bg-slate-50/50 p-5 mt-2 font-mono text-[12px] text-slate-650 leading-relaxed max-w-xl select-text relative whitespace-pre-wrap shadow-inner">
                                    <p className="font-semibold text-slate-800 mb-2">Meeting Invitation Details:</p>
                                    {`nitinbiswas is inviting you to a scheduled Zoom meeting.

Topic: My Personal Meeting ID (PMI)

Join Zoom Meeting:
${window.location.origin}/meeting/${pmiValue.replace(/\s+/g, "")}

Meeting ID: ${pmiValue}`}
                                </div>
                            )}
                        </div>
                    </main>
                )}

            </div>

            {/* ========== FLOATING DRAGGABLE SETTINGS WINDOW ========== */}
            {showSettings && (
                <div
                    className="fixed z-50 w-[640px] bg-white rounded-xl border border-[#DFE3E8] shadow-2xl shadow-black/10 flex flex-col overflow-hidden select-none"
                    style={{ left: settingsPos.x, top: settingsPos.y, maxHeight: "540px" }}
                >
                    {/* Title bar (draggable) */}
                    <div
                        onMouseDown={handleSettingsDragStart}
                        className="h-[44px] px-5 flex items-center justify-between border-b border-[#DFE3E8] bg-white cursor-move flex-shrink-0"
                    >
                        <span className="text-[15px] font-semibold text-slate-800">Settings</span>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body: Left sidebar + Right content */}
                    <div className="flex flex-1 min-h-0">
                        {/* Settings sidebar tabs */}
                        <div className="w-[110px] bg-white border-r border-[#DFE3E8] py-3 px-2 flex flex-col gap-0.5 flex-shrink-0">
                            {([
                                { id: "general" as const, label: "General", color: "#0E71EB" },
                                { id: "audio" as const, label: "Audio", color: "#E8A317" },
                                { id: "video" as const, label: "Video", color: "#0E71EB" },
                                { id: "chat" as const, label: "Chat", color: "#16A34A" },
                            ]).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSettingsTab(tab.id)}
                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all focus:outline-none ${settingsTab === tab.id
                                        ? "bg-[#0E71EB] text-white shadow-sm"
                                        : "text-[#0E71EB] hover:bg-slate-50"
                                        }`}
                                >
                                    <span className={`w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-bold ${settingsTab === tab.id ? "bg-white/20" : ""
                                        }`} style={{ backgroundColor: settingsTab === tab.id ? "rgba(255,255,255,0.25)" : tab.color }}>
                                        {tab.id === "general" && <Settings className="w-2.5 h-2.5" />}
                                        {tab.id === "audio" && <Headphones className="w-2.5 h-2.5" />}
                                        {tab.id === "video" && <Video className="w-2.5 h-2.5" />}
                                        {tab.id === "chat" && <MessageSquare className="w-2.5 h-2.5" />}
                                    </span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Settings content pane */}
                        <div className="flex-1 overflow-y-auto p-5 text-left">

                            {/* ===== GENERAL TAB ===== */}
                            {settingsTab === "general" && (
                                <div className="space-y-5">
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-slate-800 mb-0.5">Theme</h3>
                                        <p className="text-[11px] text-slate-400 mb-3">Only applied when the system is using light mode, learn more ⓘ</p>
                                        <div className="flex items-center gap-4">
                                            {([
                                                { id: "classic", label: "Classic", gradient: "linear-gradient(135deg, #fff 50%, #1a1a2e 50%)" },
                                                { id: "bloom", label: "Bloom", bg: "#0E71EB" },
                                                { id: "agave", label: "Agave", bg: "#4A7C6F" },
                                                { id: "rose", label: "Rose", bg: "#B05A7A" },
                                            ]).map((t) => (
                                                <div key={t.id} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => setSelectedTheme(t.id)}>
                                                    <div
                                                        className={`w-9 h-9 rounded-full border-2 transition-all ${selectedTheme === t.id ? "border-[#0E71EB] ring-2 ring-[#0E71EB]/20" : "border-slate-200"}`}
                                                        style={t.gradient ? { background: t.gradient } : { backgroundColor: t.bg }}
                                                    />
                                                    <span className="text-[10px] text-slate-500 font-medium">{t.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-slate-800 mb-0.5">Navigation</h3>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] text-slate-500">Items are added to toolbar when accessed</p>
                                            <button className="text-[11px] text-[#0E71EB] hover:underline font-medium focus:outline-none">Reset to default</button>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-slate-800 mb-1.5">Auto-call</h3>
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                            <input type="checkbox" checked={autoCall} onChange={(e) => setAutoCall(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 text-[#0E71EB] focus:ring-[#0E71EB] accent-[#0E71EB]" />
                                            Automatically receive a call when a scheduled meeting starts
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* ===== AUDIO TAB ===== */}
                            {settingsTab === "audio" && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-slate-800 mb-2">Speaker</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none">Test Speaker</button>
                                            <select className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-[11px] text-slate-600 bg-white focus:outline-none focus:border-[#0E71EB] appearance-none cursor-pointer">
                                                <option>Default - MacBook Air Speakers (Built-in)</option>
                                            </select>
                                        </div>
                                        <div className="mb-1">
                                            <span className="text-[11px] font-medium text-slate-600">Volume</span>
                                            <input type="range" min="0" max="100" value={speakerVol} onChange={(e) => setSpeakerVol(Number(e.target.value))} className="w-full h-1.5 mt-1 accent-[#0E71EB] cursor-pointer" />
                                        </div>
                                        <span className="text-[10px] text-slate-400">Output level:</span>
                                    </div>
                                    <div>
                                        <h3 className="text-[13px] font-semibold text-slate-800 mb-2">Microphone</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <button className="px-3 py-1.5 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none">Test Mic</button>
                                            <select className="flex-1 px-3 py-1.5 border border-slate-200 rounded-md text-[11px] text-slate-600 bg-white focus:outline-none focus:border-[#0E71EB] appearance-none cursor-pointer">
                                                <option>Default - MacBook Air Microphone (Built-in)</option>
                                            </select>
                                        </div>
                                        <span className="text-[10px] text-slate-400 block mb-3">Input level:</span>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                            <input type="checkbox" checked={muteMicOnJoin} onChange={(e) => setMuteMicOnJoin(e.target.checked)} className="w-3.5 h-3.5 accent-[#0E71EB]" />
                                            Mute my microphone when join a meeting
                                        </label>
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                            <input type="checkbox" className="w-3.5 h-3.5 accent-[#0E71EB]" />
                                            Press and hold SPACE key to temporarily unmute yourself
                                        </label>
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                            <input type="checkbox" className="w-3.5 h-3.5 accent-[#0E71EB]" />
                                            Sync buttons on headset
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* ===== VIDEO TAB ===== */}
                            {settingsTab === "video" && (
                                <div className="space-y-4">
                                    <div className="w-full h-[160px] bg-slate-900 rounded-lg flex items-center justify-center">
                                        <Video className="w-10 h-10 text-slate-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                            <input type="checkbox" checked={videoOffOnJoin} onChange={(e) => setVideoOffOnJoin(e.target.checked)} className="w-3.5 h-3.5 accent-[#0E71EB]" />
                                            Turn off my video when join a meeting
                                        </label>
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                            <input type="checkbox" className="w-3.5 h-3.5 accent-[#0E71EB]" />
                                            Hide Non-video Participants
                                        </label>
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                            <input type="checkbox" className="w-3.5 h-3.5 accent-[#0E71EB]" />
                                            Hide Self View
                                        </label>
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                            <input type="checkbox" className="w-3.5 h-3.5 accent-[#0E71EB]" />
                                            See myself as the active speaker while speaking
                                        </label>
                                    </div>
                                    <div>
                                        <p className="text-[12px] text-slate-600 font-medium mb-2">Use hardware acceleration for:</p>
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                                <input type="checkbox" className="w-3.5 h-3.5 accent-[#0E71EB]" />
                                                Receiving video
                                            </label>
                                            <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                                <input type="checkbox" className="w-3.5 h-3.5 accent-[#0E71EB]" />
                                                Sending video
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== CHAT TAB ===== */}
                            {settingsTab === "chat" && (
                                <div className="space-y-5">
                                    <div>
                                        <h3 className="text-[14px] font-semibold text-slate-800 mb-3">Left sidebar behavior</h3>
                                        <p className="text-[12px] font-medium text-slate-700 mb-2">Customize sidebar look</p>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-12 border-2 border-[#0E71EB] rounded-md bg-slate-50 cursor-pointer" />
                                            <div className="w-10 h-12 border-2 border-slate-200 rounded-md bg-slate-800 cursor-pointer" />
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4">
                                        <p className="text-[12px] font-semibold text-slate-700 mb-2">Message grouping</p>
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer mb-1">
                                            <input type="radio" name="msgGroup" checked={msgGrouping === "combine"} onChange={() => setMsgGrouping("combine")} className="accent-[#0E71EB]" />
                                            Combine all chats into the Recents folder
                                        </label>
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                            <input type="radio" name="msgGroup" checked={msgGrouping === "separate"} onChange={() => setMsgGrouping("separate")} className="accent-[#0E71EB]" />
                                            Separate direct messages, channels, and meeting chats
                                        </label>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4">
                                        <p className="text-[12px] font-semibold text-slate-700 mb-2">When opening sections or folders:</p>
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer mb-1">
                                            <input type="radio" name="sectionOpen" checked={sectionBehavior === "one"} onChange={() => setSectionBehavior("one")} className="accent-[#0E71EB]" />
                                            Open one section at a time
                                        </label>
                                        <label className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                                            <input type="radio" name="sectionOpen" checked={sectionBehavior === "multiple"} onChange={() => setSectionBehavior("multiple")} className="accent-[#0E71EB]" />
                                            Open multiple sections simultaneously
                                        </label>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                                        <span className="text-[12px] text-slate-600">Manage badge settings</span>
                                        <button className="px-3 py-1 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none">Manage</button>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[12px] font-medium text-slate-600">Reset left sidebar to default</span>
                                            <button className="px-3 py-1 border border-slate-200 rounded-md text-[11px] font-medium text-slate-700 hover:bg-slate-50 focus:outline-none">Reset</button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-tight">You can drag and drop sidebar items to reorder them. Items accessed from More are added to the toolbar automatically.</p>
                                    </div>
                                    <div className="border-t border-slate-100 pt-4">
                                        <h3 className="text-[14px] font-semibold text-slate-800">Unread messages</h3>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}