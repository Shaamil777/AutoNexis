const prisma = require("../config/db")

exports.createLog = async ({
    orderId,
    eventType,
    source,
    status,
    message,
    metadata={}
})=>{
    try {
        await prisma.log.create({
            data:{
                orderId,
                eventType,
                source,
                status,
                message,
                metadata
            }
        });
    } catch (error) {
        console.error("Log creation failed",error.message)
    }
}