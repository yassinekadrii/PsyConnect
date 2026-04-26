const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/request', connectionController.requestConnection);
router.put('/accept/:patientId', connectionController.acceptConnection);
router.put('/block/:patientId', connectionController.blockConnection);
router.get('/', connectionController.getConnections);

module.exports = router;
