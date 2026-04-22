const prisma = require('../config/db')
const axios = require('axios')

const MAX_RETRIES = 3

exports.retryFailedEvents = async () => {
    const failedEvents = await prisma.eventQueue.findMany({
        where: { status: { in: ['FAILED', 'PENDING'] } }
    })

    const now = new Date()

    for (const event of failedEvents) {
        try {
            if (event.retryCount >= MAX_RETRIES) {
                await prisma.eventQueue.update({
                    where: { eventId: event.eventId },
                    data: {
                        status: 'DLQ',
                        lastError: event.lastError || 'Max retries exceeded'
                    }
                })
                continue
            }

            const delay = Math.pow(2, event.retryCount) * 30000

            if (event.lastAttemptAt) {
                const nextAttempt = new Date(event.lastAttemptAt.getTime() + delay)
                if (now < nextAttempt) continue
            }

            await axios.post(process.env.N8N_WEBHOOK_URL, {
                eventId: event.eventId,
                type: event.type,
                data: event.payload
            }, {
                timeout: 3000
            })

            await prisma.eventQueue.update({
                where: { eventId: event.eventId },
                data: {
                    status: 'SENT',
                    lastAttemptAt: new Date(),
                    lastError: null
                }
            })
        } catch (error) {
            const errorMsg = error.response
                ? `${error.response.status}: ${error.response.statusText}`
                : error.code || error.message

            await prisma.eventQueue.update({
                where: { eventId: event.eventId },
                data: {
                    retryCount: { increment: 1 },
                    status: 'FAILED',
                    lastAttemptAt: new Date(),
                    lastError: errorMsg
                }
            })
        }
    }
}