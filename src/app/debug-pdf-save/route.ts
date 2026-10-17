import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { filename, base64 } = await req.json();
    const cleanBase64 = base64.replace(/^data:application\/pdf[^,]*,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const outDir = 'C:\\Users\\dhira\\.gemini\\antigravity-ide\\brain\\100c3172-c5b2-46c1-ae01-c4e6d89e825d\\scratch';
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const safeName = filename || 'epaper-generated.pdf';
    const filePath = path.join(outDir, safeName);
    fs.writeFileSync(filePath, buffer);
    return NextResponse.json({ success: true, filePath, bytes: buffer.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
