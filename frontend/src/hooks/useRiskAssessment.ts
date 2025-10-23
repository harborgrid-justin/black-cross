/**
 * @fileoverview Custom React hook for RiskAssessment feature. Provides state management and operations for RiskAssessment.
 * 
 * @module hooks/useRiskAssessment
 */

import { useState, useCallback } from 'react';
import { riskService } from '@/services/riskService';
import type { RiskAssessment, ApiResponse } from '@/types';

/**
 * Custom hook for risk assessment queries
 */
export function useRiskQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRiskScores = useCallback(async (): Promise<RiskAssessment[] | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskService.getRiskScores();
      return response.data || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch risk scores';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAssetCriticality = useCallback(async (assetId: string): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskService.getAssetCriticality(assetId);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch asset criticality';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPriorities = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskService.getPriorities();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch priorities';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrends = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskService.getTrends();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch trends';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getExecutiveReport = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskService.getExecutiveReport();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch executive report';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getImpactAnalysis = useCallback(async (): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskService.getImpactAnalysis();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch impact analysis';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getRiskScores,
    getAssetCriticality,
    getPriorities,
    getTrends,
    getExecutiveReport,
    getImpactAnalysis,
    loading,
    error,
  };
}

/**
 * Custom hook for risk assessment mutations
 */
export function useRiskMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessAsset = useCallback(async (data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskService.assessAsset(data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assess asset';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateRisk = useCallback(async (data: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskService.calculateRisk(data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to calculate risk';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (options: unknown): Promise<ApiResponse<unknown> | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await riskService.generateReport(options);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assessAsset,
    calculateRisk,
    generateReport,
    loading,
    error,
  };
}

/**
 * Custom hook for composite risk assessment operations
 */
export function useRiskComposite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assessAndCalculate = useCallback(async (assetData: unknown): Promise<{
    assessment: ApiResponse<unknown> | null;
    risk: ApiResponse<unknown> | null;
  }> => {
    try {
      setLoading(true);
      setError(null);
      
      const assessment = await riskService.assessAsset(assetData);
      const risk = await riskService.calculateRisk(assetData);
      
      return { assessment, risk };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assess and calculate risk';
      setError(message);
      return { assessment: null, risk: null };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    assessAndCalculate,
    loading,
    error,
  };
}

/**
 * Main hook that combines all risk assessment operations
 */
export function useRiskAssessment() {
  const queries = useRiskQuery();
  const mutations = useRiskMutation();
  const composites = useRiskComposite();

  return {
    queries,
    mutations,
    composites,
  };
}
