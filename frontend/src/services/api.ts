import axios from "axios";
import {
  Meeting,
  MeetingCreateInput,
  InstantMeetingCreateInput,
  RecentMeeting,
  RecentMeetingCreateInput,
} from "../types/meeting";

// Base URL for the FastAPI backend, defaulting to http://localhost:8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Creates a new instant meeting immediately.
 * POST /meetings/instant
 */
export const createInstantMeeting = async (
  data: InstantMeetingCreateInput = {}
): Promise<Meeting> => {
  const response = await api.post<Meeting>("/meetings/instant", data);
  return response.data;
};

/**
 * Schedules a new meeting for a future date/time.
 * POST /meetings/schedule
 */
export const scheduleMeeting = async (
  data: MeetingCreateInput
): Promise<Meeting> => {
  const response = await api.post<Meeting>("/meetings/schedule", data);
  return response.data;
};

/**
 * Retrieves a list of upcoming scheduled meetings.
 * GET /meetings/upcoming
 */
export const getUpcomingMeetings = async (): Promise<Meeting[]> => {
  const response = await api.get<Meeting[]>("/meetings/upcoming");
  return response.data;
};

/**
 * Validates a meeting's existence and returns its details if it exists.
 * GET /meetings/{meeting_id}
 */
export const joinMeeting = async (meetingId: string): Promise<Meeting> => {
  // Strip spaces/formatting before sending to backend
  const formattedId = meetingId.trim();
  const response = await api.get<Meeting>(`/meetings/${formattedId}`);
  return response.data;
};

/**
 * Saves a participant log when joining a meeting.
 * POST /recent
 */
export const saveRecentMeeting = async (
  data: RecentMeetingCreateInput
): Promise<RecentMeeting> => {
  const response = await api.post<RecentMeeting>("/recent", data);
  return response.data;
};

/**
 * Retrieves a list of recently joined meetings.
 * GET /recent
 */
export const getRecentMeetings = async (limit: number = 10): Promise<RecentMeeting[]> => {
  const response = await api.get<RecentMeeting[]>(`/recent?limit=${limit}`);
  return response.data;
};

export default api;
