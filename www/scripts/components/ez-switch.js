export class EzSwitch extends HTMLElement {
  static get observedAttributes() {
    return ["disabled"];
  }

  attributeChangedCallback(name) {
    if (name === "disabled") {
      this.disabled = this.hasAttribute("disabled");
      this.render();
    }
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = this.getAttribute("state") || "off";
    this.disabled = this.hasAttribute("disabled");
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host, :root {
          --switch-size: 2rem;
          --switch-button-size: 1rem;
        }

        .switch-container {
          display: inline-block;
        }

        .switch-checkbox {
          display: none;
        }

        .switch-label {
          display: flex;
          align-items: center;
          width: var(--switch-size);
          height: calc(var(--switch-button-size) + 2px);
          background-color: var(--darkest-gray);
          border-radius: var(--switch-size);
          position: relative;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .switch-checkbox:checked + .switch-label {
          background-color: var(--theme-primary);
        }

        .switch-checkbox:disabled + .switch-label {
          background-color: var(--darkest-gray);
          opacity: 0.5;
          pointer-events: none;

          .switch-button {
            background-color: var(--charcoal);
          }
        }

        .switch-button {
          width: var(--switch-button-size);
          height: var(--switch-button-size);
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 1px;
          left: 1px;
          transition: transform 0.3s ease;
        }

        .switch-checkbox:checked + .switch-label .switch-button {
          transform: translateX(calc(100% - 2px));
        }
      </style>
      <div class="switch-container">
        <input type="checkbox" id="switch" class="switch-checkbox" ${this.state === "on" ? "checked" : ""} ${
      this.disabled ? "disabled" : ""
    } />
        <label for="switch" class="switch-label">
          <span class="switch-button"></span>
        </label>
      </div>
    `;
  }

  addEventListeners() {
    const el = this.shadowRoot.querySelector("#switch");

    el.addEventListener("change", (e) => {
      this.state = e.target.checked ? "on" : "off";
      this.dispatchEvent(
        new CustomEvent("statechange", {
          bubbles: false,
          cancelable: true,
          composed: true,
          detail: {
            el: e.target,
            data: this.state,
          },
        })
      );
    });
  }
}
