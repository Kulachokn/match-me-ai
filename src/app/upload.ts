// import { NextApiRequest, NextApiResponse } from "next";
// import formidable from "formidable";
// import fs from "fs/promises";

// export const config = {
//   api: {
//     bodyParser: false, 
//   },
// };

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method Not Allowed" });
//   }

//   const form = new formidable.IncomingForm();

//   form.parse(req, async (err, fields, files) => {
//     if (err) {
//       return res.status(500).json({ message: "File upload error" });
//     }

//     const file = files.file?.[0]; 
//     if (!file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const fileContent = await fs.readFile(file.filepath, "utf-8");

//     return res.status(200).json({ text: fileContent });
//   });
// }
