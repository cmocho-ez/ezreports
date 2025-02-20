export class EzTable extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.data = [];
    this.columns = [];
    this.defaultBody = null;
    this.page = 1;
    this.pageSize = 50;
    this.totalPages = 1;
    this.totalRecords = 0;
    this.shownRecords = 0;
    this.sortColumn = "";
    this.sortDirection = "asc";
    this.filter = {};
    this.selectedRow = null;
    this.toolBarbuttons = [];
    this.showToolbar = true;
    this.showNavigation = true;
    this.showFilter = true;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue;
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/styles/components/tables.css" />
      <div class="ez-table full">
        <section class="toolbar">
          <div class="toolbar-buttons"></div>
          <div class="filter-controls">
            <button class="button icon btn-normal" title="Filtrar..." name="btnFilter">
              <i class="material-symbols">filter_list</i><span>Filtrar...</span>
            </button>
          </div>
          <div class="table-options">
            <ez-switch state="on"></ez-switch>
            <label>Mostrar etiquetas</label>
          </div>
        </section>

        <section class="main-table"></section>

        <section class="footer">
          <div class="page-size-controls">
            <label for="page-size">Mostrar:</label>
            <select class="form-element" id="page-size">
              <option value="10">10</option>
              <option value="25">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div class="pagination-controls">
            <button class="button icon small btn-primary" id="btnFirst" title="Primeiro">
              <i class="material-symbols">keyboard_double_arrow_left</i>
            </button>
            <button class="button icon small btn-primary" id="btnPrev" title="Anterior">
              <i class="material-symbols">chevron_left</i>
            </button>
            <span>Página</span>
            <input class="form-element" style="width: 4rem" type="number" id="page-number" value="1" min="1" />
            <span>de</span><span id="total-pages">1</span>
            <button class="button icon small btn-primary" id="btnNext" title="Próximo">
              <i class="material-symbols">chevron_right</i>
            </button>
            <button class="button icon small btn-primary" id="btnLast" title="Último">
              <i class="material-symbols">keyboard_double_arrow_right</i>
            </button>
          </div>
          <div class="records-info">
            <span id="records-info"></span>
          </div>
        </section>
      </div>
    `;

    this.renderToolbar();
    this.renderFooter();
    this.renderTable();
  }

  renderToolbar() {
    const toolbar = this.shadowRoot.querySelector(".toolbar");
    const toolbarButtons = toolbar.querySelector(".toolbar-buttons");

    // TODO: Check authorization for the buttons
    toolbarButtons.innerHTML = `
      <button class="button icon btn-primary" title="Novo registo" name="btnNew">
        <i class="material-symbols">add_circle</i><span>Novo registo</span>
      </button>
      <button class="button icon btn-primary" title="Editar selecionado" name="btnEdit">
        <i class="material-symbols">edit</i><span>Editar selecionado</span>
      </button>
      <button class="button icon btn-danger" title="Excluir selecionado" name="btnDelete">
        <i class="material-symbols">delete</i><span>Excluir selecionado</span>
      </button>
      <div class="separator"></div>
    `;

    toolbarButtons.innerHTML += `${this.toolBarbuttons.map(
      (button) =>
        `<button class="button icon btn-primary" title="${button.label}" name="${button.name}">
          <i class="material-symbols">${button.icon}</i>
          <span>${button.label}</span>
        </button>`
    )}`;
  }

  renderFooter() {
    const pageSize = this.shadowRoot.querySelector("#page-size");
    const pageNumber = this.shadowRoot.querySelector("#page-number");
    const totalPages = this.shadowRoot.querySelector("#total-pages");
    const recordsInfo = this.shadowRoot.querySelector("#records-info");

    pageSize.value = this.pageSize;
    pageNumber.value = this.page;
    totalPages.textContent = this.totalPages;
    recordsInfo.textContent = `Exibindo ${this.shownRecords} de ${this.totalRecords} registos`;
  }

  renderTable() {
    const table = this.shadowRoot.querySelector(".main-table");

    table.innerHTML = `
      <table>
        <thead>
          <tr>
            ${this.columns
              .map(
                (column) =>
                  `<th data-column="${column.field}" ${column.sortable ? 'class="sortable" ' : ""}>${column.title}</th>`
              )
              .join("")}
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    this.renderTableBody();
  }

  renderTableBody() {
    const table = this.shadowRoot.querySelector(".main-table");
    const tableBody = table.querySelector("tbody");

    tableBody.innerHTML = this.defaultBody;

    const renderCell = (row, column) => {
      if (column.format) return column.format(row);

      return row[column.field];
    };

    if (this.data.length > 0) {
      tableBody.innerHTML = this.data
        // .slice((this.page - 1) * this.pageSize, this.page * this.pageSize) // Pagination should be done on the server side
        .map((row) => {
          return `
            <tr>
              ${this.columns
                .map(
                  (column) =>
                    `<td ${column.align ? `class="align-${column.align}"` : ""}>${renderCell(row, column)}</td>`
                )
                .join("")}
            </tr>
          `;
        })
        .join("");
    }
  }

  addEventListeners() {
    const toolbar = this.shadowRoot.querySelector(".toolbar");
    const labelSwitch = this.shadowRoot.querySelector("ez-switch");
    const pagination = this.shadowRoot.querySelector(".pagination-controls");
    const table = this.shadowRoot.querySelector(".main-table");

    labelSwitch.addEventListener("statechange", (e) => {
      toolbar.querySelectorAll("button span").forEach((span) => {
        span.style.display = e.detail.data === "on" ? "inline" : "none";
      });
    });
  }
}
