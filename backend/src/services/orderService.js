const prisma = require("../config/db")
const {v4:uuidv4} = require("uuid")
const {emitOrderCreated} = require('../events/orderEvents')

exports.createOrder = async(data)=>{
    const priority = data.totalAmount>10000?"HIGH":"LOW";

    const order = await prisma.order.create({
        data:{
            customerName : data.customerName,
            email: data.email,
            totalAmount : data.totalAmount,
            priority
        }
    })

    const event = await prisma.eventQueue.create({
        data:{
            eventId:uuidv4(),
            type:'ORDER_CREATED',
            payload:order,
            status:'PENDING'
        }
    });
    try {
        await emitOrderCreated(event)
    } catch (error) {
        console.error("Emitter Failed:",error.message)
    }

    return order

}