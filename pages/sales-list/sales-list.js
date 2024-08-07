import { openPopup } from "../../util/open-pop-up.js";
import { getItemName } from "../../util/get-item-name.js";
import { Button } from "../../components/Button.js";
import { HomeButton } from "../../components/HomeButton.js";

/** 페이지네이션 변수 */
let currentPage = 1;
const itemsPerPage = 10;
let cachedSalesList = [];
const selectedIndices = new Set();

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

const prevBtn = new Button({
  label: "이전",
  onClick: () => {
    document.querySelector(
      ".table2 thead input[type='checkbox']"
    ).checked = false;
    if (currentPage > 1) {
      currentPage--;
      renderSalesList();
    }
  },
  id: "prev-btn",
}).render();

const nextBtn = new Button({
  label: "다음",
  onClick: () => {
    document.querySelector(
      ".table2 thead input[type='checkbox']"
    ).checked = false;
    const totalPages = Math.ceil(cachedSalesList.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderSalesList();
    }
  },
  id: "next-btn",
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
      (sale, index) => !selectedIndices.has(index)
    );

    cachedSalesList = updatedSalesList;
    selectedIndices.clear();
    window.localStorage.setItem("sales-list", JSON.stringify(updatedSalesList));
    alert("선택된 항목이 삭제되었습니다.");

    document.querySelector(
      ".table2 thead input[type='checkbox']"
    ).checked = false;
    renderSalesList();
  },
  id: "check-del-btn",
}).render();

document.getElementById("search-btn-div").appendChild(searchBtn);
document.getElementById("next-prev-btn-div").append(prevBtn, nextBtn);
document.getElementById("func-btn-div").append(newBtn, checkDelBtn);

/** 품목 선택 팝업 열기 */
document.getElementById("item-code-help-img").onclick = () =>
  openPopup("../item-list/item-list.html", 900, 600, "");

/** 거래처 선택 팝업 열기 */
document.getElementById("cust-code-help-img").onclick = () =>
  openPopup("../cust-list/cust-list.html", 800, 600, "");

/** 테이블 헤더의 체크박스 클릭 시 모든 행 체크박스 선택/해제 */
document.querySelector(".table2 thead input[type='checkbox']").onclick =
  function (event) {
    const checkboxes = document.querySelectorAll(
      ".table2 tbody input[type='checkbox']"
    );

    /** 페이지를 넘기더라도 체크는 유지되어야 함 */
    checkboxes.forEach((checkbox) => {
      checkbox.checked = event.target.checked;
      if (event.target.checked) {
        selectedIndices.add(parseInt(checkbox.dataset.index, 10));
      } else {
        selectedIndices.delete(parseInt(checkbox.dataset.index, 10));
      }
    });
  };

/** 판매 리스트 가져와서 캐시하는 함수 */
function fetchAndCacheSalesList() {
  const sItemCodeDiv = document.getElementById("item-code-div");
  const sCustCodeDiv = document.getElementById("cust-code-div");
  const sSlipDateFr = document.getElementById("slip-date-fr");
  const sSlipDateTo = document.getElementById("slip-date-to");
  const sDescription = document.getElementById("description");

  const sItemSet = new Set(
    Array.from(sItemCodeDiv.querySelectorAll("span")).map((sItem) => {
      return sItem.textContent;
    })
  );

  const sCustSet = new Set(
    Array.from(sCustCodeDiv.querySelectorAll("span")).map((sCust) => {
      return sCust.textContent;
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

  renderSalesList();
}

/** 필터링 된 판매 리스트 화면에 렌더링 */
function renderSalesList() {
  const salesTableBody = document.querySelector(".table2 tbody");

  salesTableBody.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, cachedSalesList.length);

  /** 데이터가 하나도 없으면 이전 페이지로 */
  /** 삭제 이후 렌더링 로직 */
  if (startIndex === endIndex) {
    if (currentPage > 1) {
      currentPage--;
      renderSalesList();
    }
    return;
  }

  for (let i = startIndex; i < endIndex; i++) {
    const sale = cachedSalesList[i];

    const row = document.createElement("tr");

    const checkboxCell = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.index = i;
    checkbox.dataset.slipCode = sale.slipCode;
    checkbox.checked = selectedIndices.has(i); // 체크 여부 다시 가져오기
    checkbox.onclick = () => {
      if (checkbox.checked) {
        selectedIndices.add(i);
      } else {
        selectedIndices.delete(i);
      }
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
  }

  document.getElementById("prev-btn").disabled = currentPage === 1;
  document.getElementById("next-btn").disabled =
    endIndex >= cachedSalesList.length;
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
        <td colspan="5">
          ${
            JSON.parse(window.localStorage.getItem("cust-list")).find(
              (cust) => cust.custCode === sale.custCode
            )?.custName || ""
          }
        </td>
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
        <td>
          ${(
            parseInt(sale.qty, 10) * parseInt(sale.price, 10)
          ).toLocaleString()}
        </td>
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
  const itemCodeSpanList = document
    .getElementById("item-code-div")
    .querySelectorAll("span");

  outBtnList.forEach((outBtn) => {
    outBtn.onclick = () => {
      outBtn.parentNode.remove();

      itemCodeSpanList.forEach((itemCodeSpan) => {
        if (itemCodeSpan.textContent === outBtn.dataset.itemCode) {
          itemCodeSpan.remove();
        }
      });
    };
  });
}

/** 거래처 조회 조건의 거래처 아이템 클릭 시 삭제 */
function searchCustDelete() {
  const outBtnList = document.querySelectorAll(".cust-out-btn");
  const custCodeSpanList = document
    .getElementById("cust-code-div")
    .querySelectorAll("span");

  outBtnList.forEach((outBtn) => {
    outBtn.onclick = () => {
      outBtn.parentNode.remove();

      custCodeSpanList.forEach((custCodeSpan) => {
        if (custCodeSpan.textContent === outBtn.dataset.custCode) {
          custCodeSpan.remove();
        }
      });
    };
  });
}

/** 판매 등록에서 사용할 수 있도록 전역화 */
window.fetchAndCacheSalesList = fetchAndCacheSalesList;
window.searchItemDelete = searchItemDelete;
window.searchCustDelete = searchCustDelete;

/** 초기 조회 */
fetchAndCacheSalesList();

const homeButton = new HomeButton();
homeButton.render();
