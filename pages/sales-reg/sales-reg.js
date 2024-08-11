import { getItemName } from "../../util/get-item-name.js";
import { getUrlParams } from "../../util/get-url-params.js";
import { Button } from "../../components/Button.js";
import { CodeHelp } from "../../components/CodeHelp.js";

/** URL 파라미터 */
const params = getUrlParams();

/** 로컬 스토리지에서 판매 리스트 가져오기 */
const salesList = JSON.parse(window.localStorage.getItem("sales-list")) || [];

/** 저장된 판매 항목 필터링 */
const savedSale =
  salesList.find((sale) => sale.slipCode === params["slip-code"]) || null;

/** 업데이트 모드 확인 */
const isUpdate = params["update"]
  ? JSON.parse(params["update"].toLowerCase())
  : false;

/** 판매 항목 요소들 */
const slipDate = document.getElementById("slip-date");
const itemInput = document.getElementById("item-input");
const qty = document.getElementById("qty");
const price = document.getElementById("price");
const description = document.getElementById("description");

/** CodeHelp 인스턴스 생성 */
const itemCodeHelp = new CodeHelp({
  inputId: "item-input",
  helpDivId: "item-code-help",
  maxItems: 1,
  mode: "item",
  searchFunction: (searchTerm) => {
    const itemList = JSON.parse(window.localStorage.getItem("item-list")) || [];
    return itemList.filter((item) =>
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
});

/** 버튼 생성 */
const saveBtn = new Button({
  label: "저장",
  onClick: clickSaveBtnHandler,
  className: "blue-btn",
  id: "save-btn",
}).render();

const delBtn = new Button({
  label: "삭제",
  onClick: clickDelBtnHandler,
  id: "del-btn",
}).render();

const reBtn = new Button({
  label: "다시작성",
  onClick: init,
  id: "re-btn",
}).render();

const closeBtn = new Button({
  label: "닫기",
  onClick: () => window.close(),
  id: "close-btn",
}).render();

document
  .getElementById("button-container")
  .append(saveBtn, delBtn, reBtn, closeBtn);

/** 업데이트 모드 설정 */
if (isUpdate) {
  document.getElementById("web-title").textContent = "판매수정";
  document.getElementById("title").textContent = "🐱 판매수정";
  slipDate.type = "text";
  slipDate.value = savedSale.slipCode;
  slipDate.disabled = true;
} else {
  delBtn.style.display = "none";
}

/** 저장 버튼 클릭 핸들러 */
function clickSaveBtnHandler() {
  if (
    !slipDate.value ||
    !document.querySelector("#item-code-help span") ||
    !qty.value ||
    !price.value ||
    !description.value
  ) {
    alert("내용을 입력해주세요.");
    return;
  }

  const itemCode = document.querySelector("#item-code-help span").dataset
    .itemCode;

  if (isUpdate) {
    try {
      const formData = {
        slipCode: savedSale.slipCode,
        slipDate: savedSale.slipDate,
        itemCode,
        qty: qty.value,
        price: price.value,
        description: description.value,
        date: new Date(),
      };

      const existingIndex = salesList.findIndex(
        (sale) => sale.slipCode === savedSale.slipCode
      );

      if (existingIndex !== -1) {
        salesList[existingIndex] = formData;
      }

      window.localStorage.setItem("sales-list", JSON.stringify(salesList));

      alert("저장되었습니다.");

      if (window.opener && !window.opener.closed) {
        window.opener.fetchAndCacheSalesList();
      }

      window.close();
    } catch (error) {
      console.error(error);
    }
  } else {
    try {
      const slipDate2 = new Date(slipDate.value);

      let maxNo = 0;

      salesList.forEach((sale) => {
        const savedSlipDate = new Date(sale.slipDate);

        if (
          savedSlipDate.getFullYear() === slipDate2.getFullYear() &&
          savedSlipDate.getMonth() === slipDate2.getMonth() &&
          savedSlipDate.getDate() === slipDate2.getDate()
        ) {
          const idx = sale.slipCode.lastIndexOf("-");
          maxNo =
            maxNo < parseInt(sale.slipCode.slice(idx + 1), 10)
              ? parseInt(sale.slipCode.slice(idx + 1), 10)
              : maxNo;
        }
      });

      const formData = {
        slipCode: slipDate.value + "-" + (maxNo + 1),
        slipDate: slipDate.value,
        itemCode,
        qty: qty.value,
        price: price.value,
        description: description.value,
        date: new Date(),
      };

      salesList.push(formData);

      window.localStorage.setItem("sales-list", JSON.stringify(salesList));

      alert("저장되었습니다.");

      if (window.opener && !window.opener.closed) {
        window.opener.fetchAndCacheSalesList();
      }

      window.close();
    } catch (error) {
      console.error(error);
    }
  }
}

/** 삭제 버튼 클릭 핸들러 */
function clickDelBtnHandler() {
  if (!isUpdate) return;

  try {
    const updatedSalesList = salesList.filter((sale) => {
      return sale.slipCode !== savedSale.slipCode;
    });

    window.localStorage.setItem("sales-list", JSON.stringify(updatedSalesList));
    if (window.opener && !window.opener.closed)
      window.opener.fetchAndCacheSalesList();
    alert("삭제되었습니다.");
    window.close();
  } catch (error) {
    console.error(error);
  }
}

/** 초기화 함수 */
function init() {
  if (isUpdate) {
    const itemName =
      JSON.parse(window.localStorage.getItem("item-list")).find(
        (item) => item.itemCode === savedSale.itemCode
      )?.itemName || "";

    itemCodeHelp.clear();
    itemCodeHelp.addItem({
      itemCode: savedSale.itemCode,
      itemName: itemName,
    });

    qty.value = savedSale.qty;
    price.value = savedSale.price;
    description.value = savedSale.description;
  } else {
    slipDate.value = "";
    itemInput.value = "";
    qty.value = "";
    price.value = "";
    description.value = "";
  }
}

/** 닫기 버튼 클릭 핸들러 */
document.getElementById("close-btn").onclick = () => {
  window.close();
};

/** 품목 조회 조건의 품목 아이템 클릭 시 삭제 */
function inputItemDelete() {
  const outBtnList = document.querySelectorAll(".item-out-btn");

  outBtnList.forEach((outBtn) => {
    outBtn.onclick = () => {
      outBtn.parentNode.remove();
    };
  });
}

window.inputItemDelete = inputItemDelete;

/** 초기화 호출 */
init();
