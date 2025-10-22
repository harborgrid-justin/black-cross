import iocService from '../services/iocService';

class IocController {
  async create(req, res) {
    try {
      const item = await iocService.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const item = await iocService.getById(req.params.id);
      res.json(item);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async list(req, res) {
    try {
      const items = await iocService.list(req.query);
      res.json(items);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const item = await iocService.update(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await iocService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async bulkImport(req, res) {
    try {
      const { iocs } = req.body;
      const results = await iocService.bulkImportIndicators(iocs);
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async exportIoCs(req, res) {
    try {
      const { format } = req.query;
      const result = await iocService.exportIndicators(format as 'json' | 'csv' | 'stix');
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async checkIoC(req, res) {
    try {
      const { value, type } = req.body;
      const result = await iocService.checkIndicator(value, type);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export default new IocController();

