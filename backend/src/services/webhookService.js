const prisma = require("../config/db")
const { createLog } = require('../utils/logger')

exports.processOrderUpdate = async (data) => {
    const { eventId, message } = data
    const orderId = parseInt(data.orderId, 10)
    const status = data.status ? data.status.toUpperCase() : undefined

    const existingEvent = await prisma.eventQueue.findUnique({
        where: { eventId }
    })

    if (!existingEvent || existingEvent.status === "PROCESSED") return

    await prisma.$transaction(async (tx) => {
        await tx.order.update({
            where: { id: orderId },
            data: { status }
        })

        await tx.eventQueue.update({
            where: { eventId },
            data: { status: "PROCESSED" }
        })
    })

    await createLog({
        orderId,
        eventType: "ORDER_UPDATE",
        source: "N8N",
        status: "SUCCESS",
        message,
        metadata: data
    })
}