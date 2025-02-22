import { showAlert, showDialog, newButton } from "./utilities/utilities.js";

// Toolbar
function uploadMedia(button) {
  button.disabled = true;

  const dlg = showDialog({
    icon: "upload",
    title: "Upload media",
    content: document.querySelector("#upload").content.cloneNode(true),
    buttons: [
      newButton({ label: "Clear list", icon: "clear_all", name: "btnClearAll", type: "danger" }),
      newButton({ label: "Upload all", icon: "upload", name: "btnUploadAll", type: "primary" }),
      newButton({ label: "Cancel", icon: "cancel", name: "btnCancel", type: "normal" }),
    ],
  });

  dlg.addEventListener("close", () => {
    button.disabled = false;
  });

  const dropArea = dlg.querySelector(".drop-area");
  const fileInput = dlg.querySelector("#file");

  let fileList = [];

  // Listing files
  function listFiles(files) {
    files.forEach((file) => {
      const html = `
        <div class="file-row">
          <div class="file-image" style="background-image: url(${URL.createObjectURL(file)})"></div>
          <div class="file-info">
            <span class="file-name">${file.name}</span>
            <span class="file-size">${file.size}&nbsp;bytes</span>
            <span class="file-type">${file.type}</span>
          </div>
          <div class="file-actions">
            <button class="button btn-icon" name="btnFileProps" title="Properties..."><i class="material-symbols">more_horiz</i></button>
            <button class="button btn-icon" name="btnUploadFile" title="Upload"><i class="material-symbols">upload</i></button>
            <button class="button btn-icon" name="btnCancelFile" title="Cancel"><i class="material-symbols">delete</i></button>
            <button class="button btn-icon" name="btnPreviewFile" title="Enlarge"><i class="material-symbols">fullscreen</i></button>
          </div>
          <meter value="0" max="100" optimal="100"></meter>
        </div>
      `;

      const filelist = dlg.querySelector(".file-list");
      filelist.insertAdjacentHTML("beforeend", html);
      filelist.querySelector(".file-row:last-child").data = file;
      filelist.querySelector(".file-row:last-child").metadata = {
        title: file.name,
        description: "",
        author: "cristian.mocho",
      };

      fileList.push(file);
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
    listFiles(Array.from(dt.files));
  }

  function onDropAreaClick(e) {
    fileInput.click();
  }

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Auxiliary functions
  function addErrorRibbon(row, message) {
    row.classList.add("error");

    const ribbon = document.createElement("div");
    ribbon.innerHTML = `<i class="material-symbols">warning</i>`;
    ribbon.classList.add("ribbon");
    ribbon.title = message;

    row.appendChild(ribbon);
  }

  function removeErrorRibbon(row) {
    row.classList.remove("error");
    const ribbon = row.querySelector(".ribbon");
    if (ribbon) ribbon.remove();
  }

  function uploadFile(row) {
    const file = row.data;
    const fileProps = row.metadata;
    const meter = row.querySelector("meter");

    if (!fileProps) {
      addErrorRibbon(row, 'File properties are not set!\nClick que "Properties" button, fill the form and try again.');
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("title", fileProps.title);
    formData.append("description", fileProps.description);
    formData.append("author", fileProps.author);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload", true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        meter.value = percentComplete;
      }
    };

    xhr.addEventListener("readystatechange", (e) => {
      if (xhr.status === 200) {
        meter.value = 100;
        row.classList.add("success");

        setTimeout(() => {
          row.remove();
        }, 3000);
      } else {
        meter.value = 0;
        addErrorRibbon(row, `Error uploading file: ${file.name}. ${xhr.statusText}`);
      }
    });

    xhr.send(formData);
  }

  function uploadAllFiles() {
    fileList.forEach((file) => {
      const row = [...dlg.querySelector(".file-list").children].find((r) => r.data === file);
      uploadFile(row);
    });
  }

  function enlargeImage(file) {
    // Shows the image in a dialog
    const dlg = showDialog({
      icon: "image",
      title: `Preview of ${file.name}`,
      content: `<div class="preview-box"><img src="${URL.createObjectURL(file)}" alt="${file.name}" /></div>`,
    });

    dlg.addEventListener("dialogbuttonclick", dlg.close);
  }

  function fileProps(row) {
    const { title, description, author } = row.metadata;

    const dlg = showDialog({
      icon: "more_horiz",
      title: "File properties",
      content: `
        <div class="form-group">
          <label for="title">Title:</label>
          <input type="text" id="title" />
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea id="description"></textarea>
        </div>
        <div class="form-group">
          <label for="author">Author:</label>
          <input type="text" id="author" />
        </div>
      `,
      buttons: [
        newButton({ label: "Save", icon: "save", name: "btnSave", type: "primary" }),
        newButton({ label: "Cancel", icon: "cancel", name: "btnCancel", type: "normal" }),
      ],
    });

    dlg.querySelector("#title").value = title;
    dlg.querySelector("#description").value = description;
    dlg.querySelector("#author").value = author;

    dlg.addEventListener("dialogbuttonclick", (e) => {
      const button = e.detail.button;
      const name = button.name;

      switch (name) {
        case "btnSave":
          row.metadata = {
            title: dlg.querySelector("#title").value,
            description: dlg.querySelector("#description").value,
            author: dlg.querySelector("#author").value,
          };
          break;
      }

      dlg.close();
    });
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
      listFiles(Array.from(e.target.files));
    },
    false
  );

  dlg.addEventListener("dialogbuttonclick", (e) => {
    const button = e.detail.button;
    const name = button.name;

    switch (name) {
      case "btnClearAll":
        dlg.querySelector(".file-list").innerHTML = "";
        fileList = [];
        break;
      case "btnUploadAll":
        uploadAllFiles();
        break;
      case "btnCancel":
        dlg.close();
        break;
      case "btnCancelFile": {
        const file = button.closest(".file-row").data;
        fileList = fileList.filter((f) => f !== file);
        button.closest(".file-row").remove();
        break;
      }
      case "btnPreviewFile":
        enlargeImage(button.closest(".file-row").data);
        break;
      case "btnUploadFile":
        uploadFile(button.closest(".file-row"));
        break;
      case "btnFileProps": {
        fileProps(button.closest(".file-row"));
        break;
      }
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
        uploadMedia(button);
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
