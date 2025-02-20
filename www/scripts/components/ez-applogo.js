export class EzAppLogo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.type = this.getAttribute("type");
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const html = `
      <style>
        .logo {
          width: 498px;
          height: 84px;
          background: url('/assets/images/ezreports-logo.svg') no-repeat center;
          background-size: contain;

          &.small {
            width: 249px;
            height: 42px;
          }
        }
      
      </style>
      <div class="logo"></div>`;

    this.shadowRoot.innerHTML = html;

    if (this.type === "small") this.shadowRoot.querySelector(".logo").classList.add("small");
  }
}
