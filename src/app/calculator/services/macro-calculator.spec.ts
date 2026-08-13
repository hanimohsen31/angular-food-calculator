import {
  CALORIES_PER_GRAM,
  FAT_PER_KG,
  PROTEIN_PER_KG,
  macroTargets,
  macroTargetsFromSplit,
} from './macro-calculator';

// the grams are whole ones, so nothing here lands on a round number exactly.
// a couple of grams either way is the same plan
function near(value: number, expected: number, slack: number = 3) {
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(slack);
}

describe('macroTargets', () => {
  it('takes the protein and the fat off body weight and leaves the carbs the rest', () => {
    // 68 kg on a recomposition day, 2057 kcal
    let plan = macroTargets({ weight: 68, calories: 2057, proteinPerKg: 2.2, fatPerKg: 0.8 });
    near(plan.grams.Protein, 150);
    near(plan.grams.Fat, 55);
    near(plan.grams.Carbohydrate, 240, 5);
    expect(plan.constrained).toBeFalse();
  });

  it('lands the three of them back on the calorie target', () => {
    let plan = macroTargets({ weight: 68, calories: 2057, proteinPerKg: 2.2, fatPerKg: 0.8 });
    // whole grams cannot always hit it, but they cannot drift off it either
    expect(Math.abs(plan.totalCalories - 2057)).toBeLessThanOrEqual(CALORIES_PER_GRAM.Carbohydrate);
  });

  it('scales the protein down with a lighter body', () => {
    let light = macroTargets({ weight: 45, calories: 1600, proteinPerKg: 2.0, fatPerKg: 0.8 });
    near(light.grams.Protein, 90);
    near(light.grams.Fat, 36);
    expect(light.grams.Protein).toBeLessThan(
      macroTargets({ weight: 68, calories: 1600, proteinPerKg: 2.0, fatPerKg: 0.8 }).grams.Protein
    );
    expect(light.grams.Carbohydrate).toBeGreaterThan(0);
  });

  it('does not hand a heavy body more protein just because the day is big', () => {
    // 120 kg on a 3600 kcal day. the protein follows the body, not the calories
    let plan = macroTargets({ weight: 120, calories: 3600, proteinPerKg: 2.0, fatPerKg: 0.8 });
    near(plan.grams.Protein, 240);
    expect(plan.grams.Protein / 120).toBeLessThanOrEqual(PROTEIN_PER_KG.max);
    // the same body on a much bigger day eats the same protein, the extra
    // calories go to the carbohydrates
    let bigger = macroTargets({ weight: 120, calories: 4500, proteinPerKg: 2.0, fatPerKg: 0.8 });
    expect(bigger.grams.Protein).toBe(plan.grams.Protein);
    expect(bigger.grams.Carbohydrate).toBeGreaterThan(plan.grams.Carbohydrate);
  });

  it('never lets a percentage split drive the protein up on a big day', () => {
    // the old way of doing it, 40% of 3600 kcal, was 360 gm on a 68 kg body
    let plan = macroTargets({ weight: 68, calories: 3600, proteinPerKg: 2.2, fatPerKg: 0.8 });
    expect(plan.grams.Protein).toBeLessThanOrEqual(68 * PROTEIN_PER_KG.max + 1);
    expect(plan.percent.Protein).toBeLessThan(30);
  });

  it('keeps the carbohydrates off the floor on a low fat loss target', () => {
    // 60 kg on 1200 kcal. the protein and the fat asked for take 1020 of it
    let plan = macroTargets({ weight: 60, calories: 1200, proteinPerKg: 2.2, fatPerKg: 0.8 });
    expect(plan.grams.Carbohydrate).toBeGreaterThanOrEqual(0);
    expect(plan.grams.Protein).toBeGreaterThan(0);
    expect(plan.grams.Fat).toBeGreaterThan(0);
    expect(plan.totalCalories).toBeLessThanOrEqual(1200 + CALORIES_PER_GRAM.Carbohydrate);
  });

  it('brings the fat down to its floor before it touches the protein', () => {
    // 100 kg on 1400 kcal, which is far under what that body asks for
    let plan = macroTargets({ weight: 100, calories: 1400, proteinPerKg: 2.2, fatPerKg: 1.0 });
    expect(plan.constrained).toBeTrue();
    expect(plan.note).toBeTruthy();
    // the fat gave way first and stopped at its floor
    near(plan.grams.Fat, 100 * FAT_PER_KG.min, 1);
    expect(plan.grams.Protein).toBeGreaterThanOrEqual(100 * PROTEIN_PER_KG.min - 1);
    expect(plan.grams.Carbohydrate).toBeGreaterThanOrEqual(0);
  });

  it('shares out a day that cannot hold even the two floors instead of going negative', () => {
    // 120 kg on 800 kcal, which is not a day this body can be planned on
    let plan = macroTargets({ weight: 120, calories: 800, proteinPerKg: 2.2, fatPerKg: 1.0 });
    expect(plan.constrained).toBeTrue();
    expect(plan.grams.Protein).toBeGreaterThan(0);
    expect(plan.grams.Fat).toBeGreaterThan(0);
    expect(plan.grams.Carbohydrate).toBe(0);
    expect(plan.totalCalories).toBeLessThanOrEqual(800 + CALORIES_PER_GRAM.Protein);
  });

  it('works the same for maintenance and for muscle gain, the goal only moves the numbers', () => {
    let weight = 80;
    let maintain = macroTargets({ weight: weight, calories: 2600, proteinPerKg: 1.8, fatPerKg: 0.9 });
    let gain = macroTargets({ weight: weight, calories: 2900, proteinPerKg: 2.0, fatPerKg: 0.9 });
    near(maintain.grams.Protein, 144);
    near(gain.grams.Protein, 160);
    // the surplus is eaten, and it is not eaten as an unreasonable amount of
    // protein, most of it lands on the carbohydrates
    expect(gain.grams.Protein / weight).toBeLessThanOrEqual(PROTEIN_PER_KG.max);
    expect(gain.grams.Carbohydrate).toBeGreaterThan(maintain.grams.Carbohydrate);
    expect(gain.totalCalories).toBeGreaterThan(maintain.totalCalories);
  });

  it('holds a typed grams per kg target inside what a body can be planned on', () => {
    let plan = macroTargets({ weight: 70, calories: 2500, proteinPerKg: 40, fatPerKg: -5 });
    expect(plan.grams.Protein).toBeLessThanOrEqual(70 * 4);
    expect(plan.grams.Fat).toBeGreaterThanOrEqual(0);
    expect(plan.grams.Carbohydrate).toBeGreaterThanOrEqual(0);
  });

  it('gives back an empty day rather than a broken one when there is nothing to plan', () => {
    [
      macroTargets({ weight: 0, calories: 2000 }),
      macroTargets({ weight: 70, calories: 0 }),
      macroTargets({ weight: -70, calories: -2000 }),
      macroTargets({ weight: NaN, calories: NaN } as any),
    ].map((plan: any) => {
      expect(plan.grams.Protein).toBe(0);
      expect(plan.grams.Fat).toBe(0);
      expect(plan.grams.Carbohydrate).toBe(0);
      expect(plan.totalCalories).toBe(0);
    });
  });

  it('never gives back a negative gram of anything, whatever it is handed', () => {
    [30, 45, 60, 68, 90, 120, 200].map((weight: number) => {
      [600, 900, 1200, 1500, 2057, 2600, 3200, 4500].map((calories: number) => {
        [1.6, 2.0, 2.2].map((protein: number) => {
          let plan = macroTargets({
            weight: weight,
            calories: calories,
            proteinPerKg: protein,
            fatPerKg: 0.8,
          });
          expect(plan.grams.Protein).toBeGreaterThanOrEqual(0);
          expect(plan.grams.Fat).toBeGreaterThanOrEqual(0);
          expect(plan.grams.Carbohydrate).toBeGreaterThanOrEqual(0);
          // and it never plans a day bigger than the one it was given
          expect(plan.totalCalories).toBeLessThanOrEqual(calories + CALORIES_PER_GRAM.Protein);
        });
      });
    });
  });

  it('reports the split it came out at, without working anything out from it', () => {
    let plan = macroTargets({ weight: 68, calories: 2057, proteinPerKg: 2.2, fatPerKg: 0.8 });
    let total = plan.percent.Protein + plan.percent.Fat + plan.percent.Carbohydrate;
    expect(Math.abs(total - 100)).toBeLessThanOrEqual(1);
    expect(plan.split.Protein).toBeGreaterThan(0);
  });
});

describe('macroTargetsFromSplit', () => {
  it('cuts the day up by the percentages that were asked for', () => {
    let plan = macroTargetsFromSplit(2000, { Fat: 30, Carbohydrate: 50, Protein: 20 }, 68);
    near(plan.grams.Fat, 67);
    near(plan.grams.Carbohydrate, 250);
    near(plan.grams.Protein, 100);
  });

  it('reads a set that does not add to a hundred as shares of what it does add to', () => {
    let plan = macroTargetsFromSplit(2000, { Fat: 15, Carbohydrate: 25, Protein: 10 }, 68);
    near(plan.grams.Fat, 67);
    near(plan.grams.Carbohydrate, 250);
    near(plan.grams.Protein, 100);
  });

  it('gives back an empty day for a split with nothing in it', () => {
    let plan = macroTargetsFromSplit(2000, { Fat: 0, Carbohydrate: 0, Protein: 0 }, 68);
    expect(plan.totalCalories).toBe(0);
  });
});
