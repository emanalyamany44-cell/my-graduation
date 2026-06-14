const router = require('express').Router();
const c = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
router.get('/', protect, c.list);
router.get('/:id', protect, c.getOne);
module.exports = router;
