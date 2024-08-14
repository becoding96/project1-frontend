export function handleCheckDelete({
  cachedList,
  checkboxHandler,
  storageKey,
  fetchFunction,
}) {
  const selectedItems = checkboxHandler.getSelectedItems(); // selectedItems 가져오기

  const updatedList = cachedList.filter(
    (item) => !selectedItems.has(item.itemCode) // selectedItems에 없는 항목만 필터링
  );

  cachedList.length = 0;
  cachedList.push(...updatedList);
  checkboxHandler.getSelectedItems().clear(); // 선택된 항목 초기화

  window.localStorage.setItem(storageKey, JSON.stringify(updatedList));
  alert("선택된 항목이 삭제되었습니다.");

  document.querySelector(
    ".table2 thead input[type='checkbox']"
  ).checked = false;

  document.getElementById("checked-div").innerHTML = "";

  fetchFunction();
}
