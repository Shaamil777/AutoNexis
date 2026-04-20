const prisma = require("../config/db")
const {createLog} = require('../utils/logger')

exports.processOrderUpdate = async (data)=>{
    const {eventId, message} = data;

    // 1. Type Fixes: Ensure orderId is an Int and status strictly matches Prisma Enum casing
    const orderId = parseInt(data.orderId, 10);
    const status = data.status ? data.status.toUpperCase() : undefined;

    const existingEvent = await prisma.eventQueue.findUnique({
        where:{eventId}
    })

    if(!existingEvent || existingEvent.status === "PROCESSED"){
        console.log("Duplicate or invalid event ignored");
        return;
    }

    // 2. Transaction Fix: Group critical database writes so they either all succeed or all fail together
    await prisma.$transaction(async (tx) => {
        await tx.order.update({
            where:{id: orderId},
            data:{status}
        });

        await tx.eventQueue.update({
            where:{eventId},
            data:{status:"PROCESSED"}
        });
    });

    // 3. Log the successful update (runs only if the transaction above succeeds)
    await createLog({
        orderId,
        eventType: "ORDER_UPDATE",
        source:"N8N",
        status:"SUCCESS",
        message,
        metadata:data
    });
}