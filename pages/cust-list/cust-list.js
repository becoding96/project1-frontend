import { Button } from "../../components/Button.js";
import { HomeButton } from "../../components/HomeButton.js";
import { getUrlParams } from "../../util/get-url-params.js";
import { openPopup } from "../../util/open-pop-up.js";
import { usePagination } from "../../hooks/usePagination.js";

let cachedCustList = [];
const selectedIndices = new Set();
const itemsPerPage = 10;
let pagination;

/** 쿼리 params */
const params = getUrlParams();
const isSalesReg =
  window.opener && window.opener.location.href.includes("sales-reg.html");
const isSalesList =
  window.opener && window.opener.location.href.includes("sales-list.html");

/** 조회 조건 설정 */
const searchCustCode = document.getElementById("search-cust-code");
const searchCustName = document.getElementById("search-cust-name");
searchCustCode.value = params.search || "";

/** 버튼 생성 */
const searchBtn = new Button({
  label: "검색",
  onClick: () => {
    pagination.reset();
    fetchAndCacheCustList();
  },
  className: "blue-btn",
  id: "search-btn",
}).render();

const firstBtn = new Button({
  label: "<<",
  onClick: () => {
    pagination.setPage(1);
    renderCustList();
  },
  className: "page-btn",
  id: "first-btn",
}).render();

const prevBtn = new Button({
  label: "<",
  onClick: () => {
    pagination.prevPage();
    renderCustList();
  },
  className: "page-btn",
  id: "prev-btn",
}).render();

const nextBtn = new Button({
  label: ">",
  onClick: () => {
    pagination.nextPage();
    renderCustList();
  },
  className: "page-btn",
  id: "next-btn",
}).render();

const lastBtn = new Button({
  label: ">>",
  onClick: () => {
    pagination.setPage(pagination.getTotalPages());
    renderCustList();
  },
  className: "page-btn",
  id: "last-btn",
}).render();

const applyBtn = new Button({
  label: "적용",
  onClick: () => {
    const selectedCusts = Array.from(selectedIndices).map(
      (index) => cachedCustList[index]
    );

    if (isSalesReg) {
      if (selectedCusts.length === 1) {
        const cust = selectedCusts[0];
        const custCode = cust.custCode;
        const custName = cust.custName;
        window.opener.document.getElementById(
          "cust-input"
        ).value = `${custName} (${custCode})`;
        window.opener.document.getElementById("cust-code").value = custCode;
        window.close();
      } else {
        alert("거래처를 선택해주세요.");
      }
    } else {
      if (selectedCusts.length > 0) {
        const custDiv = window.opener.document.getElementById("cust-div");
        custDiv.innerHTML = "";

        const custCodeDiv =
          window.opener.document.getElementById("cust-code-div");
        custCodeDiv.innerHTML = "";

        selectedCusts.forEach((cust) => {
          const custCode = cust.custCode;
          const custName = cust.custName;

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

const checkDelBtn = new Button({
  label: "선택삭제",
  onClick: () => {
    const updatedCustList = cachedCustList.filter(
      (cust, index) => !selectedIndices.has(index)
    );

    cachedCustList = updatedCustList;
    selectedIndices.clear();
    window.localStorage.setItem("cust-list", JSON.stringify(updatedCustList));
    alert("선택된 항목이 삭제되었습니다.");

    document.querySelector(
      ".table2 thead input[type='checkbox']"
    ).checked = false;

    fetchAndCacheCustList();
  },
  id: "check-del-btn",
}).render();

document.getElementById("search-btn-div").appendChild(searchBtn);
document.getElementById("next-prev-btn-div").append(prevBtn, nextBtn);
document
  .getElementById("func-btn-div")
  .append(applyBtn, newBtn, checkDelBtn, closeBtn);

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

  const oldPage = pagination ? pagination.getCurrentPage() : 1;
  pagination = usePagination(cachedCustList, itemsPerPage);
  pagination.setPage(oldPage);
  renderCustList();
}

/** 필터링된 거래처 리스트 렌더링 */
function renderCustList() {
  const custDiv = document.getElementById("cust-div");
  custDiv.innerHTML = "";

  const paginatedData = pagination.getPaginatedData();

  paginatedData.forEach((cust, i) => {
    const tr = document.createElement("tr");

    const td1 = document.createElement("td");
    const input1 = document.createElement("input");
    input1.type = "checkbox";
    input1.classList.add("cust-checkbox");
    input1.dataset.index = pagination.getCurrentPageIndex(i);
    input1.dataset.custCode = cust.custCode;
    input1.dataset.custName = cust.custName;
    input1.checked = selectedIndices.has(pagination.getCurrentPageIndex(i));
    input1.addEventListener("change", (event) => {
      const index = parseInt(event.target.dataset.index, 10);
      if (event.target.checked) {
        if (isSalesReg && selectedIndices.size >= 1) {
          event.target.checked = false;
          alert("최대 1개만 선택 가능합니다.");
        } else if (isSalesList && selectedIndices.size >= 3) {
          event.target.checked = false;
          alert("최대 3개만 선택 가능합니다.");
        } else {
          selectedIndices.add(index);
        }
      } else {
        selectedIndices.delete(index);
      }
    });
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

    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);

    custDiv.append(tr);
  });

  const headerCheckbox = document.querySelector(
    ".table2 thead input[type='checkbox']"
  );
  headerCheckbox.onclick = (event) => {
    const checkboxes = document.querySelectorAll(
      ".table2 tbody input[type='checkbox']"
    );
    checkboxes.forEach((checkbox) => {
      const index = parseInt(checkbox.dataset.index, 10);
      checkbox.checked = event.target.checked;
      if (event.target.checked) {
        selectedIndices.add(index);
      } else {
        selectedIndices.delete(index);
      }
    });
  };

  if (isSalesReg || isSalesList) {
    headerCheckbox.disabled = true;
  } else {
    document.getElementById("apply-btn").style.display = "none";
    document.getElementById("close-btn").style.display = "none";
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
        renderCustList();
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

/** 거래처 등록에서 사용할 수 있도록 전역화 */
window.fetchAndCacheCustList = fetchAndCacheCustList;
window.renderCustList = renderCustList;

/** 초기 조회 */
fetchAndCacheCustList();

/** 홈 버튼 렌더링 */
if (!isSalesReg && !isSalesList) {
  const homeButton = new HomeButton();
  homeButton.render();
}
