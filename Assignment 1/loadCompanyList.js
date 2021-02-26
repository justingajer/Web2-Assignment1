document.addEventListener("DOMContentLoaded", function () {
    
    let companyURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
    
    const listContainer = document.querySelector('#companyList');
    
    let companyList = retrieveStorage();
    
    fill(companyList);
    
    
    console.log(companyList[0]);
    
    
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
        console.log(infoList);
        elementArray.push(createTextElement(company.symbol));
        elementArray.push(createTextElement(company.name));
        elementArray.push(createTextElement(company.sector));
        elementArray.push(createTextElement(company.subindustry));
        elementArray.push(createTextElement(company.address));
        elementArray.push(createTextElement(company.exchange));
        elementArray.push(createTextElement(company.description));
        
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
            
            //Grab info box and clear it so we don't constantly fill it
            const infoBox = document.querySelector('#infoInternal');
            infoBox.innerHTML = "";
            
            //Creating and inserting image element
            const logo = document.createElement("img");
            logo.setAttribute('src', './logos/' + foundCompany.symbol + '.svg');
            infoBox.appendChild(logo);
            
            informationFill(foundCompany);
            
        }
    });
});