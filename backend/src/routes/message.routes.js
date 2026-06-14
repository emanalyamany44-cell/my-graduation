const router = require('express').Router();
const c = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');

router.get('/project/:projectId', protect, c.list);
router.post('/project/:projectId', protect, c.send);

module.exports = router;
