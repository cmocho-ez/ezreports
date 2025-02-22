import { join, resolve } from "node:path";
import { unlink } from "node:fs/promises";
import { throwError } from "../../utils/error.js";
import MySQL from "../../utils/mysql.js";

async function UploadCtrl(req, res) {
  const file = req.file;

  if (!file) {
    return throwError(400, "No file uploaded");
  }

  return res.status(200).json({
    message: "File uploaded successfully",
    file: file.filename,
  });

  const { title, description, author } = req.body;
  const newFile = {
    name: file.filename,
    original_name: file.originalname,
    description,
    file_path: join(resolve(process.env.UPLOAD_FILES_DEST), file.filename),
    title,
    mime_type: file.mimetype,
    size: file.size,
    author,
  };

  try {
    const config = res.app.get("config") ?? {};
    const mysql = new MySQL(config.database);

    if (!title || !description || !author) {
      await unlink(newFile.file_path);
      return throwError(400, "Title, description, and author are required");
    }

    // Insert new files into the database
    const result = await mysql.QueryTransaction(
      `insert into media (name, original_name, description, file_path, title, mime_type, size, author)
      values (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newFile.name,
        newFile.original_name,
        newFile.description,
        newFile.file_path,
        newFile.title,
        newFile.mime_type,
        newFile.size,
        newFile.author,
      ]
    );

    if (result.rowsAffected < 1) {
      await unlink(newFile.file_path);
      return throwError(500, "Error inserting file into the database");
    }

    return res.status(200).json({
      message: "File uploaded successfully",
      file: newFile,
    });
  } catch (err) {
    await unlink(newFile.file_path);
    return throwError(500, err.message);
  }
}

export default UploadCtrl;
