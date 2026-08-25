import { _get, _post, _put, _delete } from '@/Helper';
import {
  ApiItemResponse,
  ApiListResponse,
  ItemBankEntry,
  ItemBankFilters,
} from '../types/itemBank.types';

const BASE = 'api/cbt/item-bank';

function toQuery(filters: ItemBankFilters = {}): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const itemBankService = {
  list: async (filters?: ItemBankFilters): Promise<ApiListResponse<ItemBankEntry>> => {
    return new Promise((resolve, reject) => {
      _get(`${BASE}${toQuery(filters)}`, (res) => resolve(res), (err) => reject(err));
    });
  },

  getById: async (id: string): Promise<ApiItemResponse<ItemBankEntry>> => {
    return new Promise((resolve, reject) => {
      _get(`${BASE}/${id}`, (res) => resolve(res), (err) => reject(err));
    });
  },

  add: async (data: {
    question_id: string;
    subject_code?: string;
    subject_name?: string;
    topic_name?: string;
    bloom_level?: string;
    difficulty_level?: string;
    tags?: string[];
    status?: string;
  }): Promise<ApiItemResponse<ItemBankEntry>> => {
    return new Promise((resolve, reject) => {
      _post(BASE, data, (res) => resolve(res), (err) => reject(err));
    });
  },

  syncFromExam: async (examId: string): Promise<ApiItemResponse<string[]>> => {
    return new Promise((resolve, reject) => {
      _post(`${BASE}/sync/${examId}`, {}, (res) => resolve(res), (err) => reject(err));
    });
  },

  update: async (
    id: string,
    data: { tags?: string[]; status?: string; peer_reviewed?: boolean }
  ): Promise<ApiItemResponse<null>> => {
    return new Promise((resolve, reject) => {
      _put(`${BASE}/${id}`, data, (res) => resolve(res), (err) => reject(err));
    });
  },

  remove: async (id: string): Promise<ApiItemResponse<null>> => {
    return new Promise((resolve, reject) => {
      _delete(`${BASE}/${id}`, {}, (res) => resolve(res), (err) => reject(err));
    });
  },
};