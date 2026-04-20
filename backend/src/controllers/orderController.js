const orderService = require('../services/orderService')

exports.createOrder = async (req, res) => {
    try {
        const order = await orderService.createOrder(req.body)
        res.status(201).json({
            success:true,
            data:order
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}