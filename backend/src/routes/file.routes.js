const router = require('express').Router();
const c = require('../controllers/file.controller');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/project/:projectId', protect, c.list);
router.post('/project/:projectId', protect, upload.single('file'), c.upload);
router.delete('/:id', protect, c.remove);

module.exports = router;
