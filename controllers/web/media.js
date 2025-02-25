import { readFile } from "node:fs/promises";

import MySQL from "../../utils/mysql.js";
import { throwError } from "../../utils/error.js";

async function MediaCtrl(req, res) {
  const { config, userPrefs } = res.locals;

  // Loading media
  try {
    const mysql = new MySQL(config.database);
    const result = await mysql.QueryTransaction(`select * from media`);

    // Add the Base64 encoded version of the media to each row if it is an SVG file
    for await (const row of result.rows) {
      if (row.mime_type === "image/svg+xml") {
        const fileContent = await readFile(row.file_path, "utf-8");
        const base64 = Buffer.from(fileContent).toString("base64");

        row.base64 = `data:image/svg+xml;base64,${base64}`;
      }
    }

    return res.render("media", { config, userPrefs, mediaLib: result.rows });
  } catch (err) {
    return throwError(500, err.message);
  }
}

export default MediaCtrl;
