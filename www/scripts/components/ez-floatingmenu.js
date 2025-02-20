export class EzFloatingMenu extends HTMLElement {
  static get observedAttributes() {
    return ["options", "alignment"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.options = [];
    this.alignment = this.getAttribute("alignment") ?? "left";

    this.init();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue;
    }
  }

  #menuClickHandler(e) {
    const option = e.target.closest("li");

    this.hideMenu();
    if (!option) return;
    if (option.classList.contains("divider")) return;

    // Dispatch event
    const event = new CustomEvent("menuclick", {
      detail: {
        menuName: option.getAttribute("name"),
      },
    });
    this.dispatchEvent(event);
  }

  #contextmenuHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    const el = e.target;

    if (!el.dataset.contextmenu) {
      this.hideMenu(e);
      return;
    }

    this.options = JSON.parse(el.dataset.contextmenu);
    this.showMenu(e.clientX, e.clientY, this.alignment);
  }

  #addEventListeners() {
    document.addEventListener("click", (e) => {
      const target = e.target.closest("[data-contextmenu]");
      if (!target) this.hideMenu(e);
    });

    document.addEventListener("contextmenu", (e) => {
      const target = e.target.closest("[data-contextmenu]");
      if (target) this.hideMenu(e);

      this.#contextmenuHandler(e);
    });

    this.shadowRoot.querySelector("ul").addEventListener("click", this.#menuClickHandler.bind(this));
  }

  init() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url("/styles/material_symbols.css");

        .ez-floatingmenu {
          position: absolute;
          z-index: 10000;
          background: #d9d9d9;
          border-radius: 5px;
          border: 1px solid #ddd;
          box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          display: none;
          grid-auto-flow: row;

          & ul {
            list-style: none;
            padding: 0;
            margin: 0;

            & li {
              display: grid;
              grid-template-columns: 16px auto;
              white-space: nowrap;
              align-items: center;
              padding: 0.5rem;
              cursor: pointer;
              transition: background 0.3s;
              gap: 8px;

              &:hover {
                background: #263238;
                color: #fff;

                & i {
                  color: #eb3f00;
                }
              }

              &.divider {
                padding: 0;
                height: 1px;
                background: #ccc;
                margin: 0.25rem 0;
                border-bottom: solid 1px #aaa;
              }

              & i {
                max-width: 16px;
                max-height: 16px;
                font-size: 1rem;
              }
            }
          }
        }
      </style>
      <div class="ez-floatingmenu">
        <ul></ul>
      </div>
    `;

    this.#addEventListeners();
  }

  showMenu(x, y, align = "left") {
    const menu = this.shadowRoot.querySelector(".ez-floatingmenu");
    const ul = menu.querySelector("ul");

    ul.innerHTML = this.options
      .map((option) =>
        option.type === "divider"
          ? `<li class="divider"></li>`
          : `<li name="${option.name}"><i class="material-symbols outlined">${option.icon ?? ""}</i><span>${
              option.label
            }</span></li>`
      )
      .join("");

    menu.style.top = `${y}px`;
    menu.style.right = align === "right" ? `${x}px` : "auto";
    menu.style.left = align === "left" ? `${x}px` : "auto";
    menu.style.display = "grid";
  }

  hideMenu(e) {
    this.shadowRoot.querySelector(".ez-floatingmenu").style.display = "none";
  }
}
