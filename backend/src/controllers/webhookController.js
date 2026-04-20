const webhookService = require('../services/webhookService')

exports.handleOrderUpdate = async (req,res)=>{
    try {
        await webhookService.processOrderUpdate(req.body)
        res.json({success:true})
    } catch (error) {
        res.status(500).json({success:false,message:error.message})
    }
}