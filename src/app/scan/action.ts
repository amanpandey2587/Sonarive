'use server';

import { buildApiUrl } from '@/lib/backend-url';
import type { AnalyzeMedicalScanOutput } from '@/types/scan';

interface ScanAnalysisResult {
  data: AnalyzeMedicalScanOutput | null;
  error: string | null;
}

export async function handleScanUpload(scanDataUri: string): Promise<ScanAnalysisResult> {
  if (!scanDataUri) {
    return {
      data: null,
      error: 'No scan data provided.',
    };
  }

  if (!scanDataUri.startsWith('data:image/')) {
    return {
      data: null,
      error: 'Invalid image data format. Please upload a valid image file (PNG, JPG, etc.).',
    };
  }

  try {
    const response = await fetch(buildApiUrl('/api/scan-analyze'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scanDataUri }),
      cache: 'no-store',
    });

    const payload = await response.json();
    const initialResult = payload?.data as AnalyzeMedicalScanOutput | undefined;

    if (!response.ok) {
      return {
        data: null,
        error: payload?.error || 'Scan analysis service returned an error.',
      };
    }

    if (!initialResult || !Array.isArray(initialResult.findings) || typeof initialResult.summary !== 'string') {
      console.error('AI initial analysis result structure is not as expected:', initialResult);
      return {
        data: null,
        error: 'AI initial analysis returned an unexpected data structure. Please try again.',
      };
    }

    return { data: initialResult, error: null };
  } catch (error) {
    console.error('Error during scan analysis process:', error);
    let errorMessage = 'An error occurred during the scan analysis. Please try again later.';
    if (error instanceof Error) {
      errorMessage = `Analysis failed: ${error.message}`;
    }
    return { data: null, error: errorMessage };
  }
}
