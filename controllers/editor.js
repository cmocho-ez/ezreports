import { throwError } from "../utils/error.js";

function EditorCtrl(req, res) {
  const config = res.app.get("config") ?? {};
  const userPrefs = res.app.get("userPrefs") ?? {};

  const { uid } = req.params;

  if (!uid) {
    return res.render("editor-new", { config, userPrefs });
  }

  const report = {
    uid,
    title: "My Report",
    description: "This is a sample report",
    content: {},
  };

  return res.render("editor", { config, userPrefs, report });
}

export default EditorCtrl;
