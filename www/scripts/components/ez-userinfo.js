export class EzUserInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.userInfo = {
      userName: this.getAttribute("userName"),
      fullName: this.getAttribute("fullName") ?? "Guest",
      avatarUrl: this.getAttribute("avatar") ?? "/assets/images/no-picture.png",
    };
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    const { fullName, avatarUrl } = this.userInfo;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          font-family: Arial, sans-serif;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 10px;
        }
        .user-details {
          display: flex;
          flex-direction: column;
        }
        .welcome-message {
          font-size: 14px;
          color: #666;
        }
        .full-name {
          font-size: 16px;
          font-weight: bold;
        }
        .arrow-down {
          margin-left: 10px;
          cursor: pointer;
        }
      </style>
      <img class="avatar" src="${avatarUrl}" alt="User Avatar">
      <div class="user-details">
        <span class="welcome-message">Welcome,</span>
        <span class="full-name">${fullName}</span>
      </div>
      <div class="arrow-down">▼</div>
    `;
  }

  addEventListeners() {
    const arrowDown = this.shadowRoot.querySelector(".arrow-down");

    arrowDown.addEventListener("click", (e) => {
      this.dispatchEvent(
        new CustomEvent("userinfoclick", {
          bubbles: true,
          composed: true,
          cancelable: true,
          detail: {
            x: e.target.offsetLeft,
            y: e.target.offsetTop,
            align: "right",
          },
        })
      );
    });
  }
}
