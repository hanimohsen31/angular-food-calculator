// the units a food item or a recipe can be measured in. the server only takes
// these three, anything else is refused on the way in, so the same list is
// offered wherever a unit is typed
export const MEASURE_UNITS: string[] = ['gm', 'item', 'recipe'];

// the server refuses a name longer than this, on both the english and the
// arabic one, so the forms stop it before the request is made
export const NAME_MAX_LENGTH: number = 200;

// what every stored field is called on screen. the server names them
// englishName, arabicName, energy, carbs ... the screens name them the way the
// food table always has, and this is the one place either of those is spelled
// out for a reader
export const FOOD_LABELS: any = {
  ShortFoodName: 'Food Name',
  Translation: 'Arabic Name',
  Measure: 'Measure',
  MeasureUnit: 'Unit',
  Quantity: 'Quantity',
  Energy: 'Energy (kcal)',
  Carbohydrate: 'Carbs (g)',
  Fat: 'Fats (g)',
  Protein: 'Protein (g)',
  Sugars: 'Sugars (g)',
};

// the same fields as a table heading, where the column is narrow and the unit
// is already understood from the row beside it
export const FOOD_COLUMN_LABELS: any = {
  ShortFoodName: 'Food Name',
  Translation: 'Arabic Name',
  Measure: 'Measure',
  MeasureUnit: 'Unit',
  Quantity: 'Quantity',
  Energy: 'Energy',
  Carbohydrate: 'Carbs',
  Fat: 'Fats',
  Protein: 'Protein',
  Sugars: 'Sugars',
};

// only the english name is required by the server, everything else has a
// default behind it. the forms say the same, so a field is never refused here
// for a rule the server does not have
export const REQUIRED_FOOD_KEYS: string[] = ['ShortFoodName'];
