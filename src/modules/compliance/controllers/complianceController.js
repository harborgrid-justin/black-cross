/**
 * Compliance Controller
 * Handles HTTP requests for compliance operations
 */

const frameworkService = require('../services/frameworkService');
const auditService = require('../services/auditService');
const gapAnalysisService = require('../services/gapAnalysisService');
const policyService = require('../services/policyService');
const reportingService = require('../services/reportingService');
const evidenceService = require('../services/evidenceService');
const requirementService = require('../services/requirementService');
const logger = require('../utils/logger');

class ComplianceController {
  /**
   * Get available frameworks
   * GET /api/v1/compliance/frameworks
   */
  async getFrameworks(req, res) {
    try {
      const frameworks = await frameworkService.getFrameworks();
      res.json({
        success: true,
        data: frameworks,
      });
    } catch (error) {
      logger.error('Error in getFrameworks controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Map controls to framework
   * POST /api/v1/compliance/frameworks/:framework/map
   */
  async mapFramework(req, res) {
    try {
      const { framework } = req.params;
      const result = await frameworkService.mapControls(framework, req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in mapFramework controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get audit logs
   * GET /api/v1/compliance/audit/logs
   */
  async getAuditLogs(req, res) {
    try {
      const result = await auditService.getLogs(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in getAuditLogs controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get user audit logs
   * GET /api/v1/compliance/audit/logs/user/:userId
   */
  async getUserAuditLogs(req, res) {
    try {
      const { userId } = req.params;
      const result = await auditService.getUserLogs(userId, req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in getUserAuditLogs controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Perform gap analysis
   * POST /api/v1/compliance/gap-analysis
   */
  async performGapAnalysis(req, res) {
    try {
      const result = await gapAnalysisService.performGapAnalysis(req.body);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in performGapAnalysis controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get compliance gaps
   * GET /api/v1/compliance/gaps
   */
  async getGaps(req, res) {
    try {
      const result = await gapAnalysisService.getGaps(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in getGaps controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Create policy
   * POST /api/v1/compliance/policies
   */
  async createPolicy(req, res) {
    try {
      const policy = await policyService.createPolicy(req.body);
      res.status(201).json({
        success: true,
        data: policy,
      });
    } catch (error) {
      logger.error('Error in createPolicy controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get policy
   * GET /api/v1/compliance/policies/:policyId
   */
  async getPolicy(req, res) {
    try {
      const { policyId } = req.params;
      const policy = await policyService.getPolicy(policyId);
      res.json({
        success: true,
        data: policy,
      });
    } catch (error) {
      logger.error('Error in getPolicy controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * List policies
   * GET /api/v1/compliance/policies
   */
  async listPolicies(req, res) {
    try {
      const result = await policyService.listPolicies(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in listPolicies controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Generate compliance report
   * POST /api/v1/compliance/reports/generate
   */
  async generateReport(req, res) {
    try {
      const report = await reportingService.generateReport({
        ...req.body,
        generated_by: req.user?.id || 'system',
      });
      res.status(201).json({
        success: true,
        data: report,
      });
    } catch (error) {
      logger.error('Error in generateReport controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get reports
   * GET /api/v1/compliance/reports
   */
  async getReports(req, res) {
    try {
      const result = await reportingService.getReports(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in getReports controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Add evidence
   * POST /api/v1/compliance/evidence
   */
  async addEvidence(req, res) {
    try {
      const evidence = await evidenceService.addEvidence({
        ...req.body,
        collected_by: req.user?.id || 'system',
      });
      res.status(201).json({
        success: true,
        data: evidence,
      });
    } catch (error) {
      logger.error('Error in addEvidence controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get evidence by control
   * GET /api/v1/compliance/evidence/:controlId
   */
  async getEvidence(req, res) {
    try {
      const { controlId } = req.params;
      const evidence = await evidenceService.getEvidenceByControl(controlId);
      res.json({
        success: true,
        data: evidence,
      });
    } catch (error) {
      logger.error('Error in getEvidence controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get requirements
   * GET /api/v1/compliance/requirements
   */
  async getRequirements(req, res) {
    try {
      const result = await requirementService.getRequirements(req.query);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in getRequirements controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Track requirement
   * POST /api/v1/compliance/requirements/track
   */
  async trackRequirement(req, res) {
    try {
      const requirement = await requirementService.trackRequirement(req.body);
      res.status(201).json({
        success: true,
        data: requirement,
      });
    } catch (error) {
      logger.error('Error in trackRequirement controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Create audit log
   * POST /api/v1/compliance/audit/logs
   */
  async createAuditLog(req, res) {
    try {
      const log = await auditService.createLog({
        ...req.body,
        user_id: req.user?.id || 'system',
        username: req.user?.username || 'system',
      });
      res.status(201).json({
        success: true,
        data: log,
      });
    } catch (error) {
      logger.error('Error in createAuditLog controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Create control
   * POST /api/v1/compliance/controls
   */
  async createControl(req, res) {
    try {
      const control = await frameworkService.createControl(req.body);
      res.status(201).json({
        success: true,
        data: control,
      });
    } catch (error) {
      logger.error('Error in createControl controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Get controls
   * GET /api/v1/compliance/controls
   */
  async getControls(req, res) {
    try {
      const { framework } = req.query;
      if (!framework) {
        return res.status(400).json({
          success: false,
          error: 'Framework parameter is required',
        });
      }
      const controls = await frameworkService.getControlsByFramework(framework, req.query);
      res.json({
        success: true,
        data: controls,
      });
    } catch (error) {
      logger.error('Error in getControls controller', { error: error.message });
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new ComplianceController();
