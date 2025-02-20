export class EzDialog extends HTMLElement {
  static get observedAttributes() {
    return ["title", "icon", "type"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "title" && oldValue !== newValue) {
      this.title = newValue;
      this.render();
    } else if (name === "icon" && oldValue !== newValue) {
      this.icon = newValue;
      this.render();
    } else if (name === "type" && oldValue !== newValue) {
      this.type = newValue;
      this.render();
    }
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.title = "New Dialog";
    this.icon = "info";
    this.type = "info"; // info, confirm, warning, error
    this.handler = null;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.title = this.getAttribute("title") ?? this.title;
    this.icon = this.getAttribute("icon") ?? this.icon;
    this.type = this.getAttribute("type") ?? this.type;

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/components/dialog.css" />
      <dialog class="ez-dialog ${this.type}">
        <header>
          <i class="material-symbols">${this.icon}</i><span>${this.title}</span>
        </header>
        <main>
          <slot name="body"></slot>
        </main>
        <footer>
          <slot name="buttons"></slot>
        </footer>
      </dialog>
    `;
    this.addEventListeners();
  }

  show() {
    const dlg = this.shadowRoot.querySelector("dialog");
    if (!dlg.open) dlg.show();
  }

  showModal() {
    const dlg = this.shadowRoot.querySelector("dialog");
    if (!dlg.open) dlg.showModal();
  }

  close() {
    const dlg = this.shadowRoot.querySelector("dialog");
    if (dlg.open) dlg.close();

    this.dispatchEvent(new CustomEvent("close"));
  }

  addEventListeners() {
    const dlg = this.shadowRoot.querySelector("dialog");

    dlg.addEventListener("click", (e) => {
      const btn = e.target.closest("button");

      if (!btn) return;

      this.dispatchEvent(
        new CustomEvent("buttonclick", {
          bubbles: false,
          cancelable: true,
          composed: true,
          detail: {
            button: btn.name,
          },
        })
      );
    });
  }
}
