const axios = require('axios')
const prisma = require('../config/db')

exports.emitOrderCreated = async (event) => {
    try {
        await axios.post(process.env.N8N_WEBHOOK_URL, {
            eventId: event.eventId,
            type: event.type,
            data: event.payload
        }, {
            timeout: 3000
        })

        await prisma.eventQueue.update({
            where: { eventId: event.eventId },
            data: { status: 'SENT', lastAttemptAt: new Date() }
        })
    } catch (error) {
        const errorMsg = error.response
            ? `${error.response.status}: ${error.response.statusText}`
            : error.code || error.message

        await prisma.eventQueue.update({
            where: { eventId: event.eventId },
            data: {
                status: 'FAILED',
                lastAttemptAt: new Date(),
                lastError: errorMsg
            }
        })
    }
}