export class EzCopyButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.contentFrom = this.getAttribute("content-from");
    this.tootltip = this.getAttribute("tooltip") || "Copy";
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url("/styles/material_symbols.css");

        .ez-copybutton {
          position: relative;
          font-size: inherit;
          color: inherit;
          cursor: pointer;
          transform: translateY(1px);
          transition: transform 0.2s ease-in-out;
        }

        .ez-copybutton:hover {
          color: var(--theme-accent);
          transform: scale(1.3);
        }
      </style>
      <i class="ez-copybutton material-symbols outlined" title="${this.tootltip}">content_copy</i>
    `;
  }

  addEventListeners() {
    const btn = this.shadowRoot.querySelector("i");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      this.dispatchEvent(
        new CustomEvent("click", {
          bubbles: false,
          cancelable: true,
          composed: true,
          detail: {
            contentfrom: document.querySelector(this.contentFrom),
            content:
              document.querySelector(this.contentFrom)?.innerText ||
              document.querySelector(this.contentFrom)?.value ||
              "",
          },
        }),
      );
    });
  }
}
