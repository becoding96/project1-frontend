import { getItemName } from "../../util/get-item-name.js";
import { getUrlParams } from "../../util/get-url-params.js";
import { openPopup } from "../../util/open-pop-up.js";
import { Button } from "../../components/Button.js";

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
const custInput = document.getElementById("cust-input");
const qty = document.getElementById("qty");
const price = document.getElementById("price");
const description = document.getElementById("description");
const itemCode = document.getElementById("item-code");
const custCode = document.getElementById("cust-code");

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

/** 품목 입력 이벤트 리스너 추가 */
itemInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    openPopup(
      "../item-list/item-list.html",
      900,
      600,
      `search=${encodeURIComponent(itemInput.value)}`
    );
  }
});

itemInput.addEventListener("dblclick", () => {
  openPopup("../item-list/item-list.html", 900, 600, "");
});

/** 거래처 입력 이벤트 리스너 추가 */
custInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    openPopup(
      "../cust-list/cust-list.html",
      800,
      600,
      `search=${encodeURIComponent(custInput.value)}`
    );
  }
});

custInput.addEventListener("dblclick", () => {
  openPopup("../cust-list/cust-list.html", 800, 600, "");
});

/** 업데이트 모드 설정 */
if (isUpdate) {
  document.getElementById("web-title").textContent = "판매수정";
  document.getElementById("title").textContent = "🐱 판매수정";
  slipDate.type = "text";
  slipDate.value = savedSale.slipCode;
  slipDate.disabled = true;

  const itemName =
    JSON.parse(window.localStorage.getItem("item-list")).find(
      (item) => item.itemCode === savedSale.itemCode
    )?.itemName || "";

  const custName =
    JSON.parse(window.localStorage.getItem("cust-list")).find(
      (cust) => cust.custCode === savedSale.custCode
    )?.custName || "";

  itemInput.value = `${savedSale.itemCode} (${itemName})`;
  custInput.value = `${savedSale.custCode} (${custName})`;
  itemCode.value = savedSale.itemCode;
  custCode.value = savedSale.custCode;
  qty.value = savedSale.qty;
  price.value = savedSale.price;
  description.value = savedSale.description;
} else {
  delBtn.style.display = "none";
}

/** 저장 버튼 클릭 핸들러 */
function clickSaveBtnHandler() {
  if (
    !slipDate.value ||
    !itemCode.value ||
    !custCode.value ||
    !qty.value ||
    !price.value ||
    !description.value
  ) {
    alert("내용을 입력해주세요.");
    return;
  }

  if (isUpdate) {
    try {
      const formData = {
        slipCode: savedSale.slipCode,
        slipDate: savedSale.slipDate,
        itemCode: itemCode.value,
        custCode: custCode.value,
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
        itemCode: itemCode.value,
        custCode: custCode.value,
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
    slipDate.value = savedSale.slipDate;
    itemInput.value = `${getItemName(savedSale.itemCode)} (${
      savedSale.itemCode
    })`;
    itemCode.value = savedSale.itemCode;
    const custName =
      JSON.parse(window.localStorage.getItem("cust-list")).find(
        (cust) => cust.custCode === savedSale.custCode
      )?.custName || "";
    custInput.value = `${savedSale.custCode} (${custName})`;
    custCode.value = savedSale.custCode;
    qty.value = savedSale.qty;
    price.value = savedSale.price;
    description.value = savedSale.description;
  } else {
    slipDate.value = "";
    itemInput.value = "";
    itemCode.value = "";
    custInput.value = "";
    custCode.value = "";
    qty.value = "";
    price.value = "";
    description.value = "";
  }
}

/** 닫기 버튼 클릭 핸들러 */
document.getElementById("close-btn").onclick = () => {
  window.close();
};

/** 초기화 호출 */
init();
