import { createClient } from '@supabase/supabase-js';
import type { AnalysisResult, PrintJob, NearbyDetection } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const FUNCTION_URL = `${supabaseUrl}/functions/v1/ai-analyze`;

export async function scanObject(imageData?: string): Promise<{ object: string; confidence: number }> {
  const response = await fetch(`${FUNCTION_URL}/scan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageData }),
  });
  if (!response.ok) throw new Error(`Scan failed (${response.status})`);
  const data = await response.json();
  if (!data.object) throw new Error('Invalid scan response');
  return data;
}

export async function analyzeObject(object?: string, confidence?: number, imageData?: string): Promise<AnalysisResult> {
  const response = await fetch(`${FUNCTION_URL}/analyze`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ object, confidence, image: imageData }),
  });
  if (!response.ok) throw new Error(`Analysis failed (${response.status})`);
  const data = await response.json();
  if (!data.object) throw new Error('Invalid analysis response');
  return data;
}

export async function createPrintJob(job: {
  part_name: string;
  required_material: string;
  estimated_print_time: string;
  estimated_material_amount: string;
  design_available: boolean;
  source_item?: string;
}): Promise<PrintJob> {
  const response = await fetch(`${FUNCTION_URL}/3d-print`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(job),
  });
  if (!response.ok) throw new Error(`Print job creation failed (${response.status})`);
  const data = await response.json();
  return data;
}

export async function autoScan(userId: string, count: number = 3): Promise<NearbyDetection[]> {
  const response = await fetch(`${FUNCTION_URL}/auto-scan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId, count }),
  });
  if (!response.ok) throw new Error(`Auto-scan failed (${response.status})`);
  const data = await response.json();
  if (!data.detections) throw new Error('Invalid auto-scan response');
  return data.detections;
}

export async function getNearbyDetections(userId: string, limit: number = 20): Promise<NearbyDetection[]> {
  const response = await fetch(`${FUNCTION_URL}/nearby?user_id=${userId}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });
  if (!response.ok) throw new Error(`Nearby fetch failed (${response.status})`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

