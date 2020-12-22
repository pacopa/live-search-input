const template     = document.createElement('template');
template.innerHTML = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat&display=swap');

* {
    font-family: Monserrat,sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
}

div {
    width: 460px;
}

input {
    width: 100%;
    height: 48px;
    padding-left: 16px;
    padding-right: 15px;
    line-height: 22px;
    color: #9B9B9B;
    border: 1px solid #D2D2D2;
    box-sizing: border-box;
    border-radius: 4px;
    background: #FFFFFF url("img/search.png") no-repeat 98% 50%;
}

input.hover {
    background: #FAFAFA url("img/search.png") no-repeat 98% 50%;
    border: 1px solid #9B9B9B;
}

input.focus {
    color: #9B9B9B;
    background: #FFFFFF url("img/search-orange.png") no-repeat 98% 50%;
    border: 1px solid #FF7300;
    box-shadow: 0 0 8px rgba(255, 115, 0, 0.2);
    outline: none;
}

input.loading {
    color: #9B9B9B;
    background: #FFFFFF url("img/loader.png") no-repeat 98% 50%;
    border: 1px solid #FF7300;
    box-shadow: 0 0 8px rgba(255, 115, 0, 0.2);
    outline: none;
}

ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

li:first-child {
    background: #FAFAFA;
}

li {
    background: #FFFFFF;
    border: 1px solid #D2D2D2;
    box-sizing: border-box;
    border-radius: 4px;
    padding: 11px 15px 9px 16px;
    cursor: pointer;
}

.bold {
    font-weight: bold;
}
</style>
`;

class HabitissimoLiveSearchInput extends HTMLElement {

    constructor() {
        super();

        this.uuid       = `hlsi-${Date.now()}`;
        this.dataSource = 'https://datos.gob.es/apidata/nti/territory/Province?_sort=label&_pageSize=100';

        this.ul = document.createElement('ul');
        this.ul.setAttribute('id', `${this.uuid}-result-list`);

        this.input = document.createElement('input');
        this.input.setAttribute('id', this.uuid);
        this.input.setAttribute('placeholder', 'Qué provincia estás buscando...');
        this.input.addEventListener('keyup', event => {
            this.cleanProvincesList();
            this.input.classList.remove('loading');

            const value = this.input.value.trim();
            if (value.length >= 3) {
                fetch(this.dataSource)
                    .then(response => response.json())
                    .then(data => {
                        data.result.items.forEach(element => {
                            let label           = element.label;
                            const valuePosition = label.toLocaleLowerCase().indexOf(value.toLocaleLowerCase());
                            if (valuePosition !== -1) {
                                const li = document.createElement('li');
                                li.setAttribute('real-text', label);
                                li.appendChild(document.createTextNode(label));
                                this.ul.appendChild(li);
                                const changedValue = label.substr(valuePosition, value.length)
                                li.innerHTML       = label.replace(new RegExp(changedValue, 'gi'), `<span class="bold">${changedValue}</span>`);
                                li.addEventListener('click', event => {
                                    this.input.value = li.getAttribute('real-text');
                                    this.input.classList.remove('focus', 'hover');
                                    this.input.classList.add('loading');
                                    this.cleanProvincesList();
                                });
                            }
                        });
                    });
            }
        });
        this.input.addEventListener('mouseover', event => {
            this.input.classList.add('hover');
        });
        this.input.addEventListener('mouseout', event => {
            this.input.classList.remove('hover');
        });
        this.input.addEventListener('focus', event => {
            this.input.classList.remove('hover');
            this.input.classList.add('focus');
        });
        this.input.addEventListener('blur', event => {
            this.input.classList.remove('focus', 'hover');
        });

        this.div = document.createElement('div');
        this.div.appendChild(this.input);
        this.div.appendChild(this.ul);

        const shadow = this.attachShadow({mode: "open"});
        shadow.appendChild(this.div);
    }

    cleanProvincesList() {
        while (this.ul.firstChild) {
            this.ul.removeChild(this.ul.lastChild);
        }
    }

    connectedCallback() {
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}

// https://datos.gob.es/apidata/catalog/spatial?_pageSize=10&_page=0
// https://datos.gob.es/apidata/nti/territory/Province?_sort=label&_pageSize=10&_page=0
window.customElements.define('habitissimo-live-search-input', HabitissimoLiveSearchInput);