import { getItemName } from "../../util/get-item-name.js";
import { getUrlParams } from "../../util/get-url-params.js";
import { openPopup } from "../../util/open-pop-up.js";

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
const itemCode = document.getElementById("item-code");
const delBtn = document.getElementById("del-btn");

/** 품목 입력 이벤트 리스너 추가 */
itemInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    openPopup(
      "../item-list/item-list.html",
      800,
      600,
      `search=${encodeURIComponent(itemInput.value)}`
    );
  }
});

itemInput.addEventListener("dblclick", () => {
  openPopup("../item-list/item-list.html", 800, 600, "");
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

  itemInput.value = `${savedSale.itemCode} (${itemName})`;
  itemCode.value = savedSale.itemCode;
  qty.value = savedSale.qty;
  price.value = savedSale.price;
  description.value = savedSale.description;
} else {
  delBtn.style.display = "none";
}

/** 저장 버튼 클릭 핸들러 */
document.getElementById("save-btn").onclick = function () {
  if (isUpdate) {
    try {
      const formData = {
        slipCode: savedSale.slipCode,
        slipDate: savedSale.slipDate,
        itemCode: itemCode.value,
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
        window.opener.setSalesList();
      }

      window.close();
    } catch (error) {
      alert("오류가 발생했습니다.");
    }
  } else {
    try {
      const slipDate2 = new Date(slipDate.value);

      const count = salesList.reduce((count, sale) => {
        const savedSlipDate = new Date(sale.slipDate);

        if (
          savedSlipDate.getFullYear() === slipDate2.getFullYear() &&
          savedSlipDate.getMonth() === slipDate2.getMonth() &&
          savedSlipDate.getDate() === slipDate2.getDate()
        ) {
          return count + 1;
        }

        return count;
      }, 1);

      const formData = {
        slipCode: slipDate.value + "-" + count,
        slipDate: slipDate.value,
        itemCode: itemCode.value,
        qty: qty.value,
        price: price.value,
        description: description.value,
        date: new Date(),
      };

      salesList.push(formData);

      window.localStorage.setItem("sales-list", JSON.stringify(salesList));

      alert("저장되었습니다.");

      if (window.opener && !window.opener.closed) {
        window.opener.setSalesList();
      }

      window.close();
    } catch (error) {
      alert("오류가 발생했습니다.");
    }
  }
};

/** 다시 작성 버튼 클릭 핸들러 */
document.getElementById("re-btn").onclick = () => {
  if (isUpdate) {
    slipDate.value = savedSale.slipDate;
    itemInput.value = `${getItemName(savedSale.itemCode)} (${
      savedSale.itemCode
    })`;
    itemCode.value = savedSale.itemCode;
    qty.value = savedSale.qty;
    price.value = savedSale.price;
    description.value = savedSale.description;
  } else {
    slipDate.value = "";
    itemInput.value = "";
    itemCode.value = "";
    qty.value = "";
    price.value = "";
    description.value = "";
  }
};

/** 닫기 버튼 클릭 핸들러 */
document.getElementById("close-btn").onclick = () => {
  window.close();
};
