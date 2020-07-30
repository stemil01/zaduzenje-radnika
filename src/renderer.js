function createTable(data, tableID) {
    let table = document.getElementById(tableID);

    // creating table header
    let thead = table.createTHead();
    let headerData = Object.keys(data[0]);
    headerHTML = '<tr>';
    headerHTML += '<th></th>';
    for (let key of headerData) {
        headerHTML += `<th>${key}</th>`;
    }
    headerHTML += '</tr>';
    thead.innerHTML = headerHTML;
    table.appendChild(thead);

    // create table body
    let tbody = table.createTBody();
    for (let obj of data) {
        let row = tbody.insertRow();
        let rowData = Object.values(obj);
        let rowHTML = '';
        for (let value of rowData) {
            rowHTML += `<td>${value}</td>`;
        }
        rowHTML += '<button type="button" class="rowMenu">X</button>';
        row.innerHTML = rowHTML;
        tbody.appendChild(row);
    }
}
