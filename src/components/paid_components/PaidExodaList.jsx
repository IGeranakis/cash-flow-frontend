import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../../buildinglist.css';
import apiBaseUrl from '../../apiConfig';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { MultiSelect } from 'primereact/multiselect';
import { Dialog } from 'primereact/dialog';
import apiBaseFrontUrl from '../../apiFrontConfig';

const PaidExodaList = () => {
    const [paradotea, setIncomeParadotea] = useState([]);
    const [ekxorimena, setEkxorimena] = useState([]);
    const [incomeTim, setIncomeTim] = useState([]);
    const [daneia,setDaneia]=useState([])
    const [doseis,setDoseis]=useState([])
    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilterValue, setGlobalFilterValue] = useState('');
    const [statuses] = useState(['Bank', 'Customer','Paradotea','Timologia']);
    const [totalIncome, setTotalIncome] = useState(0);
    const [filtercalled,setfiltercalled]=useState(false)
    const [combinedData,setCombinedData]=useState([])
    const [provider, setProvider] = useState([])
    
    const [ypoxreoseis, setYpoxreoseis] = useState([])
    const[selectedIdType,setSelectedIdType]=useState([])
    const [visible, setVisible] = useState(false); // State to control the visibility of the popup
    const [selectedRowData, setSelectedRowData] = useState(null); // State to store the row data to display

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchData();
        setLoading(false);
        initFilters();
    }, []);

    const fetchData = async () => {
        await getDoseis();
        await getEkxorimena();
        await getIncomePar();
        await getIncomeTim();
        await getDaneia();
        await getYpoxreoseis();
    };

    const getDoseis = async () =>{
        const response = await axios.get(`${apiBaseUrl}/doseis`, {timeout: 5000})
        setDoseis(response.data)
    }
    const getYpoxreoseis = async() =>
    {
        const response = await axios.get(`${apiBaseUrl}/doseis`, {timeout: 5000})
        const uniqueNames = [...new Set(response.data.filter(item=>item.status==="no").map(item => item.provider))];
        console.log("Unique names:",uniqueNames);
        setProvider(uniqueNames);
        setYpoxreoseis(response.data)
    }

    const getEkxorimena = async () => {
        const response = await axios.get(`${apiBaseUrl}/ek_tim`, {timeout: 5000});
        setEkxorimena(response.data);
    };

    const getIncomePar = async () => {
        const response = await axios.get(`${apiBaseUrl}/income_par`, {timeout: 5000});
        setIncomeParadotea(response.data);
    };

    const getIncomeTim = async () => {
        const response = await axios.get(`${apiBaseUrl}/income_tim`, {timeout: 5000});
        const data = response.data;

        // Filter to ensure unique timologia.id values
        const uniqueTimologia = [];
        const seenTimologiaIds = new Set();

        data.forEach(item => {
            if (!seenTimologiaIds.has(item.timologia.id)) {
                seenTimologiaIds.add(item.timologia.id);
                uniqueTimologia.push(item);
            }
        });
        setIncomeTim(uniqueTimologia);
    };
    const getDaneia = async () =>{
        const response = await axios.get(`${apiBaseUrl}/daneia`, {timeout: 5000})
        setDaneia(response.data);
    }

    const getDosiId = async(id)=>{
        console.log("id scenario id ",id)
        const response = await axios.get(`${apiBaseUrl}/doseis/${id}`, {timeout: 5000})
        console.log("eeeeeeeee: ", response)
        setSelectedRowData(response.data)
    }

    const clearFilter = () => {
        initFilters();
    };

    const onGlobalFilterChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const initFilters = () => {
        setFilters({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            date: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
            income: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            type: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
            provider: { value: null, matchMode: FilterMatchMode.EQUALS }

        });
        setGlobalFilterValue('');
    };

    const formatDate = (value) => {
        if (value===null || value===""){
            return ""
        } 
        let date = new Date(value);
        if (!isNaN(date)) {
            return date.toLocaleDateString('en-UK', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } else {
            
            return "Invalid date";
        }
    };

  //Sign Date
  const DateBodyTemplate = (rowData) => {
    return formatDate(rowData.date);
};

const dateFilterTemplate = (options) => {
    return <Calendar value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy" mask="99/99/9999" />;
};


const formatCurrency = (value) => {
    return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const ammountBodyTemplate = (rowData) => {
    console.log("hehehe",rowData.income)
    return formatCurrency(rowData.income);
};


const ammountFilterTemplate = (options) => {
    return <InputNumber value={options.value} onChange={(e) => options.filterCallback(e.value, options.index)} mode="currency" currency="EUR" locale="en-US" />;
};


const getSeverity = (status) => {
    switch (status) {
        case 'Bank':
            return 'danger';
        case 'Customer':
            return 'danger';
        case 'Paradotea':
            return 'info';
        case 'Timologia':
            return 'success';
        case 'Daneia':
            return 'warning';
     
    }
};

const statusBodyTemplate = (rowData) => {
    return <Tag value={rowData.type} severity={getSeverity(rowData.type)} />;
};

const NameBodyTemplate = (rowData) =>
{
    
    const provider_name = rowData.provider || 'N/A';
    console.log("RRR data: ", provider_name)  
    return (
        <div className="flex align-items-center gap-2">
            <span>{provider_name}</span>
        </div>
    );
}

const NameFilterTemplate = (options) =>
{
    console.log("Provider Options in Filter: ", options.value);
    return (<Dropdown
        value={options.value}
        options={provider}
        onChange={(e) => {
            console.log("Selected providerrrrrrrrrrr:", e.value); // Log the selected value
            options.filterCallback(e.value); // Apply filter with selected value
        }}
        placeholder="Any"
        className="p-column-filter"
        showClear
    />);
}

const NameItemTemplate = (option) =>
{
    return (
        <div className="flex align-items-center gap-2">
            <span>{option}</span>
        </div>
    );
}

const statusFilterTemplate = (options) => {
    return <Dropdown value={options.value} options={statuses} onChange={(e) => options.filterCallback(e.value, options.index)} itemTemplate={statusItemTemplate} placeholder="Select One" className="p-column-filter" showClear />;
};

const statusItemTemplate = (option) => {
    return <Tag value={option} severity={getSeverity(option)} />;
};


const handleRowData = (rowData) => {
    setSelectedIdType(rowData.type)
    console.log("rowdataaaaaaa: ", rowData)
    getDosiId(rowData.id)
    
    
    setVisible(true);
};
const idBodyTemplate = (rowData) => {
    return (
        <Button label={rowData.id} onClick={() => handleRowData(rowData)} />
    );
};



    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} />
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </IconField>
            </div>
        );
    };

    const calculateTotalIncome = (data) => {
        
        if (!data || data.length === 0) return 0;
        return data.reduce((acc, item) => Number(acc) + Number(item.income), 0);
    };
    

    
    useEffect(()=>{
        
        const combinedData2 = [
            ...doseis.filter(item=>item.status==="no").map(item=>({ date: new Date(item.estimate_payment_date), income: Number(item.ammount) , type: 'doseis', id: item.doseis_id, provider: item.provider?.trim() || 'N/A' }))
        ];
        console.log("Combined Data: ", doseis);
        setCombinedData(combinedData2)

        const uniqueProviders = [...new Set(combinedData2.map(item => item.provider?.trim() || 'N/A'))];
        console.log("Unique Providers (for filter): ", uniqueProviders);
        setProvider(uniqueProviders); // Set provider options for the filter

    },[doseis])
    





    useEffect(() => {
        if(!filtercalled){
            setTotalIncome(formatCurrency(calculateTotalIncome(combinedData)));
        }
        
    }, [combinedData]);


    const handleValueChange = (e) => {
        const visibleRows = e;
        if(e.length>0){
            setfiltercalled(true)
        }

        // // Calculate total income for the visible rows
        const incomeSum = visibleRows.reduce((sum, row) => sum + Number((row.income || 0)), 0);
        
        setTotalIncome(formatCurrency(incomeSum));
    };

    const header = renderHeader();

    return (
        
        <div>
            {console.log("Got you: " , selectedRowData)}
            <DataTable value={combinedData} paginator rows={10} 
            header={header} 
            filters={filters} 
            filterDisplay="menu" loading={loading} 
            responsiveLayout="scroll" 
            globalFilterFields={['date', 'income', 'type', 'provider','id']}
            onFilter={(e)=>setFilters(e.filters)}
            onValueChange={handleValueChange}
            >
                <Column filterField="date" header="Ημερομηνία" dataType="date" style={{ minWidth: '5rem' }} body={DateBodyTemplate} filter filterElement={dateFilterTemplate} sortable sortField="date" ></Column>
                <Column filterField="income" header="Εκροές" dataType="numeric" style={{ minWidth: '5rem' }} body={ammountBodyTemplate} filter filterElement={ammountFilterTemplate} footer={totalIncome} ></Column>
                <Column field="type" header="Τύπος Εκροής" filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '5rem' }} body={statusBodyTemplate} filter filterElement={statusFilterTemplate} />
                <Column  filterField="provider" header="Περιγραφή"
                showFilterMatchModes={false} 
                  filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '14rem' }}
                    body={NameBodyTemplate} 
                    filter filterElement={NameFilterTemplate} /> 
                <Column field="id" header="Id" body={idBodyTemplate} filter ></Column>

            </DataTable>
            <Dialog header="Λεπτομέρειες" visible={visible} style={{ width: '50vw' }} onHide={() => setVisible(false)}>
                {selectedRowData && selectedIdType==="doseis" && (
                    
                    <div>
                        {console.log("Rowdata selectedeeeeee: ", selectedRowData)}
                        <p><strong>ID:</strong> {selectedRowData.id}</p>
                        <p><strong>Ποσό:</strong> {formatCurrency(selectedRowData.ammount)}</p>
                        <p><strong>Πραγματική ημερομηνία πληρωμής:</strong> {formatDate(selectedRowData.actual_payment_date)}</p>
                        <p><strong>Εκτιμώμενη ημερομηνία πληρωμής:</strong> {formatDate(selectedRowData.estimate_payment_date)}</p>
                        <p><strong>Κατάσταση:</strong> {selectedRowData.status}</p>
                        <p><strong>id Yποχρεωσης:</strong> {selectedRowData.ypoxreoseis_id}</p>
                        <p><strong>Προμηθευτής-έξοδο:</strong> {selectedRowData.ypoxreosei.provider}</p>
                        <p><strong><a href = {`${apiBaseFrontUrl}/doseis/edit/${selectedRowData.id}`}>Επεξεργασία δόσης</a></strong></p>
                        <p><strong><a href = {`${apiBaseFrontUrl}/doseis/profile/${selectedRowData.id}`}>Πληροφορίες δόσης</a></strong></p>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default PaidExodaList;
