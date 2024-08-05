/** 품목 코드 기반 이름 조회 함수 */
export function getItemName(itemCode) {
  const itemList = JSON.parse(window.localStorage.getItem("item-list")) || [];
  const item = itemList.find((item) => item.itemCode === itemCode);
  return item ? item.itemName : "";
}
