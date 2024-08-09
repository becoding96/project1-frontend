export function useCheckbox(
  mode = "item",
  maxCount = 0,
  initialSelectedIndices = new Set()
) {
  const selectedIndices = initialSelectedIndices;

  const isChecked = (index) => selectedIndices.has(index);

  const toggleCheckbox = (index, isChecked, data, event) => {
    if (isChecked) {
      if (maxCount != 0 && selectedIndices.size >= maxCount) {
        alert(`최대 ${maxCount}개만 선택 가능합니다.`);
        if (event) event.target.checked = false;
        return;
      } else {
        selectedIndices.add(index);
      }
    } else {
      selectedIndices.delete(index);
    }
    updateCheckedDiv(data);
  };

  const handleHeaderCheckboxClick = (
    headerCheckboxSelector,
    bodyCheckboxesSelector,
    data
  ) => {
    const headerCheckbox = document.querySelector(headerCheckboxSelector);
    headerCheckbox.onclick = (event) => {
      const checkboxes = document.querySelectorAll(bodyCheckboxesSelector);
      checkboxes.forEach((checkbox) => {
        const index = parseInt(checkbox.dataset.index, 10);
        checkbox.checked = event.target.checked;
        toggleCheckbox(index, event.target.checked, data);
      });
    };
  };

  const getSelectedIndices = () => selectedIndices;

  const updateCheckedDiv = (data) => {
    const checkedDiv = document.getElementById("checked-div");
    checkedDiv.innerHTML = "";

    Array.from(selectedIndices).forEach((index) => {
      const item = data[index];
      if (item) {
        const div = document.createElement("div");
        if (mode === "item")
          div.textContent = `${item.itemName} (${item.itemCode})`;
        if (mode === "cust")
          div.textContent = `${item.custName} (${item.custCode})`;
        if (mode === "sales") div.textContent = `${item.slipCode}`;
        div.dataset.index = index;
        div.onclick = () => {
          const checkbox = document.querySelector(
            `input[data-index='${index}']`
          );
          if (checkbox) {
            checkbox.checked = false;
          }
          selectedIndices.delete(index);
          updateCheckedDiv(data);
        };
        checkedDiv.appendChild(div);
      }
    });
  };

  const insertStyles = () => {
    const style = document.createElement("style");
    style.textContent = `
      .checked-div {
        display: flex;
        flex-wrap: wrap;
        margin-top: 5px;
      }

      .checked-div div {
        margin: 5px 5px 0 0;
        padding: 5px;
        background-color: rgb(221, 241, 250);
        border-radius: 5px;
        font-size: 0.75rem;
        box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.025);
        cursor: pointer;
      }

      .checked-div div:hover {
        background-color: rgb(205, 239, 255);
      }
    `;
    document.head.appendChild(style);
  };

  if (!document.getElementById("useCheckboxStyles")) {
    insertStyles();
  }

  return {
    isChecked,
    toggleCheckbox,
    handleHeaderCheckboxClick,
    getSelectedIndices,
  };
}
