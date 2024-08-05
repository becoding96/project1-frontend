import { getUrlParams } from "../../util/get-url-params.js";
import { Button } from "../../components/Button.js";

/** 쿼리 params */
const params = getUrlParams();

/** 저장된 아이템 */
const savedItem = {
  itemCode: params["item-code"],
  itemName: params["item-name"],
};

/** 저장 및 수정 여부 확인 */
const isSaved = params["save"]
  ? JSON.parse(params["save"].toLowerCase())
  : false;
const isUpdate = params["update"]
  ? JSON.parse(params["update"].toLowerCase())
  : false;

/** 품목 코드, 명 */
const itemCode = document.getElementById("item-code");
const itemName = document.getElementById("item-name");
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
  /** 품목 조회 */
} else if (isSaved && !isUpdate) {
  saveBtn.style.display = "none";
  delBtn.style.display = "none";
  reBtn.style.display = "none";
  webTitle.textContent = "품목상세";
  title.textContent = "🐱 품목상세";
  itemCode.disabled = true;
  itemName.disabled = true;
  /** 수정 */
} else if (isSaved && isUpdate) {
  webTitle.textContent = "품목수정";
  title.textContent = "🐱 품목수정";
  itemCode.disabled = true;
}

/** 초기화 함수 */
function init() {
  if (isSaved) {
    itemCode.value = savedItem.itemCode;
    itemName.value = savedItem.itemName;
  } else {
    itemCode.value = "";
    itemName.value = "";
  }
}

/** 삭제 버튼 핸들러 */
function clickDelBtnHandler() {
  if (isUpdate) {
    const itemList = JSON.parse(window.localStorage.getItem("item-list")) || [];
    const updatedList = itemList.filter(
      (item) => item.itemCode !== itemCode.value
    );
    window.localStorage.setItem("item-list", JSON.stringify(updatedList));
    alert("삭제되었습니다.");
    if (window.opener && !window.opener.closed) {
      window.opener.setItemList();
    }
    window.close();
  }
}

/** 저장 버튼 핸들러 */
function clickSaveBtnHandler() {
  const formData = {
    itemCode: itemCode.value,
    itemName: itemName.value,
    date: new Date(),
  };

  try {
    if (itemCode.value && formData) {
      const itemList =
        JSON.parse(window.localStorage.getItem("item-list")) || [];
      const existingIndex = itemList.findIndex(
        (item) => item.itemCode === itemCode.value
      );

      if (isUpdate && existingIndex !== -1) {
        itemList[existingIndex] = formData;
      } else if (!isUpdate && existingIndex !== -1) {
        alert("중복된 코드명입니다.");
        return;
      } else {
        itemList.push(formData);
      }

      window.localStorage.setItem("item-list", JSON.stringify(itemList));
      alert("저장되었습니다.");
      if (window.opener && !window.opener.closed) {
        window.opener.setItemList();
      }
      window.close();
    } else {
      throw new Error("Invalid input data");
    }
  } catch (error) {
    alert("오류가 발생했습니다.");
    console.error("Error:", error);
  }
}

/** 초기화 호출 */
init();
