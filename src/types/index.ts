export type ActionType = 'REPAIR' | 'REUSE' | 'RECYCLE' | 'EXCHANGE' | '3D_PRINT' | 'DISCARD';
export type ItemStatus = 'Available' | 'Repaired' | 'Recycled' | 'Exchanged' | 'Printed' | 'Discarded';
export type PrintStatus = 'Pending' | 'Printing' | 'Completed' | 'Failed';
export type ExchangeStatus = 'Available' | 'Requested' | 'Transferred';

export interface SpacecraftProfile {
  id: string;
  spacecraft_name: string;
  mission_type: string;
  coordinates: string;
  crew_size: number;
  status: string;
  created_at: string;
}

export interface InventoryItem {
  id: number;
  object_name: string;
  category: string;
  material: string;
  condition: string;
  damage_level: string;
  quantity: number;
  location: string;
  recommended_action: ActionType;
  reason: string;
  status: ItemStatus;
  reusable: boolean;
  repairable: boolean;
  recyclable: boolean;
  three_d_print_potential: boolean;
  image_url: string | null;
  user_id: string | null;
  created_at: string;
}

export interface AnalysisResult {
  object: string;
  material: string;
  condition: string;
  damage_level: string;
  reusable: boolean;
  repairable: boolean;
  recyclable: boolean;
  three_d_print_potential: boolean;
  recommended_action: ActionType;
  reason: string;
  category: string;
  confidence: number;
}

export interface DetectionResult {
  object: string;
  confidence: number;
}

export interface PrintJob {
  id: number;
  part_name: string;
  required_material: string;
  estimated_print_time: string;
  estimated_material_amount: string;
  design_available: boolean;
  status: PrintStatus;
  source_item: string | null;
  created_at: string;
}

export interface ExchangeListing {
  id: number;
  item_name: string;
  material: string;
  quantity: number;
  location: string;
  status: ExchangeStatus;
  description: string;
  listed_by: string;
  requested_by: string | null;
  user_id: string | null;
  created_at: string;
}

export interface ScanLog {
  id: number;
  detected_object: string;
  confidence: number;
  material: string;
  condition: string;
  recommended_action: string;
  created_at: string;
}

export interface NearbyDetection {
  id: number;
  spacecraft_id: string;
  detected_object: string;
  confidence: number;
  material: string;
  condition: string;
  recommended_action: string;
  auto_listed: boolean;
  created_at: string;
}
