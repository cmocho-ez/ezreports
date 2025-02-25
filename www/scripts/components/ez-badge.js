import { getBestContrastColor } from "../utilities/utils.js";

export class EzBadge extends HTMLElement {
  static get observedAttributes() {
    return ["color", "label"];
  }

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.color = this.getAttribute("color") ?? "#000000";
    this.label = this.getAttribute("label");
    this.size = this.getAttribute("size") ?? "regular"; // regular, small
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue;
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.color || !this.label) return;

    this.shadowRoot.innerHTML = `
      <style>
        .ez-badge{
          display: inline-block;
          box-sizing: border-box; 
          text-wrap: nowrap; 
          width: 100%; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          padding: ${this.size === "small" ? "2px 4px" : "0.5rem"}; 
          font-size: ${this.size === "small" ? "0.75rem" : "1rem"}; 
          border-radius: 4px;
          background-color: ${this.color};
          color: ${getBestContrastColor(this.color)};
        }
      </style>
      <div class="ez-badge">${this.label}</div>`;
  }
}
