// /home/ashben/www/html/tipics/nextjs-test-app/app/api/hello/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Determine the absolute path to the python-backend directory. __dirname works
    // reliably *both* in dev and production, *and* with Vercel deployments.
    const backendDir = path.join(process.cwd(), 'python-backend');
    const scriptPath = path.join(backendDir, 'hello.py');

    // Use a more robust way to execute the script and capture output
    const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`, { cwd: backendDir, shell: '/bin/bash' }); //Set working dir

    if (stderr) {
      console.error("Error from Python script:", stderr);
      return NextResponse.json({ error: `Python script error: ${stderr}` }, { status: 500 });
    }

    return NextResponse.json({ message: stdout.trim() }); // trim() removes extra whitespace

  } catch (error: any) {
    console.error('Error running Python script:', error);
    return NextResponse.json({ error: `Failed to run Python script: ${error.message}` }, { status: 500 });
  }
}