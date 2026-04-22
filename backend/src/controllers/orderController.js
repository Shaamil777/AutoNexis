const orderService = require('../services/orderService')

exports.createOrder = async (req, res) => {
    try {
        const order = await orderService.createOrder(req.body)
        res.status(201).json({
            success:true,
            order:order
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const prisma = require("../config/db")

exports.getOrders = async (req, res) => {
    try {
        const { status, priority } = req.query;
        let where = {};
        if (status && status !== 'ALL') where.status = status;
        if (priority && priority !== 'ALL') where.priority = priority;

        const orders = await prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        // map totalAmount to amount for frontend compatibility
        const mappedOrders = orders.map(o => ({
            ...o,
            id: o.id.toString(),
            amount: o.totalAmount
        }));
        
        res.status(200).json(mappedOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: { logs: true }
        });

        if (!order) return res.status(404).json({ message: "Not found" });

        // Retrieve event history manually mapping through the event queue payload or relying on logs?
        // Frontend expects eventHistory array. Let's send logs as eventHistory since eventQueue deletes/updates dynamically.
        // Or we can find EventQueue entries where payload->>'id' == order.id if using JSON querying, but Log is safer.
        const orderEvents = await prisma.eventQueue.findMany();
        const eventHistory = orderEvents
            .filter(e => e.payload && e.payload.id === parseInt(id))
            .map(e => ({
                type: e.type,
                status: e.status,
                timestamp: e.lastAttemptAt || e.createdAt,
            }));

        const mappedOrder = {
            ...order,
            id: order.id.toString(),
            amount: order.totalAmount,
            eventHistory,
            logs: order.logs || []
        };
        res.status(200).json(mappedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getOrderStats = async (req, res) => {
    try {
        const totalOrders = await prisma.order.count();
        const pending = await prisma.order.count({ where: { status: 'PENDING' } });
        const processing = await prisma.order.count({ where: { status: 'PROCESSING' } });
        const completed = await prisma.order.count({ where: { status: 'COMPLETED' } });
        const failed = await prisma.order.count({ where: { status: 'FAILED' } });
        
        const failedEvents = await prisma.eventQueue.count({ where: { status: 'FAILED' } });
        const dlqEvents = await prisma.eventQueue.count({ where: { status: 'DLQ' } });

        res.status(200).json({
            totalOrders,
            statusCounts: { PENDING: pending, PROCESSING: processing, COMPLETED: completed, FAILED: failed },
            eventStats: { failedEvents, dlqEvents }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.cleanDatabase = async (req, res) => {
    try {
        await prisma.$transaction([
            prisma.log.deleteMany(),
            prisma.eventQueue.deleteMany(),
            prisma.order.deleteMany()
        ]);
        res.status(200).json({ success: true, message: "Database cleaned successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}