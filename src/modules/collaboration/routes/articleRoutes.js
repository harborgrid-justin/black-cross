/**
 * Article Routes
 */

const express = require('express');
const articleController = require('../controllers/articleController');
const {
  articleSchema,
  updateArticleSchema,
  approveArticleSchema,
  searchSchema,
} = require('../validators/articleValidator');

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }
  next();
};

router.post('/kb/articles', validate(articleSchema), articleController.createArticle);
router.get('/kb/articles', articleController.listArticles);
router.get('/kb/search', validateQuery(searchSchema), articleController.searchArticles);
router.get('/kb/articles/:id', articleController.getArticle);
router.put('/kb/articles/:id', validate(updateArticleSchema), articleController.updateArticle);
router.delete('/kb/articles/:id', articleController.deleteArticle);
router.post('/kb/articles/:id/publish', articleController.publishArticle);
router.post(
  '/kb/articles/:id/approve',
  validate(approveArticleSchema),
  articleController.approveArticle,
);

module.exports = router;
