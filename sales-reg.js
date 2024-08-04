import { getUrlParams } from "./get-url-params.js";

const params = getUrlParams();

const savedSaleRaw = window.localStorage.getItem(params["slip-code"]);
const savedSale = savedSaleRaw ? JSON.parse(savedSaleRaw) : null;

const isUpdate = params["update"]
  ? JSON.parse(params["update"].toLowerCase())
  : false;

const slipDate = document.getElementById("slip-date");
const itemInput = document.getElementById("item-input");
const qty = document.getElementById("qty");
const price = document.getElementById("price");
const description = document.getElementById("description");
const itemCode = document.getElementById("item-code");
const delBtn = document.getElementById("del-btn");

function openPopup(searchTerm) {
  const popupUrl = `item-list.html?search=${encodeURIComponent(searchTerm)}`;
  window.open(popupUrl, "_blank", "width=800, height=600");
}

itemInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    openPopup(itemInput.value);
  }
});

itemInput.addEventListener("dblclick", () => {
  openPopup("");
});

if (isUpdate) {
} else {
  delBtn.style.display = "none";
}

document.getElementById("save-btn").onclick = function () {
  if (isUpdate) {
  } else {
    try {
      const slipDate2 = new Date(slipDate.value);
      const salesList =
        JSON.parse(window.localStorage.getItem("sales-list")) || [];

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
        silpCode: slipDate.value + "-" + count,
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

document.getElementById("re-btn").onclick = () => {};

document.getElementById("close-btn").onclick = () => {
  window.close();
};
