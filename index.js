import { openPopup } from "./util/open-pop-up.js";
import { getItemName } from "./util/get-item-name.js";
import { Button } from "./components/Button.js";

/** 페이지네이션 변수 */
let currentPage = 1;
const itemsPerPage = 10;

/** 버튼 생성 */
const searchBtn = new Button({
  label: "검색",
  onClick: () => {
    currentPage = 1;
    setSalesList();
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
      setSalesList();
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
    const salesList = getSalesList();
    const totalPages = Math.ceil(salesList.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      setSalesList();
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

    const allSalesList =
      JSON.parse(window.localStorage.getItem("sales-list")) || [];

    const updatedSalesList = allSalesList.filter((sale) => {
      return !Array.from(selectedCheckboxes).some(
        (checkbox) => checkbox.dataset.slipCode === sale.slipCode
      );
    });

    window.localStorage.setItem("sales-list", JSON.stringify(updatedSalesList));
    alert("선택된 항목이 삭제되었습니다.");

    document.querySelector(
      ".table2 thead input[type='checkbox']"
    ).checked = false;
    setSalesList();
  },
  id: "check-del-btn",
}).render();

document.getElementById("search-btn-div").appendChild(searchBtn);
document.getElementById("next-prev-btn-div").append(prevBtn, nextBtn);
document.getElementById("func-btn-div").append(newBtn, checkDelBtn);

/** 품목 선택 팝업 열기 */
document.getElementById("code-help-img").onclick = () =>
  openPopup("pages/item-list/item-list.html", 800, 600, "");

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

/** 조건에 맞는 판매 리스트 불러오기 함수 */
function getSalesList() {
  const sItemCodeDiv = document.getElementById("item-code-div");
  const sSlipDateFr = document.getElementById("slip-date-fr");
  const sSlipDateTo = document.getElementById("slip-date-to");
  const sDescription = document.getElementById("description");

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

/** 필터링 된 판매 리스트 화면에 렌더링 */
function setSalesList() {
  const salesList = getSalesList();
  const salesTableBody = document.querySelector(".table2 tbody");

  salesTableBody.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, salesList.length);

  /** 데이터가 하나도 없으면 이전 페이지로 */
  /** 삭제 이후 렌더링 로직 */
  if (startIndex === endIndex) {
    if (currentPage > 1) currentPage--;
    setSalesList();
    return;
  }

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

/** 판매 등록에서 사용할 수 있도록 전역화 */
window.setSalesList = setSalesList;

/** 품목 조회 조건의 품목 아이템 클릭 시 삭제 */
function searchItemDelete() {
  const outBtnList = document.querySelectorAll(".out-btn");
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

/** 판매 등록에서 사용할 수 있도록 전역화 */
window.searchItemDelete = searchItemDelete;

/** 초기 조회 */
setSalesList();
