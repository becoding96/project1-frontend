let currentPage = 1;
const itemsPerPage = 10;

function getItemData() {
  const searchItemCode = document.getElementById("search-item-code").value;
  const searchItemName = document.getElementById("search-item-name").value;

  let itemData = [];

  for (let i = 0; i < window.localStorage.length; i++) {
    let key = window.localStorage.key(i);
    if (key.indexOf("ITEM") === -1) continue;
    let value = window.localStorage.getItem(key);

    try {
      value = JSON.parse(value);
    } catch (e) {}

    if (
      (!searchItemCode || value.itemCode.indexOf(searchItemCode) !== -1) &&
      (!searchItemName || value.itemName.indexOf(searchItemName) !== -1)
    ) {
      itemData.push({ key, value });
    }
  }

  return itemData;
}

function setItemData() {
  const itemData = getItemData();

  const itemDiv = document.getElementById("item-div");
  itemDiv.innerHTML = "";

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, itemData.length);

  for (let i = startIndex; i < endIndex; i++) {
    const item = itemData[i].value;

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

  document.getElementById("prev-btn").disabled = currentPage === 1;
  document.getElementById("next-btn").disabled = endIndex >= itemData.length;
}

window.setItemData = setItemData;

document.getElementById("search-btn").onclick = function () {
  currentPage = 1;
  setItemData();
};

document.getElementById("new-btn").onclick = function () {
  openPopup("item-reg.html", "", false);
};

document.getElementById("prev-btn").onclick = function () {
  if (currentPage > 1) {
    currentPage--;
    setItemData();
  }
};

document.getElementById("next-btn").onclick = function () {
  const itemData = getItemData();
  const totalPages = Math.ceil(itemData.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    setItemData();
  }
};

function openPopup(url, itemCode, isUpdate) {
  const popupUrl = `${url}?item-code=${itemCode}&update=${isUpdate}`;
  window.open(popupUrl, "_blank", "width=650, height=200");
}

setItemData(); // Initial load
