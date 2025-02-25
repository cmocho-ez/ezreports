import { throwError } from "../../utils/error.js";

function ViewerCtrl(req, res) {
  const { config, userPrefs } = res.locals;
  const { uid } = req.params;

  if (!uid) {
    throwError(400, "Missing report UID");
  }

  const report = {
    uid,
    title: "My Report",
    description: "This is a sample report",
    content: {},
  };

  res.render("viewer", { config, userPrefs, report });
}

export default ViewerCtrl;
