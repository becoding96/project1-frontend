// 아이템 리스트
function getItemData() {
  let itemData = {};

  for (let i = 0; i < window.localStorage.length; i++) {
    let key = window.localStorage.key(i);
    if (key.indexOf("ITEM") === -1) continue;
    let value = window.localStorage.getItem(key);

    try {
      value = JSON.parse(value);
    } catch (e) {}

    itemData[key] = value;
  }

  return itemData;
}

// 조회 공간
function setItemData() {
  const itemData = getItemData();

  const itemDiv = document.getElementById("item-div");
  itemDiv.innerHTML = "";

  for (let itemKey in itemData) {
    const item = itemData[itemKey];

    const td1 = document.createElement("td");
    const input1 = document.createElement("input");
    input1.type = "checkbox";
    td1.appendChild(input1);
    td1.classList.add("center");

    const td2 = document.createElement("td");
    const a1 = document.createElement("a");
    a1.href = "#";
    a1.textContent = item.itemCode;
    a1.onclick = function () {
      openPopup("item-reg.html", item.itemCode, false);
    };
    td2.appendChild(a1);

    const td3 = document.createElement("td");
    td3.textContent = item.itemName;

    const td4 = document.createElement("td");
    const a2 = document.createElement("a");
    a2.href = "#";
    a2.textContent = "수정";
    a2.onclick = function () {
      openPopup("item-reg.html", item.itemCode, true);
    };
    td4.appendChild(a2);
    td4.classList.add("center");

    const tr = document.createElement("tr");
    tr.append(td1);
    tr.append(td2);
    tr.append(td3);
    tr.append(td4);

    itemDiv.append(tr);
  }
}

window.setItemData = setItemData;

setItemData();

const newBtn = document.getElementById("new-btn");
newBtn.onclick = function () {
  openPopup("item-reg.html", "", false);
};

function openPopup(url, itemCode, isUpdate) {
  const popupUrl = `${url}?item-code=${itemCode}&update=${isUpdate}`;
  window.open(popupUrl, "_blank", "width=650,height=200");
}
