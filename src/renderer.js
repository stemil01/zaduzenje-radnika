function createTable(tableID, data, buttons) {
    let table = document.getElementById(tableID);
    table.innerHTML = '';

    if (data.length > 0) {
        // creating table header
        let thead = table.createTHead();
        let headerData = Object.keys(data[0]);
        headerHTML = '<tr>';
        let pk = true;
        for (let key of headerData) {
            if (pk) {
                headerHTML += `<th style="display: none;">${key}</th>`;
                pk = false;
            } else {
                headerHTML += `<th class="headerCell">${key}</th>`;
            }
        }
        headerHTML += '<th></th><th></th>';
        headerHTML += '</tr>';
        thead.innerHTML = headerHTML;
        table.appendChild(thead);

        // create table body
        let tbody = table.createTBody();
        for (let obj of data) {
            let row = tbody.insertRow();
            let rowData = Object.entries(obj);
            let rowHTML = '';
            let pk = true;
            for (let [key, value] of rowData) {
                if (pk) {
                    rowHTML += `<td class="value" style="display: none;">${value}</td>`;
                    pk = false;
                } else if (key.indexOf('Datum') > -1) {
                    let formatDatum = value.substr(8, 2) + '.' + value.substr(5, 2) + '.' + value.substr(0, 4) + '.';
                    rowHTML += `<td class="value">${formatDatum}</td>`;
                } else {
                    rowHTML += `<td class="value">${value}</td>`;
                }
            }
            if (buttons) {
                rowHTML += '<td><button type="button" class="deleteRow">X</button></td>';
                rowHTML += '<td><button type="button" class="editRow">E</button></td>';
            }
            row.innerHTML = rowHTML;
            tbody.appendChild(row);
        }
    }
}

function debounce(fn, delay) {
    let timeout;
    return function(...args) {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

function filterTable(data, attribute, desc, key, searchBy) {
    if (data.length > 0) {
        let filteredData = [];
        for (obj of data) {
            if (obj[searchBy].toString().toLowerCase().indexOf(key.toLowerCase()) > -1) {
                filteredData.push(obj);
            }
        }

        if (filteredData.length > 0) {
            filteredData.sort((x, y) => {
                let _x = x[attribute], _y = y[attribute];
                if (typeof filteredData[0][attribute] == 'string') {
                    _x = _x.toLowerCase();
                    _y = _y.toLowerCase();
                }

                if (_x < _y) return desc ? 1 : -1;
                if (_x > _y) return desc ? -1 : 1;
                return 0;
            });
        }
        return filteredData;
    }
    return;
}

function searchTable(data, key, searchBy) {
    if (data.length > 0) {
        let filteredData = [];
        for (obj of data) {
            if (obj[searchBy].toString().toLowerCase().indexOf(key.toLowerCase()) > -1) {
                filteredData.push(obj);
            }
        }
        return filteredData;
    }
    return;
}
