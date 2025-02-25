import { showAlert, showDialog } from "./utilities/utils.js";
import Bytes from "./utilities/bytes.js";

let currentView = "grid";

function viewAsGrid() {
  currentView = "grid";

  const bytes = new Bytes();

  document.querySelector(".media-list").style.display = "none";
  const container = document.querySelector(".media-grid");
  container.style.display = "grid";
  container.innerHTML = "";

  if (mediaLib.length === 0) {
    container.innerHTML = `<p>No media uploaded yet.</p>`;
    return;
  }

  mediaLib.forEach(async (media) => {
    let thumb = "";

    // If image is SVG, encode it as Base64
    if (media.base64) {
      thumb = `<img class="thumb-image" src="${media.base64}" />`;
    } else {
      thumb = `<img class="thumb-image" src="/medialib/${media.name}" />`;
    }

    thumb += `<div class="thumb-info">
      <span class="thumb-title">${media.title}</span>
      <span class="thumb-author">Author: ${media.author}</span>
      <span class="thumb-size">${bytes.format(Number(media.size))}</span>
    </div>`.trim();

    const thumbContainer = document.createElement("div");
    thumbContainer.classList.add("thumb");
    thumbContainer.innerHTML = thumb;
    thumbContainer.title = media.title;

    thumbContainer.metadata = media;

    container.appendChild(thumbContainer);
  });
}

function viewAsList() {
  currentView = "list";

  document.querySelector(".media-grid").style.display = "none";
  const container = document.querySelector(".media-list");
  container.style.display = "grid";
  container.innerHTML = "";

  if (mediaLib.length === 0) {
    container.innerHTML = `<p>No media uploaded yet.</p>`;
    return;
  }
}

function refreshView() {
  if (currentView === "grid") {
    viewAsGrid();
  } else {
    viewAsList();
  }
}

// Toolbar
function uploadMedia() {
  const dlg = showDialog({
    icon: "upload",
    headtitle: "Upload media",
    content: document.querySelector("#upload").innerHTML.trim(),
    buttons: [
      { label: "Clear list", icon: "clear_all", name: "btnClearAll", type: "danger" },
      { label: "Upload all", icon: "upload", name: "btnUploadAll", type: "primary" },
      { label: "Cancel", icon: "cancel", name: "btnCancel", type: "normal" },
    ],
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
            <button class="button btn-icon" name="btnPreviewFile" title="Preview"><i class="material-symbols">fullscreen</i></button>
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

    return new Promise((resolve, reject) => {
      if (!fileProps) {
        return reject("File properties are not set");
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
          if (xhr.readyState === 4) {
            meter.value = 100;
            row.classList.add("success");

            resolve(JSON.parse(xhr.responseText || "{}"));

            fileList = fileList.filter((f) => f !== file);

            setTimeout(() => {
              row.remove();
            }, 5000);
          }
        } else {
          meter.value = 0;
          reject(`Error uploading file: ${file.name}. ${xhr.statusText}`);
        }
      });

      xhr.send(formData);
    });
  }

  async function uploadAllFiles() {
    for await (const file of fileList) {
      const row = [...dlg.querySelector(".file-list").children].find((r) => r.data === file);

      try {
        const resp = await uploadFile(row);
        mediaLib.push(resp.file);
        refreshView();
      } catch (err) {
        addErrorRibbon(row, err.message || "An error occurred while uploading the file. Please try again later.");
        console.log(err);
      }
    }
  }

  function fileProps(row) {
    const { title, description, author } = row.metadata;

    const dlg = showDialog({
      icon: "more_horiz",
      title: "File properties",
      content: `
      <section class="file-props">
        <div class="form-group">
          <label for="title">Title:</label>
          <input type="text" id="title" value="${title}" />
        </div>
        <div class="form-group">
          <label for="description">Description:</label>
          <textarea id="description">${description}</textarea>
        </div>
        <div class="form-group">
          <label for="author">Author:</label>
          <input type="text" id="author" value="${author}" />
        </div>
      </section>
      `,
      buttons: [
        { label: "Save", icon: "save", name: "btnSave", type: "primary" },
        { label: "Cancel", icon: "cancel", name: "btnCancel", type: "normal" },
      ],
    });

    dlg.addEventListener("buttonclick", (e) => {
      const { name } = e.detail;

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

  dlg.addEventListener("buttonclick", async (e) => {
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
        previewMedia(button.closest(".file-row").data);
        break;
      case "btnUploadFile": {
        const resp = await uploadFile(button.closest(".file-row"));
        mediaLib.push(resp.file);
        refreshView();

        break;
      }
      case "btnFileProps": {
        fileProps(button.closest(".file-row"));
        break;
      }
    }
  });
}

function downloadMedia() {}

function selectAll() {
  const thumbs = document.querySelectorAll(".thumb");
  thumbs.forEach((thumb) => thumb.classList.toggle("selected"));
}

function previewMedia(file) {
  if (!file) return;

  let prev;

  if (file instanceof File) {
    prev = {
      title: file.name,
      url: URL.createObjectURL(file),
    };
  } else {
    prev = {
      title: file.original_name,
      url: file.base64 ?? "/medialib/" + file.name,
    };
  }

  const dlg = showDialog({
    icon: "image",
    title: `Preview of ${prev.title}`,
    content: `<div class="preview-box"><img src="${prev.url}" alt="${prev.title}" /></div>`,
    buttons: [{ label: "Close", icon: "close", name: "btnClose", type: "normal" }],
  });

  dlg.addEventListener("buttonclick", dlg.close);
}

function deleteSelected() {
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

const card = document.querySelector("ez-card");
card.addToolbarButtons([
  { label: "Upload...", icon: "upload", name: "btnUpload" },
  { label: "Download selected", icon: "download", name: "btnDownload" },
  { type: "divider" },
  { label: "Select/Deselect all", icon: "checklist", name: "btnSelAll" },
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
    case "btnSelAll":
      selectAll();
      break;
    case "btnView":
      break;
    case "btnDelete":
      deleteSelected();
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

card.querySelector(".media-grid").addEventListener("click", (e) => {
  const thumb = e.target.closest(".thumb");
  if (!thumb) return;

  thumb.classList.toggle("selected");
});

card.querySelector(".media-list").addEventListener("click", (e) => {
  const item = e.target.closest(".media-item");
  if (!item) return;

  item.classList.toggle("selected");
});

card.querySelector(".media-grid").addEventListener("dblclick", (e) => {
  const thumb = e.target.closest(".thumb");
  if (!thumb) return;

  previewMedia(thumb.metadata);
});

viewAsGrid();
