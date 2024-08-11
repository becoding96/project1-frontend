export function handleCheckDelete({
  cachedList,
  checkboxHandler,
  storageKey,
  fetchFunction,
}) {
  const updatedList = cachedList.filter(
    (item, index) => !checkboxHandler.getSelectedIndices().has(index)
  );

  cachedList.length = 0;
  cachedList.push(...updatedList);
  checkboxHandler.getSelectedIndices().clear();

  window.localStorage.setItem(storageKey, JSON.stringify(updatedList));
  alert("선택된 항목이 삭제되었습니다.");

  document.querySelector(
    ".table2 thead input[type='checkbox']"
  ).checked = false;

  document.getElementById("checked-div").innerHTML = "";

  fetchFunction();
}
