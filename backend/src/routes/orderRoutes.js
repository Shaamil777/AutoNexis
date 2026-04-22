const router = require('express').Router()
const {createOrder, getOrders, getOrderById, getOrderStats, cleanDatabase} = require('../controllers/orderController')

router.post('/',createOrder)
router.get('/stats',getOrderStats)
router.get('/',getOrders)
router.delete('/clean', cleanDatabase)
router.get('/:id',getOrderById)

module.exports = router