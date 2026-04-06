import { NextRequest, NextResponse } from 'next/server';

function resolveBackendBaseUrl(): string {
  const configured = process.env.BACKEND_URL?.trim() || process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  const baseUrl = configured || 'http://localhost:8000';
  return baseUrl.replace(/\/+$/, '');
}

export async function proxyBackendRequest(request: NextRequest, targetPath: string): Promise<NextResponse> {
  const backendUrl = `${resolveBackendBaseUrl()}${targetPath}${request.nextUrl.search}`;
  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.text();

  try {
    const response = await fetch(backendUrl, {
      method,
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
      },
      body,
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || 'application/json';
    const responseText = await response.text();

    if (contentType.includes('application/json')) {
      const payload = responseText ? JSON.parse(responseText) : {};
      return NextResponse.json(payload, { status: response.status });
    }

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Backend service is unavailable.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 }
    );
  }
}
