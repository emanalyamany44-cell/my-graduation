const router = require('express').Router();
const c = require('../controllers/project.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, c.list);
router.get('/mine', protect, c.mine);
router.get('/:id', protect, c.getOne);
router.post('/', protect, c.create);
router.patch('/:id', protect, c.update);
router.delete('/:id', protect, c.remove);

module.exports = router;
