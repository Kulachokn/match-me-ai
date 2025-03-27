import { NextResponse } from 'next/server';
// import pdfParse from 'pdf-parse';
import pdf from 'pdf-parse/lib/pdf-parse.js';

import mammoth from 'mammoth';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  console.log("Received file:", file.name, "Size:", fileBuffer.length);
  // const filePath = path.join('/tmp', file.name);
  const filePath = path.join(process.cwd(), 'uploads', file.name);

  await writeFile(filePath, fileBuffer);

  try {
    let extractedText = '';

    if (file.name.endsWith('.pdf')) {
      // const pdfData = await pdfParse(fileBuffer);
      // const pdfData = await pdfParse(Buffer.from(fileBuffer));
      const pdfData = await pdf(Buffer.from(fileBuffer));

      extractedText = pdfData.text;
    } else if (file.name.endsWith('.docx')) {
      const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = docxData.value;
    } else {
      return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 });
    }

    await unlink(filePath); // Delete the temporary file

    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Failed to extract text' }, { status: 500 });
  }
}
