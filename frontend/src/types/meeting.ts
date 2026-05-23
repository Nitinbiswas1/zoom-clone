export interface Meeting {
  id: number;
  meeting_id: string;
  title: string;
  description?: string | null;
  created_by: string;
  scheduled_time?: string | null;
  duration?: number | null;
  created_at: string;
  is_instant: boolean;
}

export interface MeetingCreateInput {
  title: string;
  description?: string;
  created_by: string;
  scheduled_time?: string;
  duration?: number;
  is_instant?: boolean;
}

export interface InstantMeetingCreateInput {
  title?: string;
  created_by?: string;
}

export interface RecentMeeting {
  id: number;
  meeting_id: string;
  participant_name: string;
  joined_at: string;
}

export interface RecentMeetingCreateInput {
  meeting_id: string;
  participant_name: string;
}
