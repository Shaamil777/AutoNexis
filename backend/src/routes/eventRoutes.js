const router = require('express').Router();
const { getEvents, getDlqEvents, retryEvent } = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/dlq', getDlqEvents);
router.post('/:id/retry', retryEvent);

module.exports = router;
