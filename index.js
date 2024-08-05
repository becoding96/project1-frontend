import { openPopup } from "./util/open-pop-up.js";
import { getItemName } from "./util/get-item-name.js";
import { Button } from "./components/Button.js";

/** 페이지네이션 변수 */
let currentPage = 1;
const itemsPerPage = 10;
let cachedSalesList = [];

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
  onClick: () => openPopup("pages/sales-reg/sales-reg.html", 700, 300, ""),
  className: "blue-btn",
  id: "new-btn",
}).render();

const checkDelBtn = new Button({
  label: "선택삭제",
  onClick: () => {
    const selectedCheckboxes = document.querySelectorAll(
      ".table2 tbody input[type='checkbox']:checked"
    );

    if (selectedCheckboxes.length === 0) {
      alert("삭제할 항목을 선택해주세요.");
      return;
    }

    const updatedSalesList = cachedSalesList.filter((sale) => {
      return !Array.from(selectedCheckboxes).some(
        (checkbox) => checkbox.dataset.slipCode === sale.slipCode
      );
    });

    cachedSalesList = updatedSalesList;
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
  openPopup("pages/item-list/item-list.html", 800, 600, "");

/** 거래처 선택 팝업 열기 */
document.getElementById("cust-code-help-img").onclick = () =>
  openPopup("pages/cust-list/cust-list.html", 800, 600, "");

/** 테이블 헤더의 체크박스 클릭 시 모든 행 체크박스 선택/해제 */
document.querySelector(".table2 thead input[type='checkbox']").onclick =
  function (event) {
    const checkboxes = document.querySelectorAll(
      ".table2 tbody input[type='checkbox']"
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = event.target.checked;
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
    checkbox.dataset.slipCode = sale.slipCode;
    checkboxCell.appendChild(checkbox);
    checkboxCell.classList.add("center");
    row.appendChild(checkboxCell);

    const slipCodeCell = document.createElement("td");
    const slipCode = document.createElement("a");
    slipCode.textContent = sale.slipCode;

    slipCode.onclick = () =>
      openPopup(
        "pages/sales-reg/sales-reg.html",
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
    <html>
      <head>
        <title>거래명세서</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>거래명세서</h2>
        <table>
          <tr><th>전표일자/번호</th><td>${sale.slipCode}</td></tr>
          <tr><th>품목코드</th><td>${sale.itemCode}</td></tr>
          <tr><th>품목명</th><td>${getItemName(sale.itemCode)}</td></tr>
          <tr><th>거래처코드</th><td>${sale.custCode}</td></tr>
          <tr><th>거래처명</th><td>${
            JSON.parse(window.localStorage.getItem("cust-list")).find(
              (cust) => cust.custCode === sale.custCode
            )?.custName || ""
          }</td></tr>
          <tr><th>수량</th><td>${parseInt(
            sale.qty,
            10
          ).toLocaleString()}</td></tr>
          <tr><th>단가</th><td>${parseInt(
            sale.price,
            10
          ).toLocaleString()}</td></tr>
          <tr><th>적요</th><td>${sale.description}</td></tr>
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
