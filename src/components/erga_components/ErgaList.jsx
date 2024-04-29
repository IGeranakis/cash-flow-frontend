import React,{useState,useEffect} from 'react'
import {Link} from "react-router-dom"
import axios from 'axios'
import { useSelector } from 'react-redux';
import '../../buildinglist.css';
import apiBaseUrl from '../../apiConfig'; // Update the path accordingly


const ErgaList = () => {
    const [erga,setErga]=useState([]);
    const {user} = useSelector((state)=>state.auth)
    useEffect(()=>{
        getErga()
    },[]);

    const getErga = async() =>{
        const response = await axios.get(`${apiBaseUrl}/erga`);
        setErga(response.data);
    }
    const deleteErga = async(ergaId)=>{
        await axios.delete(`${apiBaseUrl}/erga/${ergaId}`);
        getErga();
    }

  return (
    <div>
        <h1 className='title'>Εργα</h1>
        {user && user.role ==="admin" && (
        <Link to={"/erga/add"} className='button is-primary mb-2'>Προσθήκη Νέου</Link>
        )}
        <table className='table is-stripped is-fullwidth'>
            <thead>
                <tr>

                    <th>#</th>

                    <th>ΟΝΟΜΑ ΕΡΓΟΥ</th>
                    <th>ΠΟΣΟ ΣΥΜΒΑΣΗΣ (€) ΧΩΡΙΣ Φ.Π.Α.</th>
                    <th>ΗΜΕΡΟΜΗΝΙΑ ΥΠΟΓΡΑΦΗΣ ΣΥΜΒΑΣΗΣ</th>
                    <th>ΚΑΤΑΣΤΑΣΗ ΕΡΓΟΥ</th>
                    <th>ΗΜΕΡΟΜΗΝΙΑ ΕΝΑΡΞΗΣ(εκτίμηση)</th>
                    <th>PROJECT MANAGER</th>
                    <th>ID ΠΕΛΑΤΗ</th>
                </tr>
            </thead>
            <tbody>
                {erga.map((ergo,index)=>(
                    <tr key={ergo.id}>
                        <td>{index+1}</td>
                        <td>{ergo.name}</td>
                        <td>{ergo.sign_ammount_no_tax}</td>
                        <td>{ergo.sign_date}</td>
                        <td>{ergo.status}</td>
                        <td>{ergo.estimate_start_date}</td>
                        <td>{ergo.project_manager }</td>
                        <td>{ergo.customer_id}</td>


                        <td>
                            <Link to={`/erga/profile/${ergo.id}`} className='button is-small is-info'>Προφίλ</Link>
                            {user && user.role ==="admin" && (
                            <div>
                                <Link to={`/erga/edit/${ergo.id}`} className='button is-small is-info'>Επεξεργασία</Link>
                                <button onClick={()=>deleteErga(ergo.id)} className='button is-small is-danger'>Διαγραφή</button>
                            </div>
                            )}
                            
                        </td>
                    </tr>
                ))}
                
            </tbody>
        </table>
    </div>
  )
}

export default ErgaList