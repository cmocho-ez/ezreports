export class EzCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.header = this.getAttribute("header") ?? "";
    this.type = this.getAttribute("type") ?? "";
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  addToolbarButtons(buttons = []) {
    const toolbar = this.shadowRoot.querySelector(".toolbar");

    buttons.forEach((btn) => {
      if (btn.type === "divider") {
        const div = document.createElement("div");
        div.classList.add("divider");

        toolbar.appendChild(div);
      } else {
        const button = document.createElement("button");
        button.classList.add("button", "btn-icon");
        button.name = btn.name;
        button.title = btn.label;

        const i = document.createElement("i");
        i.classList = "material-symbols";
        i.textContent = btn.icon;

        button.appendChild(i);
        toolbar.appendChild(button);
      }
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/components/card.css" />
      <div class="ez-card ${this.type}">
        <header>
          ${this.header}
          <div class="toolbar"></div>
        </header>
        <hr />
        <main>
          <slot part="main"></slot>
        </main>
      </div>
    `;
  }

  addEventListeners() {
    const toolbar = this.shadowRoot.querySelector(".toolbar");

    toolbar.addEventListener("click", (e) => {
      const button = e.target.closest("button");

      if (button) {
        this.dispatchEvent(
          new CustomEvent("toolbarbuttonclick", {
            bubbles: false,
            cancelable: true,
            composed: false,
            detail: { button },
          })
        );
      }
    });
  }
}
