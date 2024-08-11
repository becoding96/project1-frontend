/** 체크박스 처리 로직 */
export function useCheckbox(
  mode = "item", // 품목, 거래처 별로
  maxCount = 0, // 최대 선택 개수
  initialSelectedIndices = new Set()
) {
  /** 선택 데이터 저장 - 페이지 넘겨도 유지되어야 함 */
  const selectedIndices = initialSelectedIndices;

  /** 렌더링 시 다시 체크하기 위함 */
  const isChecked = (index) => selectedIndices.has(index);

  /** 체크 로직 */
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
    updateCheckedDiv(data); // 상단 체크 내역 표시
  };

  /** 헤더 체크박스 클릭 로직 */
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

  /** 선택 데이터 */
  const getSelectedIndices = () => selectedIndices;

  /** 상단 체크 내역 표시 */
  const updateCheckedDiv = (data) => {
    const checkedDiv = document.getElementById("checked-div");
    checkedDiv.innerHTML = "";

    Array.from(selectedIndices).forEach((index) => {
      const item = data[index];
      if (item) {
        const div = document.createElement("div");
        if (mode === "item")
          div.textContent = `${item.itemName} (${item.itemCode})`;
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

  return {
    isChecked,
    toggleCheckbox,
    handleHeaderCheckboxClick,
    getSelectedIndices,
  };
}
