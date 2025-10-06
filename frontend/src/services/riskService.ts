import { apiClient } from './api';
import type { RiskAssessment, ApiResponse } from '@/types';

export const riskService = {
  // Get risk scores
  async getRiskScores(): Promise<ApiResponse<RiskAssessment[]>> {
    return apiClient.get<ApiResponse<RiskAssessment[]>>('/risk-assessment/scores');
  },

  // Get asset criticality
  async getAssetCriticality(assetId: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/risk-assessment/assets/${assetId}/criticality`);
  },

  // Assess asset
  async assessAsset(data: unknown): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>('/risk-assessment/assets/assess', data);
  },

  // Calculate risk
  async calculateRisk(data: unknown): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>('/risk-assessment/calculate', data);
  },

  // Get risk priorities
  async getPriorities(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/risk-assessment/priorities');
  },

  // Get risk trends
  async getTrends(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/risk-assessment/trends');
  },

  // Get executive report
  async getExecutiveReport(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/risk-assessment/reports/executive');
  },

  // Generate report
  async generateReport(options: unknown): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>('/risk-assessment/reports/generate', options);
  },

  // Get impact analysis
  async getImpactAnalysis(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/risk-assessment/impact-analysis');
  },
};
