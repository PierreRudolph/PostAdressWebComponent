let findaZipCode = {
    plz_city: 'horgau',
    plz_plz: '',
    plz_city_clear: '',
    plz_district: '',
    finda: 'plz',
    plz_street: '',
    lang: 'de_DE'
}

let findaCity = {
    finda: 'city',
    city: '',
    lang: 'de_DE'
}

let zipSuggArray = [];
let citySuggArray = [];
let streetSuggArray = [];
let actualCity;
let cityJSON = {
    city: '',
    plz: '',
    street: '',
    number: '',
    land: 'de'
}


async function getPostAdress(data) {
    let preparedData = prepareJSON(data);
    try {
        noCorsUrl = 'https://cors-anywhere.herokuapp.com/https://www.postdirekt.de/plzserver/PlzAjaxServlet';
        normalUrl = 'https://www.postdirekt.de/plzserver/PlzAjaxServlet'
        let response = await fetch(normalUrl, {
            method: 'POST',
            cache: 'no-cache',

            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: preparedData,

        })
        return response = await response.json();

    } catch (error) {
        console.log(error);
    }
}


function prepareJSON(data) {
    dataToString = JSON.stringify(data);
    preparedData = dataToString.replaceAll('"', '');
    preparedData = preparedData.replaceAll(':', '=');
    preparedData = preparedData.replaceAll(',', '&');
    preparedData = preparedData.replace('{', '');
    preparedData = preparedData.replace('}', '');
    return preparedData;
}


async function autoCompleteZipCode() {
    let zipCodeInput = getHTMLElement('zip-code-input');
    let zipSuggDiv = getHTMLElement('zip-code-suggestions')
    findaCity.city = zipCodeInput.value;
    let response = await getPostAdress(findaCity);

    if (response.rows) {
        console.log(response.rows[0]);
        foundCityIntoCityJSON(response.rows[0]);
        if (response.rows.length > 5) {
            response.rows.length = 5;
        }
        zipSuggDiv.innerHTML = '';
        zipSuggArray = [];
        for (let i = 0; i < response.rows.length; i++) {
            const foundCity = response.rows[i];
            if (!zipSuggArray.includes(foundCity.plz)) {
                zipSuggArray.push(foundCity.plz)
            }
        }
        removeDNone('zip-code-table');
        zipSuggArray.forEach(zipCode => {
            zipSuggDiv.innerHTML += /*html*/`<td class="suggestion-td" onclick="setInputValue(${zipCode},'zip-code-input')">${zipCode}</td>`;
        });
    }

    if (zipCodeInput.value.length == 0) {
        zipSuggArray = [];
        zipSuggDiv.innerHTML = '';
        addDNone('zip-code-table');
    }
}


async function autoCompleteCity() {
    let cityInput = getHTMLElement('city-input');
    let citySuggTable = getHTMLElement('city-suggestions');
    findaZipCode.plz_city = cityInput.value;
    let response = await getPostAdress(findaZipCode);
    if (response.rows) {
        foundCityIntoCityJSON(response.rows[0])
        console.log(response.rows[0])
        if (response.rows.length > 5) {
            response.rows.length = 5;
        }
        citySuggTable.innerHTML = '';
        citySuggArray = [];
        for (let i = 0; i < response.rows.length; i++) {
            const foundCity = response.rows[i];
            if (!citySuggArray.includes(foundCity.city)) {
                citySuggArray.push(foundCity.city)
            }
        }
        removeDNone('city-table');
        citySuggArray.forEach(city => {
            cityToString = "'" + city + "'";
            citySuggTable.innerHTML += /*html*/`<td class="suggestion-td" onclick="setInputValue(${cityToString},'city-input')">${city}</td>`;
        });
    }
    if (cityInput.value.length == 0) {
        citySuggArray = [];
        citySuggTable.innerHTML = '';
        addDNone('city-table');
    }
}


async function autoCompleteStreet() {
    let streetInput = getHTMLElement('street-input');
    let streetSuggTable = getHTMLElement('street-suggestions');
    findaZipCode.plz_city = cityJSON.city;
    findaZipCode.plz_plz = cityJSON.plz;
    findaZipCode.plz_street = streetInput.value;

    let response = await getPostAdress(findaZipCode);

    if (response.rows) {
        foundCityIntoCityJSON(response.rows[0])
        if (response.rows.length > 5) {
            response.rows.length = 5;
        }
        streetSuggTable.innerHTML = '';
        streetSuggArray = [];
        for (let i = 0; i < response.rows.length; i++) {
            const foundCity = response.rows[i];

            if (!streetSuggArray.includes(foundCity.street)) {

                streetSuggArray.push(foundCity.street)
            }
        }
        removeDNone('street-table');
        streetSuggArray.forEach(city => {
            streetToString = "'" + city + "'";
            streetSuggTable.innerHTML += /*html*/`<td class="suggestions-td" onclick="setInputValue(${streetToString},'street-input')">${city}</td>`;
        });
    }
    if (streetInput.value.length == 0) {
        streetSuggArray = [];
        streetSuggTable.innerHTML = '';
        addDNone('street-table');
    }
}


function setInputValue(value, id) {
    let input = getHTMLElement(id);
    input.focus({ focusVisible: true });
    input.value = value;
    inputsIntoCityJSON();
}


function foundCityIntoCityJSON(foundCity) {
    cityJSON.city = foundCity.city;
    cityJSON.plz = foundCity.plz;
    cityJSON.street = foundCity.street;
}


function inputsIntoCityJSON() {
    let cityInput = getHTMLElement('city-input');
    let zipCode = getHTMLElement('zip-code-input');
    let streetInput = getHTMLElement('street-input');
    let numberInput = getHTMLElement('number-input');
    cityJSON.city = cityInput.value;
    cityJSON.plz = zipCode.value;
    cityJSON.street = streetInput.value;
    cityJSON.number = numberInput.value;

}


function autoFillCity() {
    let cityInput = getHTMLElement('city-input');
    let zipCode = getHTMLElement('zip-code-input');
    if (cityJSON.city) {
        cityInput.value = cityJSON.city;
    }
    if (zipCode.value.length == 0) {
        cityInput.value = '';
    }
}


/**
 * Funktioniert nicht weil große Städte mehr als eine Postleitzahl haben.
 */
// function autoFillZipCode() {
//     let cityInput = getHTMLElement('city-input')
//     let zipCode = getHTMLElement('zip-code-input');
//     if (cityJSON.plz) {
//         console.log(cityJSON.plz)
//         zipCode.value = cityJSON.plz;
//     }
//     if (cityInput.value.length == 0) {
//         zipCode.value = '';
//     }
// }


function prefillLand() {
    let landInput = getHTMLElement('land-input');
    landInput.value = 'Deutschland';
}


function clearTable(tableBodyId, tableId) {
    let tableBody = getHTMLElement(tableBodyId);
    setTimeout(() => {
        addDNone(tableId);
        tableBody.innerHTML = '';
    }, 200);
}


function showMessageBox() {
    let mesBox = getHTMLElement('message-box');
    let jsonToText = JSON.stringify(cityJSON)
    mesBox.innerHTML = /*html*/`{
    <tr><td>city:</td><td>${cityJSON.city}</td></tr>
    <tr><td>plz:</td><td>${cityJSON.plz}</td></tr>
    <tr><td>street:</td><td>${cityJSON.street}</td></tr>
    <tr><td>number:</td><td>${cityJSON.number}</td></tr>
    <tr><td>land:</td><td>${cityJSON.land}</td></tr>
}`;
}


function getHTMLElement(id) {
    let inputEl = document.getElementById(`${id}`);
    return inputEl;
}


function addDNone(id) {
    let HTMLElement = getHTMLElement(id);
    HTMLElement.classList.add('d-none');
}


function removeDNone(id) {
    let HTMLElement = getHTMLElement(id);
    HTMLElement.classList.remove('d-none');
}


function preventArrowKeyDefault(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
    }
}