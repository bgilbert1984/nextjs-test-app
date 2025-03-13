// app/api/upload/route.ts
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers'; // Import headers


export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new NextResponse(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
        }

        // --- Basic Security Checks (MIME Type and File Size) ---
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']; // Add other allowed types
        const maxSize = 10 * 1024 * 1024; // 10 MB (adjust as needed)

        if (!allowedTypes.includes(file.type)) {
            return new NextResponse(JSON.stringify({ error: "Invalid file type" }), { status: 400 });
        }

        if (file.size > maxSize) {
             return new NextResponse(JSON.stringify({ error: "File too large" }), { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
		const filename = `${Date.now()}-${file.name}`; //Prevent File collisions
        const uploadDir = join(process.cwd(), 'uploads'); // FOR DEVELOPMENT ONLY
        const filePath = join(uploadDir, filename);


        // --- Save to Local Filesystem (FOR DEVELOPMENT) ---
        await writeFile(filePath, buffer);
        console.log(`File saved to: ${filePath}`);
        return NextResponse.json({ filename }); // Return the filename



        // --- Error Handling ---
    } catch (error: any) {
        console.error("File upload error:", error);
        return new NextResponse(JSON.stringify({ error: 'Failed to upload file: ' + error.message }), {status: 500});
    }
}