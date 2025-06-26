import React,{useEffect} from 'react'
import Layout from '../Layout'
import FormAddCustomer from '../../components/customer_components/FormAddCustomer'
import { useDispatch,useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../../features/authSlice'
import BreadcrumbsEsoda from '../../components/BreadcrumbsEsoda'

const AddCustomer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {isError} = useSelector((state=>state.auth));

  useEffect(()=>{
      dispatch(getMe());
  },[dispatch]);

  useEffect(()=>{
      if(isError){
          navigate("/");
      }
  },[isError,navigate]);
  return (
    <Layout>
      <BreadcrumbsEsoda />
        <FormAddCustomer/>
    </Layout>
  )
}

export default AddCustomer