import { UserRole, BaseEntity } from './common.types';

export interface User extends BaseEntity {
  user_id: string;
  username: string;
  email: string;
  user_type: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  school_id: string;
  branch_id?: string;
  school_location?: any;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

