const router = require('express').Router()
const {handleOrderUpdate} = require('../controllers/webhookController')

router.post('/order-update',handleOrderUpdate)

module.exports = router