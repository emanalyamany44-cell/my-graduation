const router = require('express').Router();
const c = require('../controllers/supervisor.controller');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, c.list);
router.post('/requests', protect, requireRole('student'), c.requestSupervision);
router.get('/me/requests', protect, requireRole('supervisor'), c.myRequests);
router.post('/requests/:requestId/respond', protect, requireRole('supervisor'), c.respond);
router.get('/me/projects', protect, requireRole('supervisor'), c.myProjects);

module.exports = router;
