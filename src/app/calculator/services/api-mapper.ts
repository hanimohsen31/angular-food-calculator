// the screens speak in the names the food table has always used
// (ShortFoodName, Energy, Carbohydrate ...), the node server speaks in its own
// (englishName, energy, carbs ...). the translation between the two is kept
// here, so nothing above the services has to know about either shape.

// ------------------------------ food & recipes ------------------------------
// a recipe item is stored with the amount it contributes as its measure, and
// its nutrients already scaled to that amount, so a saved recipe reads back
// with a unit factor of one and the totals come out the same
export function recipeItemFromApi(item: any): any {
  let measure = +item?.measure || 0;
  return {
    FoodKey: '',
    FoodID: '',
    ShortFoodName: item?.englishName || '',
    Translation: item?.arabicName || '',
    Measure: measure,
    MeasureUnit: item?.MeasureUnit || 'gm',
    Quantity: measure,
    QuantityBasis: 'unit',
    Energy: +item?.energy || 0,
    Carbohydrate: +item?.carbs || 0,
    Fat: +item?.fats || 0,
    Protein: +item?.proteins || 0,
    Sugars: +item?.sugars || 0,
  };
}

export function recipeItemToApi(item: any): any {
  let measure = +item?.Measure || 0;
  let quantity = +item?.Quantity || 0;
  // nutrients are stored per Measure, the amount used is the typed quantity
  let factor = measure > 0 ? quantity / measure : 0;
  let scaled = (key: string) => Math.round((+item?.[key] || 0) * factor * 100) / 100;
  return {
    englishName: item?.ShortFoodName || '',
    arabicName: item?.Translation || '',
    measure: quantity,
    MeasureUnit: item?.MeasureUnit || 'gm',
    energy: scaled('Energy'),
    carbs: scaled('Carbohydrate'),
    fats: scaled('Fat'),
    proteins: scaled('Protein'),
    sugars: scaled('Sugars'),
  };
}

export function foodFromApi(food: any): any {
  let id = food?.id || food?._id || '';
  return {
    // the row id doubles as the key the screens update and delete through
    FoodKey: id,
    FoodID: id,
    ShortFoodName: food?.englishName || '',
    Translation: food?.arabicName || '',
    Measure: +food?.measure || 0,
    MeasureUnit: food?.MeasureUnit || 'gm',
    Quantity: 1,
    QuantityBasis: 'unit',
    Energy: +food?.energy || 0,
    Carbohydrate: +food?.carbs || 0,
    Fat: +food?.fats || 0,
    Protein: +food?.proteins || 0,
    Sugars: +food?.sugars || 0,
    isRecipe: !!food?.isRecipe,
    RecipeItems: (food?.RecipeItems || []).map((item: any) => recipeItemFromApi(item)),
  };
}

export function foodToApi(food: any): any {
  let body: any = {
    englishName: food?.ShortFoodName || '',
    arabicName: food?.Translation || '',
    measure: +food?.Measure || 0,
    MeasureUnit: food?.MeasureUnit || 'gm',
    energy: +food?.Energy || 0,
    carbs: +food?.Carbohydrate || 0,
    fats: +food?.Fat || 0,
    proteins: +food?.Protein || 0,
    sugars: +food?.Sugars || 0,
  };
  if (food?.isRecipe) {
    body.RecipeItems = (food?.RecipeItems || []).map((item: any) => recipeItemToApi(item));
  }
  return body;
}

// ------------------------------ settings ------------------------------
// a stored zero is a setting like any other, the custom activity level is kept
// as one, so a missing value is what falls back and not a falsy one
function number(value: any, fallback: number): number {
  return value === null || value === undefined || value === '' || isNaN(+value)
    ? fallback
    : +value;
}

export function settingsFromApi(settings: any): any {
  if (!settings) {
    return null;
  }
  return {
    targetEnergy: +settings?.targetEnergy || 0,
    macroSplit: {
      Fat: +settings?.macroSplit?.fats || 0,
      Carbohydrate: +settings?.macroSplit?.carbs || 0,
      Protein: +settings?.macroSplit?.proteins || 0,
    },
    targetProfile: {
      Gender: settings?.targetProfile?.gender || 'male',
      Age: +settings?.targetProfile?.age || 0,
      Weight: +settings?.targetProfile?.weight || 0,
      Height: +settings?.targetProfile?.height || 0,
      BodyFat: number(settings?.targetProfile?.bodyFat, 20),
      Formula: settings?.targetProfile?.formula || 'mifflin',
      Activity: number(settings?.targetProfile?.activity, 1.375),
      ActivityCustom: number(settings?.targetProfile?.activityCustom, 1.4),
      Goal: settings?.targetProfile?.goal || 'keep',
      GoalCustom: number(settings?.targetProfile?.goalCustom, -500),
      MacroMethod: settings?.targetProfile?.macroMethod || 'goal',
      SplitProtein: number(settings?.targetProfile?.splitProtein, 20),
      SplitFat: number(settings?.targetProfile?.splitFat, 30),
      SplitCarbs: number(settings?.targetProfile?.splitCarbs, 50),
      ProteinPerKg: number(settings?.targetProfile?.proteinPerKg, 2.0),
      FatPerKg: number(settings?.targetProfile?.fatPerKg, 0.8),
    },
    // the stamp the last write lands under, this is what decides which device
    // carries over when two of them have been used apart
    updatedAt: +settings?.stamp || 0,
    addedFoodList: settings?.addedFoodList || [],
  };
}

export function settingsToApi(settings: any): any {
  return {
    targetEnergy: +settings?.targetEnergy || 0,
    macroSplit: {
      fats: +settings?.macroSplit?.Fat || 0,
      carbs: +settings?.macroSplit?.Carbohydrate || 0,
      proteins: +settings?.macroSplit?.Protein || 0,
    },
    targetProfile: {
      gender: settings?.targetProfile?.Gender || 'male',
      age: +settings?.targetProfile?.Age || 0,
      weight: +settings?.targetProfile?.Weight || 0,
      height: +settings?.targetProfile?.Height || 0,
      bodyFat: number(settings?.targetProfile?.BodyFat, 20),
      formula: settings?.targetProfile?.Formula || 'mifflin',
      activity: number(settings?.targetProfile?.Activity, 1.375),
      activityCustom: number(settings?.targetProfile?.ActivityCustom, 1.4),
      goal: settings?.targetProfile?.Goal || 'keep',
      goalCustom: number(settings?.targetProfile?.GoalCustom, -500),
      macroMethod: settings?.targetProfile?.MacroMethod || 'goal',
      splitProtein: number(settings?.targetProfile?.SplitProtein, 20),
      splitFat: number(settings?.targetProfile?.SplitFat, 30),
      splitCarbs: number(settings?.targetProfile?.SplitCarbs, 50),
      proteinPerKg: number(settings?.targetProfile?.ProteinPerKg, 2.0),
      fatPerKg: number(settings?.targetProfile?.FatPerKg, 0.8),
    },
    stamp: +settings?.updatedAt || 0,
  };
}

// ------------------------------ tracking ------------------------------
export function trackingDayFromApi(day: any): any {
  return {
    id: day?.dayId || '',
    Measure: +day?.measure || 0,
    Energy: +day?.energy || 0,
    Carbohydrate: +day?.carbs || 0,
    Fat: +day?.fats || 0,
    Protein: +day?.proteins || 0,
    Sugars: +day?.sugars || 0,
    enrgTrg: +day?.energyTarget || 0,
    enrgPer: +day?.energyPercentage || 0,
    fatTarg: +day?.fatsTarget || 0,
    fatPerc: +day?.fatsPercentage || 0,
    carbTarg: +day?.carbsTarget || 0,
    carbPer: +day?.carbsPercentage || 0,
    proTrg: +day?.proteinsTarget || 0,
    proPer: +day?.proteinsPercentage || 0,
    items: day?.items || [],
    note: day?.note || '',
  };
}

export function trackingDayToApi(day: any, dayId: string): any {
  return {
    dayId: dayId,
    measure: +day?.Measure || 0,
    energy: +day?.Energy || 0,
    carbs: +day?.Carbohydrate || 0,
    fats: +day?.Fat || 0,
    proteins: +day?.Protein || 0,
    sugars: +day?.Sugars || 0,
    energyTarget: +day?.enrgTrg || 0,
    energyPercentage: +day?.enrgPer || 0,
    fatsTarget: +day?.fatTarg || 0,
    fatsPercentage: +day?.fatPerc || 0,
    carbsTarget: +day?.carbTarg || 0,
    carbsPercentage: +day?.carbPer || 0,
    proteinsTarget: +day?.proTrg || 0,
    proteinsPercentage: +day?.proPer || 0,
    items: day?.items || [],
  };
}
