import React,{useState,useEffect} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import apiBaseUrl from '../../apiConfig'

import Select from 'react-select';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Divider } from 'primereact/divider';

import { Inplace, InplaceDisplay, InplaceContent } from "primereact/inplace"
import { format } from 'date-fns';

const FormAddDoseis = () => {
    const [ammount, setAmmount] = useState(null);
    const [actual_payment_date,setActual_Payment_Date] = useState(null)
    const [estimate_payment_date, setEstimate_Payment_Date] = useState("")
    const [status,setStatus] = useState("no")
    const [ypoxreoseis_id,setYpoxreoseisId] = useState("")
    const[doseis,setdoseis]=useState([])
    const [comment, setComment] = useState(null);

    const [totalOwedAmmount, setTotal_Owed_Ammount] = useState(0.0);
    const [ammountVat, setAmmount_Vat] = useState(0.0);
    

    const [ypoxreoseis,setYpoxreoseis]=useState([]);

    const [text, setText] = useState('');

    const[msg,setMsg]=useState("");

    const navigate = useNavigate();

    useEffect(()=>{
        getYpoxreoseis()
       
    },[]);
    useEffect(()=>{
        if(ypoxreoseis_id!==""){
            getdoseis()
        }
    },[ypoxreoseis_id]);

    const getYpoxreoseis = async() =>{
        const response = await axios.get(`${apiBaseUrl}/ypo`, {timeout: 5000});
        console.log(response.data)
        setYpoxreoseis(response.data);
    }
    const getdoseis = async() =>{
        const response = await axios.get(`${apiBaseUrl}/doseis`, {timeout: 5000});
        const doseisData = response.data.filter(item => item.ypoxreoseis_id === parseInt(ypoxreoseis_id)  )

        setdoseis(doseisData);
    }

    //used for ammount to check the limit required for ypoxreoseis
    useEffect(() => { console.log("ammount updated ",ammount) }, [ammount])
    const CalculateMax= (event)=>{
        const sumYpo=Number(totalOwedAmmount)+Number(ammountVat)
        var sumdoseis=0
        const keyInputs=event.value
        doseis.map((dosi)=>{
            sumdoseis+=parseFloat(dosi.ammount)

        })
        const total=sumYpo-sumdoseis
        if(keyInputs>total){
            setAmmount(total)
        }else{
            setAmmount(Number(keyInputs))
        }
    }
    


    const handleYpoxreoseisChange = async (e) => {
        const selectedId = e.target.value;
        setYpoxreoseisId(selectedId)
        try {
            const response = await axios.get(`${apiBaseUrl}/ypoquery/${selectedId}`, {timeout: 5000});
      
            setTotal_Owed_Ammount(response.data.ypoxreoseis.total_owed_ammount);
            setAmmount_Vat(response.data.ypoxreoseis.ammount_vat);
          
    } catch (error) {
        if (error.response) {
            setMsg(error.response.data.msg);
        }
    }

    }


      // Convert dates to UTC format before sending to the server
      const formatToUTC = (date) => {
        return date ? format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'") : null;
    };

    const saveDoseis = async (e) =>{
        const updatedStatus = actual_payment_date ? "yes" : "no";

        e.preventDefault();
        try{
            await axios.post(`${apiBaseUrl}/doseis`, {
            ammount:ammount,
            actual_payment_date:formatToUTC(actual_payment_date),
            estimate_payment_date:formatToUTC(estimate_payment_date),
            status:updatedStatus,
            ypoxreoseis_id:ypoxreoseis_id,
            comment: comment
            });
            navigate("/doseis");
        }catch(error){
            if(error.response){
                setMsg(error.response.data.msg);
            }
        }
    }

    const clearDate = (e) => {
        e.preventDefault();  // Prevent form submission
        setActual_Payment_Date(null); // Clear the calendar date
    };


    const formatCurrency = (value) => {
        return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };


    return(

        <div >
        <h1 className='title'>Προσθήκη Δόσης</h1>
      <form onSubmit={saveDoseis}>
      <div className="grid">
      <div className="col-12 md:col-6">
          <div className="card p-fluid">
          <div className=""><Divider><span className="p-tag text-lg">Στοιχεία Δόσης</span></Divider></div>

          <div className="field">
                    <label className="label">Προμηθευτής-έξοδο</label>
                <div className="control">
                    <select className="input" onChange={(e) => handleYpoxreoseisChange(e)} defaultValue="">
                            <option value="" disabled>Επιλέξτε Προμηθευτή</option>
                            {ypoxreoseis.map((ypoxreosh, index) => (
                                <option key={index} value={ypoxreosh.id}>{ypoxreosh.provider}</option>
                            ))}
                        </select>
                    </div>
              </div>

              <div className="field">
                  <label htmlFor="name1">Συνολικό Ποσο Υποχρέωσης</label>
                  <div className="control">

                 <h2>{formatCurrency(Number(totalOwedAmmount)+Number(ammountVat))}</h2> 
                  </div>
              </div>

              <div className="field">
                  <label htmlFor="name1">Ποσό Δόσης</label>
                  <div className="control">

                  <InputNumber id="ammount"  keyfilter="pnum" mode="decimal" minFractionDigits={2} value={ammount} onChange={(e)=> CalculateMax(e)} max={Number(ammount)}/>


                  </div>
              </div>

                <div className="field">
                    <label htmlFor="estimate_payment_date">Εκτιμώμενη ημερομηνία πληρωμής</label>
                    <div className="control">

                    <Calendar id="estimate_payment_date"  value={estimate_payment_date} onChange={(e)=> setEstimate_Payment_Date(e.target.value)} inline showWeek />
                        </div>
                </div>


                <div className="field">
                    <label htmlFor="actual_payment_date">Πραγματική ημερομηνία πληρωμής</label>
                    <div className="control">

                    <Calendar id="actual_payment_date"  value={actual_payment_date ? new Date(actual_payment_date) : null} onChange={(e)=> setActual_Payment_Date(e.target.value)} inline showWeek />
                    </div>

                    <div className="field">
              <label  className="label">Comment</label>
              <div className="control">
                <InputText  id="comment" type="text" className="input" value={comment} onChange={(e)=> setComment(e.target.value)} placeholder='comment'/>
              </div>
            </div>

                    <div className="controll">
                        <div className="card">
                            <Inplace closable>
                                <InplaceDisplay>{text || 'Click to add number of copies'}</InplaceDisplay>
                                <InplaceContent>
                                    <InputText value={text} keyfilter="pint" onChange={(e) => setText(e.target.value)} autoFocus />
                                </InplaceContent>
                            </Inplace>
                        </div>
                    </div>

                    <div className="control">
                        <Button label="Clear" onClick={clearDate} className="p-button-secondary mt-2" type="button"/>
                    </div>
                </div>

          </div>


          <div className="field">
                            <div className="control">
                                <Button type="submit" className="button is-success is-fullwidth">Προσθήκη</Button>
                            </div>
                        </div>
 
      </div>

     

     
  </div>
  </form>

                                      
  </div>
    )

}

export default FormAddDoseis;