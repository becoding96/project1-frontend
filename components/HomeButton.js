/** 홈 버튼 컴포넌트 */
export class HomeButton {
  render() {
    const button = document.createElement("a");
    button.href = "/";
    button.textContent = "🏠";
    button.classList.add("home-btn");

    document.querySelector("body").appendChild(button);
  }
}
