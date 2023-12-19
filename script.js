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
        console.log(response);
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
        console.log(response.rows[0])
        actualCity = response.rows[0];
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
        zipSuggArray.forEach(zipCode => {
            zipSuggDiv.innerHTML += /*html*/`<td class="suggestion-td" onclick="setInputValue(${zipCode},'zip-code-input')">${zipCode}</td>`;
        });
    }
    if (zipCodeInput.value.length == 0) {
        zipSuggArray = [];
        zipSuggDiv.innerHTML = '';
    }
}
async function autoCompleteCity() {
    let cityInput = getHTMLElement('city-input');
    let citySuggTable = getHTMLElement('city-suggestions');
    findaZipCode.plz_city = cityInput.value;
    let response = await getPostAdress(findaZipCode);
    console.log(response)
    if (response.rows) {
        console.log(response.rows[0])
        actualCity = response.rows[0];
        if (response.rows.length > 5) {
            response.rows.length = 5;
        }
        citySuggTable.innerHTML = '';
        citySuggArray = [];
        for (let i = 0; i < response.rows.length; i++) {
            const foundCity = response.rows[i];
            console.log(citySuggArray, 'gefundeneStadt=', foundCity)
            if (!citySuggArray.includes(foundCity.city)) {
                console.log(foundCity.city)
                citySuggArray.push(foundCity.city)
            }
        }
        citySuggArray.forEach(city => {
            cityToString = "'" + city + "'";
            citySuggTable.innerHTML += /*html*/`<td class="suggestion-td" onclick="setInputValue(${cityToString},'city-input')">${city}</td>`;
        });
    }
    if (cityInput.value.length == 0) {
        citySuggArray = [];
        citySuggTable.innerHTML = '';
    }
}

async function autoCompleteStreet() {
    let streetInput = getHTMLElement('street-input');
    let streetSuggTable = getHTMLElement('street-suggestions');
    findaZipCode.plz_city = actualCity.city;
    findaZipCode.plz_plz = actualCity.plz;
    findaZipCode.plz_street = streetInput.value;

    let response = await getPostAdress(findaZipCode);
    console.log(response);

    if (response.rows) {
        console.log('response rows 0=', response.rows[0])
        //actualCity = response.rows[0];
        if (response.rows.length > 5) {
            response.rows.length = 5;
        }

        console.log('response rows beschnitten =', response.rows)
        streetSuggTable.innerHTML = '';
        streetSuggArray = [];
        for (let i = 0; i < response.rows.length; i++) {
            const foundCity = response.rows[i];
            console.log('response.rows', i, '=', response.rows[i])
            console.log(citySuggArray, 'gefundeneStadt=', foundCity)
            if (!streetSuggArray.includes(foundCity.street)) {
                console.log(foundCity.street)
                streetSuggArray.push(foundCity.street)
            }
        }
        streetSuggArray.forEach(city => {
            streetToString = "'" + city + "'";
            streetSuggTable.innerHTML += /*html*/`<td class="suggestion-td" onclick="setInputValue(${streetToString},'street-input')">${city}</td>`;
        });
    }
    if (streetInput.value.length == 0) {
        streetSuggArray = [];
        streetSuggTable.innerHTML = '';
    }
}

function setInputValue(value, id) {
    let input = getHTMLElement(id);
    input.focus({ focusVisible: true });
    input.value = value;
}

function autoFillCity() {
    let cityInput = getHTMLElement('city-input');
    let zipCode = getHTMLElement('zip-code-input');
    console.log(zipCode.value.length, findaCity.city, actualCity)
    if (actualCity) {
        cityInput.value = actualCity.city;
        console.log(zipCode.value.length)
    }
    if (zipCode.value.length == 0) {
        console.log('call clear input', zipCode.value.length)
        cityInput.value = '';
    }
}

// function autoFillZipCode() {
//     let cityInput = getHTMLElement('city-input')
//     let zipCode = getHTMLElement('zip-code-input');
//     if (actualCity) {
//         zipCode.value = actualCity.plz;
//         console.log(cityInput.value.length)
//     }
//     if (cityInput.value.length == 0) {
//         zipCode.value = '';
//     }
// }

function clearTable(tableId) {
    let suggTable = getHTMLElement(tableId);
    setTimeout(() => {
        suggTable.innerHTML = '';
    }, 200);
}

function getHTMLElement(id) {
    let inputEl = document.getElementById(`${id}`);
    return inputEl;
}

function preventArrowKeyDefault(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
    }
};