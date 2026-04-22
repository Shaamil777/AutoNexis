const prisma = require("../config/db")
const retryService = require("../services/retryService")

exports.getEvents = async (req, res) => {
    try {
        const events = await prisma.eventQueue.findMany({
            where: { status: { not: 'DLQ' } },
            orderBy: { createdAt: 'desc' },
            take: 100
        })

        const mapped = events.map(ev => ({
            ...ev,
            orderId: ev.payload?.id || "N/A"
        }))

        res.json(mapped)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getDlqEvents = async (req, res) => {
    try {
        const dlqEvents = await prisma.eventQueue.findMany({
            where: { status: 'DLQ' },
            orderBy: { updatedAt: 'desc' }
        })

        const mapped = dlqEvents.map(ev => ({
            ...ev,
            orderId: ev.payload?.id || "N/A"
        }))

        res.json(mapped)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.retryEvent = async (req, res) => {
    try {
        const { id } = req.params

        const ev = await prisma.eventQueue.findUnique({
            where: { id: parseInt(id) }
        })

        if (!ev) return res.status(404).json({ message: "Event not found" })
        if (ev.status !== 'DLQ' && ev.status !== 'FAILED') {
            return res.status(400).json({ message: "Event is not in a retriable state" })
        }

        await prisma.eventQueue.update({
            where: { id: ev.id },
            data: { status: 'PENDING', retryCount: 0, lastError: null }
        })

        retryService.retryFailedEvents().catch(console.error)

        res.json({ success: true, message: "Retry triggered" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
