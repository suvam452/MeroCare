export interface SymptomInput {
  symptoms: string[];
  age?: number;
  gender?: string;
}

export interface Diagnosis {
  id: number;
  predicted_disease: string;
  suggested_treatment: string;
  created_at: string;
  symptoms: string;
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  full_response: string;
}