/**
 * @fileoverview Risk Assessment API service.
 * 
 * Provides methods for risk assessments, calculations, and mitigation recommendations.
 * 
 * @module services/riskService
 */

import { apiClient } from './api';
import type { RiskAssessment, ApiResponse } from '@/types';

/**
 * Service for handling risk assessment API operations.
 *
 * Provides comprehensive methods for risk scoring, asset criticality assessment,
 * risk calculation, trend analysis, and executive reporting. Requires authentication.
 * All methods return promises and handle errors appropriately.
 *
 * @namespace riskService
 * @example
 * ```typescript
 * // Get all risk scores
 * const scores = await riskService.getRiskScores();
 *
 * // Calculate risk for an asset
 * const risk = await riskService.calculateRisk({
 *   assetId: 'asset-123',
 *   threats: ['threat-1', 'threat-2']
 * });
 * ```
 */
export const riskService = {
  /**
   * Retrieves all risk scores across the organization.
   *
   * @async
   * @returns {Promise<ApiResponse<RiskAssessment[]>>} List of risk assessments with scores
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * const scores = await riskService.getRiskScores();
   * ```
   */
  async getRiskScores(): Promise<ApiResponse<RiskAssessment[]>> {
    return apiClient.get<ApiResponse<RiskAssessment[]>>('/risk-assessment/scores');
  },

  /**
   * Retrieves the criticality rating for a specific asset.
   *
   * Asset criticality is based on business value, dependencies, and potential impact.
   *
   * @async
   * @param {string} assetId - The asset ID
   * @returns {Promise<ApiResponse<unknown>>} Asset criticality data with rating and justification
   * @throws {Error} When asset not found or request fails
   *
   * @example
   * ```typescript
   * const criticality = await riskService.getAssetCriticality('asset-123');
   * ```
   */
  async getAssetCriticality(assetId: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>(`/risk-assessment/assets/${assetId}/criticality`);
  },

  /**
   * Performs a risk assessment for an asset.
   *
   * Evaluates threats, vulnerabilities, and controls to generate a comprehensive risk profile.
   *
   * @async
   * @param {unknown} data - Assessment data including asset details, threats, and controls
   * @returns {Promise<ApiResponse<unknown>>} Assessment results with risk score and recommendations
   * @throws {Error} When assessment fails or invalid data provided
   *
   * @example
   * ```typescript
   * const assessment = await riskService.assessAsset({
   *   assetId: 'asset-123',
   *   threats: ['malware', 'unauthorized-access'],
   *   existingControls: ['firewall', 'antivirus']
   * });
   * ```
   */
  async assessAsset(data: unknown): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>('/risk-assessment/assets/assess', data);
  },

  /**
   * Calculates risk score based on provided parameters.
   *
   * Uses probability and impact to compute quantitative risk scores.
   *
   * @async
   * @param {unknown} data - Risk calculation parameters including probability and impact
   * @returns {Promise<ApiResponse<unknown>>} Calculated risk score with breakdown
   * @throws {Error} When calculation fails or invalid parameters
   *
   * @example
   * ```typescript
   * const risk = await riskService.calculateRisk({
   *   probability: 0.75,
   *   impact: 'high',
   *   threats: ['data-breach', 'ransomware']
   * });
   * ```
   */
  async calculateRisk(data: unknown): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>('/risk-assessment/calculate', data);
  },

  /**
   * Retrieves prioritized list of risks requiring attention.
   *
   * Returns risks sorted by severity, likelihood, and business impact.
   *
   * @async
   * @returns {Promise<ApiResponse<unknown>>} Prioritized risk list
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * const priorities = await riskService.getPriorities();
   * ```
   */
  async getPriorities(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/risk-assessment/priorities');
  },

  /**
   * Retrieves risk trend analysis over time.
   *
   * Provides historical data showing how risk posture has changed.
   *
   * @async
   * @returns {Promise<ApiResponse<unknown>>} Trend data with historical risk scores
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * const trends = await riskService.getTrends();
   * ```
   */
  async getTrends(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/risk-assessment/trends');
  },

  /**
   * Retrieves executive-level risk report.
   *
   * Provides high-level summary suitable for C-suite and board presentations.
   *
   * @async
   * @returns {Promise<ApiResponse<unknown>>} Executive summary with key metrics and insights
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * const report = await riskService.getExecutiveReport();
   * ```
   */
  async getExecutiveReport(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/risk-assessment/reports/executive');
  },

  /**
   * Generates a custom risk assessment report.
   *
   * Allows specification of report scope, format, and included sections.
   *
   * @async
   * @param {unknown} options - Report configuration including scope, format, and filters
   * @returns {Promise<ApiResponse<unknown>>} Generated report data or download link
   * @throws {Error} When report generation fails
   *
   * @example
   * ```typescript
   * const report = await riskService.generateReport({
   *   format: 'pdf',
   *   scope: 'department-it',
   *   includeTrends: true,
   *   includeRecommendations: true
   * });
   * ```
   */
  async generateReport(options: unknown): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>('/risk-assessment/reports/generate', options);
  },

  /**
   * Retrieves business impact analysis for potential security incidents.
   *
   * Evaluates financial, operational, and reputational impact of risk scenarios.
   *
   * @async
   * @returns {Promise<ApiResponse<unknown>>} Impact analysis with potential cost and disruption estimates
   * @throws {Error} When the API request fails
   *
   * @example
   * ```typescript
   * const impact = await riskService.getImpactAnalysis();
   * ```
   */
  async getImpactAnalysis(): Promise<ApiResponse<unknown>> {
    return apiClient.get<ApiResponse<unknown>>('/risk-assessment/impact-analysis');
  },
};
