import { Button } from "../components/Button.js";

/** 페이지네이션 버튼 렌더링 함수 */
export function renderPaginationButtons({
  currentPage,
  totalPages,
  setPage,
  renderListFunction,
  paginationDivId,
  firstBtn,
  prevBtn,
  nextBtn,
  lastBtn,
}) {
  const paginationDiv = document.getElementById(paginationDivId);
  paginationDiv.innerHTML = "";

  // 표시할 페이지 번호 계산
  const visiblePages = getVisiblePageNumbers(currentPage, totalPages);

  paginationDiv.append(firstBtn, prevBtn);

  visiblePages.forEach((pageNumber) => {
    const pageButton = new Button({
      label: pageNumber.toString(),
      onClick: () => {
        setPage(pageNumber);
        renderListFunction();
      },
      className: pageNumber === currentPage ? "page-btn blue-btn" : "page-btn",
    }).render();

    paginationDiv.appendChild(pageButton);
  });

  paginationDiv.append(nextBtn, lastBtn);

  document.getElementById(prevBtn.id).disabled = currentPage === 1;
  document.getElementById(nextBtn.id).disabled = currentPage >= totalPages;
}

/** 페이지 번호 계산 함수 */
function getVisiblePageNumbers(currentPage, totalPages) {
  const visiblePages = 5;
  let start = Math.max(currentPage - Math.floor(visiblePages / 2), 1);
  let end = Math.min(start + visiblePages - 1, totalPages);
  if (end - start < visiblePages - 1) {
    start = Math.max(end - visiblePages + 1, 1);
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
