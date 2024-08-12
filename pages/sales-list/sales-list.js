import { openPopup } from "../../util/open-pop-up.js";
import { getItemName } from "../../util/get-item-name.js";
import { Button } from "../../components/Button.js";
import { HomeButton } from "../../components/HomeButton.js";
import { usePagination } from "../../hooks/usePagination.js";
import { useCheckbox } from "../../hooks/useCheckbox.js";
import { CodeHelp } from "../../components/CodeHelp.js";
import { printSale } from "./sale-print.js";
import { renderPaginationButtons } from "../../util/render-pagination-buttons.js";
import { handleCheckDelete } from "../../util/handle-check-delete.js";

let cachedSalesList = [];
const itemsPerPage = 10;
let pagination;
const checkboxHandler = useCheckbox("sales");

/** 코드 기반 검색 */
new CodeHelp({
  inputId: "item-input",
  helpDivId: "item-code-help",
  maxItems: 3,
  mode: "item",
  searchFunction: (searchTerm) => {
    const itemList = JSON.parse(window.localStorage.getItem("item-list")) || [];
    return itemList.filter((item) =>
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
});

/** 버튼 생성 */
const searchBtn = new Button({
  label: "검색",
  onClick: () => {
    pagination.reset();
    fetchAndCacheSalesList();
  },
  className: "blue-btn",
  id: "search-btn",
}).render();

const firstBtn = new Button({
  label: "<<",
  onClick: () => {
    pagination.setPage(1);
    renderSalesList();
  },
  className: "page-btn",
  id: "first-btn",
}).render();

const prevBtn = new Button({
  label: "<",
  onClick: () => {
    pagination.prevPage();
    renderSalesList();
  },
  className: "page-btn",
  id: "prev-btn",
}).render();

const nextBtn = new Button({
  label: ">",
  onClick: () => {
    pagination.nextPage();
    renderSalesList();
  },
  className: "page-btn",
  id: "next-btn",
}).render();

const lastBtn = new Button({
  label: ">>",
  onClick: () => {
    pagination.setPage(pagination.getTotalPages());
    renderSalesList();
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
      checkboxHandler: checkboxHandler,
      storageKey: "sales-list",
      fetchFunction: fetchAndCacheSalesList,
    });
  },
  id: "check-del-btn",
}).render();

document.getElementById("search-btn-div").appendChild(searchBtn);
document.getElementById("next-prev-btn-div").append(prevBtn, nextBtn);
document.getElementById("func-btn-div").append(newBtn, checkDelBtn);

/** 판매 리스트 가져와서 캐싱 */
function fetchAndCacheSalesList() {
  const sItemCodeDiv = document.getElementById("item-code-help");
  const sSlipDateFr = document.getElementById("slip-date-fr");
  const sSlipDateTo = document.getElementById("slip-date-to");
  const sDescription = document.getElementById("description");

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

  const oldPage = pagination ? pagination.getCurrentPage() : 1;
  pagination = usePagination(cachedSalesList, itemsPerPage);
  pagination.setPage(
    oldPage > pagination.getTotalPages() ? pagination.getTotalPages() : oldPage
  );
  renderSalesList();
}

/** 캐싱한 판매 리스트 페이지 단위로 화면에 렌더링 */
function renderSalesList() {
  const salesTableBody = document.querySelector(".table2 tbody");
  salesTableBody.innerHTML = "";

  const paginatedData = pagination.getPaginatedData();

  paginatedData.forEach((sale, i) => {
    const row = document.createElement("tr");

    const checkboxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.index = pagination.getCurrentPageIndex(i);
    checkbox.dataset.slipCode = sale.slipCode;
    checkbox.checked = checkboxHandler.isChecked(
      pagination.getCurrentPageIndex(i)
    );
    checkbox.onclick = (event) => {
      const index = parseInt(event.target.dataset.index, 10);
      checkboxHandler.toggleCheckbox(
        index,
        event.target.checked,
        cachedSalesList
      );
    };
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

  checkboxHandler.handleHeaderCheckboxClick(
    ".table2 thead input[type='checkbox']",
    ".table2 tbody input[type='checkbox']",
    cachedSalesList
  );

  if (document.getElementById("item-code-help-img")) {
    document.getElementById("item-code-help-img").onclick = () =>
      openPopup("../item-list/item-list.html", 900, 600, "");
  }

  // 페이지네이션 버튼 렌더링
  renderPaginationButtons({
    pagination,
    renderListFunction: renderSalesList,
    paginationDivId: "next-prev-btn-div",
    firstBtn,
    prevBtn,
    nextBtn,
    lastBtn,
  });
}

/** 품목 조회 조건의 품목 아이템 클릭 시 삭제 */
function searchItemDelete() {
  const outBtnList = document.querySelectorAll(".item-out-btn");

  outBtnList.forEach((outBtn) => {
    outBtn.onclick = () => {
      outBtn.parentNode.remove();
    };
  });
}

/** 판매 등록에서 사용할 수 있도록 전역화 */
window.fetchAndCacheSalesList = fetchAndCacheSalesList;
window.searchItemDelete = searchItemDelete;

/** 초기 조회 */
fetchAndCacheSalesList();

/** 홈 버튼 렌더링 */
const homeButton = new HomeButton();
homeButton.render();
