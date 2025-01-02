import React,{useState, useEffect,useMemo } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import apiBaseUrl from '../../apiConfig'
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Divider } from 'primereact/divider';
import Select from 'react-select'
import { format } from 'date-fns';

const FormAddYpoxreoseis = () => {
    const [provider, setProvider] = useState("");
    const [erga_id, setErga_Id] = useState(null);
    const [erga, setErga] = useState([]);
    const [invoice_date, setInvoice_Date] = useState(null);
    const [total_owed_ammount, setTotal_Owed_Ammount] = useState(0.0);
    const [ammount_vat, setAmmount_Vat] = useState(0.0);
    const [tags, setTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [msg, setMsg] = useState("");
    const [tagError, setTagError] = useState("");



    const navigate = useNavigate();

    useEffect(() => {
        getErga();
    }, []);

    useEffect(() => {
        getTags();
    }, []);

    const getErga = async () => {
        const response = await axios.get(`${apiBaseUrl}/erga`, {timeout: 5000});
        setErga(response.data);
    };

    const handleErgaChange = (e) => {
        setErga_Id(e.target.value);
    };

    const getTags = async () => {
        const response = await axios.get(`${apiBaseUrl}/tags`, {timeout: 5000});
        setTags(response.data);
    };

    const handleTagChange = (selectedOptions) => {
        setSelectedTags(selectedOptions);
        if (selectedOptions.length > 0) {
            setTagError("");
        }
    };
    // Convert dates to UTC format before sending to the server
    const formatToUTC = (date) => {
        return date ? format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'") : null;
    };
    const saveYpoxreoseis = async (e) => {
        e.preventDefault();
        if (selectedTags.length === 0) {
            setTagError("Please select at least one tag.");
            return;
        }
        try {
            const tagIds = selectedTags.map(tag => tag.value);
            console.log(tagIds)
            await axios.post(`${apiBaseUrl}/ypoquery`, {
                provider,
                erga_id,
                invoice_date:formatToUTC(invoice_date),
                total_owed_ammount,
                ammount_vat,
                tags_id: tagIds
            });
            navigate("/ypoquery");
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg);
            }
        }
    };

    const tagOptions = tags.map(tag => ({
        value: tag.id,
        label: tag.name
    }));

    const clearInvoiceDate = (e) => {
        e.preventDefault();  // Prevent form submission
        setInvoice_Date(null); // Clear the calendar date
    };

    return (
        <div >
          <h1 className='title'>Προσθήκη Υποχρέωσεις</h1>
        <form onSubmit={saveYpoxreoseis}>
        <div className="grid">
        <div className="col-12 md:col-6">
            <div className="card p-fluid">
            <div className=""><Divider><span className="p-tag text-lg">Στοιχεία Υποχρέωσεις</span></Divider></div>
            <div className="field">
                    <label htmlFor="name1">Προμηθευτής-έξοδο</label>
                    <div className="control">

                    <InputText id="name1" type="text" value={provider} onChange={(e)=> setProvider(e.target.value)} />
                    </div>
                </div>

                <div className="field">
                    <label htmlFor="percentagevat">Ποσό (σύνολο)</label>
                    <div className="control">

                    <InputNumber id="totalAmmount" className="input" mode="decimal" minFractionDigits={2} value={total_owed_ammount} onChange={(e) => setTotal_Owed_Ammount(e.value)} />
                   </div>
                </div>

                <div className="field">
                    <label htmlFor="percentagevat">Ποσό ΦΠΑ</label>
                    <div className="control">

                    <InputNumber  id="percentagevat" className="input" mode="decimal" minFractionDigits={2} value={ammount_vat} onChange={(e)=> setAmmount_Vat(e.value)}  />
                   </div>
                </div>

                <div className="field">
                    <label htmlFor="invoice_date">Ημερομηνία τιμολογίου</label>
                    <div className="control">

                    <Calendar id="invoice_date"  value={invoice_date} onChange={(e)=> setInvoice_Date(e.target.value)} inline showWeek />
                    </div>
                    <div className="control">
                    <Button label="Clear" onClick={clearInvoiceDate} className="p-button-secondary mt-2" type="button"/>
                    </div>
                </div>

                <div className="field">
                                <label className="label">Ετικέτες</label>
                                <div className="control">
                                    <Select
                                        isMulti
                                        value={selectedTags}
                                        onChange={handleTagChange}
                                        options={tagOptions}
                                        placeholder="Επιλέξτε Tags"
                                        classNamePrefix="react-select"
                                    />
                                    {tagError && <p className="help is-danger">{tagError}</p>}
                                </div>
                            </div>

                <div className="field">
            <label className="label">Εργα</label>
            <div className="control">
                  <select className="input" onChange={(e) => handleErgaChange(e)} defaultValue="">
                                    <option value="" disabled>Επιλέξτε Εργο</option>
                                        {erga.map((ergo, index) => (
                                            <option key={index} value={ergo.id}>{ergo.name}</option>
                                        ))}
                                </select>
            </div>

            <br />
            <br />

            

        </div>                
            </div>


            <div >

            <div className="field">
                            <div className="control">
                                <Button type="submit" className="button is-success is-fullwidth">Προσθήκη</Button>
                            </div>
                        </div>
            </div>

           
        </div>

       
    </div>
    </form>

                                        
    </div>
    );
};

export default FormAddYpoxreoseis;