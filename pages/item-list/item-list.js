import { Button } from "../../components/Button.js";
import { HomeButton } from "../../components/HomeButton.js";
import { getUrlParams } from "../../util/get-url-params.js";
import { openPopup } from "../../util/open-pop-up.js";
import { CodeHelp } from "../../components/CodeHelp.js";
import { renderPaginationButtons } from "../../util/render-pagination-buttons.js";
import { handleCheckDelete } from "../../util/handle-check-delete.js";

let cachedItemList = [];
let selectedItems = new Map();
const itemsPerPage = 10;
let currentPage = 1;
let totalPages = 1;
let eventListenerAdded = false;

/** 쿼리 params */
const params = getUrlParams();
const isSalesReg =
  window.opener && window.opener.location.href.includes("sales-reg.html");
const isSalesList =
  window.opener && window.opener.location.href.includes("sales-list.html");

const maxCount = isSalesReg ? 1 : isSalesList ? 3 : 0; // 최대 선택 개수 설정

/** 조회 조건 설정 */
const searchItemCode = document.getElementById("search-item-code");
const searchItemName = document.getElementById("search-item-name");

searchItemCode.value = params.search || "";

searchItemCode.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    currentPage = 1;
    fetchAndCacheItemList();
  }
});

searchItemName.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    currentPage = 1;
    fetchAndCacheItemList();
  }
});

/** 코드 기반 검색 */
const codeHelp = new CodeHelp({
  inputId: "item-input",
  helpDivId: "item-code-help",
  maxItems: isSalesReg ? 1 : 3,
  mode: "item",
  isSuper: true,
});

/** 버튼 생성 */
const searchBtn = new Button({
  label: "검색",
  onClick: () => {
    currentPage = 1;
    fetchAndCacheItemList();
  },
  className: "blue-btn",
  id: "search-btn",
}).render();

const firstBtn = new Button({
  label: "<<",
  onClick: () => {
    currentPage = 1;
    fetchAndCacheItemList();
  },
  className: "page-btn",
  id: "first-btn",
}).render();

const prevBtn = new Button({
  label: "<",
  onClick: () => {
    if (currentPage > 1) {
      currentPage--;
      fetchAndCacheItemList();
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
      fetchAndCacheItemList();
    }
  },
  className: "page-btn",
  id: "next-btn",
}).render();

const lastBtn = new Button({
  label: ">>",
  onClick: () => {
    currentPage = totalPages;
    fetchAndCacheItemList();
  },
  className: "page-btn",
  id: "last-btn",
}).render();

const applyBtn = new Button({
  label: "적용",
  onClick: handleApplyClick,
  className: "blue-btn",
  id: "apply-btn",
}).render();

const newBtn = new Button({
  label: "신규",
  onClick: () => {
    openPopup("../item-reg/item-reg.html", 650, 200, `save=false&update=false`);
  },
  id: "new-btn",
}).render();

const closeBtn = new Button({
  label: "닫기",
  onClick: () => window.close(),
  id: "close-btn",
}).render();

const checkDelBtn = new Button({
  label: "선택삭제",
  onClick: () => {
    handleCheckDelete({
      cachedList: cachedItemList,
      checkboxHandler: { getSelectedItems: () => selectedItems },
      storageKey: "item-list",
      fetchFunction: fetchAndCacheItemList,
    });
  },
  id: "check-del-btn",
}).render();

document.getElementById("search-btn-div").appendChild(searchBtn);
document.getElementById("next-prev-btn-div").append(prevBtn, nextBtn);
document
  .getElementById("func-btn-div")
  .append(applyBtn, newBtn, checkDelBtn, closeBtn);

// 판매에서 온 경우 헤더 체크 비활성화
if (isSalesReg || isSalesList) {
  document.querySelector(
    ".table2 thead input[type='checkbox']"
  ).disabled = true;
} else {
  document.getElementById("apply-btn").style.display = "none";
  document.getElementById("close-btn").style.display = "none";
}

/** 품목 리스트 가져와서 캐싱 */
function fetchAndCacheItemList() {
  let itemList = JSON.parse(window.localStorage.getItem("item-list")) || [];

  cachedItemList = itemList.filter((item) => {
    return (
      (!searchItemCode.value ||
        item.itemCode
          .toLowerCase()
          .includes(searchItemCode.value.toLowerCase())) &&
      (!searchItemName.value ||
        item.itemName
          .toLowerCase()
          .includes(searchItemName.value.toLowerCase()))
    );
  });

  totalPages = Math.ceil(cachedItemList.length / itemsPerPage);

  renderItemList();
}

/** 캐싱한 품목 리스트 페이지 단위로 화면에 렌더링 */
function renderItemList() {
  const itemDiv = document.getElementById("item-div");
  itemDiv.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = cachedItemList.slice(startIndex, endIndex);

  paginatedData.forEach((item) => {
    const tr = document.createElement("tr");

    tr.dataset.itemCode = item.itemCode;
    tr.dataset.itemName = item.itemName;
    tr.dataset.itemPrice = parseInt(item.itemPrice, 10);

    const td1 = document.createElement("td");
    const input1 = document.createElement("input");
    input1.type = "checkbox";
    input1.classList.add("item-checkbox");
    input1.dataset.itemCode = item.itemCode;
    input1.checked = selectedItems.has(item.itemCode);
    td1.appendChild(input1);
    td1.classList.add("center");

    const td2 = document.createElement("td");
    const a1 = document.createElement("a");
    a1.href = "#";
    a1.textContent = item.itemCode;
    a1.dataset.update = false;
    td2.appendChild(a1);

    const td3 = document.createElement("td");
    td3.textContent = item.itemName;

    const td4 = document.createElement("td");
    td4.textContent = parseInt(item.itemPrice, 10).toLocaleString();

    const td5 = document.createElement("td");
    const a2 = document.createElement("a");
    a2.href = "#";
    a2.textContent = "수정";
    a2.dataset.update = true;
    td5.appendChild(a2);
    td5.classList.add("center");

    tr.append(td1, td2, td3, td4, td5);
    itemDiv.append(tr);
  });

  if (!eventListenerAdded) {
    itemDiv.addEventListener("change", (event) => {
      if (event.target.classList.contains("item-checkbox")) {
        const itemCode = event.target.dataset.itemCode;
        if (event.target.checked) {
          if (maxCount != 0 && selectedItems.size >= maxCount) {
            alert(`최대 ${maxCount}개만 선택 가능합니다.`);
            event.target.checked = false;
            return;
          }
          const item = cachedItemList.find(
            (item) => item.itemCode === itemCode
          );
          if (item) {
            selectedItems.set(itemCode, item);
          }
        } else {
          selectedItems.delete(itemCode);
        }
        updateCheckedDiv();
      }
    });

    itemDiv.addEventListener("click", (event) => {
      if (event.target.tagName === "A") {
        event.preventDefault();

        const tr = event.target.closest("tr");
        const itemCode = tr.dataset.itemCode;
        const itemName = tr.dataset.itemName;
        const itemPrice = tr.dataset.itemPrice;
        const update = event.target.dataset.update;

        openPopup(
          "../item-reg/item-reg.html",
          650,
          200,
          `item-code=${itemCode}&item-name=${itemName}&item-price=${itemPrice}&save=true&update=${update}`
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
        const itemCode = checkbox.dataset.itemCode;
        checkbox.checked = event.target.checked;
        if (checkbox.checked) {
          const item = cachedItemList.find(
            (item) => item.itemCode === itemCode
          );
          if (item) {
            selectedItems.set(itemCode, item);
          }
        } else {
          selectedItems.delete(itemCode);
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
      fetchAndCacheItemList();
    },
    renderListFunction: renderItemList,
    paginationDivId: "next-prev-btn-div",
    firstBtn,
    prevBtn,
    nextBtn,
    lastBtn,
  });
}

/** 상단 표시 */
function updateCheckedDiv() {
  const checkedDiv = document.getElementById("checked-div");
  checkedDiv.innerHTML = "";

  selectedItems.forEach((item) => {
    const div = document.createElement("div");
    div.textContent = `${item.itemName} (${item.itemCode})`;
    div.dataset.itemCode = item.itemCode;
    div.onclick = () => {
      selectedItems.delete(item.itemCode);
      const checkbox = document.querySelector(
        `input[data-item-code='${item.itemCode}']`
      );
      if (checkbox) checkbox.checked = false;
      updateCheckedDiv();
    };
    checkedDiv.appendChild(div);
  });
}

/** 적용 버튼 핸들러 */
function handleApplyClick() {
  const selectedItemsArray = Array.from(selectedItems.values());

  if (isSalesReg) {
    if (selectedItemsArray.length === 1) {
      codeHelp.addItem(selectedItemsArray[0]);
      window.opener.document.getElementById("price").value = parseInt(
        selectedItemsArray[0].itemPrice,
        10
      );
      window.opener.inputItemDelete();
      window.close();
    } else {
      alert("품목을 선택해주세요.");
    }
  } else {
    if (selectedItemsArray.length > 0) {
      selectedItemsArray.forEach((selectedItem) =>
        codeHelp.addItem(selectedItem)
      );
      window.opener.searchItemDelete();
      window.close();
    } else {
      alert("품목을 선택해주세요.");
    }
  }
}

/** 품목 등록에서 사용할 수 있도록 전역화 */
window.fetchAndCacheItemList = fetchAndCacheItemList;
window.renderItemList = renderItemList;

/** 초기 조회 */
fetchAndCacheItemList();

/** 홈 버튼 렌더링 */
if (!isSalesReg && !isSalesList) {
  const homeButton = new HomeButton();
  homeButton.render();
}
