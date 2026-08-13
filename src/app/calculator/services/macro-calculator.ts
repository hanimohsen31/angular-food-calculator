// how a day of calories is cut up into grams.
//
// the calories themselves are worked out elsewhere, on the target page, and
// arrive here as a single number. what happens to them here is that the protein
// and the fat are taken off body weight rather than off the calorie number, and
// the carbohydrates are whatever is left over. a percentage split cannot say
// how much protein a body needs, only how much of the day it happens to be, so
// a high calorie day would hand out protein nobody asked for.

export const CALORIES_PER_GRAM: any = { Fat: 9, Carbohydrate: 4, Protein: 4 };

// what a gram per kg target is allowed to be. the middle one is what a body is
// planned on unless a goal asks for more, the low one is the floor a day is
// squeezed down to before the target itself is given up on, and the high one is
// the most any goal here asks for
export const PROTEIN_PER_KG: any = { min: 1.6, default: 2.0, max: 2.2 };
export const FAT_PER_KG: any = { min: 0.6, default: 0.8, max: 1.0 };

// the widest a typed target is taken seriously at, a number outside of these is
// a slip rather than a plan
export const PER_KG_BOUNDS: any = {
  Protein: { min: 0, max: 4 },
  Fat: { min: 0, max: 3 },
};

export interface MacroInput {
  weight: number;
  calories: number;
  proteinPerKg?: number;
  fatPerKg?: number;
}

export interface MacroPlan {
  // grams of each, which is what the day is actually eaten in
  grams: any;
  // the calories those grams carry
  calories: any;
  // the share of the day each one came out as. informational only, nothing is
  // worked out from it, it is what the grams turned out to be
  percent: any;
  // the split the calculator reads its own rows against, as fractions
  split: any;
  // what the grams add up to, and how far that landed from the target
  totalCalories: number;
  targetCalories: number;
  // the per kg targets the grams were actually built on, which are the ones
  // asked for unless the day was too small to hold them
  appliedPerKg: any;
  // the day could not hold the protein and the fat that were asked for, so they
  // were brought down to fit
  constrained: boolean;
  note: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function toNumber(value: any, fallback: number): number {
  return value === null || value === undefined || value === '' || isNaN(+value)
    ? fallback
    : +value;
}

// a day with no body or no calories behind it has no grams in it either, and
// every reader below still gets the shape it expects
function emptyPlan(target: number): MacroPlan {
  return {
    grams: { Protein: 0, Fat: 0, Carbohydrate: 0 },
    calories: { Protein: 0, Fat: 0, Carbohydrate: 0 },
    percent: { Protein: 0, Fat: 0, Carbohydrate: 0 },
    split: { Protein: 0, Fat: 0, Carbohydrate: 0 },
    totalCalories: 0,
    targetCalories: Math.max(0, Math.round(target || 0)),
    appliedPerKg: { Protein: 0, Fat: 0 },
    constrained: false,
    note: '',
  };
}

// the grams, once they are settled, written up into every shape the pages read
function planFromGrams(
  grams: any,
  target: number,
  appliedPerKg: any,
  constrained: boolean,
  note: string
): MacroPlan {
  let calories = {
    Protein: grams.Protein * CALORIES_PER_GRAM.Protein,
    Fat: grams.Fat * CALORIES_PER_GRAM.Fat,
    Carbohydrate: grams.Carbohydrate * CALORIES_PER_GRAM.Carbohydrate,
  };
  let total = calories.Protein + calories.Fat + calories.Carbohydrate;
  let share = (value: number) => (total > 0 ? value / total : 0);
  return {
    grams: grams,
    calories: calories,
    percent: {
      Protein: Math.round(share(calories.Protein) * 100),
      Fat: Math.round(share(calories.Fat) * 100),
      Carbohydrate: Math.round(share(calories.Carbohydrate) * 100),
    },
    split: {
      Protein: share(calories.Protein),
      Fat: share(calories.Fat),
      Carbohydrate: share(calories.Carbohydrate),
    },
    totalCalories: total,
    targetCalories: Math.round(target),
    appliedPerKg: appliedPerKg,
    constrained: constrained,
    note: note,
  };
}

// the protein and the fat asked for do not fit inside the day, so they are
// brought down in the order they can afford to come down in. the fat gives way
// first, down to the least a body should be eating, then the protein does the
// same, and a day too small to hold even those two floors is split between them
// in the proportion they were asked in
function fitToBudget(weight: number, protein: number, fat: number, budget: number): any {
  let cost = (p: number, f: number) => p * CALORIES_PER_GRAM.Protein + f * CALORIES_PER_GRAM.Fat;
  if (cost(protein, fat) <= budget) {
    return { protein: protein, fat: fat, constrained: false, note: '' };
  }

  // the fat comes down first, never below the floor and never below nothing
  let fatFloor = Math.min(fat, weight * FAT_PER_KG.min);
  let over = cost(protein, fat) - budget;
  let fatGiven = Math.min(fat - fatFloor, over / CALORIES_PER_GRAM.Fat);
  fat = fat - fatGiven;
  if (cost(protein, fat) <= budget) {
    return {
      protein: protein,
      fat: fat,
      constrained: true,
      note: 'the day was too small to hold the fat that was asked for, it was brought down to the least a body should eat',
    };
  }

  // then the protein, down to the least that keeps muscle on
  let proteinFloor = Math.min(protein, weight * PROTEIN_PER_KG.min);
  over = cost(protein, fat) - budget;
  let proteinGiven = Math.min(protein - proteinFloor, over / CALORIES_PER_GRAM.Protein);
  protein = protein - proteinGiven;
  if (cost(protein, fat) <= budget) {
    return {
      protein: protein,
      fat: fat,
      constrained: true,
      note: 'the day was too small to hold the protein and the fat that were asked for, both were brought down to the least a body should eat',
    };
  }

  // a day that cannot hold even the two floors is not a day this page can plan,
  // but it still has to come out as grams rather than as a negative number of
  // carbohydrates, so what there is is shared out as it was asked for
  let scale = cost(protein, fat) > 0 ? budget / cost(protein, fat) : 0;
  return {
    protein: protein * scale,
    fat: fat * scale,
    constrained: true,
    note: 'the calorie target is under what this body needs of protein and fat alone, the two were scaled to fit and there is nothing left for carbohydrates',
  };
}

// the day, in grams. protein off body weight, fat off body weight, and the
// carbohydrates take whatever the calorie target has left
export function macroTargets(input: MacroInput): MacroPlan {
  let weight = Math.max(0, toNumber(input?.weight, 0));
  let target = Math.max(0, toNumber(input?.calories, 0));
  if (weight <= 0 || target <= 0) {
    return emptyPlan(target);
  }

  let proteinPerKg = clamp(
    toNumber(input?.proteinPerKg, PROTEIN_PER_KG.default),
    PER_KG_BOUNDS.Protein.min,
    PER_KG_BOUNDS.Protein.max
  );
  let fatPerKg = clamp(
    toNumber(input?.fatPerKg, FAT_PER_KG.default),
    PER_KG_BOUNDS.Fat.min,
    PER_KG_BOUNDS.Fat.max
  );

  let fitted = fitToBudget(weight, weight * proteinPerKg, weight * fatPerKg, target);

  // the grams are what is eaten, so they are the ones rounded, and the
  // carbohydrates are worked out from the rounded protein and fat rather than
  // from the unrounded ones. that way the three of them add back up to the
  // target as closely as whole grams allow instead of drifting off it
  let protein = Math.max(0, Math.round(fitted.protein));
  let fat = Math.max(0, Math.round(fitted.fat));
  let spent = protein * CALORIES_PER_GRAM.Protein + fat * CALORIES_PER_GRAM.Fat;
  let carbs = Math.max(0, Math.round((target - spent) / CALORIES_PER_GRAM.Carbohydrate));

  return planFromGrams(
    { Protein: protein, Fat: fat, Carbohydrate: carbs },
    target,
    { Protein: weight > 0 ? fitted.protein / weight : 0, Fat: weight > 0 ? fitted.fat / weight : 0 },
    fitted.constrained,
    fitted.note
  );
}

// the same day, cut up by percentages instead. this is here for a split that is
// typed by hand, where the shares are the thing that was asked for and the
// grams follow from them, which is the other way round from everything above
export function macroTargetsFromSplit(calories: number, split: any, weight: number = 0): MacroPlan {
  let target = Math.max(0, toNumber(calories, 0));
  let shares = {
    Protein: Math.max(0, toNumber(split?.Protein, 0)),
    Fat: Math.max(0, toNumber(split?.Fat, 0)),
    Carbohydrate: Math.max(0, toNumber(split?.Carbohydrate, 0)),
  };
  let total = shares.Protein + shares.Fat + shares.Carbohydrate;
  if (target <= 0 || total <= 0) {
    return emptyPlan(target);
  }
  // the three are read as shares of whatever they add up to, so a set that does
  // not come to a hundred is still a split rather than an error
  let grams: any = {};
  Object.keys(shares).map((key: string) => {
    grams[key] = Math.max(
      0,
      Math.round((target * ((shares as any)[key] / total)) / CALORIES_PER_GRAM[key])
    );
  });
  let body = Math.max(0, toNumber(weight, 0));
  return planFromGrams(
    grams,
    target,
    {
      Protein: body > 0 ? grams.Protein / body : 0,
      Fat: body > 0 ? grams.Fat / body : 0,
    },
    false,
    ''
  );
}
