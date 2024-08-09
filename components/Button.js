/** 버튼 컴포넌트 */
export class Button {
  constructor({ label, onClick, type = "button", className = "", id = "" }) {
    this.label = label;
    this.onClick = onClick;
    this.type = type;
    this.className = className;
    this.id = id;
  }

  render() {
    const button = document.createElement("button");
    button.type = this.type;
    button.id = this.id;
    button.className = `btn ${this.className}`;
    button.innerText = this.label;
    button.addEventListener("click", this.onClick);

    return button;
  }
}
