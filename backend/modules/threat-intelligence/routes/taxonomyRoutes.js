/**
 * Taxonomy Routes
 */

const express = require('express');
const router = express.Router();
const taxonomyController = require('../controllers/taxonomyController');
const { taxonomySchema, taxonomyUpdateSchema } = require('../validators/taxonomyValidator');

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

// Taxonomy CRUD routes
router.post('/taxonomies', validate(taxonomySchema), taxonomyController.createTaxonomy);
router.put('/taxonomies/:id', validate(taxonomyUpdateSchema), taxonomyController.updateTaxonomy);
router.get('/taxonomies/:id', taxonomyController.getTaxonomy);
router.get('/taxonomies', taxonomyController.listTaxonomies);
router.delete('/taxonomies/:id', taxonomyController.deleteTaxonomy);

// Import/Export routes
router.get('/taxonomies/:id/export', taxonomyController.exportTaxonomy);
router.post('/taxonomies/import', taxonomyController.importTaxonomy);

module.exports = router;
