const router = require('express').Router();
const c = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, c.list);
router.patch('/:id/read', protect, c.markRead);
router.post('/read-all', protect, c.markAllRead);

module.exports = router;
