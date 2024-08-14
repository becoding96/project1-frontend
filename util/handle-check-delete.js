export function handleCheckDelete({
  cachedList,
  selectedDatas,
  storageKey,
  fetchFunction,
  identifierKey,
}) {
  const updatedList = cachedList.filter(
    (data) => !selectedDatas.has(data[identifierKey])
  );

  cachedList.length = 0;
  cachedList.push(...updatedList);
  selectedDatas.clear();

  window.localStorage.setItem(storageKey, JSON.stringify(updatedList));
  alert("선택된 항목이 삭제되었습니다.");

  document.querySelector(
    ".table2 thead input[type='checkbox']"
  ).checked = false;
  document.getElementById("checked-div").innerHTML = "";

  fetchFunction();
}
