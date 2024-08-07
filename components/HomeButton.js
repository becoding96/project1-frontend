export class HomeButton {
  render() {
    const button = document.createElement("a");
    button.href = "/";
    button.textContent = "🏠";
    button.classList.add("home-btn");

    const style = document.createElement("style");
    style.textContent = `
      .home-btn {
        display: flex;
        justify-content: center;
        width: 60px;
        height: 60px;
        background-color: rgb(221, 241, 250);
        border-radius: 100%;
        position: absolute;
        right: 30px;
        top: 30px;
        font-size: 30px;
        line-height: 50px;
        box-shadow: 1px 1px 5px rgb(0, 0, 0, 0.1);
      }

      .home-btn:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);

    document.querySelector("body").appendChild(button);
  }
}
