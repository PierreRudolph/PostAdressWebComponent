const adressFormTemplate = document.createElement('template');
adressFormTemplate.innerHTML =/*html*/`

<link rel="stylesheet" href="adress-component/adress-comp.css">

<div class="d-flex flex-column align-center pad-top50 gap-60">
        <div class="adress-formular gap-10 d-flex flex-column">
            <span class="fw-6 fs-15">Adresse</span>
            <div class="d-flex gap-60">
                <div class="input-div align-center d-flex" style="padding-left: 31px;">
                    <span class="fw-5">PLZ</span>
                    <input class="number-input" id="zip-code-input" type="number" placeholder="Postleitzahl"
                    onkeydown="this.getRootNode().host.preventArrowKeyDefault(event)"
                    onfocusout="this.getRootNode().host.autoFillCity();this.getRootNode().host.clearTable('zip-code-suggestions','zip-code-table')">
                    <table id="zip-code-table" class="tables d-none">
                        <tbody id="zip-code-suggestions">
                        </tbody>
                    </table>
                </div>
                <div class="input-div align-center d-flex width-100-per" style="padding-left:11 ;">
                    <span class="fw-5">Stadt</span>
                    <input class="width-100-per" id="city-input" placeholder="Stadt"
                    onfocusout="this.getRootNode().host.clearTable('city-suggestions','city-table')">
                    <table id="city-table" class="tables d-none">
                        <tbody id="city-suggestions">
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="d-flex gap-60">
                <div class="input-div align-center d-flex width-100-per" style="padding-left: 11px;">
                    <span class="fw-5">Straße</span>
                    <input class="width-100-per" id="street-input" placeholder="Straße"
                    onfocusout="this.getRootNode().host.clearTable('street-suggestions','street-table')" placeholder="Straße">
                    <table id="street-table" class="tables d-none">
                        <tbody id="street-suggestions">
                        </tbody>
                    </table>
                </div>
                <div class="input-div align-center  d-flex">
                    <span class="fw-5">Hausnummer</span>
                    <input type="number" class="number-input" id="number-input" placeholder="Hausnummer"
                    onkeydown="this.getRootNode().host.preventArrowKeyDefault(event)"
                    onfocusout="this.getRootNode().host.inputsIntoCityJSON()">
                </div>
            </div>
            <div class="input-div align-center d-flex d-flex" style="padding-left: 21px;">
                <span class="fw-5">Land</span>
                <input id="land-input" class="width-100-per"  placeholder="Land"
                onfocusout="this.getRootNode().host.prefillLand()">
            </div>
            <button id="show-mes-btn" class="button" >Info</button>
        </div>
        <div class="message-box d-none" id="mes-box-div">
            <table>
                <tbody id="message-box">
                </tbody>
            </table>
        </div>
    </div>
`;

class PostAdressForm extends HTMLElement {
    zipSuggArray = [];
    citySuggArray = [];
    streetSuggArray = [];

    findaZipCode = {
        plz_city: 'horgau',
        plz_plz: '',
        plz_city_clear: '',
        plz_district: '',
        finda: 'plz',
        plz_street: '',
        lang: 'de_DE'
    };

    findaCity = {
        finda: 'city',
        city: '',
        lang: 'de_DE'
    };

    cityJSON = {
        city: '',
        plz: '',
        street: '',
        number: '',
        land: 'de'
    };

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.appendChild(adressFormTemplate.content.cloneNode(true));
        this.shadowRoot.getElementById('zip-code-input').onkeyup = () => this.autoCompleteZipCode();
        this.shadowRoot.getElementById('city-input').onkeyup = () => this.autoCompleteCity();
        this.shadowRoot.getElementById('street-input').onkeyup = () => this.autoCompleteStreet();
        this.shadowRoot.getElementById('show-mes-btn').onclick = () => this.showMessageBox();
        this.prefillLand();
    }

    async getPostAdress(data) {
        let noCorsUrl = 'https://cors-anywhere.herokuapp.com/https://www.postdirekt.de/plzserver/PlzAjaxServlet';
        let normalUrl = 'https://www.postdirekt.de/plzserver/PlzAjaxServlet'
        try {
            let response = await fetch(normalUrl, this.getResponseContent(data))
            return response = await response.json();
        } catch (error) {
            console.log(error);
        }
    }

    getResponseContent(data) {
        let preparedData = this.prepareJSON(data);
        let responseContent;
        return responseContent = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: preparedData,
        };
    }

    prepareJSON(data) {
        let dataToString = JSON.stringify(data);
        let preparedData = dataToString.replaceAll('"', '');
        preparedData = preparedData.replaceAll(':', '=');
        preparedData = preparedData.replaceAll(',', '&');
        preparedData = preparedData.replace('{', '');
        preparedData = preparedData.replace('}', '');
        return preparedData;
    }


    async autoCompleteZipCode() {
        let zipCodeInput = this.getHTMLElement('zip-code-input');
        let zipTableBody = this.getHTMLElement('zip-code-suggestions')
        this.findaCity.city = zipCodeInput.value;
        let response = await this.getPostAdress(this.findaCity);
        if (response.rows) {
            this.foundCityIntoCityJSON(response.rows[0]);
            response.rows.length = this.setResponseRowsLength5(response);
            zipTableBody.innerHTML = '';
            this.zipSuggArray = [];
            this.createSuggestionsArray(response, this.zipSuggArray, 'zip-code')
            this.removeDNone('zip-code-table');
            this.tableInnerHTMl(this.zipSuggArray, zipTableBody, "'zip-code-input'");
        }
        this.clearZipSuggIfInputEmpty(zipCodeInput, zipTableBody);
    }



    clearZipSuggIfInputEmpty(zipCodeInput, zipTableBody) {
        if (zipCodeInput.value.length == 0) {
            this.zipSuggArray = [];
            zipTableBody.innerHTML = '';
            this.addDNone('zip-code-table');
        }
    }


    async autoCompleteCity() {
        let cityInput = this.getHTMLElement('city-input');
        let cityTableBody = this.getHTMLElement('city-suggestions');
        this.findaZipCode.plz_city = cityInput.value;
        let response = await this.getPostAdress(this.findaZipCode);
        if (response.rows) {
            this.foundCityIntoCityJSON(response.rows[0])
            console.log(response.rows[0])
            response.rows.length = this.setResponseRowsLength5(response);
            cityTableBody.innerHTML = '';
            this.citySuggArray = [];
            this.createSuggestionsArray(response, this.citySuggArray, 'city')
            this.removeDNone('city-table');
            this.tableInnerHTMl(this.citySuggArray, cityTableBody, "'city-input'");
        }
        this.clearCitySuggIfInputEmpty(cityInput, cityTableBody);
    }


    clearCitySuggIfInputEmpty(cityInput, cityTableBody) {
        if (cityInput.value.length == 0) {
            this.citySuggArray = [];
            cityTableBody.innerHTML = '';
            this.addDNone('city-table');
        }
    }


    async autoCompleteStreet() {
        let streetInput = this.getHTMLElement('street-input');
        let streetTableBody = this.getHTMLElement('street-suggestions');
        this.findaZipCode.plz_city = this.cityJSON.city;
        this.findaZipCode.plz_plz = this.cityJSON.plz;
        this.findaZipCode.plz_street = streetInput.value;
        let response = await this.getPostAdress(this.findaZipCode);
        if (response.rows) {
            this.foundCityIntoCityJSON(response.rows[0])
            response.rows.length = this.setResponseRowsLength5(response);
            streetTableBody.innerHTML = '';
            this.streetSuggArray = [];
            this.createSuggestionsArray(response, this.streetSuggArray, 'street')
            this.removeDNone('street-table');
            this.tableInnerHTMl(this.streetSuggArray, streetTableBody, "'street-input'");
        }
        this.clearStreetSuggIfInputEmpty(streetInput, streetTableBody);
    }


    clearStreetSuggIfInputEmpty(streetInput, streetTableBody) {
        if (streetInput.value.length == 0) {
            this.streetSuggArray = [];
            streetTableBody.innerHTML = '';
            this.addDNone('street-table');
        }
    }


    setResponseRowsLength5(response) {
        if (response.rows.length > 5) {
            return response.rows.length = 5;
        } else {
            return response.rows.length;
        }
    }


    createSuggestionsArray(response, array, value) {
        let arrayElement;
        for (let i = 0; i < response.rows.length; i++) {
            const foundCity = response.rows[i];
            arrayElement = this.getArrayElement(value, foundCity)
            if (!array.includes(arrayElement)) {
                array.push(arrayElement)
            }
        }
    }


    getArrayElement(value, foundCity) {
        let arrayElement;
        if (value == 'zip-code') {
            arrayElement = foundCity.plz;
        }
        if (value == 'city') {
            arrayElement = foundCity.city;
        }
        if (value == 'street') {
            arrayElement = foundCity.street;
        }
        return arrayElement;
    }


    tableInnerHTMl(array, tableBody, inputId) {
        array.forEach(element => {
            let elementToString = "'" + element + "'";
            tableBody.innerHTML += /*html*/`<td class="suggestion-td" onclick="this.getRootNode().host.setInputValue(${elementToString},${inputId})">${element}</td>`;
        });
    }



    setInputValue(value, id) {
        let input = this.getHTMLElement(id);
        input.focus({ focusVisible: true });
        input.value = value;
        this.inputsIntoCityJSON();
    }


    foundCityIntoCityJSON(foundCity) {
        this.cityJSON.city = foundCity.city;
        this.cityJSON.plz = foundCity.plz;
        this.cityJSON.street = foundCity.street;
    }


    inputsIntoCityJSON() {
        let cityInput = this.getHTMLElement('city-input');
        let zipCode = this.getHTMLElement('zip-code-input');
        let streetInput = this.getHTMLElement('street-input');
        let numberInput = this.getHTMLElement('number-input');
        this.cityJSON.city = cityInput.value;
        this.cityJSON.plz = zipCode.value;
        this.cityJSON.street = streetInput.value;
        this.cityJSON.number = numberInput.value;
        console.log(this.cityJSON)
    }


    autoFillCity() {
        let cityInput = this.getHTMLElement('city-input');
        let zipCode = this.getHTMLElement('zip-code-input');
        if (this.cityJSON.city) {
            cityInput.value = this.cityJSON.city;
        }
        if (zipCode.value.length == 0) {
            cityInput.value = '';
        }
    }


    prefillLand() {
        let landInput = this.getHTMLElement('land-input');
        landInput.value = 'Deutschland';
    }


    clearTable(tableBodyId, tableId) {
        let tableBody = this.getHTMLElement(tableBodyId);
        setTimeout(() => {
            this.addDNone(tableId);
            tableBody.innerHTML = '';
        }, 200);
    }


    showMessageBox() {
        this.removeDNone('mes-box-div');
        let mesBox = this.getHTMLElement('message-box');
        mesBox.innerHTML = /*html*/`{
        <tr><td>city:</td><td>${this.cityJSON.city}</td></tr>
        <tr><td>plz:</td><td>${this.cityJSON.plz}</td></tr>
        <tr><td>street:</td><td>${this.cityJSON.street}</td></tr>
        <tr><td>number:</td><td>${this.cityJSON.number}</td></tr>
        <tr><td>land:</td><td>${this.cityJSON.land}</td></tr>
    }`;
    }


    getHTMLElement(id) {
        let inputEl = this.shadowRoot.getElementById(`${id}`);
        return inputEl;
    }


    addDNone(id) {
        let HTMLElement = this.getHTMLElement(id);
        HTMLElement.classList.add('d-none');
    }


    removeDNone(id) {
        let HTMLElement = this.getHTMLElement(id);
        HTMLElement.classList.remove('d-none');
    }


    preventArrowKeyDefault(e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
        }
    }
}

customElements.define('post-adress-form', PostAdressForm);