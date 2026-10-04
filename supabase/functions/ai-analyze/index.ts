import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DetectionResult {
  object: string;
  confidence: number;
}

interface AnalysisResult {
  object: string;
  material: string;
  condition: string;
  damage_level: string;
  reusable: boolean;
  repairable: boolean;
  recyclable: boolean;
  three_d_print_potential: boolean;
  recommended_action: string;
  reason: string;
  category: string;
  confidence: number;
}

const OBJECT_DATABASE: Record<string, {
  material: string;
  category: string;
  conditions: { condition: string; damage_level: string; reusable: boolean; repairable: boolean; recyclable: boolean; three_d_print_potential: boolean }[];
}> = {
  "Plastic Container": {
    material: "Plastic",
    category: "Storage",
    conditions: [
      { condition: "Damaged", damage_level: "Medium", reusable: true, repairable: true, recyclable: true, three_d_print_potential: false },
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: true, three_d_print_potential: false },
      { condition: "Critical", damage_level: "High", reusable: false, repairable: false, recyclable: true, three_d_print_potential: true },
    ],
  },
  "Carbon Fiber Sheet": {
    material: "Carbon Fiber",
    category: "Material",
    conditions: [
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: false, three_d_print_potential: false },
      { condition: "Damaged", damage_level: "Low", reusable: true, repairable: true, recyclable: false, three_d_print_potential: false },
    ],
  },
  "Metal Wrench": {
    material: "Steel",
    category: "Tool",
    conditions: [
      { condition: "Worn", damage_level: "Low", reusable: true, repairable: true, recyclable: true, three_d_print_potential: false },
      { condition: "Damaged", damage_level: "Medium", reusable: false, repairable: true, recyclable: true, three_d_print_potential: true },
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: true, three_d_print_potential: false },
    ],
  },
  "Solar Panel": {
    material: "Silicon/Glass",
    category: "Equipment",
    conditions: [
      { condition: "Critical", damage_level: "High", reusable: false, repairable: false, recyclable: true, three_d_print_potential: false },
      { condition: "Damaged", damage_level: "Medium", reusable: false, repairable: true, recyclable: true, three_d_print_potential: false },
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: false, three_d_print_potential: false },
    ],
  },
  "Food Pouch": {
    material: "Plastic Foil",
    category: "Container",
    conditions: [
      { condition: "Good", damage_level: "None", reusable: false, repairable: false, recyclable: true, three_d_print_potential: true },
      { condition: "Damaged", damage_level: "Low", reusable: false, repairable: false, recyclable: true, three_d_print_potential: true },
    ],
  },
  "Pipe Fitting": {
    material: "Aluminum",
    category: "Equipment",
    conditions: [
      { condition: "Damaged", damage_level: "Medium", reusable: false, repairable: false, recyclable: true, three_d_print_potential: true },
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: true, three_d_print_potential: false },
      { condition: "Critical", damage_level: "High", reusable: false, repairable: false, recyclable: true, three_d_print_potential: true },
    ],
  },
  "Circuit Board": {
    material: "Silicon/Copper",
    category: "Electronics",
    conditions: [
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: true, three_d_print_potential: false },
      { condition: "Damaged", damage_level: "Medium", reusable: false, repairable: true, recyclable: true, three_d_print_potential: false },
    ],
  },
  "Space Suit Glove": {
    material: "Synthetic Fiber",
    category: "Equipment",
    conditions: [
      { condition: "Worn", damage_level: "Medium", reusable: true, repairable: true, recyclable: false, three_d_print_potential: false },
      { condition: "Damaged", damage_level: "High", reusable: false, repairable: true, recyclable: false, three_d_print_potential: false },
    ],
  },
  "Oxygen Filter": {
    material: "Ceramic/Carbon",
    category: "Equipment",
    conditions: [
      { condition: "Worn", damage_level: "Low", reusable: true, repairable: true, recyclable: true, three_d_print_potential: false },
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: true, three_d_print_potential: false },
    ],
  },
  "Titanium Bolt": {
    material: "Titanium",
    category: "Hardware",
    conditions: [
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: true, three_d_print_potential: false },
      { condition: "Worn", damage_level: "Low", reusable: true, repairable: false, recyclable: true, three_d_print_potential: false },
    ],
  },
  "Thermal Blanket": {
    material: "Aerogel Composite",
    category: "Equipment",
    conditions: [
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: false, three_d_print_potential: false },
      { condition: "Damaged", damage_level: "Medium", reusable: true, repairable: true, recyclable: false, three_d_print_potential: false },
    ],
  },
  "Water Filter Cartridge": {
    material: "Activated Carbon",
    category: "Equipment",
    conditions: [
      { condition: "Worn", damage_level: "Low", reusable: false, repairable: false, recyclable: true, three_d_print_potential: true },
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: true, three_d_print_potential: false },
    ],
  },
  "Helmet Visor": {
    material: "Polycarbonate",
    category: "Equipment",
    conditions: [
      { condition: "Damaged", damage_level: "Medium", reusable: false, repairable: true, recyclable: true, three_d_print_potential: false },
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: true, three_d_print_potential: false },
    ],
  },
  "Power Cable": {
    material: "Copper/Insulation",
    category: "Electronics",
    conditions: [
      { condition: "Damaged", damage_level: "Medium", reusable: false, repairable: true, recyclable: true, three_d_print_potential: false },
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: true, three_d_print_potential: false },
    ],
  },
  "3D Printed Bracket": {
    material: "PLA",
    category: "Hardware",
    conditions: [
      { condition: "Damaged", damage_level: "Medium", reusable: false, repairable: false, recyclable: true, three_d_print_potential: true },
      { condition: "Good", damage_level: "None", reusable: true, repairable: false, recyclable: true, three_d_print_potential: true },
    ],
  },
};

const OBJECT_NAMES = Object.keys(OBJECT_DATABASE);

const REASONS: Record<string, (obj: string, material: string, condition: string) => string> = {
  REPAIR: (obj, material, condition) =>
    `The ${obj.toLowerCase()} is ${condition.toLowerCase()} but its core structure remains intact. Repairing it with available ${material.toLowerCase()} bonding materials is more resource-efficient than manufacturing a replacement, saving an estimated 2.3 kg of Earth-supplied mass.`,
  REUSE: (obj, material, _condition) =>
    `The ${obj.toLowerCase()} is in good working condition. Direct reuse avoids unnecessary processing and conserves ${material} stock. Reusing this item prevents 1.5 kg of potential waste.`,
  RECYCLE: (obj, material, condition) =>
    `The ${obj.toLowerCase()} is ${condition.toLowerCase()} and cannot be restored to working order. However, its ${material} components can be broken down and reprocessed into raw filament or feedstock, recovering approximately 80% of the original material value.`,
  EXCHANGE: (obj, material, _condition) =>
    `The ${obj.toLowerCase()} (${material}) is functional but surplus to current mission needs. Listing it on the exchange allows another habitat module to utilize it, optimizing cross-mission resource allocation and reducing duplicate supply requests from Earth.`,
  "3D_PRINT": (obj, material, condition) =>
    `The ${obj.toLowerCase()} is ${condition.toLowerCase()} beyond practical repair. A replacement part can be 3D printed using recycled ${material} feedstock, eliminating the need for a resupply mission. Estimated print time: 1-3 hours using onboard printer.`,
  DISCARD: (obj, _material, condition) =>
    `The ${obj.toLowerCase()} is ${condition.toLowerCase()} with no viable recovery path. The material composition does not support recycling or reprocessing with current mission capabilities. Recommend minimal waste storage pending Earth-return disposal.`,
};

function decideAction(cond: { condition: string; damage_level: string; reusable: boolean; repairable: boolean; recyclable: boolean; three_d_print_potential: boolean }): string {
  if (cond.reusable && (cond.damage_level === "None" || cond.damage_level === "Low")) return "REUSE";
  if (cond.repairable && (cond.damage_level === "Medium" || cond.damage_level === "Low")) return "REPAIR";
  if (cond.three_d_print_potential && cond.damage_level === "High") return "3D_PRINT";
  if (cond.recyclable && (cond.damage_level === "High" || cond.damage_level === "Medium")) return "RECYCLE";
  if (cond.recyclable && !cond.reusable && !cond.repairable) return "RECYCLE";
  if (!cond.recyclable && !cond.repairable && !cond.reusable) return "DISCARD";
  return "REUSE";
}

function simulateDetection(imageData?: string): DetectionResult {
  let objectName: string;
  if (imageData && imageData.length > 100) {
    const hash = imageData.charCodeAt(50) + imageData.charCodeAt(100) + imageData.charCodeAt(200);
    objectName = OBJECT_NAMES[hash % OBJECT_NAMES.length];
  } else {
    objectName = OBJECT_NAMES[Math.floor(Math.random() * OBJECT_NAMES.length)];
  }
  const confidence = 0.85 + Math.random() * 0.14;
  return { object: objectName, confidence: parseFloat(confidence.toFixed(2)) };
}

function analyzeObject(detection: DetectionResult): AnalysisResult {
  const db = OBJECT_DATABASE[detection.object] || OBJECT_DATABASE["Plastic Container"];
  const conditionIndex = Math.floor(Math.random() * db.conditions.length);
  const cond = db.conditions[conditionIndex];
  const action = decideAction(cond);
  const reason = REASONS[action] ? REASONS[action](detection.object, db.material, cond.condition) : "Analysis complete.";

  return {
    object: detection.object,
    material: db.material,
    condition: cond.condition,
    damage_level: cond.damage_level,
    reusable: cond.reusable,
    repairable: cond.repairable,
    recyclable: cond.recyclable,
    three_d_print_potential: cond.three_d_print_potential,
    recommended_action: action,
    reason,
    category: db.category,
    confidence: detection.confidence,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop() || "";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (path === "scan") {
      const body = await req.json().catch(() => ({}));
      const imageData = body.image || body.imageData;
      const detection = simulateDetection(imageData);

      await supabase.from("scan_logs").insert({
        detected_object: detection.object,
        confidence: detection.confidence,
      });

      return new Response(JSON.stringify(detection), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "analyze") {
      const body = await req.json().catch(() => ({}));
      let detection: DetectionResult;

      if (body.object && body.confidence) {
        detection = { object: body.object, confidence: body.confidence };
      } else {
        detection = simulateDetection(body.image || body.imageData);
      }

      const analysis = analyzeObject(detection);

      await supabase.from("scan_logs").update({
        material: analysis.material,
        condition: analysis.condition,
        recommended_action: analysis.recommended_action,
      }).eq("detected_object", detection.object).order("created_at", { ascending: false }).limit(1);

      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (path === "3d-print") {
      const body = await req.json().catch(() => ({}));
      if (req.method === "POST") {
        const { data, error } = await supabase.from("print_jobs").insert({
          part_name: body.part_name || "Custom Part",
          required_material: body.required_material || "Recycled PLA",
          estimated_print_time: body.estimated_print_time || "1h 30m",
          estimated_material_amount: body.estimated_material_amount || "25g",
          design_available: body.design_available ?? true,
          status: "Pending",
          source_item: body.source_item || null,
        }).select().single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        const { data, error } = await supabase.from("print_jobs").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown endpoint. Use /scan, /analyze, or /3d-print" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
