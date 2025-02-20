import { showAlert } from "./utilities/utilities.js";

// Document
const Document = {
  margins: [10, 10, 10, 10], // Always in mm
  grid: 5,
  filterParams: {},
  sortingOrder: {},
  datasources: {
    reportSections: {
      main: "SELECT * FROM VIEW_REPORT_SALES_ORDER_TO_APPROVE",
      lines: "SELECT * FROM SALES_ORDER_LINE WHERE SO_ID={{SO_ID}}",
      chart01: "",
    },
  },
  templateFilePath: "",
};

// Toolbar
const card = document.querySelector("ez-card");
card.addToolbarButtons([
  { label: "New file", icon: "note_add", name: "btnNew" },
  { label: "Open file", icon: "folder_open", name: "btnLoad" },
  { label: "Save file", icon: "save", name: "btnSave" },
  { label: "Edit source...", icon: "html", name: "btnEdit" },
  { label: "Document properties", icon: "tune", name: "btnDocProperties" },
  { type: "divider" },
  { label: "Copy selected", icon: "content_copy", name: "btnCopy" },
  { label: "Paste", icon: "content_paste", name: "btnPaste" },
  { label: "Delete", icon: "delete", name: "btnDelete" },
  { label: "Toggle grid", icon: "grid_on", name: "btnToggleGrid" },
  { label: "Toggle guidelines", icon: "grid_4x4", name: "btnToggleGuides" },
  { type: "divider" },
  { label: "New label", icon: "title", name: "btnAddLabel" },
  { label: "Add Data Token", icon: "data_object", name: "btnAddToken" },
  { label: "Add media", icon: "add_photo_alternate", name: "btnAddMedia" },
  { label: "Add chart", icon: "pie_chart", name: "btnAddChart" },
  { type: "divider" },
  { label: "Preview report", icon: "preview", name: "btnPreview" },
  { label: "Print...", icon: "print", name: "btnPrint" },
  { type: "divider" },
  { label: "Set data source", icon: "database", name: "btnDataSource" },
  { label: "Add sub-report section", icon: "schema", name: "btnSubreport" },
  { type: "divider" },
  { label: "Quick guide", icon: "help", name: "btnHelp" },
]);

card.addEventListener("toolbarbuttonclick", async (e) => {
  const button = e.detail.button;
  const name = button.name;

  switch (name) {
    case "btnToggleGrid":
      toggleGrid();
      break;
    case "btnToggleGuides":
      toggleGuides();
      break;
    default:
      showAlert({
        message: `toolbar button clicked: ${name}`,
        title: "Button clicked",
        type: "success",
        icon: "check",
      });
      break;
  }
});

// Context menus
const context = {
  editor: [
    { icon: "account_circle", label: "My profile", name: "mnuUserProfile" },
    { icon: "corporate_fare", label: "My company", name: "mnuCompanyProfile" },
    { type: "divider" },
    { icon: "power_settings_new", label: "Logout", name: "mnuLogout" },
  ],
  document: [
    { icon: "account_circle", label: "My profile", name: "mnuUserProfile" },
    { icon: "corporate_fare", label: "My company", name: "mnuCompanyProfile" },
    { type: "divider" },
    { icon: "power_settings_new", label: "Logout", name: "mnuLogout" },
  ],
  label: [
    { icon: "account_circle", label: "My profile", name: "mnuUserProfile" },
    { icon: "corporate_fare", label: "My company", name: "mnuCompanyProfile" },
    { type: "divider" },
    { icon: "power_settings_new", label: "Logout", name: "mnuLogout" },
  ],
  chart: [
    { icon: "account_circle", label: "My profile", name: "mnuUserProfile" },
    { icon: "corporate_fare", label: "My company", name: "mnuCompanyProfile" },
    { type: "divider" },
    { icon: "power_settings_new", label: "Logout", name: "mnuLogout" },
  ],
  token: [
    { icon: "account_circle", label: "My profile", name: "mnuUserProfile" },
    { icon: "corporate_fare", label: "My company", name: "mnuCompanyProfile" },
    { type: "divider" },
    { icon: "power_settings_new", label: "Logout", name: "mnuLogout" },
  ],
  media: [
    { icon: "account_circle", label: "My profile", name: "mnuUserProfile" },
    { icon: "corporate_fare", label: "My company", name: "mnuCompanyProfile" },
    { type: "divider" },
    { icon: "power_settings_new", label: "Logout", name: "mnuLogout" },
  ],
};

// Handling events
const editor = document.querySelector("section.document-container");
const canvas = editor.querySelector("canvas");
const ctx = canvas.getContext("2d");

const pxPerMm = 3.7776815776815775; // For an A4 paper

let showingGrid = false;
let showingGuides = false;
let zoom = 1;

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

ctx.clearRect(0, 0, canvas.width, canvas.height);

function drawGrid() {
  const stroke = { size: 1, color: "#555" };

  const marginsInPx = [
    Number(Document.margins[0]) * pxPerMm, // left
    Number(Document.margins[1]) * pxPerMm, // top
    Number(210 - Document.margins[2]) * pxPerMm, // right
    Number(297 - Document.margins[3]) * pxPerMm, // bottom
  ];

  ctx.beginPath();
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.size;

  for (let x = marginsInPx[0]; x <= marginsInPx[2]; x += pxPerMm * Document.grid) {
    for (let y = marginsInPx[1]; y <= marginsInPx[3]; y += pxPerMm * Document.grid) {
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawGuides() {
  const stroke = { size: 1, color: "#0000ff20" };
  const marginsInPx = [
    Number(Document.margins[0]) * pxPerMm, // left
    Number(Document.margins[1]) * pxPerMm, // top
    Number(210 - Document.margins[2]) * pxPerMm, // right
    Number(297 - Document.margins[3]) * pxPerMm, // bottom
  ];

  ctx.beginPath();

  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;

  // Draw vertical left margin
  ctx.moveTo(marginsInPx[0], 0);
  ctx.lineTo(marginsInPx[0], canvas.clientHeight);
  ctx.stroke();

  // Draw vertical right margin
  ctx.moveTo(marginsInPx[2], 0);
  ctx.lineTo(marginsInPx[2], canvas.clientHeight);
  ctx.stroke();

  // Draw horizontal top margin
  ctx.moveTo(0, marginsInPx[1]);
  ctx.lineTo(canvas.clientWidth, marginsInPx[1]);
  ctx.stroke();

  // Draw horizontal bottom margin
  ctx.moveTo(0, marginsInPx[3]);
  ctx.lineTo(canvas.clientWidth, marginsInPx[3]);
  ctx.stroke();
}

function zoomInOut(amount) {
  zoom += amount / 100;
  editor.style.zoom = zoom;

  showAlert({
    title: `Zoom: ${(zoom * 100).toFixed(0)}%`,
    type: "info",
    icon: "pageview",
  });
}

function resetZoom() {
  zoom = 1;
  editor.style.zoom = zoom;

  showAlert({
    title: `Zoom: ${zoom * 100}%`,
    type: "info",
    icon: "pageview",
  });
}

function toggleGuides() {
  showingGuides = !showingGuides;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (showingGrid) drawGrid();
  if (showingGuides) drawGuides();
}

function toggleGrid() {
  showingGrid = !showingGrid;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (showingGrid) drawGrid();
  if (showingGuides) drawGuides();
}

document.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "NumpadAdd":
      if (e.altKey) zoomInOut(10);
      break;
    case "NumpadSubtract":
      if (e.altKey) zoomInOut(-10);
      break;
    case "Numpad0":
      if (e.altKey) resetZoom();
      break;
  }
});
