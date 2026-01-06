import api from './api';
import { SymptomInput, Diagnosis } from '../types/diagnosis';

export const diagnosisService = {
  checkSymptoms: async (input: SymptomInput): Promise<Diagnosis> => {
    const response = await api.post<Diagnosis>('/api/diagnosis/check', input);
    return response.data;
  },
};