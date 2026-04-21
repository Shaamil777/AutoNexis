const axios = require('axios')
const prisma = require('../config/db')
const { stat } = require('fs')

exports.emitOrderCreated = async (event) =>{
    try {
        await axios.post(process.env.N8N_WEBHOOK_URL,{
            eventId:event.eventId,
            type:event.type,
            data:event.payload
        },
        {
            timeout:3000
        }
    )

        await prisma.eventQueue.update({
            where:{eventId:event.eventId},
            data:{status:'SENT'}
        })
    } catch (error) {
       console.error("Event emission failed ",error.message)
       await prisma.eventQueue.update({
        where:{eventId:event.eventId},
        data:{status:'FAILED'}
       })
    }
}