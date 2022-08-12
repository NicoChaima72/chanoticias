const express = require('express');
const router = express.Router();

const permission = require('../../controllers/panel/permissions.controller')

router.get('/users/:user_id', permission.editPermissions)
router.post('/users/:user_id', permission.updatePermissions)

module.exports = router