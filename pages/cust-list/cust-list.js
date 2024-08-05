import { Button } from "../../components/Button.js";
import { getUrlParams } from "../../util/get-url-params.js";
import { openPopup } from "../../util/open-pop-up.js";

/** 페이지네이션 변수 */
let currentPage = 1;
const custsPerPage = 10;
let cachedCustList = [];

/** 쿼리 params */
const params = getUrlParams();

/** 조회 조건 설정 */
const searchCustCode = document.getElementById("search-cust-code");
const searchCustName = document.getElementById("search-cust-name");
searchCustCode.value = params.search || "";

/** 버튼 생성 */
const searchBtn = new Button({
  label: "검색",
  onClick: () => {
    currentPage = 1;
    fetchAndCacheCustList();
  },
  className: "blue-btn",
  id: "search-btn",
}).render();

const prevBtn = new Button({
  label: "이전",
  onClick: () => {
    if (currentPage > 1) {
      currentPage--;
      renderCustList();
    }
  },
  id: "prev-btn",
}).render();

const nextBtn = new Button({
  label: "다음",
  onClick: () => {
    const totalPages = Math.ceil(cachedCustList.length / custsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderCustList();
    }
  },
  id: "next-btn",
}).render();

const applyBtn = new Button({
  label: "적용",
  onClick: () => {
    if (
      window.opener &&
      window.opener.location.href.includes("sales-reg.html")
    ) {
      const selectedCheckbox = document.querySelector(".cust-checkbox:checked");

      if (selectedCheckbox) {
        const custCode = selectedCheckbox.dataset.custCode;
        const custName = selectedCheckbox.dataset.custName;
        window.opener.document.getElementById(
          "cust-input"
        ).value = `${custName} (${custCode})`;
        window.opener.document.getElementById("cust-code").value = custCode;
        window.opener.fetchAndCacheSalesList();
        window.close();
      } else {
        alert("거래처를 선택해주세요.");
      }
    } else {
      const selectedCheckboxList = document.querySelectorAll(
        ".cust-checkbox:checked"
      );

      if (selectedCheckboxList) {
        const custDiv = window.opener.document.getElementById("cust-div");
        custDiv.innerHTML = "";

        const custCodeDiv =
          window.opener.document.getElementById("cust-code-div");
        custCodeDiv.innerHTML = "";

        selectedCheckboxList.forEach((selectedCheckbox) => {
          const custCode = selectedCheckbox.dataset.custCode;
          const custName = selectedCheckbox.dataset.custName;

          const custSpan = document.createElement("span");
          custSpan.textContent = `${custName} (${custCode})`;
          const custCodeSpan = document.createElement("span");
          custCodeSpan.textContent = custCode;

          const outBtn = document.createElement("span");
          outBtn.textContent = "🗑️";
          outBtn.classList.add("cust-out-btn", "out-btn");
          outBtn.dataset.custCode = custCode;

          custSpan.appendChild(outBtn);
          custDiv.appendChild(custSpan);
          custCodeDiv.appendChild(custCodeSpan);
        });

        window.opener.searchCustDelete();
        window.opener.fetchAndCacheSalesList();
        window.close();
      } else {
        alert("거래처를 선택해주세요.");
      }
    }
  },
  className: "blue-btn",
  id: "apply-btn",
}).render();

const newBtn = new Button({
  label: "신규",
  onClick: () => {
    openPopup("../cust-reg/cust-reg.html", 650, 200, `save=false&update=false`);
  },
  id: "new-btn",
}).render();

const closeBtn = new Button({
  label: "닫기",
  onClick: () => window.close(),
  id: "close-btn",
}).render();

document.getElementById("search-btn-div").appendChild(searchBtn);
document.getElementById("next-prev-btn-div").append(prevBtn, nextBtn);
document.getElementById("func-btn-div").append(applyBtn, newBtn, closeBtn);

/** 조건에 맞는 거래처 리스트 불러오기 */
function fetchAndCacheCustList() {
  let custList = JSON.parse(window.localStorage.getItem("cust-list")) || [];

  cachedCustList = custList.filter((cust) => {
    return (
      (!searchCustCode.value ||
        cust.custCode
          .toLowerCase()
          .indexOf(searchCustCode.value.toLowerCase()) !== -1) &&
      (!searchCustName.value ||
        cust.custName
          .toLowerCase()
          .indexOf(searchCustName.value.toLowerCase()) !== -1)
    );
  });

  renderCustList();
}

/** 필터링된 거래처 리스트 렌더링 */
function renderCustList() {
  const custDiv = document.getElementById("cust-div");
  custDiv.innerHTML = "";

  const startIndex = (currentPage - 1) * custsPerPage;
  const endIndex = Math.min(startIndex + custsPerPage, cachedCustList.length);

  /** 데이터가 하나도 없으면 이전 페이지로 */
  /** 삭제 이후 렌더링 로직 */
  if (startIndex === endIndex) {
    if (currentPage > 1) {
      currentPage--;
      renderCustList();
    }
    return;
  }

  for (let i = startIndex; i < endIndex; i++) {
    const cust = cachedCustList[i];

    const td1 = document.createElement("td");
    const input1 = document.createElement("input");
    input1.type = "checkbox";
    input1.classList.add("cust-checkbox");
    input1.dataset.custCode = cust.custCode;
    input1.dataset.custName = cust.custName;
    input1.addEventListener("change", handleCheckboxChange);
    td1.appendChild(input1);
    td1.classList.add("center");

    const td2 = document.createElement("td");
    const a1 = document.createElement("a");
    a1.href = "#";
    a1.textContent = cust.custCode;
    a1.onclick = function () {
      openPopup(
        "../cust-reg/cust-reg.html",
        650,
        200,
        `cust-code=${cust.custCode}&cust-name=${cust.custName}&save=true&update=false`
      );
    };
    td2.appendChild(a1);

    const td3 = document.createElement("td");
    td3.textContent = cust.custName;

    const td4 = document.createElement("td");
    const a2 = document.createElement("a");
    a2.href = "#";
    a2.textContent = "수정";
    a2.onclick = function () {
      openPopup(
        "../cust-reg/cust-reg.html",
        650,
        200,
        `cust-code=${cust.custCode}&cust-name=${cust.custName}&save=true&update=true`
      );
    };
    td4.appendChild(a2);
    td4.classList.add("center");

    const tr = document.createElement("tr");
    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);

    custDiv.append(tr);
  }

  document.getElementById("prev-btn").disabled = currentPage === 1;
  document.getElementById("next-btn").disabled =
    endIndex >= cachedCustList.length;
}

/** 거래처 등록에서 사용할 수 있도록 전역화 */
window.fetchAndCacheCustList = fetchAndCacheCustList;
window.renderCustList = renderCustList;

/** 체크박스 개수 통제 */
function handleCheckboxChange(event) {
  const maxSelection =
    window.opener && window.opener.location.href.includes("sales-reg.html")
      ? 1
      : 3;
  const checkboxes = document.querySelectorAll(".cust-checkbox:checked");

  if (checkboxes.length > maxSelection) {
    event.target.checked = false;
    alert(`최대 ${maxSelection}개만 선택 가능합니다.`);
  }
}

/** 초기 조회 */
fetchAndCacheCustList();
