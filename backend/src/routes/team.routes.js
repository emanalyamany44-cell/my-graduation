const router = require('express').Router();
const c = require('../controllers/team.controller');
const { protect } = require('../middleware/auth');

router.post('/:projectId/join', protect, c.requestJoin);
router.delete('/:projectId/join', protect, c.cancelJoin);
router.get('/:projectId/requests', protect, c.listRequests);
router.post('/requests/:requestId/respond', protect, c.respondRequest);
router.delete('/:projectId/members/:userId', protect, c.removeMember);
router.post('/:projectId/leave', protect, c.leave);

module.exports = router;
