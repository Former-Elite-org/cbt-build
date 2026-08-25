import { _get, _post, _put, _delete } from '@/Helper';
import {
  ApiItemResponse,
  ApiListResponse,
  BlueprintSpec,
  BlueprintStatusResponse,
  TestBlueprint,
} from '../types/blueprint.types';

const BASE = 'api/cbt/blueprints';

export const blueprintService = {
  list: async (): Promise<ApiListResponse<TestBlueprint>> => {
    return new Promise((resolve, reject) => {
      _get(BASE, (res) => resolve(res), (err) => reject(err));
    });
  },

  getById: async (id: string): Promise<ApiItemResponse<TestBlueprint>> => {
    return new Promise((resolve, reject) => {
      _get(`${BASE}/${id}`, (res) => resolve(res), (err) => reject(err));
    });
  },

  getByExam: async (examId: string): Promise<ApiItemResponse<TestBlueprint>> => {
    return new Promise((resolve, reject) => {
      _get(`${BASE}/exam/${examId}`, (res) => resolve(res), (err) => reject(err));
    });
  },

  getStatus: async (examId: string): Promise<BlueprintStatusResponse> => {
    return new Promise((resolve, reject) => {
      _get(`${BASE}/status/${examId}`, (res) => resolve(res), (err) => reject(err));
    });
  },

  create: async (data: {
    exam_id?: string;
    subject_code?: string;
    title?: string;
    specifications: BlueprintSpec[];
  }): Promise<ApiItemResponse<TestBlueprint>> => {
    return new Promise((resolve, reject) => {
      _post(BASE, data, (res) => resolve(res), (err) => reject(err));
    });
  },

  update: async (
    id: string,
    data: {
      exam_id?: string;
      subject_code?: string;
      title?: string;
      status?: string;
      specifications?: BlueprintSpec[];
    }
  ): Promise<ApiItemResponse<TestBlueprint>> => {
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