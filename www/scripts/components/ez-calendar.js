import { getWeekdayNames, compareDates } from "../utilities/utilities.js";

export class EzCalendar extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.lang = this.getAttribute("lang");
    this.calendarData = [];
    this.customerData = [];
    this.holidaysData = [];
    this.selectedCustomer = null;
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.selectedDate.setDate(1);
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  // Build the table data
  refreshTableData = () => {
    const calendar = this.shadowRoot.querySelector(".ez-calendar");
    const table = calendar.querySelector(".table");
    const tableBody = table.querySelector(".tbody");
    const customers = this.customerData;

    Array.from(tableBody.querySelectorAll("div.current-month")).forEach((slot) => {
      const workInfo = this.calendarData.filter(
        (row) => compareDates(new Date(row.date), slot.data.date) && row.customer_uid != null
      );

      slot.querySelectorAll("ez-badge.work").forEach((badge) => badge.remove());

      workInfo.forEach((row) => {
        const badge = document.createElement("ez-badge");
        const customer = customers.find((cus) => cus.uid === row.customer_uid);
        badge.setAttribute("label", customer.name);
        badge.setAttribute("color", customer.color);
        badge.classList.add("work");

        if (badge.data == null) badge.data = {};
        badge.data.uid = row.customer_uid;
        badge.data.date = row.date;

        slot.appendChild(badge);
      });
    });
  };

  refresh() {
    const calendar = this.shadowRoot.querySelector(".ez-calendar");
    const table = calendar.querySelector(".table");
    const tableHead = table.querySelector(".thead");
    const tableBody = table.querySelector(".tbody");
    const weekDayNames = getWeekdayNames(this.lang, "short");

    // Defining local auxiliary functions
    const calculateCalendarDates = () => {
      const weekDay = this.selectedDate.getDay();
      const days = [];

      let firstCalendarDay = new Date(new Date(this.selectedDate).setDate(this.selectedDate.getDate() - weekDay));

      for (let i = 0; i < 42; i++) {
        const dateValue = new Date(
          firstCalendarDay.getFullYear(),
          firstCalendarDay.getMonth(),
          firstCalendarDay.getDate()
        );

        days.push({
          value: dateValue,
          isCurrentDate: compareDates(dateValue, this.currentDate),
          isWeekend: dateValue.getDay() === 0 || dateValue.getDay() === 6,
          isSelectedMonth: dateValue.getMonth() === this.selectedDate.getMonth(),
          label: firstCalendarDay.getDate().toString(),
        });

        firstCalendarDay = new Date(
          firstCalendarDay.getFullYear(),
          firstCalendarDay.getMonth(),
          firstCalendarDay.getDate() + 1
        );
      }

      return days;
    };

    const dayClasses = (day) => {
      const classes = ["td"];

      if (day.isCurrentDate) classes.push("current-date");
      if (day.isWeekend) classes.push("weekend");
      if (day.isSelectedMonth) classes.push("current-month clickable");

      return classes;
    };

    // Build the table head
    tableHead.innerHTML = "";
    weekDayNames.forEach((name) => {
      const div = document.createElement("div");
      div.innerText = name;
      div.classList.add("th");
      tableHead.appendChild(div);
    });

    // Build the table body
    const dates = calculateCalendarDates();

    tableBody.innerHTML = "";
    for (const day of dates) {
      const slot = document.createElement("div");

      slot.setAttribute("class", dayClasses(day).join(" "));
      slot.innerHTML = `<span>${day.label}</span>`;

      if (!slot.data) slot.data = {};
      slot.data.date = day.value;

      tableBody.appendChild(slot);

      // Showing holidays
      if (this.holidaysData.length > 0) {
        const holiday = this.holidaysData.find((row) => compareDates(new Date(row.date), day.value));

        if (holiday != null) {
          const badge = document.createElement("ez-badge");
          badge.classList.add("holiday");
          badge.setAttribute("label", holiday.name);
          badge.setAttribute("color", "var(--theme-inverted)");

          if (badge.data == null) badge.data = {};
          badge.data.name = holiday.name;
          badge.data.date = holiday.date;

          slot.appendChild(badge);
        }
      }
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/components/calendar.css" />
      <div class="ez-calendar">
        <div class="toolbar form-group">
          <select name="customer" class="form-element"></select>
          <ez-dateselector lang="${this.lang}"></ez-dateselector>
        </div>
        <div class="table">
          <div class="thead"></div>
          <div class="tbody"></div>
        </div>
      </div>
    `;

    // Build the calendar
    this.refresh();

    // Showing work info
    this.refreshTableData();

    // Build the customer selector
    this.setCustomerData(this.customerData);
  }

  addEventListeners() {
    const tableBody = this.shadowRoot.querySelector(".tbody");
    const dateSelector = this.shadowRoot.querySelector("ez-dateselector");
    const customerSelect = this.shadowRoot.querySelector("select[name=customer]");

    tableBody.addEventListener("click", (e) => {
      const slot = e.target.closest("div.clickable");
      if (!slot) return;

      this.dispatchEvent(
        new CustomEvent("dateclick", {
          bubbles: false,
          cancelable: true,
          composed: true,
          detail: { date: slot.data.date },
        })
      );
    });

    dateSelector.addEventListener("datechange", (e) => {
      this.selectedDate = e.detail.date;
      this.refresh();

      this.dispatchEvent(
        new CustomEvent("datechange", {
          bubbles: false,
          cancelable: true,
          composed: true,
          detail: {
            date: this.selectedDate,
          },
        })
      );
    });

    customerSelect.addEventListener("change", (e) => {
      this.selectedCustomer = this.customerData.find((row) => row.uid === e.target.value);

      this.dispatchEvent(
        new CustomEvent("customerchange", {
          detail: {
            customer_uid: e.target.value,
          },
        })
      );
    });
  }

  setCustomerData(customers) {
    this.customerData = customers;

    // Build the customer select
    const customerSelect = this.shadowRoot.querySelector("select[name=customer]");
    customerSelect.innerHTML = "";

    const option = document.createElement("option");
    option.value = "";
    option.disabled = true;
    option.selected = true;
    option.innerText = "-- Please select --";
    customerSelect.appendChild(option);

    if (!customers?.length) return;

    this.customerData.forEach((customer) => {
      const option = document.createElement("option");
      option.value = customer.uid;
      option.innerText = customer.name;

      if (customer.uid === this.selectedCustomer?.uid) option.selected = true;

      customerSelect.appendChild(option);
    });

    this.refresh();
    this.refreshTableData();
  }

  setCalendarData({ calendarData, holidayData }) {
    this.calendarData = calendarData ?? [];
    this.holidaysData = holidayData ?? [];

    this.refresh();
    this.refreshTableData();
  }

  setSelectedDate(date) {
    this.selectedDate = date;
    this.selectedDate.setDate(1);

    this.refresh();
    this.refreshTableData();
  }
}
