import { openPopup } from "../../util/open-pop-up.js";

/** 코드 검색 컴포넌트 */
export class CodeHelp {
  constructor({ inputId, helpDivId, maxItems, mode, searchFunction, isSuper }) {
    if (isSuper && window.opener) {
      this.input = window.opener.document.getElementById(inputId);
      this.helpDiv = window.opener.document.getElementById(helpDivId);
    } else {
      this.input = document.getElementById(inputId);
      this.helpDiv = document.getElementById(helpDivId);
    }

    this.maxItems = maxItems;
    this.mode = mode;
    this.searchFunction = searchFunction;

    this.initialize();
  }

  initialize() {
    if (this.input) {
      this.input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          this.handleInputEnter();
        }
      });

      this.input.addEventListener("dblclick", () => {
        this.openPopup();
      });
    }
  }

  /** 입력 + 엔터 처리 */
  handleInputEnter() {
    const searchTerm = this.input.value.trim();
    if (searchTerm) {
      const matchedItems = this.searchFunction(searchTerm);

      // 1개만 매칭될 때
      if (matchedItems.length === 1) {
        this.addItem(matchedItems[0]);
        this.input.value = "";
      } else {
        this.openPopup(searchTerm);
      }
    }
  }

  /** 검색 or 적용한 데이터 div에 추가 */
  addItem(item) {
    const added = this.helpDiv.querySelectorAll(`.${this.mode}-span`);

    if (added.length > 0) {
      for (let i = 0; i < added.length; i++) {
        if (
          (this.mode === "item" && added[i].dataset.code === item.itemCode) ||
          (this.mode === "cust" && added[i].dataset.code === item.custCode)
        )
          return;
      }
    }

    // 꽉 찬 경우
    if (added.length >= this.maxItems) {
      // 최대 1개일 때
      if (this.maxItems === 1) {
        this.helpDiv.querySelector("span").remove();
      } else if (this.maxItems > 1) {
        alert(`최대 ${this.maxItems}개까지 입력 가능합니다.`);
        return;
      }
    }

    const span = document.createElement("span");
    span.textContent =
      this.mode === "item"
        ? `${item.itemCode} (${item.itemName})`
        : `${item.custCode} (${item.custName})`;
    span.dataset.code = this.mode === "item" ? item.itemCode : item.custCode;
    span.classList.add(`${this.mode}-span`);
    span.onclick = () => {
      span.remove();
    };

    // span 삭제 버튼
    const outBtn = document.createElement("span");
    outBtn.textContent = "🗑️";
    outBtn.classList.add("out-btn", `${this.mode}-out-btn`);
    outBtn.dataset.code = this.mode === "item" ? item.itemCode : item.custCode;

    span.appendChild(outBtn);
    this.helpDiv.appendChild(span);
  }

  /** 팝업 열기 */
  openPopup(searchTerm = "") {
    const popupUrl =
      this.mode === "item"
        ? "../item-list/item-list.html"
        : "../cust-list/cust-list.html";
    openPopup(popupUrl, 900, 600, `search=${encodeURIComponent(searchTerm)}`);
  }

  /** div 비우기 */
  clear() {
    this.helpDiv.querySelectorAll(`${this.mode}-span`).forEach((span) => {
      span.remove();
    });
  }
}
