import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";

const UPLOAD_FOLDER = path.join(process.cwd(), "uploads");

fs.mkdirSync(UPLOAD_FOLDER, {recursive: true});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
        const newName = `${randomUUID}.${file.originalname.split(".").at(-1)}`
        cb(null, newName);
    }
});

export const upload = multer({storage});