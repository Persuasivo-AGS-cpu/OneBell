const KG_TO_LB = 2.2046226218;
const IN_TO_CM = 2.54;

export function getUnitSystem(profile = {}) {
  return profile.unitSystem === 'imperial' ? 'imperial' : 'metric';
}

export function getBodyMetricsSummary(profile = {}) {
  const unitSystem = getUnitSystem(profile);
  const bodyWeightKg = normalizeNumber(profile.bodyWeight, 75);
  const heightCm = normalizeNumber(profile.height, 175);
  const bmi = calculateBmi(bodyWeightKg, heightCm);

  if (unitSystem === 'imperial') {
    return {
      unitSystem,
      bodyWeightKg,
      heightCm,
      weightDisplay: Math.round(bodyWeightKg * KG_TO_LB),
      heightDisplay: Math.round(heightCm / IN_TO_CM),
      weightSuffix: 'lb',
      heightSuffix: 'in',
      weightMin: 100,
      weightMax: 310,
      heightMin: 55,
      heightMax: 84,
      bmi,
      bmiLabel: formatBmi(bmi),
    };
  }

  return {
    unitSystem,
    bodyWeightKg,
    heightCm,
    weightDisplay: Math.round(bodyWeightKg),
    heightDisplay: Math.round(heightCm),
    weightSuffix: 'kg',
    heightSuffix: 'cm',
    weightMin: 45,
    weightMax: 140,
    heightMin: 140,
    heightMax: 215,
    bmi,
    bmiLabel: formatBmi(bmi),
  };
}

export function buildBodyMetricPatch({ field, value, unitSystem = 'metric' }) {
  const numericValue = Number(value);

  if (field === 'bodyWeight') {
    return {
      bodyWeight: unitSystem === 'imperial' ? Math.round(numericValue / KG_TO_LB) : Math.round(numericValue),
    };
  }

  if (field === 'height') {
    return {
      height: unitSystem === 'imperial' ? Math.round(numericValue * IN_TO_CM) : Math.round(numericValue),
    };
  }

  return {};
}

function calculateBmi(bodyWeightKg, heightCm) {
  const heightM = heightCm / 100;
  if (!bodyWeightKg || !heightM) return null;
  return bodyWeightKg / (heightM * heightM);
}

function formatBmi(bmi) {
  return bmi ? bmi.toFixed(1) : '--';
}

function normalizeNumber(value, fallback) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : fallback;
}
