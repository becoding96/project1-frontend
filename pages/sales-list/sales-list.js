import { openPopup } from "../../util/open-pop-up.js";
import { getItemName } from "../../util/get-item-name.js";
import { Button } from "../../components/Button.js";
import { HomeButton } from "../../components/HomeButton.js";
import { renderPaginationButtons } from "../../util/render-pagination-buttons.js";
import { handleCheckDelete } from "../../util/handle-check-delete.js";
import { printSale } from "./sale-print.js";

let cachedSalesList = [];
let selectedSales = new Map();
const itemsPerPage = 10;
let currentPage = 1;
let totalPages = 1;
let eventListenerAdded = false;

/** 조회 조건 설정 */
const sItemCodeDiv = document.getElementById("item-code-help");
const sSlipDateFr = document.getElementById("slip-date-fr");
const sSlipDateTo = document.getElementById("slip-date-to");
const sDescription = document.getElementById("description");

sItemCodeDiv.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    currentPage = 1;
    fetchAndCacheSalesList();
  }
});

sSlipDateFr.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    currentPage = 1;
    fetchAndCacheSalesList();
  }
});

sSlipDateTo.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    currentPage = 1;
    fetchAndCacheSalesList();
  }
});

sDescription.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    currentPage = 1;
    fetchAndCacheSalesList();
  }
});

/** 버튼 생성 */
const searchBtn = new Button({
  label: "검색",
  onClick: () => {
    currentPage = 1;
    fetchAndCacheSalesList();
  },
  className: "blue-btn",
  id: "search-btn",
}).render();

const firstBtn = new Button({
  label: "<<",
  onClick: () => {
    currentPage = 1;
    fetchAndCacheSalesList();
  },
  className: "page-btn",
  id: "first-btn",
}).render();

const prevBtn = new Button({
  label: "<",
  onClick: () => {
    if (currentPage > 1) {
      currentPage--;
      fetchAndCacheSalesList();
    }
  },
  className: "page-btn",
  id: "prev-btn",
}).render();

const nextBtn = new Button({
  label: ">",
  onClick: () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchAndCacheSalesList();
    }
  },
  className: "page-btn",
  id: "next-btn",
}).render();

const lastBtn = new Button({
  label: ">>",
  onClick: () => {
    currentPage = totalPages;
    fetchAndCacheSalesList();
  },
  className: "page-btn",
  id: "last-btn",
}).render();

const newBtn = new Button({
  label: "신규",
  onClick: () => openPopup("../sales-reg/sales-reg.html", 700, 300, ""),
  className: "blue-btn",
  id: "new-btn",
}).render();

const checkDelBtn = new Button({
  label: "선택삭제",
  onClick: () => {
    handleCheckDelete({
      cachedList: cachedSalesList,
      selectedDatas: selectedSales,
      storageKey: "sales-list",
      fetchFunction: fetchAndCacheSalesList,
      identifierKey: "slipCode",
    });
  },
  id: "check-del-btn",
}).render();

document.getElementById("search-btn-div").appendChild(searchBtn);
document.getElementById("next-prev-btn-div").append(prevBtn, nextBtn);
document.getElementById("func-btn-div").append(newBtn, checkDelBtn);

/** 판매 리스트 가져와서 캐싱 */
function fetchAndCacheSalesList() {
  const sItemSet = new Set(
    Array.from(sItemCodeDiv.querySelectorAll(".item-span")).map((sItem) => {
      return sItem.dataset.itemCode;
    })
  );

  const allSalesList =
    JSON.parse(window.localStorage.getItem("sales-list")) || [];

  cachedSalesList = allSalesList.filter((sale) => {
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

  totalPages = Math.ceil(cachedSalesList.length / itemsPerPage);

  renderSalesList();
}

/** 캐싱한 판매 리스트 페이지 단위로 화면에 렌더링 */
function renderSalesList() {
  const salesTableBody = document.querySelector(".table2 tbody");
  salesTableBody.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = cachedSalesList.slice(startIndex, endIndex);

  if (startIndex === endIndex) {
    currentPage--;
    renderItemList();
  }

  paginatedData.forEach((sale) => {
    const row = document.createElement("tr");

    row.dataset.slipCode = sale.slipCode;
    row.dataset.itemCode = sale.itemCode;

    const checkboxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.slipCode = sale.slipCode;
    checkbox.checked = selectedSales.has(sale.slipCode);
    checkboxCell.appendChild(checkbox);
    checkboxCell.classList.add("center");
    row.appendChild(checkboxCell);

    const slipCodeCell = document.createElement("td");
    const slipCode = document.createElement("a");
    slipCode.href = "#";
    slipCode.textContent = sale.slipCode;
    slipCodeCell.appendChild(slipCode);
    row.appendChild(slipCodeCell);

    const itemCodeCell = document.createElement("td");
    itemCodeCell.textContent = sale.itemCode;
    row.appendChild(itemCodeCell);

    const itemNameCell = document.createElement("td");
    itemNameCell.textContent = getItemName(sale.itemCode);
    row.appendChild(itemNameCell);

    const qtyCell = document.createElement("td");
    qtyCell.textContent = parseInt(sale.qty, 10).toLocaleString();
    row.appendChild(qtyCell);

    const priceCell = document.createElement("td");
    priceCell.textContent = parseInt(sale.price, 10).toLocaleString();
    row.appendChild(priceCell);

    const amountCell = document.createElement("td");
    amountCell.textContent = (
      parseInt(sale.price, 10) * parseInt(sale.qty, 10)
    ).toLocaleString();
    row.appendChild(amountCell);

    const descriptionCell = document.createElement("td");
    descriptionCell.textContent = sale.description;
    row.appendChild(descriptionCell);

    const printCell = document.createElement("td");
    const printBtn = document.createElement("button");
    printBtn.textContent = "인쇄";
    printBtn.classList.add("print");
    printBtn.onclick = () => printSale(sale);
    printCell.appendChild(printBtn);
    printCell.classList.add("center");
    row.appendChild(printCell);

    salesTableBody.appendChild(row);
  });

  if (!eventListenerAdded) {
    salesTableBody.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        const slipCode = event.target.dataset.slipCode;
        if (event.target.checked) {
          const sale = cachedSalesList.find(
            (sale) => sale.slipCode === slipCode
          );
          if (sale) {
            selectedSales.set(slipCode, sale);
          }
        } else {
          selectedSales.delete(slipCode);
        }
        updateCheckedDiv();
      }
    });

    salesTableBody.addEventListener("click", (event) => {
      if (event.target.tagName === "A") {
        event.preventDefault();
        const tr = event.target.closest("tr");
        const slipCode = tr.dataset.slipCode;

        openPopup(
          "../sales-reg/sales-reg.html",
          700,
          300,
          `slip-code=${slipCode}&update=true`
        );
      }
    });

    document.querySelector(".table2 thead input[type='checkbox']").onclick = (
      event
    ) => {
      const checkboxes = document.querySelectorAll(
        ".table2 tbody input[type='checkbox']"
      );
      checkboxes.forEach((checkbox) => {
        const slipCode = checkbox.dataset.slipCode;
        checkbox.checked = event.target.checked;
        if (checkbox.checked) {
          const sale = cachedSalesList.find(
            (sale) => sale.slipCode === slipCode
          );
          if (sale) {
            selectedSales.set(slipCode, sale);
          }
        } else {
          selectedSales.delete(slipCode);
        }
      });
      updateCheckedDiv();
    };

    eventListenerAdded = true;
  }

  renderPaginationButtons({
    currentPage,
    totalPages,
    setPage: (page) => {
      currentPage = page;
      fetchAndCacheSalesList();
    },
    renderListFunction: renderSalesList,
    paginationDivId: "next-prev-btn-div",
    firstBtn,
    prevBtn,
    nextBtn,
    lastBtn,
  });
}

/** 상단 선택 항목 표시 */
function updateCheckedDiv() {
  const checkedDiv = document.getElementById("checked-div");
  checkedDiv.innerHTML = "";

  selectedSales.forEach((sale) => {
    const div = document.createElement("div");
    div.textContent = `${sale.slipCode}`;
    div.dataset.slipCode = sale.slipCode;
    div.onclick = () => {
      selectedSales.delete(sale.slipCode);
      const checkbox = document.querySelector(
        `input[data-slip-code='${sale.slipCode}']`
      );
      if (checkbox) checkbox.checked = false;
      updateCheckedDiv();
    };
    checkedDiv.appendChild(div);
  });
}

/** 초기 조회 */
fetchAndCacheSalesList();

/** 홈 버튼 렌더링 */
const homeButton = new HomeButton();
homeButton.render();

/** 판매 등록에서 사용할 수 있도록 전역화 */
window.fetchAndCacheSalesList = fetchAndCacheSalesList;
