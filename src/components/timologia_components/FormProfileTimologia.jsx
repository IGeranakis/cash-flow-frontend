import React,{useState,useEffect} from 'react'
import axios from 'axios'
import { useNavigate,useParams } from 'react-router-dom'
import '../../custom.css';
import { Divider } from 'primereact/divider';
import { Calendar } from 'primereact/calendar';
import { Chip } from 'primereact/chip';
import Select from 'react-select';

import 'bootstrap/dist/css/bootstrap.min.css';

import apiBaseUrl from '../../apiConfig';

const FormProfileTimologia = ({ id: propId, onHide }) => {
  const[invoice_date,setInvoice_date]=useState("");
  const[ammount_no_tax,setAmmount_no_tax]=useState("");
  const[ammount_tax_incl,setAmmount_Tax_Incl]=useState("");
  const[actual_payment_date,setActual_Payment_Date]=useState("");
  const[ammount_of_income_tax_incl,setAmmount_Of_Income_Tax_Incl]=useState("");
  const[comments,setComments]=useState("");
  const[invoice_number,setInvoice_Number]=useState("");
  const [status_paid, setStatus_Paid] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedParadoteaDetails, setSelectedParadoteaDetails] = useState([]);
  const [erga_id, setErga_id] = useState(null);
  const [erga, setErga] = useState([]);
  const [uniqueErga2, setUniqueErga2] = useState([]); // State to store unique `erga` data


  const [paradotea, setParadoteaByErgo] = useState([]);
  const[fullParadotea,setFullParadotea]=useState([])


    const[msg,setMsg]=useState("");
    const { id: paramId } = useParams();
    const id = propId !== undefined ? propId : paramId;

    useEffect(()=>{
        const getTimologioById = async()=>{
            try
            {
                const response=await axios.get(`${apiBaseUrl}/timologia/${id}`, {timeout: 5000});
                setInvoice_date(response.data.invoice_date);
                setAmmount_no_tax(response.data.ammount_no_tax);
                setAmmount_Tax_Incl(response.data.ammount_tax_incl);
                setActual_Payment_Date(response.data.actual_payment_date);
                setAmmount_Of_Income_Tax_Incl(response.data.ammount_of_income_tax_incl);
                setComments(response.data.comments);
                setInvoice_Number(response.data.invoice_number);
                setStatus_Paid(response.data.status_paid);

                const paradoteaResponse = await axios.get(`${apiBaseUrl}/getParadoteoAndErgoByTimologio/${id}`, {timeout: 5000});
                const paradoteaData = paradoteaResponse.data

                const ergaResponse = await axios.get(`${apiBaseUrl}/getParadoteoAndErgoByTimologio/${id}`, {timeout: 5000});
                const ergaData = ergaResponse.data;

                setErga(ergaData);
                setSelectedParadoteaDetails(paradoteaData);
                const fullParadoteaResponse = await axios.get(`${apiBaseUrl}/paradotea`, {timeout: 5000});
                setFullParadotea(fullParadoteaResponse.data);

                const itemsWithTimologiaId = fullParadotea.filter(paradoteo => paradoteo.timologia_id === parseInt(id));
                const unselectedParadotea = itemsWithTimologiaId.filter(paradoteo => 
                    !selectedParadoteaDetails.some(selected => selected.id === paradoteo.id)
                );
    
                console.log(unselectedParadotea)

            }
            catch(error)
            {
                if(error.response)
                {
                    setMsg(error.response.data.msg);
                }
            }
        };
        getTimologioById();
    }, [id]);

    const clearFormFields = () => {
        setSelectedOptions([]);
        setSelectedParadoteaDetails([]);
    }

    const handleErgaStart = async(e) => {
        console.log(e)
        const selectedId = e.erga.id;
        setErga_id(selectedId);
        console.log(selectedId)
        clearFormFields();
        if (selectedId) {
            try {
                const response = await axios.get(`${apiBaseUrl}/getParadoteoAndErgoByTimologio/${parseInt(e.timologia_id)}`, {timeout: 5000});
                const paradoteaByErgoId = response.data;
                setParadoteaByErgo(paradoteaByErgoId.filter(paradoteo=>paradoteo.erga.id===selectedId))
                // Filter by timologia_id and then map over the filtered array
                console.log(paradoteaByErgoId);
                const selected = paradoteaByErgoId
                .filter(paradoteo => paradoteo.timologia_id === e.timologia_id)
                .map(paradoteo => ({
                    value: paradoteo.id,
                    label: paradoteo.title
                }));

                setSelectedOptions(selected);
                
                

                console.log(selected);
            } catch (error) {
                console.error("Error fetching timologio data:", error);
            }
        }
    };

    const handleParadoteaChange2 = (selectedOptions) => {
        setSelectedOptions(selectedOptions);
        console.log("Selected option paradotea CHANGE", selectedOptions)

        const selectedIds = selectedOptions.map(options2 => options2.value);
        const selectedDetails = paradotea.filter(item => selectedIds.includes(item.id));
        setSelectedParadoteaDetails(selectedDetails);
    };

    const options = paradotea.map(paradoteo => ({
        value: paradoteo.id,
        label: paradoteo.title
    }));
    const options2 = paradotea.map(paradoteo => ({
        value: paradoteo.id,
        label: paradoteo.title
    }));

    useEffect(()=>{
        const selectedIds = selectedOptions.map(option => option.value);
        const selectedDetails = paradotea.filter(item => selectedIds.includes(item.id));
        setSelectedParadoteaDetails(selectedDetails);
    },[selectedOptions,id])

    useEffect(() => {
        if (erga.length > 0) {
            // Step 1: Filter the rows where timologia_id equals the given id
            const filteredErga = erga.filter(ergo => ergo.timologia_id === parseInt(id));
    
            // Step 2: Create a Set to ensure unique erga names and map the filtered array
            const uniqueErga = Array.from(new Set(filteredErga.map(ergo => ergo.erga.id)))
            .map(id => {      
                return filteredErga.find(ergo => ergo.erga.id === id);
            });
    
            setUniqueErga2(uniqueErga);
            console.log(uniqueErga2)
            
        }
        }, [erga, id]);
    useEffect(()=>{
        if(uniqueErga2.length>0){
            handleErgaStart(uniqueErga2[0]);
        }
    },[uniqueErga2,id])
        const formatCurrency = (value) => {
            return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };
    
    
    return(


<div>
<div className="surface-0">
    <div className="font-medium text-3xl text-900 mb-3">Τιμολόγιο</div>
    <div className="text-500 mb-5">Στοιχεία</div>
    <ul className="list-none p-0 m-0">
        <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Κωδικός Τιμολογίου</div>
            <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">{invoice_number}</div>
           
        </li>

        <li>
        <div className="field">
                                <label className="label">Παραδοτεα</label>
                                <div className="control">
                                    <Select
                                        isMulti
                                        value={selectedOptions}
                                        onChange={handleParadoteaChange2}
                                        options={options2}
                                        classNamePrefix="react-select"
                                        isDisabled={true}
                                    />
                                </div>
                            </div>
        </li>

        <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Κατάσταση Τιμολογίου:</div>
            <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
                <Chip label={status_paid} className="mr-2" />
               
            </div>
          
        </li>
 

        <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Ημερομηνία έκδοσης τιμολογίου</div>
            <div className="text-900 w-full md:w-6 md:flex-order-0 flex-order-1">

            <Calendar value={new Date(invoice_date)} inline showWeek />


            </div>

           
        </li>
   
        <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Ημερομηνία πληρωμής τιμολογίου (εκτίμηση)</div>
            <div className="text-900 w-full md:w-6 md:flex-order-0 flex-order-1">

            <Calendar value={new Date(actual_payment_date)} inline showWeek />


            </div>

           
        </li>

     
    </ul>
</div>
<Divider />

<div className="grid">
  
    <div className="col-12 md:col-6 lg:col-3">
        <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
            <div className="flex justify-content-between mb-3">
                <div>
                    <span className="block text-500 font-medium mb-3">Ποσό τιμολογίου  (καθαρή αξία)</span>
                    <div className="text-900 font-medium text-xl">{formatCurrency(ammount_no_tax)}</div>
                </div>
                <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className="pi pi-map-marker text-orange-500 text-xl"></i>
                </div>
            </div>
            <span className="text-green-500 font-medium">%52+ </span>
            <span className="text-500">since last week</span>
        </div>
    </div>

    <div className="col-12 md:col-6 lg:col-3">
        <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
            <div className="flex justify-content-between mb-3">
                <div>
                    <span className="block text-500 font-medium mb-3">Ποσό Φ.Π.Α.</span>
                    <div className="text-900 font-medium text-xl">{formatCurrency(ammount_tax_incl)} </div>
                </div>
                <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className="pi pi-map-marker text-orange-500 text-xl"></i>
                </div>
            </div>
            <span className="text-green-500 font-medium">%52+ </span>
            <span className="text-500">since last week</span>
        </div>
    </div>

    <div className="col-12 md:col-6 lg:col-3">
        <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
            <div className="flex justify-content-between mb-3">
                <div>
                    <span className="block text-500 font-medium mb-3">Πληρωτέο</span>
                    <div className="text-900 font-medium text-xl">{formatCurrency(ammount_of_income_tax_incl)} €</div>
                </div>
                <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                    <i className="pi pi-map-marker text-orange-500 text-xl"></i>
                </div>
            </div>
            <span className="text-green-500 font-medium">%52+ </span>
            <span className="text-500">since last week</span>
        </div>
    </div>

 

</div>

<li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Σχόλια</div>
            <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">{comments}</div>
           
        </li>
</div>
    )
}

export default FormProfileTimologia;