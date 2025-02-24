/**
 * Returns an array of month names in the specified language.
 *
 * @param {string} [lang="en-GB"] - The language code for the month names.
 * @param {string} [month="long"] - The format of the month names, either "long" or "short".
 * @returns {string[]} - An array of month names.
 */
export function getMonthNames(lang = "en-GB", month = "long") {
  const { format } = new Intl.DateTimeFormat(lang, { month });
  const year = new Date().getFullYear();

  return [...Array(12).keys()].map((month) => format(new Date(year, month, 1)));
}

/**
 * Returns an array of weekday names in the specified language.
 *
 * @param {string} [lang="en-GB"] - The language code for the weekday names.
 * @param {string} [weekday="long"] - The format of the weekday names, either "long" or "short".
 * @returns {string[]} - An array of weekday names.
 */
export function getWeekdayNames(lang = "en-GB", weekday = "long") {
  const { format } = new Intl.DateTimeFormat(lang, { weekday });
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const weekDays = [];

  let day = 0;
  let date = new Date(year, month, day);

  while (date.getDay() !== 0) {
    day++;
    date = new Date(year, month, day);
  }

  [...Array(7).keys()].forEach((i) => {
    weekDays.push(format(new Date(year, month, day + i)));
  });

  return weekDays;
}

/**
 * Returns the best contrasting color (either "black" or "white") for the given hexadecimal color code.
 *
 * @param {string} hexcolor - The hexadecimal color code to check.
 * @returns {string} The best contrasting color, either "black" or "white".
 */
export function getBestContrastColor(hexcolor) {
  // If a leading # is provided, remove it
  if (hexcolor.slice(0, 1) === "#") {
    hexcolor = hexcolor.slice(1);
  }

  // If a three-character hexcode, make six-character
  if (hexcolor.length === 3) {
    hexcolor = hexcolor
      .split("")
      .map(function (hex) {
        return hex + hex;
      })
      .join("");
  }

  // Convert to RGB value
  let r = parseInt(hexcolor.substring(0, 2), 16);
  let g = parseInt(hexcolor.substring(2, 2), 16);
  let b = parseInt(hexcolor.substring(4, 2), 16);

  // Get YIQ ratio (https://en.wikipedia.org/wiki/YIQ)
  let yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Check contrast
  return yiq >= 128 ? "black" : "white";
}

/**
 * Formats a numeric value as a currency string.
 *
 * @param {number} value - The numeric value to format as currency.
 * @param {string} [currency="EUR"] - The currency code to use for formatting, defaults to "EUR".
 * @returns {string} The formatted currency string.
 */
export const formatAsCurrency = (value, currency = "EUR") => {
  if (value == null) return "N/A";
  return Intl.NumberFormat("en", { currency, style: "currency" }).format(value);
};

/**
 * Formats a date as a string in the format "YYYY-MM-DD".
 *
 * @param {Date|string} date - The date to format. Can be a Date object or a string in a date format that can be parsed by the Date constructor.
 * @returns {string} The formatted date string in the format "YYYY-MM-DD", or "N/A" if the input is falsy.
 */
export const formatDate = (date) => {
  if (!date) return "N/A";
  if (typeof date === "string") return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
  return new Date(date).toISOString().split("T")[0]; // YYYY-MM-DD
};

/**
 * Formats an email address as an HTML link.
 *
 * @param {string} email - The email address to format as a link.
 * @returns {string} The email address formatted as an HTML link.
 */
export const formatAsEmailLink = (email) => {
  if (!email) return "N/A";
  return `<a href="mailto:${email}">${email}</a>`;
};

/**
 * Compares two dates and returns true if they have the same year, month, and day.
 *
 * @param {Date} date1 - The first date to compare.
 * @param {Date} date2 - The second date to compare.
 * @returns {boolean} True if the two dates have the same year, month, and day, false otherwise.
 */
export const compareDates = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Compares the year and month of two dates and returns true if they are the same.
 *
 * @param {Date} date1 - The first date to compare.
 * @param {Date} date2 - The second date to compare.
 * @returns {boolean} True if the year and month of the two dates are the same, false otherwise.
 */
export const isRef = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
};

/**
 * Displays a custom alert with the specified content, title, type, and icon.
 *
 * @param {Object} options - The options for the alert.
 * @param {string} [options.message="Warning!"] - The message to display in the alert.
 * @param {string} [options.title="Warning"] - The title of the alert.
 * @param {string} [options.type="warning"] - The type of the alert (e.g. "warning", "error").
 * @param {string} [options.icon="warning"] - The icon to display in the alert.
 * @param {boolean} [options.closeable=false] - Whether the alert can be closed by the user.
 * @returns {HTMLElement} The created alert element.
 */
export const showAlert = ({ message, title, type, icon, closeable = false } = {}) => {
  const alert = document.querySelector("ez-alert");

  alert.show({
    message,
    title,
    type,
    icon,
    closeable,
  });

  return alert;
};

/**
 * Displays a custom dialog with the specified content, title, type, and buttons.
 *
 * @param {Object} options - The options for the dialog.
 * @param {string} [options.message] - The message to display in the dialog.
 * @param {HTMLElement} [options.content] - The content to display in the dialog.
 * @param {HTMLButtonElement[]} [options.buttons] - The buttons to display in the dialog.
 * @param {string} [options.title="New Dialog"] - The title of the dialog.
 * @param {string} [options.type="info"] - The type of the dialog (e.g. "warning", "error", "confirm").
 * @param {string} [options.icon] - The icon to display in the dialog.
 * @param {boolean} [options.modal=true] - Whether the dialog should be modal.
 * @returns {HTMLDialogElement} The created dialog element.
 */
export const showDialog = ({
  content,
  buttons = [],
  title = "New Dialog",
  type = "info",
  icon = "info",
  modal = true,
}) => {
  let dlg = document.createElement("dialog");
  dlg.classList.add("ez-dialog", type);
  dlg.innerHTML = `
    <header>
      <i class="material-symbols">${icon}</i>
      <span>${title}</span>
    </header>
    <main></main>
    <footer></footer>`.trim();

  if (content) {
    const body = dlg.querySelector("main");

    if (typeof content === "string") {
      body.innerHTML = content;
    } else {
      body.innerHTML = "";
      body.appendChild(content);
    }
  }

  if (buttons.length > 0) {
    const footer = dlg.querySelector("footer");

    footer.innerHTML = "";

    buttons.forEach((btn) => {
      const button = document.createElement("button");
      button.name = btn.name;
      button.classList.add("button");

      if (btn.type) button.classList.add(`btn-${btn.type}`);

      if (btn.icon) button.innerHTML = `<i class="material-symbols">${btn.icon}</i>${btn.label}`;
      else button.textContent = btn.label;

      footer.appendChild(button);
    });
  }

  dlg.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;

    const name = button.name;

    dlg.dispatchEvent(
      new CustomEvent("buttonclick", {
        bubbles: false,
        cancelable: true,
        composed: true,
        detail: {
          button,
          name,
        },
      })
    );
  });

  document.body.appendChild(dlg);

  if (modal) {
    dlg.showModal();
    dlg.dispatchEvent(new CustomEvent("open"));
  } else {
    dlg.show();
    dlg.dispatchEvent(new CustomEvent("open"));
  }

  dlg.onclose = () => {
    dlg.remove();
  };

  return dlg;
};

export const showConfirmDialog = ({ message, title = "Confirm", icon = "question_mark" }) => {
  return showDialog({
    content: `<p>${message}</p>`,
    headtitle: title,
    icon,
    buttons: [
      { name: "btnYes", text: "Yes", type: "primary" },
      { name: "btnNo", text: "No", type: "normal" },
    ],
  });
};

export const showPromptDialog = ({ message, title = "Prompt", icon = "edit" }) => {
  return showDialog({
    content: `<p>${message}</p><input type="text" id="txtPrompt" />`,
    headtitle: title,
    icon,
    buttons: [
      { name: "btnOk", text: "Ok", type: "primary" },
      { name: "btnCancel", text: "Cancel", type: "normal" },
    ],
  });
};

export const showWarningDialog = ({ message, title = "Warning", icon = "warning" }) => {
  return showDialog({
    content: `<p>${message}</p>`,
    headtitle: title,
    icon,
    type: "warning",
    buttons: [{ name: "btnOk", text: "Ok", type: "primary" }],
  });
};

export const showErrorDialog = ({ message, title = "Error", icon = "error" }) => {
  return showDialog({
    content: `<p>${message}</p>`,
    headtitle: title,
    icon,
    type: "error",
    buttons: [{ name: "btnOk", text: "Ok", type: "primary" }],
  });
};

/**
 * Fills a dropdown element with options based on the provided data.
 *
 * @param {Object} options - The options for filling the dropdown.
 * @param {HTMLSelectElement} options.dropdown - The dropdown element to be filled.
 * @param {Array} [options.data=[]] - The data to be used to populate the dropdown options.
 * @param {string} [options.valueField='value'] - The field in the data object to use as the option value.
 * @param {string} [options.textField='text'] - The field in the data object to use as the option text.
 */
export const fillDropdown = ({ dropdown, data = [], valueField = "value", textField = "text" }) => {
  if (!dropdown || !data || !valueField || !textField) return;

  dropdown.innerHTML = "";

  const option = document.createElement("option");
  option.innerHTML = "-- Please select --";
  option.disabled = true;
  option.value = "";

  dropdown.appendChild(option);

  data.forEach((item) => {
    const option = document.createElement("option");

    option.value = item[valueField];
    option.innerHTML = item[textField];

    dropdown.appendChild(option);
  });
};
