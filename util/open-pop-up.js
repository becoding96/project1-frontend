/** 팝업 */
export function openPopup(url, width, height, params) {
  const paramString = params ? `?${params}` : "";
  const popupUrl = `${url}${paramString}`;
  window.open(popupUrl, "_blank", `width=${width},height=${height}`);
}
