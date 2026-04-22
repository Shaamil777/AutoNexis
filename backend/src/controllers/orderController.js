const orderService = require('../services/orderService')
const prisma = require("../config/db")

exports.createOrder = async (req, res) => {
    try {
        const order = await orderService.createOrder(req.body)
        res.status(201).json({ success: true, order })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

exports.getOrders = async (req, res) => {
    try {
        const { status, priority } = req.query
        let where = {}
        if (status && status !== 'ALL') where.status = status
        if (priority && priority !== 'ALL') where.priority = priority

        const orders = await prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })

        const mapped = orders.map(o => ({
            ...o,
            id: o.id.toString(),
            amount: o.totalAmount
        }))

        res.json(mapped)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) },
            include: { logs: true }
        })

        if (!order) return res.status(404).json({ message: "Not found" })

        const orderEvents = await prisma.eventQueue.findMany({
            where: { payload: { path: ['id'], equals: parseInt(id) } }
        })

        const eventHistory = orderEvents.map(e => ({
            type: e.type,
            status: e.status,
            error: e.lastError || null,
            retryCount: e.retryCount,
            lastAttemptAt: e.lastAttemptAt,
            timestamp: e.updatedAt || e.lastAttemptAt || e.createdAt
        }))

        res.json({
            ...order,
            id: order.id.toString(),
            amount: order.totalAmount,
            eventHistory,
            logs: order.logs || []
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.getOrderStats = async (req, res) => {
    try {
        const totalOrders = await prisma.order.count()
        const pending = await prisma.order.count({ where: { status: 'PENDING' } })
        const processing = await prisma.order.count({ where: { status: 'PROCESSING' } })
        const completed = await prisma.order.count({ where: { status: 'COMPLETED' } })
        const failed = await prisma.order.count({ where: { status: 'FAILED' } })

        const failedEvents = await prisma.eventQueue.count({ where: { status: 'FAILED' } })
        const dlqEvents = await prisma.eventQueue.count({ where: { status: 'DLQ' } })

        res.json({
            totalOrders,
            statusCounts: { PENDING: pending, PROCESSING: processing, COMPLETED: completed, FAILED: failed },
            eventStats: { failedEvents, dlqEvents }
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

exports.cleanDatabase = async (req, res) => {
    try {
        await prisma.$transaction([
            prisma.log.deleteMany(),
            prisma.eventQueue.deleteMany(),
            prisma.order.deleteMany()
        ])
        res.json({ success: true, message: "Database cleaned" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}