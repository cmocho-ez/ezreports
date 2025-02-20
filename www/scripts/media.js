import { showAlert, showDialog } from "./utilities/utilities.js";

// Toolbar
function uploadMedia() {
  const dlg = showDialog({
    icon: "upload",
    title: "Upload media",
    content: document.querySelector("#upload").content.cloneNode(true),
  });

  const dropArea = dlg.querySelector(".drop-area");
  const fileInput = dlg.querySelector("#file");

  let fileList = [];

  // Previewing files
  function previewFiles(files) {
    console.log(files);
    return;

    files.forEach((f) => {
      // Saves the object
      const file = new FileRow(f.name, f.size, f.type, f);
      fileList.push(file);

      // Creates the DOM node
      container.find(".file-list").append(file.node);

      // Prepare the node with events
      file.node.on("optionselected", (e, data) => {
        switch (data.option) {
          case "btnUpload":
            file.checkIfFileExist();
            // file.uploadFile();
            break;

          case "btnCancel":
            if (file.status !== "uploading") {
              fileList = fileList.filter((f) => f !== file);
              file.node.remove();
            } else {
              file.cancelUpload();
            }

            break;

          case "btnPreview": {
            const previewDialog = new Dialog({
              title: "Preview file",
              size: { width: "50%", height: "70%" },
              icon: "eye",
              buttons: [{ name: "btnClose", label: "Close", icon: "times", type: "secondary small" }],
            });

            if (file.type.search("image") >= 0) {
              const previewObj = $('<div style="height: 100%; background-size: contain;">');
              previewObj.css("background-image", `url(${URL.createObjectURL(file.data)})`);
              previewDialog.node.find(".body").empty().append(previewObj);
            } else if (file.type.search("pdf") >= 0) {
              const previewObj = $('<object style="height: calc(100% - 2px); width: 100%">');
              previewObj.attr("data", URL.createObjectURL(file.data));
              previewDialog.node.find(".body").empty().append(previewObj);
            } else {
              previewDialog.node.find(".body").empty().append("<p>No preview available</p>");
            }

            previewDialog.node.find(".body").append("");
            previewDialog.Show();
            previewDialog.node.on("buttonclicked", (e, btn) => {
              previewDialog.Close();
            });

            break;
          }
        }
      });
    });
  }

  // Event handling
  function highlight() {
    dropArea.classList.add("highlight");
  }

  function unhighlight() {
    dropArea.classList.remove("highlight");
  }

  function handleDrop(e) {
    let dt = e.dataTransfer;
    previewFiles(Array.from(dt.files));
  }

  function onDropAreaClick(e) {
    fileInput.click();
  }

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover", "dragleave", "drop"].forEach((e) => {
    dropArea.addEventListener(e, preventDefaults);
  });

  ["dragenter", "dragover"].forEach((e) => {
    dropArea.addEventListener(e, highlight);
  });

  ["dragleave", "drop"].forEach((e) => {
    dropArea.addEventListener(e, unhighlight);
  });

  dropArea.addEventListener("drop", handleDrop);
  dropArea.addEventListener("click", onDropAreaClick);

  fileInput.addEventListener(
    "change",
    (e) => {
      previewFiles(Array.from(e.target.files));
    },
    false
  );

  dlg.addEventListener("dialogbuttonclick", (e) => {
    const button = e.detail.button;
    const name = button.name;

    switch (name) {
      case "btnUploadAll":
        break;
      case "btnConfirm":
        dlg.close();
        break;
    }
  });
}

function downloadMedia() {}
function previewMedia() {}

function deleteMedia() {
  const dlg = showDialog({
    icon: "delete",
    title: "Delete media",
    message: "Are you sure you want to delete the selected media?",
    type: "confirm",
  });

  dlg.addEventListener("dialogbuttonclick", (e) => {
    const button = e.detail.button;
    const name = button.name;

    dlg.close();

    switch (name) {
      case "btnConfirm":
        showAlert({
          message: "Media deleted",
          title: "Media deleted",
          type: "success",
          icon: "check",
        });
        break;
      case "btnCancel":
        showAlert({
          message: "Media not deleted",
          title: "Media not deleted",
          type: "info",
          icon: "info",
        });
        break;
    }
  });
}

function viewAsGrid() {}
function viewAsList() {}

const cards = document.querySelectorAll("ez-card");
cards.forEach((card) => {
  card.addToolbarButtons([
    { label: "Upload...", icon: "upload", name: "btnUpload" },
    { label: "Download selected", icon: "download", name: "btnDownload" },
    { label: "Preview selected", icon: "preview", name: "btnView" },
    { label: "Delete selected", icon: "delete", name: "btnDelete" },
    { type: "divider" },
    { label: "View as grid", icon: "grid_view", name: "btnViewGrid" },
    { label: "View as list", icon: "view_list", name: "btnViewList" },
  ]);

  card.addEventListener("toolbarbuttonclick", async (e) => {
    const button = e.detail.button;
    const name = button.name;

    switch (name) {
      case "btnUpload":
        uploadMedia();
        break;
      case "btnDownload":
        break;
      case "btnView":
        break;
      case "btnDelete":
        deleteMedia();
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
