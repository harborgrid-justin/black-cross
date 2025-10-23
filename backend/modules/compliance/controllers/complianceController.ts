import complianceService from '../services/complianceService';

class ComplianceController {
  // Framework methods
  async getFrameworks(req, res) {
    try {
      const frameworks = await complianceService.listFrameworks(req.query);
      res.json({ success: true, data: frameworks });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getFramework(req, res) {
    try {
      const framework = await complianceService.getFramework(req.params.id);
      res.json({ success: true, data: framework });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async createFramework(req, res) {
    try {
      const framework = await complianceService.createFramework(req.body);
      res.status(201).json({ success: true, data: framework });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateFramework(req, res) {
    try {
      const framework = await complianceService.updateFramework(req.params.id, req.body);
      res.json({ success: true, data: framework });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteFramework(req, res) {
    try {
      await complianceService.deleteFramework(req.params.id);
      res.json({ success: true, message: 'Framework deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Control methods
  async getControls(req, res) {
    try {
      const controls = await complianceService.getFrameworkControls(req.params.frameworkId, req.query);
      res.json({ success: true, data: controls });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async updateControl(req, res) {
    try {
      const control = await complianceService.updateControlImplementation(
        req.params.frameworkId,
        req.params.controlId,
        req.body,
      );
      res.json({ success: true, data: control });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Gap analysis methods
  async analyzeGaps(req, res) {
    try {
      const gaps = await complianceService.analyzeComplianceGaps(req.params.frameworkId);
      res.json({ success: true, data: gaps });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getGaps(req, res) {
    try {
      const gaps = await complianceService.getComplianceGaps(req.params.frameworkId);
      res.json({ success: true, data: gaps });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  // Audit log methods
  async getAuditLogs(req, res) {
    try {
      const logs = await complianceService.getAuditTrail(req.query);
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Report methods
  async generateReport(req, res) {
    try {
      const report = await complianceService.generateComplianceReport(req.params.frameworkId);
      res.json({ success: true, data: report });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getFrameworkReports(req, res) {
    try {
      const reports = await complianceService.getFrameworkReports(req.params.frameworkId);
      res.json({ success: true, data: reports });
    } catch (error) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async getAllReports(req, res) {
    try {
      const reports = await complianceService.getAllReports(req.query);
      res.json({ success: true, data: reports });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async exportReport(req, res) {
    try {
      const { format } = req.query;
      const file = await complianceService.exportReport(req.params.reportId, format);
      res.setHeader('Content-Type', `application/${format}`);
      res.send(file);
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Evidence methods
  async uploadEvidence(req, res) {
    try {
      const { frameworkId, controlId } = req.params;
      const evidence = await complianceService.attachEvidence(
        frameworkId,
        controlId,
        req.file,
        req.body.description,
      );
      res.json({ success: true, data: evidence });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async deleteEvidence(req, res) {
    try {
      const { frameworkId, controlId, evidenceId } = req.params;
      await complianceService.removeEvidence(frameworkId, controlId, evidenceId);
      res.json({ success: true, message: 'Evidence deleted' });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Legacy CRUD methods (backward compatibility)
  async create(req, res) {
    try {
      const item = await complianceService.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const item = await complianceService.getById(req.params.id);
      res.json(item);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async list(req, res) {
    try {
      const items = await complianceService.list(req.query);
      res.json(items);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const item = await complianceService.update(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await complianceService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new ComplianceController();
