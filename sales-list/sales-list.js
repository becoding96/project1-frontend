import { openPopup } from "../util/open-pop-up.js";

let currentPage = 1;
const itemsPerPage = 10;

const sSlipDateFr = document.getElementById("slip-date-fr");
const sSlipDateTo = document.getElementById("slip-date-to");
const sItemDiv = document.getElementById("item-div");
const sDescription = document.getElementById("description");
const sItemCodeDiv = document.getElementById("item-code-div");
const salesTableBody = document.querySelector(".table2 tbody");

document.getElementById("search-btn").onclick = () => {
  currentPage = 1;
  setSalesList();
};

sItemDiv.onclick = () => openPopup("../item-list/item-list.html", 800, 600, "");
document.getElementById("new-btn").onclick = () =>
  openPopup("../sales-reg/sales-reg.html", 700, 300, "");

const headerCheckBox = document.querySelector(
  ".table2 thead input[type='checkbox']"
);
headerCheckBox.onclick = function (event) {
  const checkboxes = document.querySelectorAll(
    ".table2 tbody input[type='checkbox']"
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = event.target.checked;
  });
};

document.getElementById("prev-btn").onclick = function () {
  headerCheckBox.checked = false;

  if (currentPage > 1) {
    currentPage--;
    setSalesList();
  }
};

document.getElementById("next-btn").onclick = function () {
  headerCheckBox.checked = false;

  const salesList = getSalesList();
  const totalPages = Math.ceil(salesList.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    setSalesList();
  }
};

document.getElementById("check-del-btn").onclick = function () {
  const selectedCheckboxes = document.querySelectorAll(
    ".table2 tbody input[type='checkbox']:checked"
  );

  if (selectedCheckboxes.length === 0) {
    alert("삭제할 항목을 선택해주세요.");
    return;
  }

  const allSalesList =
    JSON.parse(window.localStorage.getItem("sales-list")) || [];

  const updatedSalesList = allSalesList.filter((sale) => {
    return !Array.from(selectedCheckboxes).some(
      (checkbox) => checkbox.dataset.slipCode === sale.slipCode
    );
  });

  window.localStorage.setItem("sales-list", JSON.stringify(updatedSalesList));
  alert("선택된 항목이 삭제되었습니다.");

  currentPage = 1;
  headerCheckBox.checked = false;
  setSalesList();
};

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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, salesList.length);

  for (let i = startIndex; i < endIndex; i++) {
    const sale = salesList[i];

    const row = document.createElement("tr");

    const checkboxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.slipCode = sale.slipCode;
    checkboxCell.appendChild(checkbox);
    checkboxCell.classList.add("center");
    row.appendChild(checkboxCell);

    const slipCodeCell = document.createElement("td");
    const slipCode = document.createElement("a");
    slipCode.textContent = sale.slipCode;

    slipCode.onclick = () =>
      openPopup(
        "../sales-reg/sales-reg.html",
        700,
        300,
        `slip-code=${sale.slipCode}&update=true`
      );

    slipCodeCell.appendChild(slipCode);
    row.appendChild(slipCodeCell);

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
  }

  document.getElementById("prev-btn").disabled = currentPage === 1;
  document.getElementById("next-btn").disabled = endIndex >= salesList.length;
}

window.setSalesList = setSalesList;

setSalesList();

function getItemNameByCode(itemCode) {
  const itemList = JSON.parse(window.localStorage.getItem("item-list")) || [];
  const item = itemList.find((item) => item.itemCode === itemCode);
  return item ? item.itemName : "";
}
