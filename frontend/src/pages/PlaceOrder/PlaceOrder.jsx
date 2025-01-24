import React, { useEffect, useState } from 'react'
import './PlaceOrder.css'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");

    script.src = src;

    script.onload = () => {
      resolve(true)
    }
    script.onerror = () => {
      resolve(false)
    }

    document.body.appendChild(script);
  })
}


const handleRazorpayScreen = async (amount) => {
  const res = await loadScript("https:/checkout.razorpay.com/v1/checkout.js")

  if (!res) {
    alert("Some error at razorpay screen loading")
    return;
  }

  const options = {
    key: 'rzp_test_5FuzPjp8yygxhW',
    amount: amount,
    currency: 'INR',
    name: "Agrawal Bekery",
    description: "payment to Agrawal Bekery",
    image: "https://papayacoders.com/demo.png",
    handler: function (response) {
      setResponseId(response.razorpay_payment_id)
    },
    prefill: {
      name: "Agrawal Bekery ",
      email: "Agrawalbekery@gmail.com"
    },
    theme: {
      color: "#F4C430"
    }
  }

  const paymentObject = new window.Razorpay(options)
  paymentObject.open()
}


const PlaceOrder = () => {

  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext)

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  })

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData(data => ({ ...data, [name]: value }))
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo)
      }
    })


    // let data = JSON.stringify({
    //   amount: amount * 100,
    //   currency: "INR"
    // })

    // let config = {
    //   method: "post",
    //   maxBodyLength: Infinity,
    //   url: "http://localhost:4000/place",
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   data: data
    // }


    // .then((response) => {
    //   console.log(JSON.stringify(response.data))
    //   handleRazorpayScreen(response.data.amount)
    // })
    // .catch((error) => {
    //   console.log("error at", error)
    // })





    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount(),
      currency: "INR"
    }
    let response = await axios.post(url + "/api/order/place", orderData, { headers: { token } })
    if (response.data.success) {

      handleRazorpayScreen(response.data.amount)


    }
    else {
      alert("Error");
    }
  }

  const navigate = useNavigate();


  useEffect(() => {
    if (!token) {
      navigate('/cart')
    }
    else if (getTotalCartAmount() === 0) {
      navigate('/cart')
    }
  }, [token])


  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input required name='firstName' onChange={onChangeHandler} value={data.firstName} type="text" placeholder='First Name' />
          <input required name='lastName' onChange={onChangeHandler} value={data.lastName} type="text" placeholder='Last Name' />
        </div>
        <input className='emaill' required name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Email address' />
        <input className='streett' required name='street' onChange={onChangeHandler} value={data.street} type="text" placeholder='Street' />
        <div className="multi-fields">
          <input required name='city' onChange={onChangeHandler} value={data.city} type="text" placeholder='City' />
          <input required name='state' onChange={onChangeHandler} value={data.state} type="text" placeholder='State' />
        </div>
        <div className="multi-fields">
          <input required name='zipcode' onChange={onChangeHandler} value={data.zipcode} type="text" placeholder='Zip code' />
          <input required name='country' onChange={onChangeHandler} value={data.country} type="text" placeholder='Country' />
        </div>
        <input className='phonee' required name='phone' onChange={onChangeHandler} value={data.phone} type="text" placeholder='Phone' />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            {/* <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>₹{getTotalCartAmount()===0?0:40}</p>
            </div>
            <hr/> */}
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount()}</b>
            </div>
          </div>
          <button type='submit'>PROCEED TO PAYMENT</button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder