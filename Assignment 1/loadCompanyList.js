document.addEventListener("DOMContentLoaded", function () {
    let companyURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
    let stockURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol='
    
    const listContainer = document.querySelector('#companyList');
    let companyList = [];
    
    //Turn on the loading animation
    document.querySelector("#companyLoader").classList.toggle('hide');
    
    companyList = retrieveStorage();
    let stockData = [];
    let ascending = false;
    
    if(companyList) {
        fillCompanyList(companyList);
        document.querySelector("#companyLoader").classList.toggle('hide');
    }
    else {
        companyList = [];
        fetchCompanyList();
    }
        
    
    /* ------------- FUNCTIONS FOR STORAGE FROM LAB4 EX11 ----------------- */
    
    //update storage with company list
    function updateStorage() {
        localStorage.setItem('companies', JSON.stringify(companyList));
    }
    
    //Parses local storage for company list
    function retrieveStorage() {
        return JSON.parse(localStorage.getItem('companies'));
    }
    
    //If company list must be fetched this will grab it, set local storage, set global variable and populate list.
    function fetchCompanyList() {
        fetch(companyURL).then( (resp) => resp.json() )
                         .then( data => {
                                         localStorage.setItem('companies', JSON.stringify(data));
                                         companyList.push(... data);
                                         fillCompanyList(data);
                                         document.querySelector("#companyLoader").classList.toggle('hide');
                                        })
                         .catch( error => console.error(error));
    }
    
    //removes collection from storage
    function removeStorage() {
        localStorage.removeItem('companies');
    }
    
    // This fills the company list from the passed company list
    function fillCompanyList(companies) {
        document.querySelector('#companyList').innerHTML = '';
        for(let company of companies) {
            let listElement = document.createElement('li');
            listElement.textContent = company.name
            listContainer.appendChild(listElement);
        }
    }
    
    /*---------------------- COMPANY INFO SCRIPTS ----------------*/
    
    //This creates a p element and makes the text content equal the parameter. It saves me like 15 lines.
    function createTextElement(text) {
        let textEl = document.createElement('p');
        textEl.textContent = text;
        return textEl;
    }
    
    
    //This creates an array of text elements to fill the company info box with.
    function informationFill(company) {
        const infoList = document.querySelector('#infoInternal');
        const companyInformation = [
                                company.symbol, company.name, company.sector, company.subindustry, company.address, company.exchange, company.description
                             ];
        const elementArray = [];

        elementArray.push(createTextElement("Symbol: "));
        elementArray.push(createTextElement("Name: "));
        elementArray.push(createTextElement("Sector: "));
        elementArray.push(createTextElement("Sub-industry: "));
        elementArray.push(createTextElement("Address: "));
        elementArray.push(createTextElement("Exchange: "));
        elementArray.push(createTextElement("Description: "));
        
        for(let i = 0; i < elementArray.length; i++) {
            elementArray[i].textContent += companyInformation[i]
        }
        
        const websiteElement = document.createElement('a');
        const webTextElement = document.createElement('p');
        websiteElement.textContent = 'Company Website';
        websiteElement.setAttribute('href', company.website);
        elementArray.push(websiteElement);
        
        for(let element of elementArray) {
            infoList.appendChild(element);
        }
    }
    
    //This fills out the company info for the chart view
    function chartInformationFill(company) {
        const secondInfoList = document.querySelector("#chartInfo>div");
        secondInfoList.innerHTML = '';
        const elementArray = [];
        
        //parse the description to append the ID speak so it can be spoken
        let speakElement = createTextElement("Description: ");
        speakElement.setAttribute('id', 'toSpeak');
        speakElement.textContent += company.description;
        
        //Assigning a value so we can use it later
        let nameElement = createTextElement("Name: ");
        nameElement.setAttribute('id', 'companyName');
        nameElement.textContent += company.name;
        
        let symbolElement = createTextElement("Symbol: ");
        symbolElement.textContent += company.symbol;
        
        elementArray.push(nameElement);
        elementArray.push(symbolElement);
        elementArray.push(speakElement);
        
        for(let element of elementArray) {
            secondInfoList.appendChild(element);
        }
        
    }
    
    /*----- FINANCE TABLE FILL -------*/
    
    //Fills out finance table of chart view
    function financeFill(company) {
        const financeTable = document.querySelector("#financeTable");
        financeTable.innerHTML = `<tr>
                                    <th id="financeYearHeader">Year</th>
                                    <th>2017</th>
                                    <th>2018</th>
                                    <th>2019</th>
                                  </tr>
                                  <tr class="financeRows"><td class="financeDescriptor">Assets</td></tr>
                                  <tr class="financeRows"><td class="financeDescriptor">Earnings</td></tr>
                                  <tr class="financeRows"><td class="financeDescriptor">Liabilities</td></tr>
                                  <tr class="financeRows"><td class="financeDescriptor">Revenue</td></tr>`
        
        
        const rows = document.querySelectorAll(".financeRows");
        const financeArray = [];
        
        //Saving all the financial data
        financeArray.push(company.financials.assets);
        financeArray.push(company.financials.earnings);
        financeArray.push(company.financials.liabilities);
        financeArray.push(company.financials.revenue);
        
        //Use two loops, one runs through the rows in the table, the other goes backwards through the financials (finances are stored newest first so this is faster than reversing all the arrays)
        for ( let i = 0; i < rows.length; i++ ) {
            
            for ( let j = financeArray[i].length-1; j > -1; j--) {
                
                const cell = document.createElement('td');
                cell.textContent = currency(parseInt(financeArray[i][j]));
                rows[i].appendChild(cell);
                
            }
        }
        
    }
    
    
    /*--------- COMPANY LIST SCRIPTS -----------*/
    
    //Click event for the company list, it will find the company then fill the info box accordingly.
    document.querySelector("#companyList").addEventListener('click', function (e) { 
        if (e.target.nodeName == "LI") {
            let foundCompany = companyList.find(company => e.target.innerText == company.name);
            

            

            document.querySelector('#stockLoader').classList.toggle('hide');
            //Fetch the stock data for future use
            fetch(stockURL + foundCompany.symbol).then( (resp) => resp.json() )
                                .then( data => {
                                                if (data.length > 0) {
                                                    //Storing the stock data for future sorting purposes
                                                    stockData = [];
                                                    stockData.push(... data);
                                                    fillStockData(data);
                                                    stockCalc(data);
                                                }
                                                else {
                                                    noStockData();
                                                    stockData = [];
                                                }
                
                                                document.querySelector('#stockLoader').classList.toggle('hide');
                                                })
                                .catch( error => console.error(error));
            
            //Grab info box and clear it so we don't constantly fill it
            const infoBox = document.querySelector('#infoInternal');
            infoBox.innerHTML = "";
            
            //Creating and inserting image element
            const logo = document.createElement("img");
            logo.setAttribute('src', './logos/' + foundCompany.symbol + '.svg');
            infoBox.appendChild(logo);
            
            //Call functions to fill in the company information sections
            informationFill(foundCompany);
            chartInformationFill(foundCompany);
            
            //Call function to initialize the map with company data
            initMap(foundCompany);
            
            //Call function to fill finance data
            if (foundCompany.financials) {
                financeFill(foundCompany);
            }
            
        }
    });
    
    //Event for filter box
    document.querySelector("#filterBox").addEventListener('change', function (e) {
        let filterString = document.querySelector('#filterBox').value.toUpperCase();
        
        let companyMatches = [];
        companyMatches = filterCompanies(filterString);
        
        fillCompanyList(companyMatches);
    });
    
    //Event for clear button that resets the company list back to normal
    document.querySelector('#clearButton').addEventListener('click', () => {
        //Clear company list
        document.querySelector('#companyList').innerHTML = '';
        
        //Refill with company data
        fillCompanyList(companyList);
        
        document.querySelector('#filterBox').value = '';
    });
    
    //Filters companies based on key provided, returns an array
    function filterCompanies(key) {
        return companyList.filter(company => company.symbol.match(key));
    }
    
    /*------------ MISC SCRIPTS (SPEAK BUTTON/MOUSEOVER EVENT)----------------*/
    // Speak button 
    document.querySelector('#speak').addEventListener('click', (e) => {
        let message = document.querySelector("#toSpeak").textContent.substring(12,);
        const utterance = new SpeechSynthesisUtterance(message); 
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    });

    //credits in header (supposed to show our names and stuff and then fade away after 4 seconds
    document.querySelector('#credits').addEventListener('mouseover', () => {
        
        document.querySelector("#tooltiptext").innerHTML = 'Jacob Gill, Justin Gajer. COMP 3512. Google Map API, Apache Charts. COMP 3512. <br>';
        
        document.querySelector("#css-used").innerHTML = 'CSS Used: Water.css (watercss.netlify.app), Csswand.dev';
        
        document.querySelector("#credits").innerHTML = '';
        
        setTimeout(function(){
            document.querySelector("#tooltiptext").innerHTML = '';
            document.querySelector("#credits").innerHTML = 'Credits';
            document.querySelector("#css-used").innerHTML = '';
        }, 5000);
    });
    
    /*--------------- MAP API FUNCTION ----------------------------*/
    // Initialize and add the map
    function initMap(company) {
        let location = {lat: company.latitude, lng: company.longitude };
        
        map = new google.maps.Map(document.querySelector("#map"), {
            center: location,
            zoom: 12
        });

        // Add marker on location
        const marker = new google.maps.Marker({
            position: location,
            map: map,  
        });
    }
    
    /*------------------- STOCK DATA FUNCTIONS ----------------------*/
    
    //Fill out the stock table from the api
    function fillStockData(data) {
        const table = document.querySelector('#stockTable');
        table.innerHTML = `<tr id="tableHeader">
                            <th>Date</th>
                            <th>Open</th>
                            <th>High</th>
                            <th>Low</th>
                            <th>Close</th>
                            <th>Volume</th>
                          </tr>`; 
        
        if(!document.querySelector('#stockMissingMessage').classList.contains('hide'))
            document.querySelector('#stockMissingMessage').classList.toggle('hide');
        
        for( let row of data) {
            let tableRow = document.createElement('tr');
            let date = document.createElement('td');
            let open = document.createElement('td');
            let close = document.createElement('td');
            let high = document.createElement('td');
            let low = document.createElement('td');
            let volume = document.createElement('td');

            
            date.textContent = row.date;
            open.textContent = currency(parseFloat(row.open).toFixed(2));
            close.textContent = currency(parseFloat(row.close).toFixed(2));
            high.textContent = currency(parseFloat(row.high).toFixed(2));
            low.textContent = currency(parseFloat(row.low).toFixed(2));
            volume.textContent = row.volume;
            
            tableRow.appendChild(date);
            tableRow.appendChild(open);
            tableRow.appendChild(high);
            tableRow.appendChild(low);
            tableRow.appendChild(close);
            tableRow.appendChild(volume);
            
            table.appendChild(tableRow);
        }
    }
    
    //If no stock data is found we run this to clear charts and provide a message.
    function noStockData() {
        document.querySelector("#stockMissingMessage").classList.toggle('hide');
        document.querySelector("#stockTable").innerHTML = "<tr id='tableHeader'></tr>"
        document.querySelector("#charts").innerHTML = `<h1>Charts:</h1>
                                                       <div class='chart' id="barChart"></div>
                                                       <div class='chart' id="candleChart"></div>
                                                       <div class='chart' id="lineChart"></div>`;
    }
    
    //This checks to see what the user clicked then sorts the current stock data array accordingly
    document.querySelector('#stockTable').addEventListener('click', function (e) { 
        if( e.target.nodeName == 'TH' ) {
            let sortProperty = e.target.innerText.toLowerCase();       
            
            if ( sortProperty == 'open') {
                if(!ascending) {
                    stockData.sort((a, b) => (parseFloat(a.open) > parseFloat(b.open)) ? 1 : -1 );
                    ascending = true;
                }
                else {
                    stockData.sort((a, b) => (parseFloat(a.open) > parseFloat(b.open)) ? 1 : -1 );
                    stockData.reverse();
                    ascending = false;
                }
                
            }
            else if ( sortProperty == 'high') {
                if(!ascending) {
                    stockData.sort((a, b) => (parseFloat(a.high) > parseFloat(b.high)) ? 1 : -1 );
                    ascending = true;
                }
                else {
                    stockData.sort((a, b) => (parseFloat(a.high) > parseFloat(b.high)) ? 1 : -1 );
                    stockData.reverse();
                    ascending = false;
                }
                
            }
            else if ( sortProperty == 'low') {
                if(!ascending) {
                    stockData.sort((a, b) => (parseFloat(a.low) > parseFloat(b.low)) ? 1 : -1 );
                    ascending = true;
                }
                else {
                    stockData.sort((a, b) => (parseFloat(a.low) > parseFloat(b.low)) ? 1 : -1 );
                    stockData.reverse();
                    ascending = false;
                }
                
            }
            else if ( sortProperty == 'close') {
                if(!ascending) {
                    stockData.sort((a, b) => (parseFloat(a.close) > parseFloat(b.close)) ? 1 : -1 );
                    ascending = true;
                }
                else {
                    stockData.sort((a, b) => (parseFloat(a.close) > parseFloat(b.close)) ? 1 : -1 );
                    stockData.reverse();
                    ascending = false;
                }
                
            }
            else if ( sortProperty == 'volume') {
                if(!ascending) {
                    stockData.sort((a, b) => (parseInt(a.volume) > parseInt(b.volume)) ? 1 : -1 );
                    ascending = true;
                }
                else {
                    stockData.sort((a, b) => (parseInt(a.volume) > parseInt(b.volume)) ? 1 : -1 );
                    stockData.reverse();
                    ascending = false;
                }
                
            }
            else if ( sortProperty == 'date' ) {
                if(!ascending) {
                    stockData.sort((a, b) => (a.date > b.date) ? 1 : -1 );
                    ascending = true;
                }
                else {
                    stockData.sort((a, b) => (a.date > b.date) ? 1 : -1 );
                    stockData.reverse();
                    ascending = false;
                }
            }
            
            fillStockData(stockData);
        }
    
        
    });
    
    //This calls for calculations and fills the min/max/average table
    function stockCalc(data) {
        const avgRow = document.querySelector("#averageCalc");
        const minRow = document.querySelector("#minCalc");
        const maxRow = document.querySelector("#maxCalc");
        
        const avgArray = calcAverage(data);
        const minMaxArray = calcMinMax(data);
        
        avgRow.innerHTML = '<td>Average</td>';
        minRow.innerHTML = '<td>Minimum</td>';
        maxRow.innerHTML = '<td>Maximum</td>';
        
        for (let avrg of avgArray ) {
            let cell = document.createElement('td');
            cell.textContent = currency(parseFloat(avrg).toFixed(2));
            avgRow.appendChild(cell);
        }
        
        for (let minNum of minMaxArray[0]) {
            let cell = document.createElement('td');
            cell.textContent = currency(minNum);
            minRow.appendChild(cell);
        }
        
        for (let maxNum of minMaxArray[1]) {
            let cell = document.createElement('td');
            cell.textContent = maxNum;
            maxRow.appendChild(cell);
        }
        
        
    }
    
    //Takes stock data and calculates the average of each property. Returns an object with each average per property
    function calcAverage(data) {
        let openSum = 0;
        let highSum = 0;
        let lowSum = 0;
        let closeSum = 0;
        let volSum = 0;
        
        for ( let day of data ) {
            openSum += parseFloat(day.open);
            highSum += parseFloat(day.high);
            lowSum += parseFloat(day.low);
            closeSum += parseFloat(day.close);
            volSum += parseInt(day.volume);
        }
        
        return [ (openSum / data.length),
                 (highSum / data.length),
                 (lowSum / data.length),
                 (closeSum / data.length),
                 (volSum / data.length),
              ];
    }
    
    //Takes stock data and finds the minimum and maximum of each property. Returns an object with each value
    function calcMinMax(data) {
        const minArr = [];
        const maxArr = [];
        const minMaxArr = [];
        
        // ---------- OPEN --------
        data.sort((a, b) => (parseFloat(a.open) > parseFloat(b.open)) ? 1 : -1 );
        minArr.push(parseFloat(data[0].open).toFixed(2));
        
        data.reverse();
        maxArr.push(parseFloat(data[0].open).toFixed(2));
        
        // ------- HIGH ---------
        data.sort((a, b) => (parseFloat(a.high) > parseFloat(b.high)) ? 1 : -1 );
        minArr.push(parseFloat(data[0].high).toFixed(2));
        
        data.reverse();
        maxArr.push(parseFloat(data[0].high).toFixed(2));
        
        // ----------- LOW -----------
        data.sort((a, b) => (parseFloat(a.low) > parseFloat(b.low)) ? 1 : -1 );
        minArr.push(parseFloat(data[0].low).toFixed(2));
        
        data.reverse();
        maxArr.push(parseFloat(data[0].low).toFixed(2));
        
        // -------- CLOSE -------
        data.sort((a, b) => (parseFloat(a.close) > parseFloat(b.close)) ? 1 : -1 );
        minArr.push(parseFloat(data[0].close).toFixed(2));
        
        data.reverse();
        maxArr.push(parseFloat(data[0].close).toFixed(2));
        
        // ------------ VOLUME ----------
        data.sort((a, b) => (parseInt(a.volume) > parseInt(b.volume)) ? 1 : -1 );
        minArr.push(parseInt(data[0].volume));
        
        data.sort((a, b) => (parseInt(a.volume) > parseInt(b.volume)) ? 1 : -1 );
        data.reverse();
        maxArr.push(parseInt(data[0].volume));
        
        minMaxArr.push(minArr);
        minMaxArr.push(maxArr);
        
        return minMaxArr;
        
    }
    
    /*----------- VIEW CHARTS AND WHATNOT ------------*/
    //Function that selects both containers individually and their elements and hides / unhides them.
    document.querySelectorAll('.viewButton').forEach(item => {
            item.addEventListener('click', (e) => {
                
                const firstContainer = document.querySelectorAll(".grid-container > div");
                const secondContainer = document.querySelectorAll(".grid-container-two > div");

                document.querySelector(".grid-container").classList.toggle("hide");
                document.querySelector(".grid-container-two").classList.toggle("hide");

                for (let anElement of firstContainer) {
                    anElement.classList.toggle('hide');
                }

                for (let secElement of secondContainer) {
                    secElement.classList.toggle('hide');
                }
                
                //If closing the view, remove current charts.
                if ( e.target.innerText.toLowerCase() == 'close') {
                    const charts = document.querySelector('#charts');
                    charts.innerHTML = `<h1>Charts:</h1>
            
                                        <div class='chart' id="barChart"></div>
                                        <div class='chart' id="candleChart"></div>
                                        <div class='chart' id="lineChart"></div>`
                    
                    if(document.querySelector("#financeTable"))
                        document.querySelector("#financeTable").innerHTML = '';
                    
                }
                else {
                    //Check to see if they picked a company, if they do send it off to be made into charts
                    if (document.querySelector('#companyName')) {
                        let companyToChart = companyList.find(company => document.querySelector('#companyName').textContent.substring(6,) == company.name);
                        
                        if(stockData.length > 0)
                            initCharts(companyToChart);
                    }
                }
                
        })
    });

    

    /*--------- CHART STUFF ----------*/
    // Takes in a company and preps charts to be made
    function initCharts(company) {
        if (company.financials) {
            initBarChart(company.financials);
        
            initCandleChart();

            initLineChart();
            
            document.querySelector("#finance").innerHTML = `<h2>Financial breakdown</h2>
            
                                                            <table id="financeTable"></table>`;
            
            financeFill(company);
        }
        else {
            const charts = document.querySelector('#charts');
                    charts.innerHTML = `<h1>Charts:</h1>
            
                                        <div class='chart' id="candleChart"></div>
                                        <div class='chart' id="lineChart"></div>`;
            
            document.querySelector("#finance").innerHTML = '<h3>No financial data found for this company.</h3>';
            
            initCandleChart();

            initLineChart();
        }
    }
    
    //Bar chart creation, takes in a finance object and creates based on that
    function initBarChart(finances) {
        let myChart = echarts.init(document.querySelector('#barChart'), 'dark');

        let labelOption = {
            show: true,
            position: 'insideBottom',
            distance: 15,
            align: 'left',
            verticalAlign: 'middle',
            rotate: 90,
            formatter: '{c}  {name|{a}}',
            fontSize: 16,
            rich: {
                name: {
                }
            }
        };

        let option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['Assets', 'Earnings', 'Liabilities', 'Revenue']
            },
            
            xAxis: [
                {
                    type: 'category',
                    axisTick: {show: false},
                    data: ['2017', '2018', '2019']
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    name: 'Assets',
                    type: 'bar',
                    barGap: 0,
                    label: labelOption,
                    emphasis: {
                        focus: 'series'
                    },
                    data: [finances.assets[0], finances.assets[1], finances.assets[2]]
                },
                {
                    name: 'Earnings',
                    type: 'bar',
                    label: labelOption,
                    emphasis: {
                        focus: 'series'
                    },
                    data: [finances.earnings[0], finances.earnings[1], finances.earnings[2]]
                },
                {
                    name: 'Liabilities',
                    type: 'bar',
                    label: labelOption,
                    emphasis: {
                        focus: 'series'
                    },
                    data: [finances.liabilities[0], finances.liabilities[1], finances.liabilities[2]]
                },
                {
                    name: 'Revenue',
                    type: 'bar',
                    label: labelOption,
                    emphasis: {
                        focus: 'series'
                    },
                    data: [finances.revenue[0], finances.revenue[1], finances.revenue[2]]
                }
            ]
        };

        myChart.setOption(option);
        
    }
    
    
    //Creates the candlestick chart?
    function initCandleChart() {
        let myChart = echarts.init(document.querySelector('#candleChart'), 'dark');
        //Using calculation methods to grab the values needed
        const averages = calcAverage(stockData);
        const minMaxArray = calcMinMax(stockData);
        
        let option = {
            xAxis: {
                data: ['Open', 'High', 'Low', 'Close']
            },
            yAxis: {},
            series: [{
                type: 'k',
                data: [
                    [averages[0], averages[0], minMaxArray[0][0], minMaxArray[1][0]],
                    [averages[1], averages[1], minMaxArray[0][1], minMaxArray[1][1]],
                    [averages[2], averages[2], minMaxArray[0][2], minMaxArray[1][2]],
                    [averages[3], averages[3], minMaxArray[0][3], minMaxArray[1][3]]
                ]
            }]
    
        };
        
        myChart.setOption(option);
    }
    
    //Creates line chart
    function initLineChart() {
        let myChart = echarts.init(document.querySelector('#lineChart'), 'dark');
        
        //Make sure the stock data is sorted by date
        stockData.sort((a, b) => (a.date > b.date) ? 1 : -1 );
        
        const dates = [];
        const closeArray = [];
        const volumeArray = [];
        
        //Building the data sets so we can just plug them into the chart
        for(let item of stockData) {
            dates.push(item.date);
            closeArray.push(item.close);
            volumeArray.push(item.close);
        }
        
        
        let option = {
            title: {},
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['Close', 'Volume']
            },
            grid: {    
                left: '3%',     
                right: '4%',  
                bottom: '3%', 
                containLabel: true
            },
            toolbox: {
                show:true,
                feature: {
                    magicType: {show: true, type: ['stack', 'tiled']},
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'Close',
                    type: 'line',
                    stack: false,
                    data: closeArray
                },
                {
                    name: 'Volume',
                    type: 'line',
                    stack: false,
                    data: volumeArray
                }
            ]
    
        };
        
        myChart.setOption(option);
    }
    
    /*-- CURRENCY FORMATTING FUNCTION FROM LAB 2 TYK 6*/
    const currency = function(num) {
        return new Intl.NumberFormat('en-us', {style: 'currency', currency: 'USD'}).format(num);
    }
});







