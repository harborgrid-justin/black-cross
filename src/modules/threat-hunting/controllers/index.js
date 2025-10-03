/**
 * Unified Controller for Threat Hunting Module
 * Handles all HTTP requests
 */

const QueryService = require('../services/QueryService');
const HypothesisService = require('../services/HypothesisService');
const PlaybookService = require('../services/PlaybookService');
const BehaviorAnalysisService = require('../services/BehaviorAnalysisService');
const PatternService = require('../services/PatternService');
const FindingService = require('../services/FindingService');
const SessionService = require('../services/SessionService');

class ThreatHuntingController {
  // ============ Query Operations ============
  async executeQuery(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const result = await QueryService.executeQuery(req.body, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to execute query', message: error.message });
    }
  }

  async saveQuery(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const query = await QueryService.saveQuery(req.body, userId);
      res.status(201).json(query);
    } catch (error) {
      res.status(500).json({ error: 'Failed to save query', message: error.message });
    }
  }

  async listQueries(req, res) {
    try {
      const filters = {
        status: req.query.status,
        createdBy: req.query.createdBy,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
      };
      const queries = await QueryService.listQueries(filters);
      res.json({ queries, total: queries.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list queries', message: error.message });
    }
  }

  async getQuery(req, res) {
    try {
      const query = await QueryService.getQuery(req.params.id);
      res.json(query);
    } catch (error) {
      res.status(404).json({ error: 'Query not found', message: error.message });
    }
  }

  // ============ Hypothesis Operations ============
  async createHypothesis(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const hypothesis = await HypothesisService.createHypothesis(req.body, userId);
      res.status(201).json(hypothesis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create hypothesis', message: error.message });
    }
  }

  async getHypothesis(req, res) {
    try {
      const hypothesis = await HypothesisService.getHypothesis(req.params.id);
      res.json(hypothesis);
    } catch (error) {
      res.status(404).json({ error: 'Hypothesis not found', message: error.message });
    }
  }

  async listHypotheses(req, res) {
    try {
      const filters = { status: req.query.status };
      const hypotheses = await HypothesisService.listHypotheses(filters);
      res.json({ hypotheses, total: hypotheses.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list hypotheses', message: error.message });
    }
  }

  async validateHypothesis(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const hypothesis = await HypothesisService.validateHypothesis(
        req.params.id,
        req.body,
        userId,
      );
      res.json(hypothesis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate hypothesis', message: error.message });
    }
  }

  // ============ Playbook Operations ============
  async createPlaybook(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const playbook = await PlaybookService.createPlaybook(req.body, userId);
      res.status(201).json(playbook);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create playbook', message: error.message });
    }
  }

  async executePlaybook(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const result = await PlaybookService.executePlaybook(req.params.id, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to execute playbook', message: error.message });
    }
  }

  async listPlaybooks(req, res) {
    try {
      const playbooks = await PlaybookService.listPlaybooks();
      res.json({ playbooks, total: playbooks.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list playbooks', message: error.message });
    }
  }

  async getPlaybook(req, res) {
    try {
      const playbook = await PlaybookService.getPlaybook(req.params.id);
      res.json(playbook);
    } catch (error) {
      res.status(404).json({ error: 'Playbook not found', message: error.message });
    }
  }

  // ============ Behavior Analysis Operations ============
  async analyzeBehavior(req, res) {
    try {
      const analysis = await BehaviorAnalysisService.analyzeBehavior(
        req.body.entityId,
        req.body.entityType,
        req.body,
      );
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze behavior', message: error.message });
    }
  }

  async getBehaviorAnalysis(req, res) {
    try {
      const analysis = await BehaviorAnalysisService.getBehaviorAnalysis(req.params.id);
      res.json(analysis);
    } catch (error) {
      res.status(404).json({ error: 'Analysis not found', message: error.message });
    }
  }

  async getEntityBehavior(req, res) {
    try {
      const history = await BehaviorAnalysisService.getEntityBehaviorHistory(req.params.entityId);
      res.json({ history, total: history.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get behavior history', message: error.message });
    }
  }

  // ============ Pattern Detection Operations ============
  async detectAnomalies(req, res) {
    try {
      const patterns = await PatternService.detectAnomalies(req.body.data, req.body);
      res.json({ patterns, total: patterns.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to detect anomalies', message: error.message });
    }
  }

  async listPatterns(req, res) {
    try {
      const filters = { status: req.query.status };
      const patterns = await PatternService.listPatterns(filters);
      res.json({ patterns, total: patterns.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list patterns', message: error.message });
    }
  }

  async getPattern(req, res) {
    try {
      const pattern = await PatternService.getPattern(req.params.id);
      res.json(pattern);
    } catch (error) {
      res.status(404).json({ error: 'Pattern not found', message: error.message });
    }
  }

  // ============ Finding Operations ============
  async createFinding(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const finding = await FindingService.createFinding(req.body, userId);
      res.status(201).json(finding);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create finding', message: error.message });
    }
  }

  async getFinding(req, res) {
    try {
      const finding = await FindingService.getFinding(req.params.id);
      res.json(finding);
    } catch (error) {
      res.status(404).json({ error: 'Finding not found', message: error.message });
    }
  }

  async listFindings(req, res) {
    try {
      const filters = {
        status: req.query.status,
        severity: req.query.severity,
      };
      const findings = await FindingService.listFindings(filters);
      res.json({ findings, total: findings.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list findings', message: error.message });
    }
  }

  async updateFinding(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const finding = await FindingService.updateFinding(req.params.id, req.body, userId);
      res.json(finding);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update finding', message: error.message });
    }
  }

  // ============ Session Operations ============
  async createSession(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const session = await SessionService.createSession(req.body, userId);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create session', message: error.message });
    }
  }

  async getSession(req, res) {
    try {
      const session = await SessionService.getSession(req.params.id);
      res.json(session);
    } catch (error) {
      res.status(404).json({ error: 'Session not found', message: error.message });
    }
  }

  async listSessions(req, res) {
    try {
      const filters = { status: req.query.status };
      const sessions = await SessionService.listSessions(filters);
      res.json({ sessions, total: sessions.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list sessions', message: error.message });
    }
  }

  async joinSession(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const session = await SessionService.joinSession(req.params.id, userId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: 'Failed to join session', message: error.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const userId = req.user?.id || 'anonymous';
      const message = await SessionService.sendChatMessage(req.params.id, req.body.message, userId);
      res.json(message);
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message', message: error.message });
    }
  }

  // ============ Health Check ============
  async healthCheck(req, res) {
    res.json({
      module: 'threat-hunting',
      status: 'operational',
      version: '1.0.0',
      features: {
        queryBuilder: 'operational',
        hypotheses: 'operational',
        playbooks: 'operational',
        behaviorAnalysis: 'operational',
        patternDetection: 'operational',
        findings: 'operational',
        sessions: 'operational',
      },
    });
  }
}

module.exports = new ThreatHuntingController();
