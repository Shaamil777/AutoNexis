const prisma = require("../config/db");
const retryService = require("../services/retryService"); // We need to trigger retry manually

exports.getEvents = async (req, res) => {
    try {
        const events = await prisma.eventQueue.findMany({
            where: { status: { not: 'DLQ' } },
            orderBy: { createdAt: 'desc' },
            take: 100 // limit to recent 100 events
        });
        
        // map order reference to mapped orderId payload if exists
        const mappedEvents = events.map(ev => {
            let orderId = ev.payload?.id || "N/A";
            return {
                ...ev,
                orderId
            }
        });

        res.status(200).json(mappedEvents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getDlqEvents = async (req, res) => {
    try {
        const dlqEvents = await prisma.eventQueue.findMany({
            where: { status: 'DLQ' },
            orderBy: { createdAt: 'desc' }
        });

        const mappedEvents = dlqEvents.map(ev => {
            let orderId = ev.payload?.id || "N/A";
            return {
                ...ev,
                orderId
            }
        });

        res.status(200).json(mappedEvents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.retryEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const eventIdStr = id.toString(); // id might be uuid string or integer ID, wait, eventId is String. ID is Int.
        // req.params.id from frontend is ev.id so it's the Int primary key id or eventId string?
        // Wait, EventQueue has `id` (autoincrement) and `eventId` (uuid string). Frontend uses `ev.id` which is Int.
        const ev = await prisma.eventQueue.findUnique({
             where: { id: parseInt(id) }
        });

        if (!ev) return res.status(404).json({ message: "Event not found" });
        if (ev.status !== 'DLQ' && ev.status !== 'FAILED') {
            return res.status(400).json({ message: "Event is not in a failed/DLQ state" });
        }

        // Trigger manual retry by resetting status and retry count then calling service
        await prisma.eventQueue.update({
            where: { id: ev.id },
            data: { status: 'PENDING', retryCount: 0 }
        });

        // Trigger retry worker manually for this specific event or let cron pick it up.
        // It's better to just let the cron pick it up or push it manually to the service payload.
        // But since retryService usually has a cron or processes them:
        // Actually, let's just trigger processRetries() async.
        if (retryService.retryFailedEvents) {
            retryService.retryFailedEvents().catch(console.error);
        }

        res.status(200).json({ success: true, message: "Retry triggered" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
