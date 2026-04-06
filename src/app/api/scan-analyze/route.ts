import { NextRequest } from 'next/server';
import { proxyBackendRequest } from '@/lib/server-backend-proxy';

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, '/api/scan-analyze');
}
