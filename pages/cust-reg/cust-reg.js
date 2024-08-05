import { getUrlParams } from "../../util/get-url-params.js";
import { Button } from "../../components/Button.js";

/** 쿼리 params */
const params = getUrlParams();

/** 저장된 아이템 */
const savedCust = {
  custCode: params["cust-code"],
  custName: params["cust-name"],
};

/** 저장 및 수정 여부 확인 */
const isSaved = params["save"]
  ? JSON.parse(params["save"].toLowerCase())
  : false;
const isUpdate = params["update"]
  ? JSON.parse(params["update"].toLowerCase())
  : false;

/** 거래처 코드, 명 */
const custCode = document.getElementById("cust-code");
const custName = document.getElementById("cust-name");
/** 페이지 타이틀 */
const webTitle = document.getElementById("web-title");
const title = document.getElementById("title");

/** 버튼 컴포넌트 생성 */
const saveBtn = new Button({
  label: "저장",
  onClick: clickSaveBtnHandler,
  className: "blue-btn",
  id: "save-btn",
}).render();

const delBtn = new Button({
  label: "삭제",
  onClick: clickDelBtnHandler,
  className: "",
  id: "del-btn",
}).render();

const reBtn = new Button({
  label: "다시작성",
  onClick: init,
  className: "",
  id: "re-btn",
}).render();

const closeBtn = new Button({
  label: "닫기",
  onClick: () => window.close(),
  className: "",
  id: "close-btn",
}).render();

document.querySelector(".btn-div").append(saveBtn, delBtn, reBtn, closeBtn);

/** 신규 */
if (!isSaved && !isUpdate) {
  delBtn.style.display = "none";
  /** 거래처 조회 */
} else if (isSaved && !isUpdate) {
  saveBtn.style.display = "none";
  delBtn.style.display = "none";
  reBtn.style.display = "none";
  webTitle.textContent = "거래처상세";
  title.textContent = "🐱 거래처상세";
  custCode.disabled = true;
  custName.disabled = true;
  /** 수정 */
} else if (isSaved && isUpdate) {
  webTitle.textContent = "거래처수정";
  title.textContent = "🐱 거래처수정";
  custCode.disabled = true;
}

/** 초기화 함수 */
function init() {
  if (isSaved) {
    custCode.value = savedCust.custCode;
    custName.value = savedCust.custName;
  } else {
    custCode.value = "";
    custName.value = "";
  }
}

/** 삭제 버튼 핸들러 */
function clickDelBtnHandler() {
  if (isUpdate) {
    const custList = JSON.parse(window.localStorage.getItem("cust-list")) || [];
    const salesList =
      JSON.parse(window.localStorage.getItem("sales-list")) || [];

    for (let i = 0; i < salesList.length; i++) {
      if (salesList[i].custCode === custCode.value) {
        alert("판매에 등록된 거래처은 삭제 불가능합니다.");
        return;
      }
    }

    const updatedList = custList.filter(
      (cust) => cust.custCode !== custCode.value
    );

    window.localStorage.setItem("cust-list", JSON.stringify(updatedList));
    alert("삭제되었습니다.");
    if (window.opener && !window.opener.closed) {
      window.opener.fetchAndCacheCustList();
    }
    window.close();
  }
}

/** 저장 버튼 핸들러 */
function clickSaveBtnHandler() {
  const formData = {
    custCode: custCode.value,
    custName: custName.value,
    date: new Date(),
  };

  try {
    if (custCode.value && custName.value && formData) {
      const custList =
        JSON.parse(window.localStorage.getItem("cust-list")) || [];
      const existingIndex = custList.findIndex(
        (cust) => cust.custCode === custCode.value
      );

      if (isUpdate && existingIndex !== -1) {
        custList[existingIndex] = formData;
      } else if (!isUpdate && existingIndex !== -1) {
        alert("중복된 코드명입니다.");
        return;
      } else {
        custList.push(formData);
      }

      window.localStorage.setItem("cust-list", JSON.stringify(custList));
      alert("저장되었습니다.");
      if (window.opener && !window.opener.closed) {
        window.opener.fetchAndCacheCustList();
      }
      window.close();
    } else {
      throw new Error("Invalid input data");
    }
  } catch (error) {
    alert("내용을 입력해주세요.");
    console.error("Error:", error);
  }
}

/** 초기화 호출 */
init();
