import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import Welcome from '../components/Welcome';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../features/authSlice';

import Eksoda from './Eksoda';
import axios from 'axios';
import ApexCharts from 'react-apexcharts';
import Select from 'react-select';
import { v4 as uuidv4 } from 'uuid';
import { IconContext } from "react-icons";
import { GiBubbles } from "react-icons/gi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import '../dashboard.css';
import '../kpisdashboard.css';
import { getColorClass2, getLimitAnnotation } from '../components/HelperComponent';
import apiBaseUrl from '../apiConfig';
import { ReactComponent as ProjectIcon } from '../icons/projecticon.svg'; // Import the SVG as a React component
import { ReactComponent as CustomerIcon } from '../icons/customericon.svg'; // Import the SVG as a React component
import { ReactComponent as DeliverablesIcon } from '../icons/deliverablesicon2.svg'; // Import the SVG as a React component
import { ReactComponent as InvoiceIcon } from '../icons/invoice.svg'; // Import the SVG as a React component
import {ReactComponent as InstallmentsIcon } from '../icons/installments.svg';
import {ReactComponent as EktimIcon } from '../icons/ektim.svg';
import {ReactComponent as LoanIcon } from '../icons/loand.svg';
import {ReactComponent as BudgetIcon } from '../icons/budget.svg';

import BudgetChart from '../components/paid_components/BudgetChart';
import BudgetChart2 from '../components/paid_components/BudgetChart2';

import { TabView, TabPanel } from 'primereact/tabview';

const KpisDashboard = () => {

    const[budget, setBudget] = useState(0.0);
    const[budgetDate, setBudgetDate] = useState(null);

    const [paradotea, setParadotea] = useState([]);
    const [timPar,setTimologimenPar]= useState([]);
    
    const [erga,setErga]= useState([]);
    const [customer,setCustomer] = useState([]);
    const [timologia,setTimologia] = useState([]);
    const [ektim,setEkxorimena] = useState([]);

    const [daneia,setDaneia]=useState([]);
    const [daneiareceived,setReceived]= useState([]);
    const [daneiaunreceived,setUnreceived]=useState([]);


    const [doseis,setDoseis] = useState([]);
    const [doseisTotal,setTotalDoseisAmmount] = useState([]);


    const [paidCount,setPaidTimologia]= useState([]);
    const [unpaidCount,setUnpaidTimologia]=useState([]);

    const [chartSeries2, setChartSeries2] = useState([]);
    const [chartSeries3, setChartSeries3] = useState([]);

    const [ergaLogos, setErgaLogos] = useState([]);


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

    useEffect(()=>{
      getBudget()
        getParadotea()
        getErga()
        getCustomer()
        getTimologia()
        getEkxorimenaTimologia()
        getDaneia()
        getDoseis()
        getTags()

    },[]);

    const formatCurrency = (value) => {
      return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (value) => {
    let date = new Date(value);
    let epochDate = new Date('1970-01-01T00:00:00Z');
    if (date.getTime() === epochDate.getTime()) 
    {
        return null;
    }
    if (!isNaN(date)) {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
    } else {
        return "Invalid date";
    }
};
  
//pie chart 
const [chartSeries, setChartSeries] = useState([]);

const [chartSeries_p1, setChartSeriesP1] = useState([]);


const [chartSeries4, setChartSeries4] = useState([]);

const [chartOptions4, setChartOptions4] = useState({
  chart: {
    type: 'bar',
    height: 350,
  },
  plotOptions: {
      bar: {
        barHeight: '100%',
        distributed: true,
        borderRadius: 4,
        borderRadiusApplication: 'end',
        horizontal: true,
      }
    },
  xaxis: {
    categories: [],
  },
  yaxis: {
      labels: {
      
      }
    },
  dataLabels: {
    enabled: false,
  },
  title: {
      text: 'Σύνολο Υποχρεώσεων ανα Tag',
      align: 'center',
      floating: true
  },
  tooltip: {
      y: {
    
      }
    }
});


const [chartOptions, setChartOptions] = useState({
    chart: {
      type: 'pie',
      width: 380,
      height:350,
    },
    labels: [],
    title: {
        text: 'Πλήθος Έργων ανά κατηγορία', // Title of the chart
        align: 'center', // Aligning the title to the center
        style: {
          fontFamily:'Helvetica, Arial, sans-serif',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333',
        },
      },
   
  });


  const [chartOptionsP1, setChartOptionsP1] = useState({
    chart: {
      type: 'pie',
      width: 380,
      height:350,
    },
    labels: [],
    title: {
        text: 'Πλήθος Έργων ανα Κατάσταση', // Title of the chart
        align: 'center', // Aligning the title to the center
        style: {
          fontFamily:'Helvetica, Arial, sans-serif',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#333',
        },
      },
   
  });




  // State for BarChart
  const [chartOptions2, setChartOptions2] = useState({
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
        bar: {
          barHeight: '100%',
          distributed: true,
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: false,
        }
      },
    xaxis: {
      categories: [],
    },
    yaxis: {
        labels: {
          formatter: function (value) {
            return Number(value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })+ ' €';
          }
        }
      },
    dataLabels: {
      enabled: false,
    },
    title: {
        text: 'Εσοδα ανα Εργο',
        align: 'center',
        floating: true
    },
    // tooltip: {
    //   custom: function({ series, seriesIndex, dataPointIndex, w }) {
    //     const ergaName = w.globals.labels[dataPointIndex]; // Get project name from the chart
    //     const projectAmount = series[seriesIndex][dataPointIndex]; // Get project amount
    //     const logoImage = ergaLogos; // Get the corresponding logoImage URL
    //     console.log("images ",logoImage);
    //     console.log("hellooooo")
    //     // Return custom HTML with the logo image and data
    //     return (
    //       '<div style="padding: 10px;">' +
    //       `<strong>${ergaName}</strong><br/>` +
    //       `${logoImage}`+
    //       `<img src="${logoImage}" alt="Logo" style="width: 50px; height: auto;"/><br/>` +
    //       'Ποσό: ' + projectAmount.toLocaleString('en-US', {
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2
    //       }) + ' €' +
    //       '</div>'
    //     );
    //   }
    // }
  });


  const [chartOptions3, setChartOptions3] = useState({
    chart: {
      type: 'bar',
      height: 350,
    },
    plotOptions: {
        bar: {
          barHeight: '100%',
          distributed: true,
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: false,
        }
      },
    xaxis: {
      categories: [],
      labels: {
        style: {
          fontSize: '12px', // Adjust font size
        },
        rotate: -45, // Rotate labels to avoid overlapping
        maxHeight: 70, // You can set max height to make sure the chart does not overflow
        trim: true // Trim the label text if it exceeds a certain length
      },
    },
    yaxis: {
        labels: {
          formatter: function (value) {
            return Number(value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })+ ' €';
          }
        }
      },
    dataLabels: {
      enabled: false,
    },
    title: {
        text: 'Εσοδα ανα Παραδοτέο',
        align: 'center',
        floating: true
    },
    tooltip: {
        y: {
          formatter: function (value) {
            return Number(value).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) + ' €';
          }
        }
      }
  });
  
  const getBudget = async() =>{
    try {

    const response = await axios.get(`${apiBaseUrl}/budget`, {timeout: 5000});
    const budgetData = response.data;

    

    setBudget(budgetData[0].ammount);
    setBudgetDate(budgetData[0].date);
} catch (error) {
    console.error('Error fetching data:', error);
}
}


     const getParadotea = async() =>{
        try {
        const response = await axios.get(`${apiBaseUrl}/paradotea`, {timeout: 5000});
        const paraData = response.data;
        console.log("ParaData:",paraData);
        
        const timPar = paraData.filter(item => item.timologia_id !== null).length;

        // Extract names and amounts
        const parNames = paraData.map(item => item.title);
        const parAmounts = paraData.map(item => item.ammount_total);



        console.log("Par Names:", parNames);
        console.log("Par Amounts:", parAmounts);

        // Update the chart options and series
        setChartOptions3(prevOptions => ({
            ...prevOptions,
            xaxis: {
                ...prevOptions.xaxis,
                categories: parNames
            }
        }));

        setChartSeries3([{ name: 'Ποσό', data: parAmounts }]);

        // Extract unique ids
        const uniqueIds = [...new Set(paraData.map(item => item.id))];
        
        // Get the total count of unique ids
        const uniqueIdsCount = uniqueIds.length;
        console.log("Total Count of Unique Pardotea Ids:", uniqueIdsCount);
        setParadotea(uniqueIdsCount);
        setTimologimenPar(timPar);
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle errors as needed
        }
    }


    const getErga = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/erga`, {timeout: 5000});
            const ergaData = response.data;


    // Count the number of projects for each erga_category.name
    //Pie categories
    const categoryCounts = ergaData.reduce((acc, item) => {
        const categoryName = item.erga_category ? item.erga_category.name : 'Χωρίς Κατηγορία';
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += 1; // Increment count for each project in the category
        return acc;
      }, {});

      // Prepare data for the chart
      const ergaNames2 = Object.keys(categoryCounts); // erga_category.name as labels
      const ergaCounts2 = Object.values(categoryCounts); // count of projects as data

      console.log("Erga Categories:", ergaNames2);
      console.log("Project Counts:", ergaCounts2);

      // Update the chart options and series
      setChartOptions(prevOptions => ({
        ...prevOptions,
        labels: ergaNames2
      }));

      setChartSeries(ergaCounts2);

      //Pie data for status count erga

       // Count the number of projects for each erga_category.name
    const categoryCountsStatus = ergaData.reduce((acc, item) => {
      const categoryNameStatus = item.status ? item.status : 'Χωρίς Κατάσταση';
      if (!acc[categoryNameStatus]) {
        acc[categoryNameStatus] = 0;
      }
      acc[categoryNameStatus] += 1; // Increment count for each project in the category
      return acc;
    }, {});

    // Prepare data for the chart
    const ergaNamesStatus = Object.keys(categoryCountsStatus); // erga_category.name as labels
    const ergaCountsStatus = Object.values(categoryCountsStatus); // count of projects as data

    console.log("Erga Categories:", ergaNamesStatus);
    console.log("Project Counts:", ergaCountsStatus);

    // Update the chart options and series
    setChartOptionsP1(prevOptions => ({
      ...prevOptions,
      labels: ergaNamesStatus
    }));

    setChartSeriesP1(ergaCountsStatus);
    
            // Extract names and amounts
            const ergaNames = ergaData.map(item => item.name);
            const ergaAmounts = ergaData.map(item => item.ammount_total);
            const ergaLogos = ergaData.map(item => {
              // Check if logoImage is null or undefined, if so return the standard URL, otherwise split and pop the filename
              return item.logoImage
                ? item.logoImage.split('/').pop()  // Get the filename from the valid logo URL
                : 'https://cdn1.iconfinder.com/data/icons/users-pack-mino-io/24/user-3-not-allowed-512.png';  // Standard URL for missing or null images
            });

            console.log("Erga Names:", ergaNames);
            console.log("Erga Amounts:", ergaAmounts);
            console.log("Erga Amounts:", ergaLogos);

    
            // Update the chart options and series
            setChartOptions2(prevOptions => ({
                ...prevOptions,
                xaxis: {
                    ...prevOptions.xaxis,
                    categories: ergaNames
                }
            }));
    
            setChartSeries2([{ name: 'Ποσό', data: ergaAmounts }]);
            setErgaLogos(ergaLogos); // Store the logos in a separate state
            // Set the count for unique IDs if needed
            const uniqueIds = [...new Set(ergaData.map(item => item.id))];
            const uniqueIdsCount = uniqueIds.length;
            setErga(uniqueIdsCount);
    
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const getCustomer = async() =>{
        try {

        const response = await axios.get(`${apiBaseUrl}/customer`, {timeout: 5000});
        const custData = response.data;

        const uniqueIds= [...new Set(custData.map(item => item.id))];
        const uniqueIdsCount = uniqueIds.length;

        console.log("Unique Customer names:",uniqueIdsCount);
        setCustomer(uniqueIdsCount);
    

        // Assuming you have a state setter like setErga defined somewhere
    } catch (error) {
        console.error('Error fetching data:', error);
        // Handle errors as needed
    }
    }

    const getTimologia = async() =>{
        // const response = await axios.get(`${apiBaseUrl}/timologia`, {timeout: 5000});
        // setTimologia(response.data);

        try {
            const response = await axios.get(`${apiBaseUrl}/timologia`, {timeout: 5000});
            const timData = response.data;
            const uniqueIds= [...new Set(timData.map(item => item.id))];
            const uniqueIdsCount = uniqueIds.length;


        // Count records where status_paid == 'yes'
        const paidCount = timData.filter(item => item.status_paid === 'yes').length;

        // Count records where status_paid == 'no'
        const unpaidCount = timData.filter(item => item.status_paid === 'no').length;
    
            console.log("Unique Customer names:",uniqueIdsCount);         
           
            setTimologia(uniqueIdsCount);
            setPaidTimologia(paidCount);  // Set paid invoices count
            setUnpaidTimologia(unpaidCount); // Set unpaid invoices count
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle errors as needed
        }





    }


    
    const getEkxorimenaTimologia = async() =>{
      try {

      const response = await axios.get(`${apiBaseUrl}/ek_tim`, {timeout: 5000});
      const ektimData = response.data;

      const uniqueIds= [...new Set(ektimData.map(item => item.id))];
      const uniqueIdsCount = uniqueIds.length;

      console.log("Unique ektimi names:",uniqueIdsCount);
      setEkxorimena(uniqueIdsCount);
  

      // Assuming you have a state setter like setErga defined somewhere
  } catch (error) {
      console.error('Error fetching data:', error);
      // Handle errors as needed
  }
  }

  const getDaneia = async() =>{
    try {

    const response = await axios.get(`${apiBaseUrl}/daneia`, {timeout: 5000});
    const daneiaData = response.data;

    const uniqueIds= [...new Set(daneiaData.map(item => item.id))];
    const uniqueIdsCount = uniqueIds.length;

    console.log("Unique daneiaData names:",uniqueIdsCount);

    const unreiceived=daneiaData.filter(item => item.status === 'no').length
    const reiceived=daneiaData.filter(item => item.status === 'yes').length

    setDaneia(uniqueIdsCount);
    setUnreceived(unreiceived);  // Set paid invoices count
    setReceived(reiceived); // Set unpaid invoices count

    // Assuming you have a state setter like setErga defined somewhere
} catch (error) {
    console.error('Error fetching data:', error);
    // Handle errors as needed
}
}


    const getDoseis = async() =>{
      try {
          const response = await axios.get(`${apiBaseUrl}/doseis`, {timeout: 5000});
          const doseis_data = response.data;
          const doseisCount = doseis_data.filter(item => item.status === 'no').length;
          const filteredDoseis=doseis_data.filter(item => item.status === 'no')
          const totalAmount = filteredDoseis.reduce((sum, item) => sum + Number(item.ammount || 0), 0);
          console.log("total doseis ammounbt",totalAmount)
          setDoseis(doseisCount);
          setTotalDoseisAmmount(totalAmount);
  
      } catch (error) {
          console.error('Error fetching data:', error);
          // Handle errors as needed
      }
  }


  const getTags = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/ypoquery`, {timeout: 5000});
      const tags_data = response.data;

      // Process the data to count occurrences of each tag
      const tagCounts = {};

      tags_data.forEach(item => {
        item.tags.forEach(tag => {
          if (tagCounts[tag]) {
            tagCounts[tag]++;
          } else {
            tagCounts[tag] = 1;
          }
        });
      });

      // Extract the labels (tags) and their respective counts
      const labels = Object.keys(tagCounts);
      const counts = Object.values(tagCounts);

      console.log("labels",labels)
      console.log("counts",counts)

 
      // Update the chart options and series
      setChartOptions4(prevOptions => ({
        ...prevOptions,
        labels: labels
      }));
      setChartSeries4([{ name: 'Πλήθος', data: counts }]);

      // setChartSeries4(counts);
    
      // Create the chart with the processed data
      // createChart(labels, counts);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


    
    return (
    <Layout>
        <Welcome />

        <div className="grid">
<div className="col-12 md:col-6 lg:col-3">
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
          <div className="flex justify-content-between mb-5">
              <div>
                  <h6 className="m-0 mb-1 text-500 text-gray-800">Τραπεζικά Διαθέσιμα</h6>
                  <h1 className="m-0 text-gray-800 ">{formatCurrency(budget)}</h1>
                  <small className="m-0 text-gray-800 ">Τελευταία Ενημέρωση: {formatDate(budgetDate)}</small>
              </div>
              <div className="flex align-items-center justify-content-center bg-bluegray-100" style={{ width: '5rem', height: '5rem',borderRadius:'50%' }}>
                  <BudgetIcon style={{ width: '2.5em', height: '2.5em' ,fill:'black'}}  className="" /> 
              </div>
          </div>
          
      </div>
  </div>

<div className="col-12 md:col-6 lg:col-3">
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
          <div className="flex justify-content-between mb-5">
              <div>
                  <h6 className="m-0 mb-1 text-500 text-gray-800">Σύνολο Πελατών</h6>
                  <h1 className="m-0 text-gray-800 ">{customer} </h1>
              </div>
              <div className="flex align-items-center justify-content-center bg-bluegray-100" style={{ width: '5rem', height: '5rem',borderRadius:'50%' }}>
                  <CustomerIcon style={{ width: '2.5em', height: '2.5em' ,fill:'black'}}  className="" /> 
              </div>
          </div>
          
      </div>
  </div>

  
  <div className="col-12 md:col-6 lg:col-3">
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
          <div className="flex justify-content-between mb-5">
              <div>
                  <h6 className="m-0 mb-1 text-500 text-gray-800">Σύνολο Έργων</h6>
                  <h1 className="m-0 text-gray-800 ">{erga} </h1>

              </div>
              <div className="flex align-items-center justify-content-center bg-bluegray-100" style={{ width: '5rem', height: '5rem',borderRadius:'50%' }}>
                  <ProjectIcon style={{ width: '2.5em', height: '2.5em' ,fill:'black'}}  className="" /> 
              </div>
          </div>
          
      </div>
  </div>

  <div className="col-12 md:col-6 lg:col-3">
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
          <div className="flex justify-content-between mb-5">
              <div>
                  <h6 className="m-0 mb-1 text-500 text-gray-800">Σύνολο Παραδοτέων</h6>
                  <h1 className="m-0 text-gray-800 ">{paradotea} </h1>
                  <h6 className="m-0 mb-1 text-500 text-green-600">Εχουν τιμολογηθεί:{timPar}</h6>

              </div>
              <div className="flex align-items-center justify-content-center bg-bluegray-100" style={{ width: '5rem', height: '5rem',borderRadius:'50%' }}>
                  <DeliverablesIcon style={{ width: '6.5em', height: '6.5em' ,fill:'black'}}  className="" /> 
              </div>
          </div>
          
      </div>
  </div>

  <div className="col-12 md:col-6 lg:col-3">
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
          <div className="flex justify-content-between mb-5">
              <div>
                  <h6 className="m-0 mb-1 text-500 text-gray-800">Σύνολο Τιμολογίων</h6>
                  <h1 className="m-0 text-gray-800 ">{timologia} </h1>
                  <h6 className="m-0 mb-1 text-500 text-green-600">Πληρωμένα:{paidCount}</h6>
                  <h6 className="m-0 mb-1 text-500 text-red-600">Απλήρωτα:{unpaidCount}</h6>

              </div>
              <div className="flex align-items-center justify-content-center bg-bluegray-100" style={{ width: '5rem', height: '5rem',borderRadius:'50%' }}>
                  <InvoiceIcon style={{ width: '6.5em', height: '6.5em' ,fill:'black'}}  className="" /> 
              </div>
          </div>
          
      </div>
  </div>

  <div className="col-12 md:col-6 lg:col-3">
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
          <div className="flex justify-content-between mb-5">
              <div>
                  <h6 className="m-0 mb-1 text-500 text-gray-800">Δοσεις που Εκκρεμούν</h6>
                  <h1 className="m-0 text-red-600">{doseis} </h1>
                  <h6 className="m-0 text-red-600">Συννολικό Ποσό Οφειλής: {formatCurrency(doseisTotal)} </h6>

               

              </div>
              <div className="flex align-items-center justify-content-center bg-bluegray-100" style={{ width: '5rem', height: '5rem',borderRadius:'50%' }}>
                  <InstallmentsIcon style={{ width: '6.5em', height: '6.5em' ,fill:'black'}}  className="" /> 

              </div>
          </div>
          
      </div>
  </div>


  <div className="col-12 md:col-6 lg:col-3">
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
          <div className="flex justify-content-between mb-5">
              <div>
                  <h6 className="m-0 mb-1 text-500 text-gray-800">Σύνολο Εκχωρημένων Τιμολογίων</h6>
                  <h1 className="m-0 text-gray-800 ">{ektim} </h1>
    

              </div>
              <div className="flex align-items-center justify-content-center bg-bluegray-100" style={{ width: '5rem', height: '5rem',borderRadius:'50%' }}>
                  <EktimIcon style={{ width: '6.5em', height: '6.5em' ,fill:'black'}}  className="" /> 
              </div>
          </div>
          
      </div>
  </div>

  <div className="col-12 md:col-6 lg:col-3">
      <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round">
          <div className="flex justify-content-between mb-5">
              <div>
                  <h6 className="m-0 mb-1 text-500 text-gray-800">Σύνολο Δανείων</h6>
                  <h1 className="m-0 text-gray-800 ">{daneia} </h1>
                  <h6 className="m-0 mb-1 text-500 text-green-600">Εχουν παραληφθεί:{daneiareceived}</h6>
                  <h6 className="m-0 mb-1 text-500 text-red-600">Δεν εχουν παραληφθεί:{daneiaunreceived}</h6>
    

              </div>
              <div className="flex align-items-center justify-content-center bg-bluegray-100" style={{ width: '5rem', height: '5rem',borderRadius:'50%' }}>
                  <LoanIcon style={{ width: '6.5em', height: '6.5em' ,fill:'black'}}  className="" /> 
              </div>
          </div>
          
      </div>
  </div>


<div className="col-12 xl:col-6 lg:col-3">
<div className="card">
  <ApexCharts options={chartOptions2} series={chartSeries2} type='bar' height={350} />
  </div>
  </div>
  <div className="col-12 xl:col-6 lg:col-3">
<div className="card">
  <ApexCharts options={chartOptions3} series={chartSeries3} type='bar' height={350} />
  </div>
  </div>
  <div className="col-12 xl:col-6 lg:col-3">
<div className="card">
  <TabView>
  <TabPanel header="Προβολή 1">
    <BudgetChart/>
  </TabPanel>
  <TabPanel header = "Προβολή 2">
    <BudgetChart2></BudgetChart2>
  </TabPanel>
  </TabView>
  </div>
  </div>

  <div className="col-12 xl:col-6 lg:col-3">
<div className="card">
<ApexCharts
            options={chartOptions} 
            series={chartSeries} 
            type="pie" 
            height={350} 
      />  </div>
  </div>

  <div className="col-12 xl:col-6 lg:col-3">
<div className="card">
<ApexCharts
            options={chartOptions4} 
            series={chartSeries4} 
            type="bar" 
            height={350} 
      />  </div>
  </div>

  <div className="col-12 xl:col-6 lg:col-3">
<div className="card">
<ApexCharts
            options={chartOptionsP1} 
            series={chartSeries_p1} 
            type="pie" 
            height={350} 
      />  </div>
  </div>

</div>
    </Layout>
  );
  
};

export default KpisDashboard;
