export class EzAlert extends HTMLElement {
  static get observedAttributes() {
    return ["duration"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "duration" && oldValue !== newValue) {
      this.duration = newValue || "3.5";
      this.render();
    }
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.duration = this.getAttribute("duration") || "3.5"; // Seconds
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url("/styles/material_symbols.css");

        @keyframes fade-in {
          from { opacity: 0 }
        }

        @keyframes fade-out {
          to { opacity: 0 }
        }

        @keyframes slide-in {
          from { transform: translateY(10px) }
        }

        .alert-group {
          pointer-events: none;
          position: absolute;
          z-index: 2;
          inset-block-start: 0;
          inset-inline: 0;
          padding-block-start: 10vh;
          padding-right: 1rem;
          display: grid;
          justify-items: end;
          justify-content: end;
          gap: 16px;
        }

        .ez-alert {
          max-inline-size: min(400px, 50vw);
          padding: 8px;
          border-radius: 6px;
          font-size: 0.85rem;
          pointer-events: none;
          will-change: transform;
          animation: fade-in .3s ease, slide-in .3s ease, fade-out .3s ease ${this.duration}s;
          transition: all .3s ease;
          background-color: #e7e7e7;
          color: #292929;
          box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.3);
          border-left: 5px solid #292929;
          display: grid;
          grid-template-columns: min-content auto min-content;
          grid-template-rows: auto auto;
          grid-template-areas: "icon title close" "icon message message";
          align-items: center;
          align-content: center;
          gap: 2px;

          & i {
            grid-area: icon;
            font-size: 2.5rem;
            opacity: 0.9;
          }

          &.info {
            background-color: #92c1ff;
            border-left: 5px solid #005dc0;
          }
          
          &.warning {
            background-color: #ffe692;
            border-left: 5px solid #ffbf00;
          }

          &.error {
            background-color: #e59e9e;
            border-left: 5px solid #bb0013;
          }

          &.success {
            background-color: #c1e592;
            border-left: 5px solid #25b800;
          }

          &.info i {
            color: #005dc0;
          }

          &.warning i {
            color: #b88416;
          }

          &.error i {
            color: #bb0013;
          }

          &.success i {
            color: #3d772e;
          }

          & .title {
            grid-area: title;
            font-weight: bold;
            font-size: 1.1em;
          }

          & .message {
            grid-area: message;
          }

          & .close {
            grid-area: close;
            cursor: pointer;
            color: #292929;
            pointer-events: all;
          }
        }
      </style>
      <section class="alert-group"></section>
    `;
  }

  #icon(type) {
    switch (type) {
      case "success":
        return "check";
      case "warning":
        return "warning";
      case "error":
        return "close";
      case "info":
      default:
        return "info";
    }
  }

  show({ title, message, closeable = false, type, icon }) {
    const alert = document.createElement("output");
    alert.innerHTML = `
      <i class="material-symbols">${icon ?? this.#icon(type)}</i>
      <span class="title">${title ?? ""}</span>
      <span class="message">${message ?? ""}</span>
      ${closeable ? '<span class="material-symbols close">close</span>' : "&nbsp;"}
    `;

    alert.classList.add("ez-alert");
    if (type) alert.classList.add(type);

    alert.setAttribute("role", "status");

    if (closeable) {
      alert.style.animation = "fade-in .3s ease, slide-in .3s ease 3s";
      alert.querySelector(".close").addEventListener("click", () => {
        alert.style.animation = "fade-out .3s ease";
        setTimeout(() => {
          this.shadowRoot.querySelector(".alert-group").removeChild(alert);
        }, 285);
      });
    }

    this.shadowRoot.querySelector(".alert-group").appendChild(alert);

    setTimeout(() => {
      if (!closeable) this.shadowRoot.querySelector(".alert-group").removeChild(alert);
    }, Number(this.duration) * 1000 + 250);
  }

  addEventListeners() {
    // const el = this.shadowRoot.querySelector(".el");
    // el.addEventListener("click", (e) => {
    //   this.dispatchEvent(
    //     new CustomEvent("click", {
    //       bubbles: false,
    //       cancelable: true,
    //       composed: true,
    //       detail: {
    //         el: e.target,
    //         data: this.data,
    //       },
    //     })
    //   );
    // });
  }
}
