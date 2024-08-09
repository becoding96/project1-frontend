import { openPopup } from "../../util/open-pop-up.js";
import { getItemName } from "../../util/get-item-name.js";
import { Button } from "../../components/Button.js";
import { HomeButton } from "../../components/HomeButton.js";
import { usePagination } from "../../hooks/usePagination.js";
import { useCheckbox } from "../../hooks/useCheckbox.js";
import { CodeHelp } from "../../components/CodeHelp.js";

let cachedSalesList = [];
const itemsPerPage = 10;
let pagination;
const checkboxHandler = useCheckbox("sales");

/** CodeHelp 인스턴스 생성 */
const itemCodeHelp = new CodeHelp({
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

const custCodeHelp = new CodeHelp({
  inputId: "cust-input",
  helpDivId: "cust-code-help",
  maxItems: 3,
  mode: "cust",
  searchFunction: (searchTerm) => {
    const custList = JSON.parse(window.localStorage.getItem("cust-list")) || [];
    return custList.filter((cust) =>
      cust.custCode.toLowerCase().includes(searchTerm.toLowerCase())
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
    const updatedSalesList = cachedSalesList.filter(
      (sale, index) => !checkboxHandler.getSelectedIndices().has(index)
    );

    cachedSalesList = updatedSalesList;
    checkboxHandler.getSelectedIndices().clear();
    window.localStorage.setItem("sales-list", JSON.stringify(updatedSalesList));
    alert("선택된 항목이 삭제되었습니다.");

    document.querySelector(
      ".table2 thead input[type='checkbox']"
    ).checked = false;

    document.getElementById("checked-div").innerHTML = "";

    fetchAndCacheSalesList();
  },
  id: "check-del-btn",
}).render();

document.getElementById("search-btn-div").appendChild(searchBtn);
document.getElementById("next-prev-btn-div").append(prevBtn, nextBtn);
document.getElementById("func-btn-div").append(newBtn, checkDelBtn);

/** 판매 리스트 가져와서 캐시하는 함수 */
function fetchAndCacheSalesList() {
  const sItemCodeDiv = document.getElementById("item-code-help");
  const sCustCodeDiv = document.getElementById("cust-code-help");
  const sSlipDateFr = document.getElementById("slip-date-fr");
  const sSlipDateTo = document.getElementById("slip-date-to");
  const sDescription = document.getElementById("description");

  const sItemSet = new Set(
    Array.from(sItemCodeDiv.querySelectorAll(".item-span")).map((sItem) => {
      return sItem.dataset.code;
    })
  );

  console.log(sItemSet);

  const sCustSet = new Set(
    Array.from(sCustCodeDiv.querySelectorAll(".cust-span")).map((sCust) => {
      return sCust.dataset.code;
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
      (sCustSet.size === 0 || sCustSet.has(sale.custCode)) &&
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

/** 필터링 된 판매 리스트 화면에 렌더링 */
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

    const custCodeCell = document.createElement("td");
    custCodeCell.textContent = sale.custCode;
    row.appendChild(custCodeCell);

    const custNameCell = document.createElement("td");
    const custName =
      JSON.parse(window.localStorage.getItem("cust-list")).find(
        (cust) => cust.custCode === sale.custCode
      )?.custName || "";
    custNameCell.textContent = custName;
    row.appendChild(custNameCell);

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
  if (document.getElementById("cust-code-help-img")) {
    document.getElementById("cust-code-help-img").onclick = () =>
      openPopup("../cust-list/cust-list.html", 800, 600, "");
  }

  renderPaginationButtons();
}

/** 페이지네이션 버튼 렌더링 */
function renderPaginationButtons() {
  const paginationDiv = document.getElementById("next-prev-btn-div");
  paginationDiv.innerHTML = "";

  const visiblePages = pagination.getVisiblePageNumbers();

  paginationDiv.append(firstBtn, prevBtn);

  visiblePages.forEach((pageNumber) => {
    const pageButton = new Button({
      label: pageNumber.toString(),
      onClick: () => {
        pagination.setPage(pageNumber);
        renderSalesList();
      },
      className:
        pageNumber === pagination.getCurrentPage()
          ? "page-btn blue-btn"
          : "page-btn",
    }).render();

    paginationDiv.appendChild(pageButton);
  });

  paginationDiv.append(nextBtn, lastBtn);

  document.getElementById("prev-btn").disabled =
    pagination.getCurrentPage() === 1;
  document.getElementById("next-btn").disabled =
    pagination.getCurrentPage() >= pagination.getTotalPages();
}

/** 출력물 */
function printSale(sale) {
  const printWindow = window.open("", "PRINT", "height=600, width=800");

  printWindow.document.write(`
    <html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>거래명세서</title>
    <style>
      .title-div {
        display: flex;
        justify-content: space-between;
        width: 100%;
        border: 1px solid black;
        box-sizing: border-box;
        margin-top: 100px;
      }
      .title-div h2 {
        width: 85%;
        text-align: center;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 10px 0;
        font-size: 20px;
      }
      .approval-box {
        display: flex;
        flex-direction: column;
        width: 15%;
        font-size: 10px;
      }
      .approval-box .header {
        display: flex;
        text-align: center;
      }
      .approval-box .header span {
        flex: 1;
        border-left: 1px solid black;
        border-bottom: 1px solid black;
        padding: 2px 0;
      }
      .approval-box .signatures {
        flex: 1;
        display: flex;
      }
      .approval-box .signatures .signature {
        flex: 1;
        border-left: 1px solid black;
        padding: 20px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        font-size: 12px;
      }
      th,
      td {
        border: 1px solid black;
        padding: 8px;
        text-align: center;
      }
      th {
        background-color: #f2f2f2;
      }
      .single-row th,
      .single-row td {
        padding: 0;
        border-right: 1px solid black;
        border-bottom: 1px solid black;
      }
      .single-row td {
        padding-left: 20px;
      }
    </style>
  </head>
  <body>
    <div class="title-div">
      <h2>거래명세서</h2>
      <div class="approval-box">
        <div class="header">
          <span>담당</span>
          <span>결재</span>
        </div>
        <div class="signatures">
          <div class="signature"></div>
          <div class="signature"></div>
        </div>
      </div>
    </div>
    <table>
      <tr class="single-row">
        <th>전표번호</th>
        <td colspan="5">${sale.slipCode}</td>
      </tr>
      <tr class="single-row">
        <th>거래처</th>
        <td colspan="5">${
          JSON.parse(window.localStorage.getItem("cust-list")).find(
            (cust) => cust.custCode === sale.custCode
          )?.custName || ""
        }</td>
      </tr>
      <tr>
        <th>전표일자</th>
        <th colspan="2">품목</th>
        <th>수량</th>
        <th>단가</th>
        <th>금액</th>
      </tr>
      <tr>
        <td>${sale.slipDate}</td>
        <td colspan="2">${getItemName(sale.itemCode)}</td>
        <td>${parseInt(sale.qty, 10).toLocaleString()}</td>
        <td>${parseInt(sale.price, 10).toLocaleString()}</td>
        <td>${(
          parseInt(sale.qty, 10) * parseInt(sale.price, 10)
        ).toLocaleString()}</td>
      </tr>
      <tr class="single-row">
        <th>적요</th>
        <td colspan="5">${sale.description}</td>
      </tr>
    </table>
    <script>
      window.onload = function() {
        window.print();
        window.close();
      }
    </script>
  </body>
</html>
  `);

  printWindow.document.close();
  printWindow.focus();
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

/** 거래처 조회 조건의 거래처 아이템 클릭 시 삭제 */
function searchCustDelete() {
  const outBtnList = document.querySelectorAll(".cust-out-btn");

  outBtnList.forEach((outBtn) => {
    outBtn.onclick = () => {
      outBtn.parentNode.remove();
    };
  });
}

/** 판매 등록에서 사용할 수 있도록 전역화 */
window.fetchAndCacheSalesList = fetchAndCacheSalesList;
window.searchItemDelete = searchItemDelete;
window.searchCustDelete = searchCustDelete;

/** 초기 조회 */
fetchAndCacheSalesList();

/** 홈 버튼 렌더링 */
const homeButton = new HomeButton();
homeButton.render();
