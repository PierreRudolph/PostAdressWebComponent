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

async function getPostAdress(data) {
    let preparedData = prepareJSON(data);
    try {
        let response = await fetch("https://www.postdirekt.de/plzserver/PlzAjaxServlet", {
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
        zipSuggDiv.innerHTML = '';
        zipSuggArray = [];
        for (let i = 0; i < 5; i++) {
            const foundCity = response.rows[i];
            if (!zipSuggArray.includes(foundCity.plz)) {
                zipSuggArray.push(foundCity.plz)
            }

        }
        zipSuggArray.forEach(zipCode => {
            zipSuggDiv.innerHTML += /*html*/`<tr>${zipCode}</tr>`;
        });
    }
}


async function autoFillCity() {
    let cityInput = getHTMLElement('city-input')
    let zipCode = getHTMLElement('zip-code-input');
    console.log(zipCode.value.length)
    if (zipCode.value.length == 5) {
        findaCity.city = zipCode.value;
        let response = await getPostAdress(findaCity);
        let foundCity = response.rows[0].city;
        cityInput.value = foundCity;
    }
}

async function autoCompleteCity() {
    let cityInput = getHTMLElement('city-input');
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