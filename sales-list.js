import { openPopup } from "./open-pop-up.js";

const sSlipDateFr = document.getElementById("slip-date-fr");
const sSlipDateTo = document.getElementById("slip-date-to");
const sItemDiv = document.getElementById("item-div");
const sDescription = document.getElementById("description");
const sItemCodeDiv = document.getElementById("item-code-div");
const salesTableBody = document.querySelector(".table2 tbody");

document.getElementById("search-btn").onclick = () => {
  setSalesList();
};

sItemDiv.onclick = () => openPopup("item-list.html", 800, 600, "");
document.getElementById("new-btn").onclick = () =>
  openPopup("sales-reg.html", 700, 300, "");

setSalesList();

function getSalesList() {
  const sItemSet = new Set(
    Array.from(sItemCodeDiv.querySelectorAll("span")).map((sItem) => {
      return sItem.textContent;
    })
  );

  const allSalesList =
    JSON.parse(window.localStorage.getItem("sales-list")) || [];

  return allSalesList.filter((sale) => {
    return (
      (!sSlipDateFr.value ||
        new Date(sSlipDateFr.value) <= new Date(sale.slipDate)) &&
      (!sSlipDateTo.value ||
        new Date(sSlipDateTo.value) >= new Date(sale.slipDate)) &&
      (sItemSet.size === 0 || sItemSet.has(sale.itemCode)) &&
      (!sDescription.value ||
        sale.description
          .toLowerCase()
          .indexOf(sDescription.value.toLowerCase()) !== -1)
    );
  });
}

function setSalesList() {
  const salesList = getSalesList();

  salesTableBody.innerHTML = "";

  salesList.forEach((sale) => {
    const row = document.createElement("tr");

    const checkboxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkboxCell.appendChild(checkbox);
    checkboxCell.classList.add("center");
    row.appendChild(checkboxCell);

    const slipDateCell = document.createElement("td");
    slipDateCell.textContent = sale.silpCode;
    row.appendChild(slipDateCell);

    const itemCodeCell = document.createElement("td");
    itemCodeCell.textContent = sale.itemCode;
    row.appendChild(itemCodeCell);

    const itemNameCell = document.createElement("td");
    itemNameCell.textContent = getItemNameByCode(sale.itemCode);
    row.appendChild(itemNameCell);

    const qtyCell = document.createElement("td");
    qtyCell.textContent = parseInt(sale.qty, 10).toLocaleString();
    row.appendChild(qtyCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = parseInt(sale.price, 10).toLocaleString();
    row.appendChild(priceCell);

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = sale.description;
    row.appendChild(descriptionCell);

    salesTableBody.appendChild(row);
  });
}

window.setSalesList = setSalesList;

function getItemNameByCode(itemCode) {
  const itemList = JSON.parse(window.localStorage.getItem("item-list")) || [];
  const item = itemList.find((item) => item.itemCode === itemCode);
  return item ? item.itemName : "";
}
