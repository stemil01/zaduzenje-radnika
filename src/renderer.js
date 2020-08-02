function createTable(tableID, data) {
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
            let rowData = Object.values(obj);
            let rowHTML = '';
            let pk = true;
            for (let value of rowData) {
                if (pk) {
                    rowHTML += `<td class="value" style="display: none;">${value}</td>`;
                    pk = false;
                } else {
                    rowHTML += `<td class="value">${value}</td>`;
                }
            }
            rowHTML += '<td><button type="button" class="deleteRow">X</button></td>';
            rowHTML += '<td><button type="button" class="editRow">E</button></td>';
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
