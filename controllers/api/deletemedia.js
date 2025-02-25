import { unlink } from "node:fs/promises";
import { throwError } from "../../utils/error.js";
import MySQL from "../../utils/mysql.js";

async function DeleteMediaCtrl(req, res) {
  const file = req.file;
  const { uid } = req.body;

  if (!uid) {
    return throwError(400, "No uid provided");
  }
  try {
    const config = res.app.get("config") ?? {};
    const mysql = new MySQL(config.database);

    // Delete the actual file before deleting the row
    const fileResult = await mysql.QueryTransaction(`select file_path from media where uid = ?`, [uid]);

    unlink(fileResult.rows[0].file_path);

    // Delete files from the database
    const result = await mysql.QueryTransaction(`delete from media where uid = ?`, [uid]);

    if (result.rowsAffected < 1) {
      return throwError(500, "Error deleting file from the database");
    }

    return res.status(200).json({
      message: "File deleted successfully",
    });
  } catch (err) {
    return throwError(500, err.message);
  }
}

export default DeleteMediaCtrl;
