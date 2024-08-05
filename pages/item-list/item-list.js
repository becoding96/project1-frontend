import { getUrlParams } from "../../util/get-url-params.js";
import { openPopup } from "../../util/open-pop-up.js";

/** 페이지네이션 변수 */
let currentPage = 1;
const itemsPerPage = 10;

/** 쿼리 params */
const params = getUrlParams();

/** 조회 조건 설정 */
const searchItemCode = document.getElementById("search-item-code");
const searchItemName = document.getElementById("search-item-name");
searchItemCode.value = params.search || "";

/** 검색 버튼 클릭 시 품목 리스트를 새로 설정 */
document.getElementById("search-btn").onclick = function () {
  currentPage = 1;
  setItemList();
};

/** 신규 등록 팝업 열기 */
document.getElementById("new-btn").onclick = function () {
  openPopup("../item-reg/item-reg.html", 650, 200, `save=false&update=false`);
};

/** 이전 페이지 버튼 클릭 시 페이지를 이동하고 리스트 새로 설정 */
document.getElementById("prev-btn").onclick = function () {
  if (currentPage > 1) {
    currentPage--;
    setItemList();
  }
};

/** 다음 페이지 버튼 클릭 시 페이지를 이동하고 리스트 새로 설정 */
document.getElementById("next-btn").onclick = function () {
  const itemList = getItemList();
  const totalPages = Math.ceil(itemList.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    setItemList();
  }
};

/** 적용 버튼 클릭 시 체크 품목을 부모 창으로 전달 */
document.getElementById("apply-btn").onclick = function () {
  if (window.opener && window.opener.location.href.includes("sales-reg.html")) {
    const selectedCheckbox = document.querySelector(".item-checkbox:checked");

    if (selectedCheckbox) {
      const itemCode = selectedCheckbox.dataset.itemCode;
      const itemName = selectedCheckbox.dataset.itemName;
      window.opener.document.getElementById(
        "item-input"
      ).value = `${itemName} (${itemCode})`;
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

        itemDiv.appendChild(itemSpan);

        const itemCodeSpan = document.createElement("span");
        itemCodeSpan.textContent = itemCode;

        itemCodeDiv.appendChild(itemCodeSpan);

        window.close();
      });
    } else {
      alert("품목을 선택해주세요.");
    }
  }
};

/** 닫기 버튼 클릭 시 창 닫기 */
document.getElementById("close-btn").onclick = function () {
  window.close();
};

/** 조건에 맞는 아이템 리스트 불러오기 */
function getItemList() {
  let itemList = JSON.parse(window.localStorage.getItem("item-list"));

  return itemList.filter((item) => {
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
}

/** 필터링된 품목 리스트 렌더링 */
function setItemList() {
  const itemList = getItemList();
  const itemDiv = document.getElementById("item-div");
  itemDiv.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, itemList.length);

  for (let i = startIndex; i < endIndex; i++) {
    const item = itemList[i];

    const td1 = document.createElement("td");
    const input1 = document.createElement("input");
    input1.type = "checkbox";
    input1.classList.add("item-checkbox");
    input1.dataset.itemCode = item.itemCode;
    input1.dataset.itemName = item.itemName;
    input1.addEventListener("change", handleCheckboxChange);
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
        `item-code=${item.itemCode}&item-name=${item.itemName}&save=true&update=false`
      );
    };
    td2.appendChild(a1);

    const td3 = document.createElement("td");
    td3.textContent = item.itemName;

    const td4 = document.createElement("td");
    const a2 = document.createElement("a");
    a2.href = "#";
    a2.textContent = "수정";
    a2.onclick = function () {
      openPopup(
        "../item-reg/item-reg.html",
        650,
        200,
        `item-code=${item.itemCode}&item-name=${item.itemName}&save=true&update=true`
      );
    };
    td4.appendChild(a2);
    td4.classList.add("center");

    const tr = document.createElement("tr");
    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);

    itemDiv.append(tr);
  }

  document.getElementById("prev-btn").disabled = currentPage === 1;
  document.getElementById("next-btn").disabled = endIndex >= itemList.length;
}

/** 품목 등록에서 사용할 수 있도록 전역화 */
window.setItemList = setItemList;

/** 체크박스 개수 통제 */
function handleCheckboxChange(event) {
  const maxSelection =
    window.opener && window.opener.location.href.includes("sales-reg.html")
      ? 1
      : 3;
  const checkboxes = document.querySelectorAll(".item-checkbox:checked");

  if (checkboxes.length > maxSelection) {
    event.target.checked = false;
    alert(`최대 ${maxSelection}개만 선택 가능합니다.`);
  }
}

/** 초기 조회 */
setItemList();
