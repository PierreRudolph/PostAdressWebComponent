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
        //this.shadowRoot.getElementById('zip-code-input').onkeydown = () => this.preventArrowKeyDefault(this.shadowRoot.event);
        //this.shadowRoot.getElementById('zip-code-input').onfocusout = () => this.autoFillCity(), this.clearTable('zip-code-suggestions', 'zip-code-table');

        this.shadowRoot.getElementById('city-input').onkeyup = () => this.autoCompleteCity();
        this.shadowRoot.getElementById('city-input').onfocusout = () => { this.clearTable('city-suggestions', 'city-table') };

        this.shadowRoot.getElementById('street-input').onkeyup = () => this.autoCompleteStreet();
        //this.shadowRoot.getElementById('street-input').onfocusout = () => { this.autoFillCity(); this.clearTable('street-suggestions', 'street-table') };

        //this.shadowRoot.getElementById('number-input').onkeydown = () => this.preventArrowKeyDefault(this.shadowRoot.event);
        //this.shadowRoot.getElementById('number-input').onfocusout = () => this.inputsIntoCityJSON();

        //this.shadowRoot.getElementById('land-input').onfocusout = () => this.prefillLand();

        this.shadowRoot.getElementById('show-mes-btn').onclick = () => this.showMessageBox();
        this.prefillLand();
    }

    async getPostAdress(data) {
        let preparedData = this.prepareJSON(data);
        try {
            let noCorsUrl = 'https://cors-anywhere.herokuapp.com/https://www.postdirekt.de/plzserver/PlzAjaxServlet';
            let normalUrl = 'https://www.postdirekt.de/plzserver/PlzAjaxServlet'
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
        let zipSuggDiv = this.getHTMLElement('zip-code-suggestions')
        this.findaCity.city = zipCodeInput.value;
        let response = await this.getPostAdress(this.findaCity);
        console.log(response)
        if (response.rows) {
            console.log(response.rows[0]);
            this.foundCityIntoCityJSON(response.rows[0]);
            if (response.rows.length > 5) {
                response.rows.length = 5;
            }
            zipSuggDiv.innerHTML = '';
            this.zipSuggArray = [];
            for (let i = 0; i < response.rows.length; i++) {
                const foundCity = response.rows[i];
                if (!this.zipSuggArray.includes(foundCity.plz)) {
                    this.zipSuggArray.push(foundCity.plz)
                }
            }
            this.removeDNone('zip-code-table');
            this.zipSuggArray.forEach(zipCode => {
                zipSuggDiv.innerHTML += /*html*/`<td class="suggestion-td" onclick="this.getRootNode().host.setInputValue(${zipCode},'zip-code-input')">${zipCode}</td>`;
            });
        }

        if (zipCodeInput.value.length == 0) {
            this.zipSuggArray = [];
            zipSuggDiv.innerHTML = '';
            this.addDNone('zip-code-table');
        }
    }


    async autoCompleteCity() {
        let cityInput = this.getHTMLElement('city-input');
        let citySuggTable = this.getHTMLElement('city-suggestions');
        this.findaZipCode.plz_city = cityInput.value;
        let response = await this.getPostAdress(this.findaZipCode);
        if (response.rows) {
            this.foundCityIntoCityJSON(response.rows[0])
            console.log(response.rows[0])
            if (response.rows.length > 5) {
                response.rows.length = 5;
            }
            citySuggTable.innerHTML = '';
            this.citySuggArray = [];
            for (let i = 0; i < response.rows.length; i++) {
                const foundCity = response.rows[i];
                if (!this.citySuggArray.includes(foundCity.city)) {
                    this.citySuggArray.push(foundCity.city)
                }
            }
            this.removeDNone('city-table');
            this.citySuggArray.forEach(city => {
                let cityToString = "'" + city + "'";
                citySuggTable.innerHTML += /*html*/`<td class="suggestion-td" onclick="this.getRootNode().host.setInputValue(${cityToString},'city-input')">${city}</td>`;
            });
        }
        if (cityInput.value.length == 0) {
            this.citySuggArray = [];
            citySuggTable.innerHTML = '';
            this.addDNone('city-table');
        }
    }


    async autoCompleteStreet() {
        let streetInput = this.getHTMLElement('street-input');
        let streetSuggTable = this.getHTMLElement('street-suggestions');
        this.findaZipCode.plz_city = this.cityJSON.city;
        this.findaZipCode.plz_plz = this.cityJSON.plz;
        this.findaZipCode.plz_street = streetInput.value;

        let response = await this.getPostAdress(this.findaZipCode);

        if (response.rows) {
            this.foundCityIntoCityJSON(response.rows[0])
            if (response.rows.length > 5) {
                response.rows.length = 5;
            }
            streetSuggTable.innerHTML = '';
            this.streetSuggArray = [];
            for (let i = 0; i < response.rows.length; i++) {
                const foundCity = response.rows[i];

                if (!this.streetSuggArray.includes(foundCity.street)) {

                    this.streetSuggArray.push(foundCity.street)
                }
            }
            this.removeDNone('street-table');
            this.streetSuggArray.forEach(city => {
                let streetToString = "'" + city + "'";
                streetSuggTable.innerHTML += /*html*/`<td class="suggestion-td" onclick="this.getRootNode().host.setInputValue(${streetToString},'street-input')">${city}</td>`;
            });
        }
        if (streetInput.value.length == 0) {
            this.streetSuggArray = [];
            streetSuggTable.innerHTML = '';
            this.addDNone('street-table');
        }
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
        ;
        let cityInput = this.getHTMLElement('city-input');
        let zipCode = this.getHTMLElement('zip-code-input');
        if (this.cityJSON.city) {
            cityInput.value = this.cityJSON.city;
        }
        if (zipCode.value.length == 0) {
            cityInput.value = '';
        }
    }


    /**
     * Funktioniert nicht weil große Städte mehr als eine Postleitzahl haben.
     */
    // autoFillZipCode() {
    //     let cityInput = this.getHTMLElement('city-input')
    //     let zipCode = this.getHTMLElement('zip-code-input');
    //     if (this.cityJSON.plz) {
    //         console.log(this.cityJSON.plz)
    //         zipCode.value = this.cityJSON.plz;
    //     }
    //     if (cityInput.value.length == 0) {
    //         zipCode.value = '';
    //     }
    // }


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