import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    const isAuthenticated = await verifySession();
    return NextResponse.json({ authenticated: isAuthenticated });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
