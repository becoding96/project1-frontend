export class Button {
  constructor({ label, onClick, type = "button", className = "", id = "" }) {
    this.label = label;
    this.onClick = onClick;
    this.type = type;
    this.className = className;
    this.id = id;
  }

  render() {
    // 버튼 요소
    const button = document.createElement("button");
    button.type = this.type;
    button.id = this.id;
    button.className = `btn ${this.className}`;
    button.innerText = this.label;
    button.addEventListener("click", this.onClick);

    // CSS
    const style = document.createElement("style");
    style.textContent = `
      .btn {
        padding: 0.25rem 1rem;
        border-radius: none;
        border: 1px solid rgb(150, 150, 150);
        background-color: rgb(240, 240, 240);
        font-size: 0.8rem;
        margin-right: 0.5rem;
      }
      
      .btn:hover {
        cursor: pointer;
        background-color: rgb(230, 230, 230);
        transition: background-color 0.3s;
      }

      .blue-btn {
        border: 1px solid rgb(0, 58, 125);
        background-color: rgb(0, 79, 168);
        color: white;
      }

      .blue-btn:hover {
        background-color: rgb(0, 70, 150);
      }
    `;
    document.head.appendChild(style);

    return button;
  }
}
