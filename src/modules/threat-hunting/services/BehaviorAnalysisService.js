/**
 * Behavior Analysis Service
 * Business logic for behavioral analysis tools (Feature 3.4)
 */

const BehaviorAnalysis = require('../models/BehaviorAnalysis');
const database = require('../models/database');

class BehaviorAnalysisService {
  /**
   * Analyze entity behavior
   */
  async analyzeBehavior(entityId, entityType, options = {}) {
    const analysisType = options.analysisType || (entityType === 'user' ? 'user' : 'entity');
    const analysisWindow = options.analysisWindow || '30d';

    // Get baseline behavior
    const baseline = await this.getBaselineBehavior(entityId, entityType, analysisWindow);

    // Get current behavior
    const current = await this.getCurrentBehavior(entityId, entityType);

    // Calculate anomaly score
    const anomalyScore = this.calculateAnomalyScore(baseline, current);

    // Calculate risk score
    const riskScore = this.calculateRiskScore(anomalyScore, current);

    // Identify deviations
    const deviations = this.identifyDeviations(baseline, current);

    // Perform peer comparison
    const peerComparison = await this.performPeerComparison(
      entityId,
      entityType,
      current,
    );

    // Temporal analysis
    const temporalAnalysis = this.performTemporalAnalysis(current);

    // Detect flags
    const flags = this.detectBehaviorFlags(deviations, anomalyScore, riskScore);

    const analysis = new BehaviorAnalysis({
      entityId,
      entityType,
      analysisType,
      baselineBehavior: baseline,
      currentBehavior: current,
      anomalyScore,
      riskScore,
      deviations,
      peerComparison,
      temporalAnalysis,
      analysisWindow,
      status: 'completed',
      flags,
    });

    const saved = await database.saveBehaviorAnalysis(analysis.toJSON());
    return BehaviorAnalysis.fromDatabase(saved);
  }

  /**
   * Get behavior analysis by ID
   */
  async getBehaviorAnalysis(analysisId) {
    const analysis = await database.getBehaviorAnalysis(analysisId);
    if (!analysis) {
      throw new Error('Behavior analysis not found');
    }
    return BehaviorAnalysis.fromDatabase(analysis);
  }

  /**
   * Get behavior analyses for an entity
   */
  async getEntityBehaviorHistory(entityId) {
    const analyses = await database.listBehaviorAnalyses({ entityId });
    return analyses.map((a) => BehaviorAnalysis.fromDatabase(a));
  }

  /**
   * Get baseline behavior for an entity
   */
  async getBaselineBehavior(entityId, entityType, window) {
    // Simulate baseline calculation from historical data
    return {
      avgLoginCount: 50,
      avgDataTransfer: 1024 * 1024 * 100, // 100MB
      avgFileAccess: 200,
      commonAccessTimes: ['08:00-12:00', '13:00-17:00'],
      commonLocations: ['Office', 'Home'],
      commonIPs: ['192.168.1.100', '10.0.0.50'],
      privilegedAccessCount: 5,
      window,
    };
  }

  /**
   * Get current behavior for an entity
   */
  async getCurrentBehavior(_entityId, _entityType) {
    // Simulate current behavior data
    return {
      loginCount: 85,
      dataTransfer: 1024 * 1024 * 500, // 500MB (5x normal)
      fileAccess: 450,
      accessTimes: ['02:00-04:00', '08:00-12:00'],
      locations: ['Unknown', 'Office'],
      ips: ['192.168.1.100', '203.0.113.42'],
      privilegedAccessCount: 15,
      period: '24h',
    };
  }

  /**
   * Calculate anomaly score (0-100)
   */
  calculateAnomalyScore(baseline, current) {
    let score = 0;
    const weights = {
      loginCount: 0.15,
      dataTransfer: 0.25,
      fileAccess: 0.15,
      location: 0.20,
      time: 0.15,
      privilegedAccess: 0.10,
    };

    // Compare login count
    const loginDeviation = Math.abs(current.loginCount - baseline.avgLoginCount)
      / baseline.avgLoginCount;
    score += loginDeviation * 100 * weights.loginCount;

    // Compare data transfer
    const dataDeviation = Math.abs(current.dataTransfer - baseline.avgDataTransfer)
      / baseline.avgDataTransfer;
    score += dataDeviation * 100 * weights.dataTransfer;

    // Check for unusual locations
    const unusualLocations = current.locations.filter(
      (loc) => !baseline.commonLocations.includes(loc),
    );
    if (unusualLocations.length > 0) {
      score += 70 * weights.location;
    }

    // Check for unusual access times
    const unusualTimes = current.accessTimes.filter(
      (time) => !baseline.commonAccessTimes.includes(time),
    );
    if (unusualTimes.length > 0) {
      score += 60 * weights.time;
    }

    // Check privileged access increase
    const privDeviation = Math.abs(current.privilegedAccessCount - baseline.privilegedAccessCount)
      / baseline.privilegedAccessCount;
    score += privDeviation * 100 * weights.privilegedAccess;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate risk score (0-100)
   */
  calculateRiskScore(anomalyScore, currentBehavior) {
    let riskScore = anomalyScore * 0.6;

    // Add risk for privileged access
    if (currentBehavior.privilegedAccessCount > 10) {
      riskScore += 15;
    }

    // Add risk for unusual locations
    const unusualLocations = currentBehavior.locations.filter((loc) => loc === 'Unknown');
    if (unusualLocations.length > 0) {
      riskScore += 20;
    }

    return Math.min(Math.round(riskScore), 100);
  }

  /**
   * Identify specific deviations
   */
  identifyDeviations(baseline, current) {
    const deviations = [];

    if (current.dataTransfer > baseline.avgDataTransfer * 2) {
      deviations.push({
        type: 'data_transfer',
        severity: 'high',
        description: 'Data transfer significantly above baseline',
        value: current.dataTransfer,
        baseline: baseline.avgDataTransfer,
      });
    }

    if (current.loginCount > baseline.avgLoginCount * 1.5) {
      deviations.push({
        type: 'login_frequency',
        severity: 'medium',
        description: 'Login count higher than normal',
        value: current.loginCount,
        baseline: baseline.avgLoginCount,
      });
    }

    const unusualIPs = current.ips.filter((ip) => !baseline.commonIPs.includes(ip));
    if (unusualIPs.length > 0) {
      deviations.push({
        type: 'unusual_ip',
        severity: 'high',
        description: 'Access from unusual IP addresses',
        value: unusualIPs,
      });
    }

    return deviations;
  }

  /**
   * Perform peer comparison
   */
  async performPeerComparison(_entityId, _entityType, _currentBehavior) {
    // Simulate peer group analysis
    return {
      peerGroup: 'normal_users',
      peerCount: 150,
      percentile: 95, // This user is in 95th percentile for unusual behavior
      comparison: {
        dataTransfer: 'significantly_above',
        loginFrequency: 'above_average',
        fileAccess: 'above_average',
      },
    };
  }

  /**
   * Perform temporal analysis
   */
  performTemporalAnalysis(_currentBehavior) {
    return {
      trend: 'increasing',
      peakActivity: '02:00-04:00',
      unusualHours: true,
      weekdayPattern: 'irregular',
      weekendActivity: false,
    };
  }

  /**
   * Detect behavior flags
   */
  detectBehaviorFlags(deviations, anomalyScore, riskScore) {
    const flags = [];

    if (anomalyScore > 70) {
      flags.push({
        type: 'high_anomaly',
        severity: 'critical',
        description: 'Highly anomalous behavior detected',
      });
    }

    if (riskScore > 70) {
      flags.push({
        type: 'high_risk',
        severity: 'critical',
        description: 'High-risk behavior pattern',
      });
    }

    deviations.forEach((deviation) => {
      if (deviation.severity === 'high') {
        flags.push({
          type: `deviation_${deviation.type}`,
          severity: 'high',
          description: deviation.description,
        });
      }
    });

    return flags;
  }
}

module.exports = new BehaviorAnalysisService();
