//test
document.addEventListener("DOMContentLoaded", function () {
    let companyURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
    let stockURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/history.php?symbol='
    
    const listContainer = document.querySelector('#companyList');
    
    let companyList = retrieveStorage();
    let stockData = [];
    let ascending = false;
    
    fill(companyList);
    
    
    
    /* ------------- FUNCTIONS FOR STORAGE FROM LAB4 EX11 ----------------- */
    
    //update storage with company list
    function updateStorage() {
        localStorage.setItem('companies', JSON.stringify(companyList));
    }
    
    //Parses local storage or fetches company data from API
    function retrieveStorage() {
        return JSON.parse(localStorage.getItem('companies')) || 
               fetch(companyURL).then( (resp) => resp.json() )
                                .then( data => localStorage.setItem('companies', JSON.stringify(data)))
                                .catch( error => console.error(error));
    }
    
    //removes collection from storage
    function removeStorage() {
        localStorage.removeItem('companies');
    }
    
    // This fills the company list from the local storage
    function fill(companies) {
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
        const elementArray = [];

        elementArray.push(createTextElement(company.symbol));
        elementArray.push(createTextElement(company.name));
        elementArray.push(createTextElement(company.sector));
        elementArray.push(createTextElement(company.subindustry));
        elementArray.push(createTextElement(company.address));
        elementArray.push(createTextElement(company.exchange));
        //parse the description to append the ID speak so it can be spoken
        let speakElement = createTextElement(company.description);
        speakElement.setAttribute('id', 'speak');
        elementArray.push(speakElement);

        
        const websiteElement = document.createElement('a');
        websiteElement.textContent = company.website
        websiteElement.setAttribute('href', company.website);
        elementArray.push(websiteElement);
        
        for(let element of elementArray) {
            infoList.appendChild(element);
        }
    }
    
    //Click event for the company list, it will find the company then fill the info box accordingly.
    document.querySelector("#companyList").addEventListener('click', function (e) { 
        if (e.target.nodeName == "LI") {
            let foundCompany = companyList.find(company => e.target.innerText == company.name);
            
            //Fetch the stock data for future use
            fetch(stockURL + foundCompany.symbol).then( (resp) => resp.json() )
                                .then( data => {
                                                fillStockData(data);
                                                stockCalc(data);
                                                //Storing the stock data for future sorting purposes
                                                stockData = [];
                                                stockData.push(... data);
                                                })
                                .catch( error => console.error(error));
            
            //Grab info box and clear it so we don't constantly fill it
            const infoBox = document.querySelector('#infoInternal');
            infoBox.innerHTML = "";
            
            //Creating and inserting image element
            const logo = document.createElement("img");
            logo.setAttribute('src', './logos/' + foundCompany.symbol + '.svg');
            infoBox.appendChild(logo);
            
            //Call function to fill in the company information
            informationFill(foundCompany);
            
            //Call function to initialize the map with company data
            initMap(foundCompany);
            
        }
    });
    // speak button 
    document.querySelector('#speak').addEventListener('click', (e) => {
            e.preventDefault();
            let message = document.querySelector('#speak').value;         
            let utterance = new SpeechSynthesisUtterance(message); 
            window.speechSynthesis.speak(utterance);
    });

    //credits in header (supposed to show our names and stuff and then fade away after 4 seconds
    document.querySelector('#logo').
        addEventListener('mouseover', (e) => {
        document.querySelector(".tooltiptext").innerHTML = 'Jacob Gill, Justin Gajer. COMP 3512, Google Maps';
        setTimeout(function(){
        document.querySelector(".tooltiptext").innerHTML = '';
        }, 3000);
    });
    
    //Map API
    // Initialize and add the map
    function initMap(company) {
        let location = {lat: company.latitude, lng: company.longitude };
        
        map = new google.maps.Map(document.querySelector("#map"), {
            center: location,
            zoom: 6
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
        
        for( let row of data) {
            let tableRow = document.createElement('tr');
            let date = document.createElement('td');
            let open = document.createElement('td');
            let close = document.createElement('td');
            let high = document.createElement('td');
            let low = document.createElement('td');
            let volume = document.createElement('td');

            
            date.textContent = row.date;
            open.textContent = parseFloat(row.open).toFixed(2);
            close.textContent = parseFloat(row.close).toFixed(2);
            high.textContent = parseFloat(row.high).toFixed(2);
            low.textContent = parseFloat(row.low).toFixed(2);
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
            cell.textContent = parseFloat(avrg).toFixed(2);
            avgRow.appendChild(cell);
        }
        
        for (let minNum of minMaxArray[0]) {
            let cell = document.createElement('td');
            cell.textContent = minNum;
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
        
        console.log(minMaxArr);
        
        return minMaxArr;
        
    }
});




