import { fillDropdown, getMonthNames } from "../utilities/utilities.js";

export class EzDateSelector extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.selectedDate = new Date();
    this.selectedDate.setDate(1);
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/components/date-selector.css" />
      <div class="ez-date-selector form-group">
        <button class="button icon btn-normal" name="previous" title="Previous month"><i class="material-symbols">chevron_left</i></button>
        <select name="month" class="form-element"></select>
        <input type="number" class="form-element" name="year" placeholder="Year" min="1970" max="2999" value="${this.selectedDate.getFullYear()}" />
        <button class="button icon btn-normal" name="next" title="Next month"><i class="material-symbols">chevron_right</i></button>
      </div>
    `;

    const monthSelect = this.shadowRoot.querySelector("select[name=month]");
    const monthNames = getMonthNames(this.lang, "long");

    fillDropdown({ dropdown: monthSelect, data: monthNames.map((name, index) => ({ value: index, text: name })) });

    monthSelect.value = this.selectedDate.getMonth();
  }

  addEventListeners() {
    const monthSelect = this.shadowRoot.querySelector("select[name=month]");
    const yearInput = this.shadowRoot.querySelector("input[name=year]");
    const previousButton = this.shadowRoot.querySelector("button[name=previous]");
    const nextButton = this.shadowRoot.querySelector("button[name=next]");

    monthSelect.addEventListener("change", () => {
      this.selectedDate.setMonth(monthSelect.value);
      this.dispatchEvent(
        new CustomEvent("datechange", { bubbles: false, cancelable: true, detail: { date: this.selectedDate } })
      );
    });

    yearInput.addEventListener("change", () => {
      this.selectedDate.setFullYear(yearInput.value);
      this.dispatchEvent(
        new CustomEvent("datechange", { bubbles: false, cancelable: true, detail: { date: this.selectedDate } })
      );
    });

    previousButton.addEventListener("click", () => {
      this.selectedDate.setMonth(this.selectedDate.getMonth() - 1);
      this.dispatchEvent(
        new CustomEvent("datechange", { bubbles: false, cancelable: true, detail: { date: this.selectedDate } })
      );

      monthSelect.value = this.selectedDate.getMonth();
      yearInput.value = this.selectedDate.getFullYear();
    });

    nextButton.addEventListener("click", () => {
      this.selectedDate.setMonth(this.selectedDate.getMonth() + 1);
      this.dispatchEvent(
        new CustomEvent("datechange", { bubbles: false, cancelable: true, detail: { date: this.selectedDate } })
      );

      monthSelect.value = this.selectedDate.getMonth();
      yearInput.value = this.selectedDate.getFullYear();
    });
  }
}
