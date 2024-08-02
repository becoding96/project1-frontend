import { getUrlParams } from "./get-url-params.js";

const params = getUrlParams();

const savedItemRaw = window.localStorage.getItem(params["item-code"]);
const savedItem = savedItemRaw ? JSON.parse(savedItemRaw) : null;

const isSaved = savedItem !== null && Object.keys(params).length > 0;
const isUpdate = params["update"]
  ? JSON.parse(params["update"].toLowerCase())
  : false;

console.log(isSaved, isUpdate);

const itemCode = document.getElementById("item-code");
const itemName = document.getElementById("item-name");
const saveBtn = document.getElementById("save-btn");
const delBtn = document.getElementById("del-btn");
const reBtn = document.getElementById("re-btn");
const closeBtn = document.getElementById("close-btn");

let formData = {
  itemCode: "",
  itemName: "",
};

function init() {
  if (isSaved) {
    itemCode.value = savedItem.itemCode;
    itemName.value = savedItem.itemName;
    formData.itemCode = savedItem.itemCode;
    formData.itemName = savedItem.itemName;
  } else {
    itemCode.value = "";
    itemName.value = "";
    formData.itemCode = "";
    formData.itemName = "";
  }
}

init();

function inputItemHandler() {
  if (!isSaved && !isUpdate) formData.itemCode = itemCode.value;
  formData.itemName = itemName.value;
}

reBtn.addEventListener("click", init);

function clickDelBtnHandler() {
  if (isUpdate) {
    window.localStorage.removeItem(itemCode.value);
    alert("삭제되었습니다.");
    if (window.opener && !window.opener.closed) {
      window.opener.setItemData();
    }
    window.close();
  } else {
    alert("잘못된 접근입니다.");
  }
}

delBtn.addEventListener("click", clickDelBtnHandler);

closeBtn.addEventListener("click", () => window.close());

// 신규
if (!isSaved && !isUpdate) {
  delBtn.style.display = "none";

  itemCode.addEventListener("input", inputItemHandler);
  itemName.addEventListener("input", inputItemHandler);

  function clickSaveBtnHandler() {
    try {
      if (itemCode.value && formData) {
        window.localStorage.setItem(itemCode.value, JSON.stringify(formData));
        alert("저장되었습니다.");
        if (window.opener && !window.opener.closed) {
          window.opener.setItemData();
        }
        window.close();
      } else {
        throw new Error("Invalid input data");
      }
    } catch (error) {
      alert("오류가 발생했습니다.");
      console.error("Error:", error);
    }

    itemCode.value = null;
    itemName.value = null;
    formData.itemCode = "";
    formData.itemName = "";
  }

  saveBtn.addEventListener("click", clickSaveBtnHandler);
  // 품목 조회
} else if (isSaved && !isUpdate) {
  saveBtn.style.display = "none";
  delBtn.style.display = "none";
  reBtn.style.display = "none";

  const webTitle = document.getElementById("web-title");
  const title = document.getElementById("title");
  webTitle.textContent = "품목상세";
  title.textContent = "🐱 품목상세";
  itemCode.disabled = true;
  itemName.disabled = true;
  // 수정
} else if (isSaved && isUpdate) {
  const webTitle = document.getElementById("web-title");
  const title = document.getElementById("title");
  webTitle.textContent = "품목수정";
  title.textContent = "🐱 품목수정";
  itemCode.disabled = true;

  function banInputItemHandler() {
    alert("품목 코드는 수정 불가합니다.");
    return;
  }

  itemCode.addEventListener("input", banInputItemHandler);
  itemName.addEventListener("input", inputItemHandler);

  function clickSaveBtnHandler() {
    try {
      if (itemCode.value && formData) {
        window.localStorage.setItem(itemCode.value, JSON.stringify(formData));
        savedItem.itemName = itemName.value;
        alert("저장되었습니다.");
        if (window.opener && !window.opener.closed) {
          window.opener.setItemData();
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

  saveBtn.addEventListener("click", clickSaveBtnHandler);
}
