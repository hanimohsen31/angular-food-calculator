// a tracked day written out for an AI to read rather than for the app to load
// back. it carries what was eaten and what it was eaten against, under plain
// names and plain units, and none of the keys the database keeps its rows under

// ------------------------------ the day being read ------------------------------
// only the fields this mapper reads, the stored day carries more
export interface TrackedFoodItem {
  ShortFoodName?: string;
  Translation?: string;
  Measure?: number | string;
  MeasureUnit?: string;
  Quantity?: number | string;
  QuantityBasis?: string;
  Energy?: number | string;
  Carbohydrate?: number | string;
  Fat?: number | string;
  Protein?: number | string;
  Sugars?: number | string;
}

export interface TrackedDay {
  id?: string;
  Energy?: number | string;
  Carbohydrate?: number | string;
  Fat?: number | string;
  Protein?: number | string;
  Sugars?: number | string;
  enrgTrg?: number | string;
  enrgPer?: number | string;
  fatTarg?: number | string;
  fatPerc?: number | string;
  carbTarg?: number | string;
  carbPer?: number | string;
  proTrg?: number | string;
  proPer?: number | string;
  items?: TrackedFoodItem[];
  note?: string;
}

// ------------------------------ the exported shape ------------------------------
export type AiNutritionUnit = 'g' | 'kg' | 'ml' | 'l' | 'piece';

export interface AiNutritionValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface AiNutritionSummary extends AiNutritionValues {
  caloriesTarget: number;
  caloriesPercentage: number;
  proteinTarget: number;
  proteinPercentage: number;
  carbsTarget: number;
  carbsPercentage: number;
  fatTarget: number;
  fatPercentage: number;
}


export interface AiNutritionFood {
  name: string;
  nameAr?: string;
  quantity: number;
  unit: AiNutritionUnit;
  nutrition: AiNutritionValues;
}

// nothing is put here that the app does not already hold, so every field is
// optional and the object itself is left off a day that has none of them
export interface AiNutritionMetadata {
  goal?: string;
  activityLevel?: string;
  weightKg?: number;
  heightCm?: number;
  age?: number;
}

export interface AiNutritionExport {
  exportType: 'ai_nutrition_analysis';
  exportVersion: 1;
  date: string;
  summary: AiNutritionSummary;
  foods: AiNutritionFood[];
  notes?: string;
  metadata?: AiNutritionMetadata;
}

// ------------------------------ helpers ------------------------------
function num(value: number | string | undefined): number {
  return +(value ?? 0) || 0;
}

// enough precision to analyse against, not enough to read as noise
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// the unit is written as the amount is counted in, gm and item are what the
// food table stores, the rest are taken as they are read
function normalizeUnit(unit: string | undefined): AiNutritionUnit {
  let read = (unit || '').trim().toLowerCase();
  if (read == 'item' || read == 'items' || read == 'piece' || read == 'pieces' || read == 'pc') {
    return 'piece';
  }
  if (read == 'kg' || read == 'kilogram' || read == 'kilograms') {
    return 'kg';
  }
  if (read == 'ml' || read == 'milliliter' || read == 'milliliters') {
    return 'ml';
  }
  if (read == 'l' || read == 'liter' || read == 'liters' || read == 'litre') {
    return 'l';
  }
  // the food table stores weights as "gm", and a row saved without a unit is
  // one of those too
  return 'g';
}

// rows saved before quantities moved to the measure unit kept the quantity as a
// number of measures. the app converts those on load, a day read straight off
// the server is converted here the same way
function consumedQuantity(item: TrackedFoodItem): number {
  let quantity = num(item?.Quantity);
  return item?.QuantityBasis === 'unit' ? quantity : quantity * num(item?.Measure);
}

// nutrients are stored per the item measure, so they come down to a single unit
// before they are taken up to the amount eaten. this is the same factor the
// calculator sums a day with
function unitFactor(item: TrackedFoodItem): number {
  let measure = num(item?.Measure);
  return measure > 0 ? consumedQuantity(item) / measure : 0;
}

// "FriAug142026" or "20260814" as the day it stands for
export function aiExportDate(id: string | undefined): string {
  let value = (id || '').trim();
  let parsed: Date | null = null;
  if (/^\d{8}$/.test(value)) {
    parsed = new Date(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T00:00:00`);
  } else if (value.length >= 11) {
    // "FriAug142026" is read back spaced out, which is a date the browser parses
    parsed = new Date(
      `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 8)} ${value.slice(8)}`,
    );
  }
  if (!parsed || isNaN(parsed.getTime())) {
    return '';
  }
  // built out of the local parts, the day is a calendar day and not a moment
  let month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  let day = `${parsed.getDate()}`.padStart(2, '0');
  return `${parsed.getFullYear()}-${month}-${day}`;
}

export function aiExportFileName(day: TrackedDay | undefined): string {
  let date = aiExportDate(day?.id);
  return date ? `nutrition-ai-${date}` : 'nutrition-ai';
}

// ------------------------------ the mapper ------------------------------
// a row of the day as the amount eaten and what that amount carried. a recipe
// is one food like any other here, what it was built out of is how the database
// holds it and not what was eaten
export function toAiNutritionFood(item: TrackedFoodItem): AiNutritionFood {
  let factor = unitFactor(item);
  let scaled = (key: keyof TrackedFoodItem) => round2(num(item?.[key] as number | string) * factor);
  let arabic = (item?.Translation || '').trim();
  let food: AiNutritionFood = {
    name: (item?.ShortFoodName || '').trim() || 'Unnamed food',
    ...(arabic ? { nameAr: arabic } : {}),
    quantity: consumedQuantity(item),
    unit: normalizeUnit(item?.MeasureUnit),
    nutrition: {
      calories: scaled('Energy'),
      protein: scaled('Protein'),
      carbs: scaled('Carbohydrate'),
      fat: scaled('Fat'),
    },
  };
  return food;
}

export function toAiNutritionSummary(day: TrackedDay): AiNutritionSummary {
  return {
    calories: round2(num(day?.Energy)),
    caloriesTarget: round2(num(day?.enrgTrg)),
    caloriesPercentage: round2(num(day?.enrgPer)),

    protein: round2(num(day?.Protein)),
    proteinTarget: round2(num(day?.proTrg)),
    proteinPercentage: round2(num(day?.proPer)),

    carbs: round2(num(day?.Carbohydrate)),
    carbsTarget: round2(num(day?.carbTarg)),
    carbsPercentage: round2(num(day?.carbPer)),

    fat: round2(num(day?.Fat)),
    fatTarget: round2(num(day?.fatTarg)),
    fatPercentage: round2(num(day?.fatPerc)),
  };
}

// the day the app already worked out, written in the AI schema. metadata is
// only ever what was handed in, nothing about the body is stored on a day and
// none of it is guessed here
export function toAiNutritionExport(
  day: TrackedDay,
  metadata?: AiNutritionMetadata,
): AiNutritionExport {
  let output: AiNutritionExport = {
    exportType: 'ai_nutrition_analysis',
    exportVersion: 1,
    date: aiExportDate(day?.id),
    summary: toAiNutritionSummary(day),
    foods: (day?.items || []).map((item: TrackedFoodItem) => toAiNutritionFood(item)),
  };
  let note = (day?.note || '').trim();
  if (note) {
    output.notes = note;
  }
  let hasMetadata = metadata
    ? Object.keys(metadata).some(
        (key: string) => metadata[key as keyof AiNutritionMetadata] !== undefined,
      )
    : false;
  if (metadata && hasMetadata) {
    output.metadata = metadata;
  }
  return output;
}
