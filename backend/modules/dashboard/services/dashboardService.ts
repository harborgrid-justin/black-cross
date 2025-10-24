import { Incident, Vulnerability, IOC } from '../../../models';

class DashboardService {
  /**
   * Gathers statistics for the main dashboard.
   * This includes counts of active threats, open incidents, vulnerabilities,
   * and a calculated risk score.
   */
  async getDashboardStats() {
    try {
      const activeThreats = await IOC.count({ where: { status: 'active' } });
      const openIncidents = await Incident.count({ where: { status: 'open' } });
      const vulnerabilities = await Vulnerability.count({ where: { status: 'open' } });

      // Example risk score calculation (can be expanded)
      const riskScore = this.calculateRiskScore(activeThreats, openIncidents, vulnerabilities);

      return {
        activeThreats,
        openIncidents,
        vulnerabilities,
        riskScore,
        threatTrend: 5, // Placeholder for trend data
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to retrieve dashboard statistics.');
    }
  }

  /**
   * Calculates a risk score based on various metrics.
   * This is a simplified example. A real-world implementation would be more complex.
   */
  private calculateRiskScore(activeThreats: number, openIncidents: number, vulnerabilities: number): number {
    let score = 0;
    score += activeThreats * 2; // Each active threat adds 2 points
    score += openIncidents * 5; // Each open incident adds 5 points
    score += vulnerabilities * 1; // Each vulnerability adds 1 point
    return Math.min(100, score); // Cap score at 100
  }
}

export default new DashboardService();
