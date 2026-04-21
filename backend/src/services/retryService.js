const prisma = require('../config/db')
const axios = require('axios')

exports.retryFailedEvents = async () =>{
    const failedEvent = await prisma.eventQueue.findMany({
        where:{
            status:{in:['failed','PENDING']}
        }
    });

    for(const event of failedEvent){
        try {
            await axios.post(process.env.N8N_WEBHOOK_URL, event.payload);

            await prisma.eventQueue.update({
                where:{eventId:event.eventId},
                data:{status:'PENDING'}
            })
            console.log("Retry Success",event.eventId)
        } catch (error) {
            console.error("Retry failed:", event.eventId);
        }
    }
}