import React, { useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';


const paymentFetch = (e) => {
  e.preventDefault();

  const paymentId = e.target.paymentId.value;

  axios.get(`http://localhost:4000/payment/${paymentId}`)
  .then((response) => {
    console.log(response.data);
    setResponseState(response.data)
  })
  .catch((error) => {
    console.log("error occures", error)
  })
}

const Verify = () => {

    const [searchParams,setSearchParams] = useSearchParams();
    const success = searchParams.get("success")
    const orderId = searchParams.get("orderId")
    const {url} = useContext(StoreContext);
    const navigate = useNavigate();

    const verifyPayment = async () => {
        const response = await axios.post(url+"/api/order/verify",{success,orderId});
        if (response.data.success){
            navigate("/myorders");
        }
        else {
            navigate("/")
        }
    }


    useEffect(()=>{
        verifyPayment();
    },[])

  return (
    <div className='verify'>
        <div className="spinner"></div>
    </div>
  )
}

export default Verify