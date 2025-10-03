/**
 * Visualization Service
 * Business logic for data visualization
 */

const Visualization = require('../models/Visualization');
const logger = require('../utils/logger');

class VisualizationService {
  /**
   * Create a new visualization
   */
  async createVisualization(visualizationData) {
    try {
      const visualization = new Visualization(visualizationData);
      await visualization.save();

      logger.info('Visualization created', { visualizationId: visualization.id });
      return visualization;
    } catch (error) {
      logger.error('Error creating visualization', { error: error.message });
      throw error;
    }
  }

  /**
   * Get visualization by ID
   */
  async getVisualization(visualizationId) {
    try {
      const visualization = await Visualization.findOne({ id: visualizationId });

      if (!visualization) {
        throw new Error('Visualization not found');
      }

      return visualization;
    } catch (error) {
      logger.error('Error retrieving visualization', { visualizationId, error: error.message });
      throw error;
    }
  }

  /**
   * Render visualization with data
   */
  async renderVisualization(visualizationId, parameters = {}) {
    try {
      const visualization = await Visualization.findOne({ id: visualizationId });

      if (!visualization) {
        throw new Error('Visualization not found');
      }

      // Fetch data based on data source
      const data = await this.fetchVisualizationData(
        visualization.type,
        visualization.data_source,
        parameters,
      );

      // Update visualization with rendered data
      visualization.data = data;
      visualization.last_rendered = new Date();
      await visualization.save();

      logger.info('Visualization rendered', { visualizationId });
      return {
        ...visualization.toObject(),
        rendered_data: this.formatDataForChart(visualization.type, data),
      };
    } catch (error) {
      logger.error('Error rendering visualization', { visualizationId, error: error.message });
      throw error;
    }
  }

  /**
   * Fetch data for visualization
   */
  async fetchVisualizationData(type, dataSource, parameters) {
    // Simulate data fetching based on visualization type
    const mockDataGenerators = {
      bar_chart: () => this.generateBarChartData(),
      line_chart: () => this.generateLineChartData(),
      pie_chart: () => this.generatePieChartData(),
      scatter_plot: () => this.generateScatterPlotData(),
      heat_map: () => this.generateHeatMapData(),
      geographic_map: () => this.generateGeographicMapData(),
      network_graph: () => this.generateNetworkGraphData(),
      time_series: () => this.generateTimeSeriesData(),
      risk_matrix: () => this.generateRiskMatrixData(),
    };

    const generator = mockDataGenerators[type] || mockDataGenerators.bar_chart;
    return generator();
  }

  /**
   * Generate mock data for different chart types
   */
  generateBarChartData() {
    return {
      labels: ['Critical', 'High', 'Medium', 'Low', 'Info'],
      datasets: [{
        label: 'Threats by Severity',
        data: [15, 35, 48, 22, 8],
        backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#17a2b8'],
      }],
    };
  }

  generateLineChartData() {
    const labels = [];
    const data = [];
    for (let i = 30; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toISOString().split('T')[0]);
      data.push(Math.floor(Math.random() * 100) + 20);
    }

    return {
      labels,
      datasets: [{
        label: 'Threats Over Time',
        data,
        borderColor: '#007bff',
        fill: false,
      }],
    };
  }

  generatePieChartData() {
    return {
      labels: ['Malware', 'Phishing', 'Ransomware', 'DDoS', 'Other'],
      datasets: [{
        data: [30, 25, 20, 15, 10],
        backgroundColor: ['#dc3545', '#fd7e14', '#ffc107', '#28a745', '#6c757d'],
      }],
    };
  }

  generateScatterPlotData() {
    const data = [];
    for (let i = 0; i < 50; i += 1) {
      data.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 20 + 5,
      });
    }

    return {
      datasets: [{
        label: 'Threat Correlation',
        data,
      }],
    };
  }

  generateHeatMapData() {
    const data = [];
    const hours = 24;
    const days = 7;

    for (let day = 0; day < days; day += 1) {
      for (let hour = 0; hour < hours; hour += 1) {
        data.push({
          x: hour,
          y: day,
          value: Math.floor(Math.random() * 100),
        });
      }
    }

    return {
      data,
      xLabels: Array.from({ length: hours }, (_, i) => `${i}:00`),
      yLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    };
  }

  generateGeographicMapData() {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { country: 'USA', threats: 450 },
          geometry: { type: 'Point', coordinates: [-98.5795, 39.8283] },
        },
        {
          type: 'Feature',
          properties: { country: 'China', threats: 380 },
          geometry: { type: 'Point', coordinates: [104.1954, 35.8617] },
        },
        {
          type: 'Feature',
          properties: { country: 'Russia', threats: 320 },
          geometry: { type: 'Point', coordinates: [105.3188, 61.5240] },
        },
      ],
    };
  }

  generateNetworkGraphData() {
    return {
      nodes: [
        { id: '1', label: 'Threat Actor A', group: 'actor' },
        { id: '2', label: 'Malware X', group: 'malware' },
        { id: '3', label: 'Target Corp', group: 'target' },
        { id: '4', label: 'Infrastructure Y', group: 'infrastructure' },
      ],
      edges: [
        { from: '1', to: '2', label: 'uses' },
        { from: '2', to: '3', label: 'targets' },
        { from: '1', to: '4', label: 'controls' },
      ],
    };
  }

  generateTimeSeriesData() {
    return this.generateLineChartData();
  }

  generateRiskMatrixData() {
    const data = [];
    for (let likelihood = 1; likelihood <= 5; likelihood += 1) {
      for (let impact = 1; impact <= 5; impact += 1) {
        const count = Math.floor(Math.random() * 20);
        if (count > 0) {
          data.push({
            likelihood,
            impact,
            count,
            risk_level: this.calculateRiskLevel(likelihood, impact),
          });
        }
      }
    }

    return {
      data,
      axes: {
        x: { label: 'Likelihood', scale: ['Very Low', 'Low', 'Medium', 'High', 'Very High'] },
        y: { label: 'Impact', scale: ['Very Low', 'Low', 'Medium', 'High', 'Very High'] },
      },
    };
  }

  calculateRiskLevel(likelihood, impact) {
    const score = likelihood * impact;
    if (score >= 20) return 'critical';
    if (score >= 12) return 'high';
    if (score >= 6) return 'medium';
    return 'low';
  }

  /**
   * Format data for specific chart type
   */
  formatDataForChart(type, data) {
    return {
      type,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update visualization
   */
  async updateVisualization(visualizationId, updates) {
    try {
      const visualization = await Visualization.findOneAndUpdate(
        { id: visualizationId },
        { $set: updates },
        { new: true, runValidators: true },
      );

      if (!visualization) {
        throw new Error('Visualization not found');
      }

      logger.info('Visualization updated', { visualizationId });
      return visualization;
    } catch (error) {
      logger.error('Error updating visualization', { visualizationId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete visualization
   */
  async deleteVisualization(visualizationId) {
    try {
      const result = await Visualization.deleteOne({ id: visualizationId });

      if (result.deletedCount === 0) {
        throw new Error('Visualization not found');
      }

      logger.info('Visualization deleted', { visualizationId });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting visualization', { visualizationId, error: error.message });
      throw error;
    }
  }

  /**
   * List visualizations with filters
   */
  async listVisualizations(filters = {}) {
    try {
      const {
        type,
        status,
        created_by,
        page = 1,
        limit = 20,
      } = filters;

      const query = {};
      if (type) query.type = type;
      if (status) query.status = status;
      if (created_by) query.created_by = created_by;

      const skip = (page - 1) * limit;

      const visualizations = await Visualization.find(query)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Visualization.countDocuments(query);

      return {
        visualizations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error listing visualizations', { error: error.message });
      throw error;
    }
  }
}

module.exports = new VisualizationService();
