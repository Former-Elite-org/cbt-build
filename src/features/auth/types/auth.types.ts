export interface LoginCredentials {
  username: string;
  password: string;
  type: 'users' | 'students';
  short_name?: string;
  school_id?: string;
}

export interface SchoolOption {
  user_id: number;
  school_id: string;
  school_name: string;
  badge_url: string | null;
  user_type: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  school_id?: string;
  user?: any;
  message?: string;
  errors?: Record<string, string>;
  // Multi-school selection flow
  requires_school_selection?: boolean;
  schools?: SchoolOption[];
  selection_token?: string;
}

export interface UserProfile {
  success: boolean;
  user: {
    user_id: string;
    username: string;
    email: string;
    user_type: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    school_id: string;
    branch_id?: string;
    school_location?: any;
  };
  school?: any;
  classes?: any[];
  subjects?: any[];
  admin?: any;
  student?: any;
  teacher?: any;
  school_locations?: any[];
  academic_calendar?: any[];
  sections?: any[];
  branches?: any[];
}

export interface SchoolDetails {
  school_id: string;
  school_name?: string;
  name?: string;
  short_name?: string;
  badge_url?: string | null;
  cbt_center?: number | null;
  cbt_enabled?: number | null;
  cbt_stand_alone?: number | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  school_name: string;
  short_name: string;
  state?: string;
  lga?: string;
  address?: string;
  primary_contact_number?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  school_id?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    user_type: string;
    school_id: string;
  };
  errors?: Record<string, string>;
}

export interface StudentRegisterPayload {
  full_name: string;
  email?: string;
  password?: string;
  phone?: string;
  boards: string[];
}

export interface ParentRegisterPayload {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  child_admission_no?: string;
}

export interface OnboardingPayload {
  school_motto?: string;
  academic_year?: string;
  term?: 'First term' | 'Second term' | 'Third term';
  session_start_date?: string;
  session_end_date?: string;
  nursery_section?: number;
  primary_section?: number;
  junior_secondary_section?: number;
  senior_secondary_section?: number;
  islamiyya?: number;
  tahfiz?: number;
  mission?: string;
  vission?: string;
  about_us?: string;
  cbt_stand_alone?: number;
}

