import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import Razorpay from "razorpay"



// placing user order from frontend
const placeOrder = async (req, res) => {

    const frontend_url = "https://food-ordering-1-xhsa.onrender.com";
    const frontend_url = "https://food-ordering-1-xhsa.onrender.com";

    const newOrder = new orderModel({
        userId: req.body.userId,
        items: req.body.items,
        amount: req.body.amount,
        address: req.body.address,
        payment: true,
    })
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    try {


        const razorpay = new Razorpay({
            key_id: "rzp_test_5FuzPjp8yygxhW",
            key_secret: "o0vJZVUjeahh2dexZkvGbTRv"
        })

        console.log(req.body.amount); 
              
        const options = {
            
            amount: req.body.amount * 100,
            currency: req.body.currency,
            receipt: req.body.userId,
            payment_capture: 1,
            
    
        }


        const response = await razorpay.orders.create(options)



        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount,
            success: true
        })


        // const line_items = req.body.items.map((item)=>({

        //     price_data:{

        //         currency:"INR",
        //         product_data:{ 
        //             name:item.name
        //         },
        //         unit_amount:item.price*100
        //     },
        //     quantity:item.quantity

        // }))

        // line_items.push({
        //     price_data:{
        //         currency:"INR",
        //         product_data:{
        //             name:"Delivery Charges"
        //         },
        //         unit_amount:4000
        //     },
        //     quantity:1
        // })

        // const session = await stripe.checkout.sessions.create({
        //     line_items:line_items,
        //     mode:'payment',
        //     success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
        //     cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        // })

        // res.json({success:true,session_url:session.url})

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const verifyOrder = async (req, res) => {


    // const {paymentId} = req.params;

    // const razorpay = new Razorpay({
    //     key_id: "rzp_test_5FuzPjp8yygxhW",
    //     key_secret: "o0vJZVUjeahh2dexZkvGbTRv"
    // })

    // try {
    //     const payment = await razorpay.payments.fetch(paymentId)

    //     if (!payment){
    //         return res.status(500).json("Error at razorpay loading")
    //     }

    //     res.json({
    //         status: payment.status,
    //         method: payment.method,
    //         amount: payment.amount,
    //         currency: payment.currency
    //     })
    // } catch(error) {
    //     res.status(500).json("failed to fetch")
    // }


    const { orderId, success } = req.body;
    try {
        if (success == "true") {
            await orderModel.findByIdAndUpdate(orderId, { payment: true });
            res.json({ success: true, message: "Paid" })
        }
        else {
            await orderModel.findByIdAndDelete(orderId);
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
