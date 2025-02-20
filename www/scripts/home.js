import { showAlert } from "./utilities/utilities.js";

// Toolbar
const cards = document.querySelectorAll("ez-card");
cards.forEach((card) => {
  card.addToolbarButtons([
    { label: "New report", icon: "note_add", name: "btnNew" },
    { label: "Edit report", icon: "edit_document", name: "btnEdit" },
    { label: "View report", icon: "preview", name: "btnView" },
    { label: "Delete report", icon: "delete", name: "btnDelete" },
    { label: "Favorite report", icon: "favorite", name: "btnFavorite" },
  ]);

  card.addEventListener("toolbarbuttonclick", async (e) => {
    const button = e.detail.button;
    const name = button.name;

    switch (name) {
      case "btnNew":
        location.assign("/editor");
        break;
      case "btnEdit":
        break;
      case "btnView":
        break;
      case "btnDelete":
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
});
