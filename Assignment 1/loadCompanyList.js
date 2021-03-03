document.addEventListener("DOMContentLoaded", function () {
    
    let companyURL = 'https://www.randyconnolly.com/funwebdev/3rd/api/stocks/companies.php';
    
    const listContainer = document.querySelector('#companyList');
    
    let companyList = retrieveStorage();
    
    fill(companyList);
    
    /* FUNCTIONS FOR STORAGE FROM LAB4 EX11*/
    
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
    
    
    function fill(companies) {
        for(let company of companies) {
            let listElement = document.createElement('li');
            listElement.textContent = company.name
            listContainer.appendChild(listElement);
        }
    }
    
    // speak button 
    document.querySelector('#speak').
        addEventListener('click', (e) => {
            e.preventDefault();
            let message = document.querySelector('textarea').value;         
            let utterance = new SpeechSynthesisUtterance(message); 
            window.speechSynthesis.speak(utterance);
        });

    //credits in header (supposed to show our names and stuff and then fade away after 4 seconds
    document.querySelector('#logo').
    addEventListener('mouseover', (e) => {
    document.getElementById("tooltiptext").innerHTML = 'Jacob Gill, Justin Gajer. COMP 3512, Google Maps';
    setTimeout(function(){
    document.getElementById("tooltiptext").innerHTML = '';
}, 3000);
});
    
    //Map API
    // Initialize and add the map
    function initMap() {
    
    const location = { lat: 41.89474, lng: 12.4839 }
  
    const map = new google.maps.Map(document.getElementById("map"), {
      center: location,
    });
    
    // Add marker on location
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      
    });
    // cant figure out how to add the map into the div
    document.getElementById('map').appendChild(map);
  }
});
