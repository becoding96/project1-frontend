import { getUrlParams } from "./get-url-params.js";

const params = getUrlParams();

const savedItem = {
  itemCode: params["item-code"],
  itemName: params["item-name"],
};

const isSaved = params["save"]
  ? JSON.parse(params["save"].toLowerCase())
  : false;
const isUpdate = params["update"]
  ? JSON.parse(params["update"].toLowerCase())
  : false;

const itemCode = document.getElementById("item-code");
const itemName = document.getElementById("item-name");
const saveBtn = document.getElementById("save-btn");
const delBtn = document.getElementById("del-btn");
const reBtn = document.getElementById("re-btn");
const closeBtn = document.getElementById("close-btn");

function init() {
  if (isSaved) {
    itemCode.value = savedItem.itemCode;
    itemName.value = savedItem.itemName;
  }
}

init();

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

function clickSaveBtnHandler() {
  let formData = {
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

saveBtn.addEventListener("click", clickSaveBtnHandler);
delBtn.addEventListener("click", clickDelBtnHandler);
reBtn.addEventListener("click", init);
closeBtn.addEventListener("click", () => window.close());

const webTitle = document.getElementById("web-title");
const title = document.getElementById("title");

// 신규
if (!isSaved && !isUpdate) {
  delBtn.style.display = "none";
  // 품목 조회
} else if (isSaved && !isUpdate) {
  saveBtn.style.display = "none";
  delBtn.style.display = "none";
  reBtn.style.display = "none";
  webTitle.textContent = "품목상세";
  title.textContent = "🐱 품목상세";
  itemCode.disabled = true;
  itemName.disabled = true;
  // 수정
} else if (isSaved && isUpdate) {
  webTitle.textContent = "품목수정";
  title.textContent = "🐱 품목수정";
  itemCode.disabled = true;
}
