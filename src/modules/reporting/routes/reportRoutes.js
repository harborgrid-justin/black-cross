/**
 * Report Routes
 */

const express = require('express');

const router = express.Router();
const reportController = require('../controllers/reportController');
const templateController = require('../controllers/templateController');
const scheduleController = require('../controllers/scheduleController');
const dashboardController = require('../controllers/dashboardController');
const analyticsController = require('../controllers/analyticsController');
const metricsController = require('../controllers/metricsController');
const visualizationController = require('../controllers/visualizationController');
const exportController = require('../controllers/exportController');

const {
  validateReport,
  validateGenerateReport,
} = require('../validators/reportValidator');
const {
  validateTemplate,
  validateUpdateTemplate,
} = require('../validators/templateValidator');
const {
  validateSchedule,
  validateUpdateSchedule,
} = require('../validators/scheduleValidator');
const {
  validateKPI,
  validateUpdateKPI,
  validateCollectMetric,
} = require('../validators/kpiValidator');

// Report routes
router.post('/', validateReport, reportController.createReport);
router.post('/generate', validateGenerateReport, reportController.generateReport);
router.get('/:id', reportController.getReport);
router.get('/', reportController.listReports);
router.delete('/:id', reportController.deleteReport);

// Template routes
router.post('/templates', validateTemplate, templateController.createTemplate);
router.get('/templates/:id', templateController.getTemplate);
router.put('/templates/:id', validateUpdateTemplate, templateController.updateTemplate);
router.delete('/templates/:id', templateController.deleteTemplate);
router.get('/templates', templateController.listTemplates);
router.post('/templates/:id/clone', templateController.cloneTemplate);

// Schedule routes
router.post('/schedules', validateSchedule, scheduleController.createSchedule);
router.get('/schedules/:id', scheduleController.getSchedule);
router.put('/schedules/:id', validateUpdateSchedule, scheduleController.updateSchedule);
router.delete('/schedules/:id', scheduleController.deleteSchedule);
router.get('/schedules', scheduleController.listSchedules);
router.get('/executions', scheduleController.getExecutions);

// Dashboard routes
router.post('/dashboards', dashboardController.createDashboard);
router.get('/dashboards/executive', dashboardController.getExecutiveDashboard);
router.get('/dashboards/:id', dashboardController.getDashboard);
router.put('/dashboards/:id', dashboardController.updateDashboard);
router.delete('/dashboards/:id', dashboardController.deleteDashboard);
router.get('/dashboards', dashboardController.listDashboards);
router.post('/dashboards/:id/widgets', dashboardController.addWidget);

// Analytics routes
router.get('/analytics/threat-trends', analyticsController.getThreatTrends);
router.get('/analytics/patterns', analyticsController.detectPatterns);
router.get('/analytics/anomalies', analyticsController.identifyAnomalies);
router.post('/analytics/predict', analyticsController.predictThreats);
router.get('/analytics/correlation', analyticsController.analyzeCorrelation);
router.get('/analytics/geographic', analyticsController.getGeographicDistribution);

// Metrics routes
router.post('/metrics/kpis', validateKPI, metricsController.createKPI);
router.get('/metrics/kpis/:id', metricsController.getKPI);
router.put('/metrics/kpis/:id', validateUpdateKPI, metricsController.updateKPI);
router.delete('/metrics/kpis/:id', metricsController.deleteKPI);
router.get('/metrics/kpis', metricsController.listKPIs);
router.post('/metrics/kpis/:id/collect', validateCollectMetric, metricsController.collectMetric);
router.get('/metrics/kpis/:id/history', metricsController.getKPIHistory);
router.get('/metrics/predefined', metricsController.getPredefinedKPIs);
router.get('/metrics/aggregate', metricsController.getAggregateMetrics);

// Visualization routes
router.post('/visualizations', visualizationController.createVisualization);
router.get('/visualizations/:id', visualizationController.getVisualization);
router.post('/visualizations/render', visualizationController.renderVisualization);
router.put('/visualizations/:id', visualizationController.updateVisualization);
router.delete('/visualizations/:id', visualizationController.deleteVisualization);
router.get('/visualizations', visualizationController.listVisualizations);

// Export routes
router.post('/:id/export', exportController.createExport);
router.get('/exports/:id', exportController.getExport);
router.get('/exports/:id/download', exportController.downloadExport);
router.get('/exports', exportController.listExports);
router.delete('/exports/:id', exportController.deleteExport);

module.exports = router;
