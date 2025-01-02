import React,{useState,useEffect, useRef} from 'react'
import {Link} from "react-router-dom"
import axios from 'axios'
import { useSelector } from 'react-redux';
import '../../buildinglist.css';
import apiBaseUrl from '../../apiConfig'; // Update the path accordingly
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputNumber } from 'primereact/inputnumber';
import { MultiSelect } from 'primereact/multiselect';
import { PrimeIcons } from 'primereact/api';
import { ToggleButton } from 'primereact/togglebutton';

import { Toast } from 'primereact/toast';

import { ConfirmDialog } from 'primereact/confirmdialog'; // For <ConfirmDialog /> component
import { confirmDialog } from 'primereact/confirmdialog'; // For confirmDialog method

import FormEditCustomer from '../customer_components/FormEditCustomer'
import FormProfileCustomer from '../customer_components/FormProfileCustomer'

import {Dialog} from 'primereact/dialog'

import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { Tab } from 'react-bootstrap';
import { BreadCrumb } from 'primereact/breadcrumb';

import robotoData from '../report_components/robotoBase64.json';
import { jsPDF } from "jspdf";
import { OverlayPanel } from 'primereact/overlaypanel';


const CustomerList = () => {
    const [customer,setCustomer]=useState([]);
    const [filteredCustomer, setFilteredCustomer] = useState([]);

    const [filters, setFilters] = useState(null);
    const [loading, setLoading] = useState(true);
    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const [nameFrozen, setNameFrozen] = useState(false);
    const [logoFrozen, setLogoFrozen] = useState(false)



    const [customernames, setCustomerNames]=useState([]);

    const {user} = useSelector((state)=>state.auth)

    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedCustomers, setSelectedCustomers] = useState([])
    const dt = useRef(null);
    const robotoBase64 = robotoData.robotoBase64;

    const cols = [
        { field: 'name', header: 'Όνομα Πελάτη' },
        { field: 'afm', header: 'ΑΦΜ' },
        { field: 'doy', header: 'Δ.Ο.Υ' },
        { field: 'epagelma', header: 'Επάγγελμα' },
        { field: 'phone', header: 'Τηλέφωνο' },
        { field: 'email', header: 'email' },
        { field: 'address', header: 'Διεύθυνση' },
        { field: 'postal_code', header: 'Ταχυδρομικός κώδικας' },
        { field: 'website', header: 'Ιστοσελίδα' },
        { field: 'facebookUrl', header: 'Facebook Page'},
        { field: 'twitterUrl', header: 'twitterPage'},
        { field: 'instagramUrl', header: 'Instagram Page'},
        { field: 'linkedInUrl', header: 'LinkedIn Page'}
    ];



// Step 1: Import base64 font string (this is a placeholder, you should replace it with the actual base64 string)

// Function to add the Roboto-Regular font to jsPDF
const callAddFont = function () {
  this.addFileToVFS('Roboto-Regular-normal.ttf', robotoBase64);
  this.addFont('Roboto-Regular-normal.ttf', 'Roboto-Regular', 'normal');
};

// Step 2: Register the font adding event
jsPDF.API.events.push(['addFonts', callAddFont]);




    const exportColumns = cols.map((col) => ({ title: col.header, dataKey: col.field }));


    const exportCSV = (selectionOnly) => {
        dt.current.exportCSV({ selectionOnly });
    };

    const exportPdf = () => {
        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then(() => {
                const doc = new jsPDF.default({
                    orientation: 'l',
                    unit: 'mm',
                    format: 'a4'
                });
        // Step 4: Set the custom font and font size
        doc.setFont('Roboto-Regular');
        doc.setFontSize(12);
        
        const formattedReportData = filteredCustomer.map((product) => {
            return {
                ...product
            };
        });

        // Step 5: Add the table using autoTable
        doc.autoTable({
        columns: exportColumns,
        body: formattedReportData.map((product) => [
            product.name,
            product.afm,
            product.doy,
            product.epagelma,
            product.phone,
            product.email, // Now this is formatted as currency
            product.address,
            product.postal_code, // Now this is formatted as currency
            product.website,
            product.facebookUrl,
            product.twitterUrl,
            product.instagramUrl,
            product.linkedInUrl
        ]),
        styles: {
            font: 'Roboto-Regular' // Make sure the table uses the Roboto font
        }});




        // Step 6: Save the document
        doc.save('Customers.pdf');
                        
                    });
                });
    };


        
    const exportExcel = () => {
        import('xlsx').then((xlsx) => {
            // Create the headers based on the 'cols' array
            const headers = cols.map(col => col.header);
    
            // Create data rows with headers first
            const data = [
                headers,  // First row with headers
                ...filteredCustomer.map((product) =>
                    cols.map((col) => {                        
                        return product[col.field];  // Return the value as is for other fields
                    })
                )
            ];
    
            // Convert data to Excel worksheet
            const worksheet = xlsx.utils.aoa_to_sheet(data);  // 'aoa_to_sheet' takes 2D array with headers
            const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    
            // Generate Excel file and save it
            const excelBuffer = xlsx.write(workbook, {
                bookType: 'xlsx',
                type: 'array',
            });
    
            saveAsExcelFile(excelBuffer, 'customers');
        });
    };
    



    const saveAsExcelFile = (buffer, fileName) => {
        import('file-saver').then((module) => {
            if (module && module.default) {
                let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
                let EXCEL_EXTENSION = '.xlsx';
                const data = new Blob([buffer], {
                    type: EXCEL_TYPE
                });

                module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
            }
        });
    };

    const formatCurrencyReport = (value) => {
        return Number(value);
    };

    const toast = useRef(null)

    const accept = (id) => {
        try {
            deleteCustomer(id);
            toast.current.show({ severity: 'success', summary: 'Deleted Successfully', detail: `Item ${id} has been deleted.` });
        } catch (error) {
            console.error('Failed to delete:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete the item. Please try again.',
                life: 3000,
            });
        } 
    };

    const reject = () => {
        toast.current.show({ severity: 'warn', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
        getCustomer()
    }

    const confirm = (id) => {
        confirmDialog({
            message: 'Do you want to delete this record?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: () => accept(id),
            reject: () => reject() // Optional
        });
    };
    
    useEffect(()=>{
        getCustomer()
        setLoading(false);

        initFilters();

    },[]);

    const getCustomer = async() =>{
        const response = await axios.get(`${apiBaseUrl}/customer`, {timeout: 5000});
        const paraData = response.data;

        const uniqueNames = [...new Set(paraData.map(item => item.name || 'N/A'))];
        console.log("Unique names:",uniqueNames);
        setCustomerNames(uniqueNames);

        const parDataWithDates = paraData.map(item => ({
            ...item,
            customernames: {
                ...item.customernames,
                name: item.name || 'N/A'
            }
            
        }));

        console.log(parDataWithDates); // Optionally log the transformed data

        // Assuming you have a state setter like setErga defined somewhere
        setCustomer(parDataWithDates);
        setFilteredCustomer(parDataWithDates)

    }
    const deleteCustomer = async(customerId)=>{
        await axios.delete(`${apiBaseUrl}/customer/${customerId}`);
        getCustomer();
    }
    
    const deleteMultipleCustomers = (ids) => {
        // Assuming you have an API call or logic for deletion
        // Example: If using a REST API for deletion, you might perform a loop or bulk deletion
        if (Array.isArray(ids)) {
            // Handle multiple deletions
            ids.forEach(async (id) => {
                // Existing logic to delete a single Dosi by id, e.g., an API call
                console.log(`Deleting customer with ID: ${id}`);
                await axios.delete(`${apiBaseUrl}/customer/${id}`);

                // Add your deletion logic here
            });
        } else {
            // Fallback for single ID deletion (just in case)
            console.log(`Deleting customers with ID: ${ids}`);
            // Add your deletion logic here
        }
    
        // Optionally update your state after deletion to remove the deleted items from the UI
        setCustomer((prevCustomers) => prevCustomers.filter((customer) => !ids.includes(customer.id)));
        setSelectedCustomers([]); // Clear selection after deletion
    };

    
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

            name: { value: null, matchMode: FilterMatchMode.IN },
            afm: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            doy: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            epagelma: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            phone: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            email: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            address: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            postal_code: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
            website: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },

            
        });
        setGlobalFilterValue('');
    };



//customer

const imageBodyTemplate = (rowData) => {
    return <img src={`${apiBaseUrl}/${rowData.logoImage}`} alt={rowData.logoImage} className="w-6rem shadow-2 border-round" />;
};
const websiteBodyTemplate = (rowData) => {
    return <a href={`${rowData.website}`} alt={rowData.logoImage} >{`${rowData.website}`}</a>;
};
const socialBodyTemplate = (rowData) => {
    return (
        <div>
            <a href={`${rowData.facebookUrl}`} alt={rowData.facebookUrl} ><i className="pi pi-facebook"></i></a> &nbsp; 
            <a href={`${rowData.twitterUrl}`} alt={rowData.twitterUrl} ><i className="pi pi-twitter"></i></a> &nbsp; 
            <a href={`${rowData.linkedInUrl}`} alt={rowData.linkedInUrl} ><i className="pi pi-linkedin"></i></a> &nbsp; 
            <a href={`${rowData.instagramUrl}`} alt={rowData.instagramUrl} ><i className="pi pi-instagram"></i></a> &nbsp; 
        
        </div>
        
        
    );
};

const customerBodyTemplate = (rowData) => {
        
    const customer = rowData.name || 'N/A';        // console.log("repsBodytempl",timologio)
    console.log("customer",customer," type ",typeof(customer));
    console.log("rep body template: ",customer)

    return (
        <div className="flex align-items-center gap-2">
            <span>{customer}</span>
        </div>
    );
};

const customerFilterTemplate = (options) => {
    console.log('Current timologia filter value:', options.value);

        return (<MultiSelect value={options.value} options={customernames} itemTemplate={customerItemTemplate} onChange={(e) => options.filterCallback(e.value)} placeholder="Any" className="p-column-filter" />);

    };


const customerItemTemplate = (option) => {
    console.log("rep Item template: ",option)
    console.log("rep Item type: ",typeof(option))

    return (
        <div className="flex align-items-center gap-2">
            <span>{option}</span>
        </div>
    );
};


const allColumnFields = ['name', 'logoImage'];
const [frozenColumns, setFrozenColumns] = useState(['name', 'logoImage']); // Initially frozen column(s)
const allColumnsFrozen = frozenColumns.length === allColumnFields.length;
const buttonLabel = allColumnsFrozen ? 'Unlock All' : 'Lock All';


    // Function to toggle a column's frozen state
    const toggleFreezeColumn = (fieldName) => {
        setFrozenColumns((prev) =>
            prev.includes(fieldName)
                ? prev.filter(col => col !== fieldName) // Unfreeze column if already frozen
                : [...prev, fieldName]                  // Freeze column if not frozen
        );
    };

    // Function to lock or unlock all columns based on current state
    const toggleAllColumns = () => {
        if (allColumnsFrozen) {
            // Unlock all columns
            setFrozenColumns([]);
        } else {
            // Lock all columns
            setFrozenColumns(allColumnFields);
        }
    }

    const renderColumnHeader = (headerText, fieldName) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            
            <span
                onClick={() => toggleFreezeColumn(fieldName)}
                style={{ cursor: 'pointer', marginRight: '8px' }}
                title={frozenColumns.includes(fieldName) ? 'Unlock Column' : 'Lock Column'}
            >
                {frozenColumns.includes(fieldName) ? <i className="pi pi-lock" style={{ fontSize: '1rem' }}></i> : <i className="pi pi-lock-open" style={{ fontSize: '1rem' }}></i>}
            </span>
            <span>{headerText}</span>
        </div>
    );

    const clearLocks = () =>
    {
        setFrozenColumns([]); // Clear all frozen columns
    }



    const renderHeader = () => {
        return (
            <div className="header-container flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={clearFilter} />
                
                <Button type="button" label={buttonLabel} icon={buttonLabel === 'Unlock All Columns' ? 'pi pi-unlock' : 'pi pi-lock'} outlined onClick={toggleAllColumns} />
                 {/* Responsive Search Field */}
               <div className="responsive-search-field">
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search" />
                        <InputText
                            value={globalFilterValue}
                            onChange={onGlobalFilterChange}
                            placeholder="Keyword Search"
                        />
                    </IconField>
                </div>

                <Button className='action-button' type="button" icon="pi pi-file-excel" severity="success" rounded onClick={exportExcel} data-pr-tooltip="XLS" />
                <Button className='action-button' type="button" icon="pi pi-file-pdf" severity="warning" rounded onClick={exportPdf} data-pr-tooltip="PDF" />
            </div>
        );
    };
    const header = renderHeader();

    const confirmMultipleDelete = () => {
        confirmDialog({
            message: 'Are you sure you want to delete the selected records?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: () => {
                // Delete all selected items after confirmation
                deleteMultipleCustomers(selectedCustomers.map(customer => customer.id));
                
                // Show success toast
                toast.current.show({
                    severity: 'success',
                    summary: 'Deleted Successfully',
                    detail: 'Selected items have been deleted.',
                    life: 3000,
                });
            },
            reject: () => {
                // Show cancellation toast
                toast.current.show({
                    severity: 'info',
                    summary: 'Cancelled',
                    detail: 'Deletion was cancelled.',
                    life: 3000,
                });
            },
        });
    };


    const ActionsBodyTemplate = (rowData) => {
        const id = rowData.id;
        const op = useRef(null);
        const [hideTimeout, setHideTimeout] = useState(null);
    
        // Show overlay on mouse over
        const handleMouseEnter = (e) => {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                setHideTimeout(null);
            }
            op.current.show(e);
        };
    
        // Hide overlay with delay on mouse leave
        const handleMouseLeave = () => {
            const timeout = setTimeout(() => {
                op.current.hide();
            }, 100); // Adjust delay as needed
            setHideTimeout(timeout);
        };
    
        return (
            <div className="actions-container">
                {/* Three dots button */}
                <Button 
                    icon="pi pi-ellipsis-v" 
                    className="p-button-text"
                    aria-label="Actions"
                    onMouseEnter={handleMouseEnter} // Show overlay on hover
                    onMouseLeave={handleMouseLeave} // Start hide timeout on mouse leave
                />
    
                {/* OverlayPanel containing action buttons in a row */}
                <OverlayPanel 
                    ref={op} 
                    onClick={() => op.current.hide()} 
                    dismissable 
                    onMouseLeave={handleMouseLeave} // Hide on overlay mouse leave
                    onMouseEnter={() => {
                        if (hideTimeout) clearTimeout(hideTimeout);
                    }} // Clear hide timeout on overlay mouse enter
                >
                    <div className="flex flex-row gap-2">
                        {/* Only show the Profile button for non-admin users */}
                        {user && user.role !== "admin" && (
                            <Link to={`/customer/profile/${id}`}>
                                <Button icon="pi pi-eye" severity="info" aria-label="User" />
                            </Link>
                        )}
                        
                        {/* Show all action buttons for admin users */}
                        {user && user.role === "admin" && (
                            <>
                                <Button 
                                className='action-button'
                                    icon="pi pi-eye"
                                    severity="info"
                                    aria-label="User"
                                    onClick={() => {
                                        setSelectedCustomerId(id);
                                        setSelectedType('Profile');
                                        setDialogVisible(true);
                                    }}
                                />
                                <Button
                                className='action-button'
                                    icon="pi pi-pen-to-square"
                                    severity="info"
                                    aria-label="Edit"
                                    onClick={() => {
                                        setSelectedCustomerId(id);
                                        setSelectedType('Edit');
                                        setDialogVisible(true);
                                    }}
                                />
                                <Button
                                className='action-button'
                                    icon="pi pi-trash"
                                    severity="danger"
                                    aria-label="Delete"
                                    onClick={() => confirm(id)}
                                />
                            </>
                        )}
                    </div>
                </OverlayPanel>
            </div>
        );
    };

    const actionsBodyTemplate=(rowData)=>{
        const id=rowData.id
        return(
            <div className=" flex flex-wrap justify-content-center gap-3">
               
            {user && user.role!=="admin" &&(
                <div>
                    <Link to={`/customer/profile/${id}`} ><Button severity="info" label="Προφίλ" text raised /></Link>
                </div>
            )}
            {user && user.role === "admin" && (
                    <span className='flex gap-1'>
                            <Button className='action-button' 
                            icon="pi pi-eye" 
                            severity="info" 

                            aria-label="User" 
                            onClick={() => {
                                setSelectedCustomerId(id);
                                setSelectedType('Profile');
                                setDialogVisible(true);
                            }}
                            />
                        <Button
                            className='action-button'
                            icon="pi pi-pen-to-square"
                            severity="info"
                            aria-label="Edit"
                            onClick={() => {
                                setSelectedCustomerId(id);
                                setSelectedType('Edit');
                                setDialogVisible(true);
                            }}
                        />
                             <Button className='action-button' icon="pi pi-trash" severity="danger" aria-label="Delete" onClick={() => deleteCustomer(id)} />
                             </span>
                        )}
            </div>
 
        );
    }

    

  return (
     <div className="card" >
        
        <h1 className='title'>Πελάτες</h1>
        <div className='d-flex align-items-center gap-4'>
        {user && user.role ==="admin" && (
        <Link to={"/customer/add"} className='button is-primary mb-2'><Button label="Προσθήκη Νεου Πελάτη" icon="pi pi-plus-circle" className='rounded'/></Link>
        )}
        
        <br />

         {selectedCustomers.length > 0 && (
            <Button 
                className='button is-primary mb-2 rounded'
                label="Delete Selected" 
                icon="pi pi-trash" 
                severity="danger" 
                onClick={confirmMultipleDelete} // Pass an array of selected IDs
            />
        )}
        </div>

        <Toast ref={toast} />
        <ConfirmDialog />
        
<DataTable ref = {dt} onValueChange={(customers) => setFilteredCustomer(customers)} value={customer} paginator  stripedRows 
 rows={20} scrollable scrollHeight="600px" loading={loading} dataKey="id" 
            filters={filters} 
            globalFilterFields={['id', 'name', 
                'afm','doy','epagelma','phone', 'email',
                'address','postal_code','website'
                ]} 
            header={header} 
            emptyMessage="No customers found."
            selection={selectedCustomers} 
                        onSelectionChange={(e) => setSelectedCustomers(e.value)} // Updates state when selection changes
                        selectionMode="checkbox">
                <Column selectionMode="multiple" headerStyle={{ width: '3em' }} frozen></Column>
                <Column className='font-bold' field="id" header="id" sortable style={{ minWidth: '2rem', color: 'black' }} frozen ></Column>
                <Column field="logoImage" header={renderColumnHeader('Λογότυπο', 'logoImage')}  body={imageBodyTemplate} frozen={frozenColumns.includes('logoImage')}></Column>
                <Column header={renderColumnHeader('Πελάτης', 'name')} filterField="name" className="font-bold" 
                showFilterMatchModes={false} frozen={frozenColumns.includes('name')}
                  filterMenuStyle={{ width: '14rem' }} style={{ minWidth: '14rem', color: "black" }}
                    body={customerBodyTemplate} 
                    filter filterElement={customerFilterTemplate} />  
              
                <Column field="afm" header="ΑΦΜ"  filter filterPlaceholder="Search by afm"  style={{ minWidth: '12rem' }}></Column>
                <Column field="doy" header="Δ.Ο.Υ."  filter filterPlaceholder="Search by doy"  style={{ minWidth: '12rem' }}></Column>
                <Column field="epagelma" header="Επάγγελμα"  filter filterPlaceholder="Search by epagelma"  style={{ minWidth: '12rem' }}></Column>
                <Column field="phone"  header="Τηλέφωνο"  filter filterPlaceholder="Search by phone" style={{ minWidth: '12rem' }}></Column>
                <Column field="email" header="email"  filter filterPlaceholder="Search by email"  style={{ minWidth: '12rem' }}></Column>
                <Column field="address"  header="Διεύθυνση"  filter filterPlaceholder="Search by address" style={{ minWidth: '12rem' }}></Column>
                <Column field="postal_code" header="Ταχυδρομικός κωδικός"  filter filterPlaceholder="Search by postal_code"  style={{ minWidth: '12rem' }}></Column>
                <Column field="website" header="Ιστοσελίδα"  filter filterPlaceholder="Search by website" body={websiteBodyTemplate} style={{ minWidth: '12rem' }}></Column>
                <Column field="social-media" header="Social"  body={socialBodyTemplate} style={{ minWidth: '12rem' }} ></Column>
                
                


                <Column header="Ενέργειες" field="id" body={ActionsBodyTemplate}  alignFrozen="right" frozen headerStyle={{backgroundImage: 'linear-gradient(to right, #1400B9, #00B4D8)', color: '#ffffff' }}  />

 </DataTable>

 <Dialog  visible={dialogVisible} onHide={() => setDialogVisible(false)} modal style={{ width: '50vw' }} maximizable breakpoints={{ '960px': '80vw', '480px': '100vw' }}>
            {selectedCustomerId && (selectedType=='Edit') && (
            <FormEditCustomer id={selectedCustomerId} onHide={() => setDialogVisible(false)} />
            )}
             {selectedCustomerId && (selectedType=='Profile') && (
            <FormProfileCustomer id={selectedCustomerId} onHide={() => setDialogVisible(false)} />
            )}
        </Dialog>
    </div>
  )

}

export default CustomerList
