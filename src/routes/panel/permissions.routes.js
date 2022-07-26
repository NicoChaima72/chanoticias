const express = require('express');
const router = express.Router();

const permission = require('../../controllers/panel/permissions.controller')

router.get('/users', permission.listUsers)
router.get('/users/:user_id', permission.getUser)
router.post('/users/:user_id', permission.setPermissions)

module.exports = router