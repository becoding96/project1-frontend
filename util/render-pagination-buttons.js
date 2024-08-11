import { Button } from "../components/Button.js";

/** 페이지네이션 버튼 렌더링 함수 */
export function renderPaginationButtons({
  pagination,
  renderListFunction,
  paginationDivId,
  firstBtn,
  prevBtn,
  nextBtn,
  lastBtn,
}) {
  const paginationDiv = document.getElementById(paginationDivId);
  paginationDiv.innerHTML = "";

  const visiblePages = pagination.getVisiblePageNumbers();

  paginationDiv.append(firstBtn, prevBtn);

  visiblePages.forEach((pageNumber) => {
    const pageButton = new Button({
      label: pageNumber.toString(),
      onClick: () => {
        pagination.setPage(pageNumber);
        renderListFunction();
      },
      className:
        pageNumber === pagination.getCurrentPage()
          ? "page-btn blue-btn"
          : "page-btn",
    }).render();

    paginationDiv.appendChild(pageButton);
  });

  paginationDiv.append(nextBtn, lastBtn);

  document.getElementById(prevBtn.id).disabled =
    pagination.getCurrentPage() === 1;
  document.getElementById(nextBtn.id).disabled =
    pagination.getCurrentPage() >= pagination.getTotalPages();
}
