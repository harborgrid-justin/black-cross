/**
 * Input Validators for Threat Hunting Module
 */

const Joi = require('joi');

const validators = {
  // Query validators
  createQuery: Joi.object({
    name: Joi.string().required().min(3).max(200),
    description: Joi.string().max(1000),
    query: Joi.string().required(),
    queryLanguage: Joi.string().valid('sql', 'kql', 'spl', 'lucene').default('sql'),
    dataSources: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    isTemplate: Joi.boolean(),
  }),

  executeQuery: Joi.object({
    query: Joi.string().required(),
    queryLanguage: Joi.string().valid('sql', 'kql', 'spl', 'lucene').default('sql'),
    dataSources: Joi.array().items(Joi.string()),
  }),

  // Hypothesis validators
  createHypothesis: Joi.object({
    title: Joi.string().required().min(5).max(200),
    description: Joi.string().required().min(10),
    hypothesis: Joi.string().required(),
    tags: Joi.array().items(Joi.string()),
    references: Joi.array().items(Joi.string()),
  }),

  validateHypothesis: Joi.object({
    isValid: Joi.boolean().required(),
    evidence: Joi.array().items(Joi.string()),
    reasoning: Joi.string(),
  }),

  // Playbook validators
  createPlaybook: Joi.object({
    name: Joi.string().required().min(3).max(200),
    description: Joi.string().required(),
    category: Joi.string().valid('authentication', 'network', 'data', 'malware', 'general').default('general'),
    steps: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required().valid('query', 'analysis', 'behavior', 'correlation'),
        query: Joi.string(),
        config: Joi.object(),
      }),
    ).min(1),
    schedule: Joi.string(),
    enabled: Joi.boolean(),
    tags: Joi.array().items(Joi.string()),
  }),

  // Behavior analysis validators
  analyzeBehavior: Joi.object({
    entityId: Joi.string().required(),
    entityType: Joi.string().required().valid('user', 'host', 'service', 'application'),
    analysisType: Joi.string().valid('user', 'entity').default('entity'),
    analysisWindow: Joi.string().default('30d'),
  }),

  // Pattern detection validators
  detectAnomalies: Joi.object({
    data: Joi.array().required(),
    algorithm: Joi.string().valid('statistical', 'ml', 'pattern_matching').default('statistical'),
    threshold: Joi.number().min(0).max(1).default(0.7),
    patterns: Joi.array().items(Joi.object()),
  }),

  // Finding validators
  createFinding: Joi.object({
    title: Joi.string().required().min(5).max(200),
    description: Joi.string().required().min(10),
    severity: Joi.string().valid('critical', 'high', 'medium', 'low', 'info').default('medium'),
    category: Joi.string(),
    sessionId: Joi.string(),
    queryId: Joi.string(),
    evidence: Joi.array().items(Joi.object()),
    affectedAssets: Joi.array().items(Joi.string()),
    recommendedActions: Joi.array().items(Joi.object()),
    mitreTactics: Joi.array().items(Joi.string()),
    mitreIds: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
  }),

  addEvidence: Joi.object({
    type: Joi.string().required(),
    description: Joi.string().required(),
    data: Joi.any(),
  }),

  // Session validators
  createSession: Joi.object({
    name: Joi.string().required().min(3).max(200),
    hypothesis: Joi.string().required(),
    hypothesisId: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  }),

  chatMessage: Joi.object({
    message: Joi.string().required().min(1).max(1000),
  }),

  annotation: Joi.object({
    type: Joi.string().required(),
    content: Joi.string().required(),
    context: Joi.object(),
  }),
};

/**
 * Middleware to validate request body
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    return res.status(400).json({
      error: 'Validation Error',
      details: errors,
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validators,
  validate,
};
