import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import Razorpay from "razorpay"



// placing user order from frontend
const placeOrder = async (req, res) => {



    


    try {


        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })



        const options = {

            amount: req.body.amount * 100,
            currency: req.body.currency,
            receipt: req.body.userId,
            payment_capture: 1,


        }

        const response = await razorpay.orders.create(options)

        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address,
            payment: false,
            orderId: "false"

        })
        await newOrder.save();
        const u =await userModel.findById(req.body.userId);
        console.log(u)
        



        res.json({
            userId: req.body.userId,
            order_id: newOrder._id,
            currency: response.currency,
            amount: response.amount,
            success: true,
            status: response.status
        })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const verifyOrder = async (req, res) => {


    const { status, orderId ,paymentId} = req.body;


    try {
        if (status == "true") {
            
            await orderModel.findByIdAndUpdate(orderId, { payment: status , orderId: paymentId});
            res.json({ success: true, message: "Paid" })


        }
        else {

            await orderModel.findByIdAndUpdate(orderId, { payment: status });
            res.json({ success: false, message: "Not Paid" })

        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}


// user orders for frontend

const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId });

        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// Listing orders for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({});
        res.json({ success: true, data: orders })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// api for updating order status
const updateStatus = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status });

        res.json({ success: true, message: "Status Updated" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// remove order item
const removeOrder = async (req, res) => {
    try {
        const order = await orderModel.findById(req.body.id);


        await orderModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Order Removed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}


export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus, removeOrder }
