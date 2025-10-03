/**
 * Role Routes
 */

const express = require('express');
const roleController = require('../controllers/roleController');
const { roleSchema, updateRoleSchema, assignRoleSchema } = require('../validators/roleValidator');

const router = express.Router();

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }
  next();
};

router.post('/roles', validate(roleSchema), roleController.createRole);
router.get('/roles', roleController.listRoles);
router.get('/roles/:id', roleController.getRole);
router.put('/roles/:id', validate(updateRoleSchema), roleController.updateRole);
router.delete('/roles/:id', roleController.deleteRole);
router.put('/users/:userId/roles', validate(assignRoleSchema), roleController.assignRole);

module.exports = router;
