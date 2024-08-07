import { Button } from "../../components/Button.js";
import { HomeButton } from "../../components/HomeButton.js";
import { getUrlParams } from "../../util/get-url-params.js";
import { openPopup } from "../../util/open-pop-up.js";

/** 페이지네이션 변수 */
let currentPage = 1;
const itemsPerPage = 10;
let cachedItemList = [];
const selectedIndices = new Set();

/** 쿼리 params */
const params = getUrlParams();
const isSalesReg =
  window.opener && window.opener.location.href.includes("sales-reg.html");
const isSalesList =
  window.opener && window.opener.location.href.includes("sales-list.html");

/** 조회 조건 설정 */
const searchItemCode = document.getElementById("search-item-code");
const searchItemName = document.getElementById("search-item-name");
searchItemCode.value = params.search || "";

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

const prevBtn = new Button({
  label: "이전",
  onClick: () => {
    if (currentPage > 1) {
      currentPage--;
      renderItemList();
    }
  },
  id: "prev-btn",
}).render();

const nextBtn = new Button({
  label: "다음",
  onClick: () => {
    const totalPages = Math.ceil(cachedItemList.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderItemList();
    }
  },
  id: "next-btn",
}).render();

const applyBtn = new Button({
  label: "적용",
  onClick: () => {
    if (isSalesReg) {
      const selectedCheckbox = document.querySelector(".item-checkbox:checked");

      if (selectedCheckbox) {
        const itemCode = selectedCheckbox.dataset.itemCode;
        const itemName = selectedCheckbox.dataset.itemName;
        const itemPrice = selectedCheckbox.dataset.itemPrice;
        window.opener.document.getElementById(
          "item-input"
        ).value = `${itemName} (${itemCode})`;
        window.opener.document.getElementById("price").value = itemPrice;
        window.opener.document.getElementById("item-code").value = itemCode;
        window.close();
      } else {
        alert("품목을 선택해주세요.");
      }
    } else {
      const selectedCheckboxList = document.querySelectorAll(
        ".item-checkbox:checked"
      );

      if (selectedCheckboxList) {
        const itemDiv = window.opener.document.getElementById("item-div");
        itemDiv.innerHTML = "";

        const itemCodeDiv =
          window.opener.document.getElementById("item-code-div");
        itemCodeDiv.innerHTML = "";

        selectedCheckboxList.forEach((selectedCheckbox) => {
          const itemCode = selectedCheckbox.dataset.itemCode;
          const itemName = selectedCheckbox.dataset.itemName;

          const itemSpan = document.createElement("span");
          itemSpan.textContent = `${itemName} (${itemCode})`;
          const itemCodeSpan = document.createElement("span");
          itemCodeSpan.textContent = itemCode;

          const outBtn = document.createElement("span");
          outBtn.textContent = "🗑️";
          outBtn.classList.add("item-out-btn", "out-btn");
          outBtn.dataset.itemCode = itemCode;

          itemSpan.appendChild(outBtn);
          itemDiv.appendChild(itemSpan);
          itemCodeDiv.appendChild(itemCodeSpan);
        });

        window.opener.searchItemDelete();
        window.close();
      } else {
        alert("품목을 선택해주세요.");
      }
    }
  },
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
    const updatedItemList = cachedItemList.filter(
      (item, index) => !selectedIndices.has(index)
    );

    cachedItemList = updatedItemList;
    selectedIndices.clear();
    window.localStorage.setItem("item-list", JSON.stringify(updatedItemList));
    alert("선택된 항목이 삭제되었습니다.");

    document.querySelector(
      ".table2 thead input[type='checkbox']"
    ).checked = false;
    renderItemList();
  },
  id: "check-del-btn",
}).render();

document.getElementById("search-btn-div").appendChild(searchBtn);
document.getElementById("next-prev-btn-div").append(prevBtn, nextBtn);
document
  .getElementById("func-btn-div")
  .append(applyBtn, newBtn, checkDelBtn, closeBtn);

/** 조건에 맞는 아이템 리스트 불러오기 */
function fetchAndCacheItemList() {
  let itemList = JSON.parse(window.localStorage.getItem("item-list")) || [];

  cachedItemList = itemList.filter((item) => {
    return (
      (!searchItemCode.value ||
        item.itemCode
          .toLowerCase()
          .indexOf(searchItemCode.value.toLowerCase()) !== -1) &&
      (!searchItemName.value ||
        item.itemName
          .toLowerCase()
          .indexOf(searchItemName.value.toLowerCase()) !== -1)
    );
  });

  renderItemList();
}

/** 필터링된 품목 리스트 렌더링 */
function renderItemList() {
  const itemDiv = document.getElementById("item-div");
  itemDiv.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, cachedItemList.length);

  /** 데이터가 하나도 없으면 이전 페이지로 */
  /** 삭제 이후 렌더링 로직 */
  if (startIndex === endIndex) {
    if (currentPage > 1) {
      currentPage--;
      renderItemList();
    }
    return;
  }

  for (let i = startIndex; i < endIndex; i++) {
    const item = cachedItemList[i];

    const tr = document.createElement("tr");

    const td1 = document.createElement("td");
    const input1 = document.createElement("input");
    input1.type = "checkbox";
    input1.classList.add("item-checkbox");
    input1.dataset.index = i;
    input1.dataset.itemCode = item.itemCode;
    input1.dataset.itemName = item.itemName;
    input1.dataset.itemPrice = parseInt(item.itemPrice, 10);
    input1.checked = selectedIndices.has(i);
    input1.addEventListener("change", (event) => {
      if (event.target.checked) {
        if (isSalesReg && selectedIndices.size >= 1) {
          event.target.checked = false;
          alert("최대 1개만 선택 가능합니다.");
        } else if (isSalesList && selectedIndices.size >= 3) {
          event.target.checked = false;
          alert("최대 3개만 선택 가능합니다.");
        } else {
          selectedIndices.add(i);
        }
      } else {
        selectedIndices.delete(i);
      }
    });
    td1.appendChild(input1);
    td1.classList.add("center");

    const td2 = document.createElement("td");
    const a1 = document.createElement("a");
    a1.href = "#";
    a1.textContent = item.itemCode;
    a1.onclick = function () {
      openPopup(
        "../item-reg/item-reg.html",
        650,
        200,
        `item-code=${item.itemCode}&item-name=${item.itemName}&item-price=${item.itemPrice}&save=true&update=false`
      );
    };
    td2.appendChild(a1);

    const td3 = document.createElement("td");
    td3.textContent = item.itemName;

    const td4 = document.createElement("td");
    td4.textContent = parseInt(item.itemPrice, 10).toLocaleString();

    const td5 = document.createElement("td");
    const a2 = document.createElement("a");
    a2.href = "#";
    a2.textContent = "수정";
    a2.onclick = function () {
      openPopup(
        "../item-reg/item-reg.html",
        650,
        200,
        `item-code=${item.itemCode}&item-name=${item.itemName}&item-price=${item.itemPrice}&save=true&update=true`
      );
    };
    td5.appendChild(a2);
    td5.classList.add("center");

    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);
    tr.append(td5);

    itemDiv.append(tr);
  }

  document.getElementById("prev-btn").disabled = currentPage === 1;
  document.getElementById("next-btn").disabled =
    endIndex >= cachedItemList.length;

  /** 테이블 헤더의 체크박스 클릭 시 모든 행 체크박스 선택, 해제 */
  const headerCheckbox = document.querySelector(
    ".table2 thead input[type='checkbox']"
  );

  headerCheckbox.onclick = (event) => {
    const checkboxes = document.querySelectorAll(
      ".table2 tbody input[type='checkbox']"
    );
    checkboxes.forEach((checkbox) => {
      checkbox.checked = event.target.checked;
      const index = parseInt(checkbox.dataset.index);
      if (event.target.checked) {
        selectedIndices.add(index);
      } else {
        selectedIndices.delete(index);
      }
    });
  };

  /** 헤더 체크박스 비활성화 */
  if (isSalesReg || isSalesList) {
    headerCheckbox.disabled = true;
  } else {
    document.getElementById("apply-btn").style.display = "none";
    document.getElementById("close-btn").style.display = "none";
  }
}

/** 품목 등록에서 사용할 수 있도록 전역화 */
window.fetchAndCacheItemList = fetchAndCacheItemList;
window.renderItemList = renderItemList;

/** 초기 조회 */
fetchAndCacheItemList();

const homeButton = new HomeButton();
homeButton.render();
