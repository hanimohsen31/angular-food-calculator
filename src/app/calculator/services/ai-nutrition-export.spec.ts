import {
  AiNutritionMetadata,
  TrackedDay,
  TrackedFoodItem,
  aiExportDate,
  aiExportFileName,
  toAiNutritionExport,
  toAiNutritionFood,
} from './ai-nutrition-export';

// a row as the food table stores one, nutrients per Measure and the amount
// eaten as Quantity
function item(overrides: Partial<TrackedFoodItem> = {}): TrackedFoodItem {
  return {
    ShortFoodName: 'White Rice (cooked ,boiled)',
    Translation: 'ارز ابيض مسلوق',
    Measure: 100,
    MeasureUnit: 'gm',
    Quantity: 250,
    QuantityBasis: 'unit',
    Energy: 129,
    Carbohydrate: 27.9,
    Fat: 0.28,
    Protein: 2.66,
    Sugars: 0,
    ...overrides,
  };
}

function day(overrides: Partial<TrackedDay> = {}): TrackedDay {
  return {
    id: 'FriAug142026',
    Energy: 2174.8900000000003,
    Carbohydrate: 299.4381,
    Fat: 34.3953,
    Protein: 161.14649999999997,
    Sugars: 28.25,
    enrgTrg: 2057,
    enrgPer: 105.73116188624212,
    fatTarg: 53.97376093294461,
    fatPerc: 63.72596499756927,
    carbTarg: 256.8751214771623,
    carbPer: 116.56952151616669,
    proTrg: 135.93391642371233,
    proPer: 118.54767687094284,
    items: [],
    note: '',
    ...overrides,
  };
}

describe('ai nutrition export', () => {
  describe('gram based foods', () => {
    it('writes the nutrition of the amount eaten, not of the measure', () => {
      let food = toAiNutritionFood(item());
      expect(food.quantity).toBe(250);
      expect(food.unit).toBe('g');
      expect(food.nutrition).toEqual({
        calories: 322.5,
        protein: 6.65,
        carbs: 69.75,
        fat: 0.7,
      });
    });

    it('writes the measure itself when that is what was eaten', () => {
      let food = toAiNutritionFood(item({ Quantity: 100 }));
      expect(food.nutrition.calories).toBe(129);
      expect(food.nutrition.carbs).toBe(27.9);
    });

    it('reads a legacy row whose quantity counted measures', () => {
      let food = toAiNutritionFood(item({ Quantity: 2.5, QuantityBasis: 'measure' }));
      expect(food.quantity).toBe(250);
      expect(food.nutrition.calories).toBe(322.5);
    });

    it('normalizes the stored unit names', () => {
      expect(toAiNutritionFood(item({ MeasureUnit: 'gm' })).unit).toBe('g');
      expect(toAiNutritionFood(item({ MeasureUnit: 'KG' })).unit).toBe('kg');
      expect(toAiNutritionFood(item({ MeasureUnit: 'ml' })).unit).toBe('ml');
      expect(toAiNutritionFood(item({ MeasureUnit: 'liter' })).unit).toBe('l');
      expect(toAiNutritionFood(item({ MeasureUnit: '' })).unit).toBe('g');
    });
  });

  describe('piece based foods', () => {
    it('keeps the count and calls the unit a piece', () => {
      let food = toAiNutritionFood(
        item({
          ShortFoodName: 'Egg Medium',
          Translation: 'بيضة متوسطة',
          Measure: 1,
          MeasureUnit: 'item',
          Quantity: 2,
          Energy: 65,
          Carbohydrate: 0.34,
          Fat: 4.37,
          Protein: 5.54,
          Sugars: 0.34,
        }),
      );
      expect(food).toEqual({
        name: 'Egg Medium',
        nameAr: 'بيضة متوسطة',
        quantity: 2,
        unit: 'piece',
        nutrition: { calories: 130, protein: 11.08, carbs: 0.68, fat: 8.74 },
      });
    });
  });

  describe('recipes', () => {
    it('writes a recipe as one consumed food, with nothing of how it is stored', () => {
      let food = toAiNutritionFood({
        ShortFoodName: 'Chicken Shawarma',
        Translation: 'شاورما دجاج',
        Measure: 100,
        MeasureUnit: 'gm',
        Quantity: 250,
        QuantityBasis: 'unit',
        Energy: 180,
        Carbohydrate: 8,
        Fat: 8,
        Protein: 18,
        Sugars: 1.2,
        // the stored row carries these, the export must not
        ...({ isRecipe: true, RecipeItems: [{ englishName: 'Chicken' }], FoodID: 'abc' } as object),
      } as TrackedFoodItem);
      expect(food.nutrition).toEqual({
        calories: 450,
        protein: 45,
        carbs: 20,
        fat: 20,
      });
      expect(Object.keys(food).sort()).toEqual(['name', 'nameAr', 'nutrition', 'quantity', 'unit']);
    });
  });

  describe('the whole day', () => {
    it('writes the header, the summary and every food', () => {
      let output = toAiNutritionExport(
        day({
          items: [
            item({ ShortFoodName: 'Egg Medium', Measure: 1, MeasureUnit: 'item', Quantity: 2 }),
            item(),
          ],
        }),
      );
      expect(output.exportType).toBe('ai_nutrition_analysis');
      expect(output.exportVersion).toBe(1);
      expect(output.date).toBe('2026-08-14');
      expect(output.foods.length).toBe(2);
      expect(output.foods.every((food) => !!food.name)).toBe(true);
      expect(output.foods.every((food) => food.quantity > 0)).toBe(true);
      expect(output.foods.every((food) => !!food.unit)).toBe(true);
    });

    it('holds no database ids or ambiguous measure fields', () => {
      let output = toAiNutritionExport(day({ items: [item()] }));
      let text = JSON.stringify(output);
      for (let key of [
        'FoodKey',
        'FoodID',
        '"id"',
        'RecipeItems',
        'isRecipe',
        'QuantityBasis',
        'MeasureUnit',
        'Measure',
        'Energy',
        'Carbohydrate',
      ]) {
        expect(text).not.toContain(key);
      }
    });

    it('rounds the summary to two places off the app totals', () => {
      let output = toAiNutritionExport(day());
      expect(output.summary).toEqual({
        calories: 2174.89,
        caloriesTarget: 2057,
        caloriesPercentage: 105.73,
        protein: 161.15,
        proteinTarget: 135.93,
        proteinPercentage: 118.55,
        carbs: 299.44,
        carbsTarget: 256.88,
        carbsPercentage: 116.57,
        fat: 34.4,
        fatTarget: 53.97,
        fatPercentage: 63.73,
      });
    });

    it('adds the foods up to the summary the app calculated', () => {
      let items = [
        item({ Measure: 1, MeasureUnit: 'item', Quantity: 2, Energy: 65, Protein: 5.54 }),
        item(),
      ];
      let totals = items.reduce(
        (sum, elm) => {
          let food = toAiNutritionFood(elm);
          sum.calories += food.nutrition.calories;
          sum.protein += food.nutrition.protein;
          return sum;
        },
        { calories: 0, protein: 0 },
      );
      let output = toAiNutritionExport(
        day({ items: items, Energy: totals.calories, Protein: totals.protein }),
      );
      let foods = output.foods;
      let sumOf = (key: 'calories' | 'protein') =>
        foods.reduce((total, food) => total + food.nutrition[key], 0);
      expect(sumOf('calories')).toBeCloseTo(output.summary.calories, 2);
      expect(sumOf('protein')).toBeCloseTo(output.summary.protein, 2);
    });

    it('writes an empty food list rather than leaving it out', () => {
      let output = toAiNutritionExport(day({ items: undefined }));
      expect(output.foods).toEqual([]);
      expect(output.summary.calories).toBe(2174.89);
    });

    it('leaves metadata off when none was handed in', () => {
      expect(toAiNutritionExport(day()).metadata).toBeUndefined();
      expect(toAiNutritionExport(day(), {}).metadata).toBeUndefined();
      expect(toAiNutritionExport(day(), {} as AiNutritionMetadata).metadata).toBeUndefined();
    });

    it('writes metadata it was handed, and nothing beside it', () => {
      let output = toAiNutritionExport(day(), { goal: 'fat_loss', weightKg: 65.5 });
      expect(output.metadata).toEqual({ goal: 'fat_loss', weightKg: 65.5 });
    });

    it('carries the note of the day only when there is one', () => {
      expect(toAiNutritionExport(day()).notes).toBeUndefined();
      expect(toAiNutritionExport(day({ note: 'travel day' })).notes).toBe('travel day');
    });

    it('leaves an unnamed row named rather than blank', () => {
      let output = toAiNutritionExport(day({ items: [item({ ShortFoodName: '' })] }));
      expect(output.foods[0].name).toBe('Unnamed food');
      expect(output.foods[0].nameAr).toBe('ارز ابيض مسلوق');
    });
  });

  describe('the date', () => {
    it('reads both stored id shapes', () => {
      expect(aiExportDate('FriAug142026')).toBe('2026-08-14');
      expect(aiExportDate('MonJul172023')).toBe('2023-07-17');
      expect(aiExportDate('20200101')).toBe('2020-01-01');
      expect(aiExportDate('')).toBe('');
    });

    it('names the file after the day', () => {
      expect(aiExportFileName(day())).toBe('nutrition-ai-2026-08-14');
      expect(aiExportFileName({})).toBe('nutrition-ai');
    });
  });
});
