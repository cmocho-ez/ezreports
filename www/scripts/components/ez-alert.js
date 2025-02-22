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
      <link rel="stylesheet" href="/styles/components/alert.css" />
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
    alert.style.animation = `fade-in 0.3s ease, slide-in 0.3s ease, fade-out 0.3s ease ${this.duration}s`;

    if (closeable) {
      alert.style.animation = `fade-in 0.3s ease, slide-in 0.3s ease`;
      alert.querySelector(".close").addEventListener("click", () => {
        alert.style.animation = `fade-out .${this.duration}s ease`;
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
