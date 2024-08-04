export function openPopup(url, width, height, query) {
  const popupUrl = `${url}?${query}`;
  window.open(popupUrl, "_blank", `width = ${width}, height = ${height}`);
}
