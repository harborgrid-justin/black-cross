/**
 * Threat Hunting Module Routes
 */

const express = require('express');
const controller = require('../controllers');
const { validate, validators } = require('../validators');

const router = express.Router();

// Health check
router.get('/health', controller.healthCheck.bind(controller));

// ============ Query Routes ============
router.post('/query', validate(validators.executeQuery), controller.executeQuery.bind(controller));
router.post('/queries', validate(validators.createQuery), controller.saveQuery.bind(controller));
router.get('/queries', controller.listQueries.bind(controller));
router.get('/queries/:id', controller.getQuery.bind(controller));

// ============ Hypothesis Routes ============
router.post('/hypotheses', validate(validators.createHypothesis), controller.createHypothesis.bind(controller));
router.get('/hypotheses/:id', controller.getHypothesis.bind(controller));
router.get('/hypotheses', controller.listHypotheses.bind(controller));
router.post('/hypotheses/:id/validate', validate(validators.validateHypothesis), controller.validateHypothesis.bind(controller));

// ============ Playbook Routes ============
router.post('/playbooks', validate(validators.createPlaybook), controller.createPlaybook.bind(controller));
router.post('/playbooks/:id/execute', controller.executePlaybook.bind(controller));
router.get('/playbooks', controller.listPlaybooks.bind(controller));
router.get('/playbooks/:id', controller.getPlaybook.bind(controller));

// ============ Behavior Analysis Routes ============
router.post('/behavior-analysis', validate(validators.analyzeBehavior), controller.analyzeBehavior.bind(controller));
router.get('/behavior-analysis/:id', controller.getBehaviorAnalysis.bind(controller));
router.get('/behaviors/:entityId', controller.getEntityBehavior.bind(controller));

// ============ Pattern Detection Routes ============
router.post('/detect-anomalies', validate(validators.detectAnomalies), controller.detectAnomalies.bind(controller));
router.get('/patterns', controller.listPatterns.bind(controller));
router.get('/patterns/:id', controller.getPattern.bind(controller));

// ============ Finding Routes ============
router.post('/findings', validate(validators.createFinding), controller.createFinding.bind(controller));
router.get('/findings/:id', controller.getFinding.bind(controller));
router.get('/findings', controller.listFindings.bind(controller));
router.put('/findings/:id', controller.updateFinding.bind(controller));

// ============ Session Routes ============
router.post('/sessions', validate(validators.createSession), controller.createSession.bind(controller));
router.get('/sessions/:id', controller.getSession.bind(controller));
router.get('/sessions', controller.listSessions.bind(controller));
router.post('/sessions/:id/join', controller.joinSession.bind(controller));
router.post('/sessions/:id/messages', validate(validators.chatMessage), controller.sendMessage.bind(controller));

module.exports = router;
