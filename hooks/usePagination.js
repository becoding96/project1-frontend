export function usePagination(data, itemsPerPage) {
  let currentPage = 1;

  const getTotalPages = () => Math.ceil(data.length / itemsPerPage);

  const getCurrentPage = () => currentPage;

  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const nextPage = () => {
    if (currentPage < getTotalPages()) {
      currentPage++;
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      currentPage--;
    }
  };

  const setPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= getTotalPages()) {
      currentPage = pageNumber;
    }
  };

  const reset = () => {
    currentPage = 1;
  };

  function getVisiblePageNumbers() {
    const visiblePages = 5;
    let start = Math.max(currentPage - Math.floor(visiblePages / 2), 1);
    let end = Math.min(start + visiblePages - 1, getTotalPages());
    if (end - start < visiblePages - 1) {
      start = Math.max(end - visiblePages + 1, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  const getCurrentPageIndex = (index) =>
    (currentPage - 1) * itemsPerPage + index;

  return {
    getTotalPages,
    getCurrentPage,
    getPaginatedData,
    nextPage,
    prevPage,
    setPage,
    reset,
    getVisiblePageNumbers,
    getCurrentPageIndex,
  };
}
