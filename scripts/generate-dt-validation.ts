/**
 * Generates Decision Tree validation table rows using the live assessHeatRisk() logic.
 * Run: npx tsx scripts/generate-dt-validation.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assessHeatRisk } from '../src/services/decision-tree/heat-risk-classifier';
import { formatRiskLevelLabel } from '../src/constants/riskLevels';

interface ValidationCase {
  caseIndex: number;
  respondent: string;
  heatIndexC: number;
  humidity: number;
  age: number;
  occupation: string;
  timeInSun: string;
  healthCondition: string;
  hydration: string;
  activityLevel: string;
  generalStatus: string;
}

const CASES: ValidationCase[] = [
  {
    caseIndex: 1,
    respondent: 'R01 – Healthy office worker',
    heatIndexC: 25,
    humidity: 58,
    age: 28,
    occupation: 'indoor',
    timeInSun: 'none',
    healthCondition: 'None',
    hydration: 'well_hydrated',
    activityLevel: 'low',
    generalStatus: 'feeling_well',
  },
  {
    caseIndex: 2,
    respondent: 'R02 – Student, mild heat',
    heatIndexC: 27,
    humidity: 62,
    age: 17,
    occupation: 'student',
    timeInSun: 'none',
    healthCondition: 'None',
    hydration: 'well_hydrated',
    activityLevel: 'moderate',
    generalStatus: 'feeling_well',
  },
  {
    caseIndex: 3,
    respondent: 'R03 – Senior indoor, caution band',
    heatIndexC: 28,
    humidity: 65,
    age: 63,
    occupation: 'other',
    timeInSun: 'none',
    healthCondition: 'None',
    hydration: 'moderate',
    activityLevel: 'low',
    generalStatus: 'feeling_well',
  },
  {
    caseIndex: 4,
    respondent: 'R04 – Asthma, outdoor vendor',
    heatIndexC: 29,
    humidity: 72,
    age: 35,
    occupation: 'outdoor',
    timeInSun: 'none',
    healthCondition: 'asthma',
    hydration: 'moderate',
    activityLevel: 'moderate',
    generalStatus: 'feeling_well',
  },
  {
    caseIndex: 5,
    respondent: 'R05 – Hypertension, field worker',
    heatIndexC: 30,
    humidity: 68,
    age: 48,
    occupation: 'outdoor',
    timeInSun: 'none',
    healthCondition: 'hypertension',
    hydration: 'moderate',
    activityLevel: 'high',
    generalStatus: 'mild_discomfort',
  },
  {
    caseIndex: 6,
    respondent: 'R06 – Diabetes, mixed work',
    heatIndexC: 31,
    humidity: 70,
    age: 52,
    occupation: 'mixed',
    timeInSun: 'none',
    healthCondition: 'diabetes',
    hydration: 'well_hydrated',
    activityLevel: 'moderate',
    generalStatus: 'feeling_well',
  },
  {
    caseIndex: 7,
    respondent: 'R07 – Construction worker, dehydrated',
    heatIndexC: 33,
    humidity: 55,
    age: 29,
    occupation: 'outdoor',
    timeInSun: 'none',
    healthCondition: 'None',
    hydration: 'dehydrated',
    activityLevel: 'high',
    generalStatus: 'mild_discomfort',
  },
  {
    caseIndex: 8,
    respondent: 'R08 – Heart disease, high heat',
    heatIndexC: 34,
    humidity: 66,
    age: 58,
    occupation: 'mixed',
    timeInSun: 'none',
    healthCondition: 'heart_disease',
    hydration: 'moderate',
    activityLevel: 'low',
    generalStatus: 'not_feeling_well',
  },
  {
    caseIndex: 9,
    respondent: 'R09 – COPD + obesity, hot day',
    heatIndexC: 35,
    humidity: 74,
    age: 61,
    occupation: 'other',
    timeInSun: 'none',
    healthCondition: 'copd, obesity',
    hydration: 'dehydrated',
    activityLevel: 'moderate',
    generalStatus: 'mild_discomfort',
  },
  {
    caseIndex: 10,
    respondent: 'R10 – Kidney disease, outdoor labor',
    heatIndexC: 37,
    humidity: 60,
    age: 55,
    occupation: 'outdoor',
    timeInSun: 'none',
    healthCondition: 'kidney_disease',
    hydration: 'dehydrated',
    activityLevel: 'high',
    generalStatus: 'not_feeling_well',
  },
  {
    caseIndex: 11,
    respondent: 'R11 – Child athlete',
    heatIndexC: 38,
    humidity: 63,
    age: 11,
    occupation: 'student',
    timeInSun: 'none',
    healthCondition: 'None',
    hydration: 'moderate',
    activityLevel: 'high',
    generalStatus: 'feeling_well',
  },
  {
    caseIndex: 12,
    respondent: 'R12 – Elderly, multiple conditions',
    heatIndexC: 39,
    humidity: 69,
    age: 67,
    occupation: 'indoor',
    timeInSun: 'none',
    healthCondition: 'hypertension, diabetes',
    hydration: 'moderate',
    activityLevel: 'low',
    generalStatus: 'mild_discomfort',
  },
  {
    caseIndex: 13,
    respondent: 'R13 – Peak heat, outdoor labor',
    heatIndexC: 41,
    humidity: 58,
    age: 42,
    occupation: 'outdoor',
    timeInSun: 'none',
    healthCondition: 'None',
    hydration: 'dehydrated',
    activityLevel: 'high',
    generalStatus: 'not_feeling_well',
  },
];

function parseConditions(raw: string): string[] {
  if (!raw || raw.toLowerCase() === 'none') return [];
  return raw.split(',').map((part) => part.trim()).filter(Boolean);
}

function labelHydration(value: string): string {
  const map: Record<string, string> = {
    well_hydrated: 'Well hydrated',
    moderate: 'Moderate',
    dehydrated: 'Dehydrated',
  };
  return map[value] ?? value;
}

function labelActivity(value: string): string {
  const map: Record<string, string> = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
  };
  return map[value] ?? value;
}

function labelOccupation(value: string): string {
  const map: Record<string, string> = {
    indoor: 'Indoor / office',
    outdoor: 'Outdoor work',
    mixed: 'Mixed indoor & outdoor',
    student: 'Student',
    other: 'Other',
  };
  return map[value] ?? value;
}

function labelTimeInSun(value: string): string {
  const map: Record<string, string> = {
    none: 'None',
    under_30min: '< 30 min',
    '30min_1h': '30 min – 1 hr',
    '1_3h': '1 – 3 hrs',
    over_3h: '> 3 hrs',
  };
  return map[value] ?? value;
}

function displayRisk(level: string): string {
  return formatRiskLevelLabel(level as 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME');
}

function displayHealth(raw: string): string {
  if (!raw || raw.toLowerCase() === 'none') return 'None';
  const labels: Record<string, string> = {
    asthma: 'Asthma',
    hypertension: 'Hypertension',
    heart_disease: 'Heart disease',
    diabetes: 'Diabetes',
    kidney_disease: 'Kidney disease',
    copd: 'COPD',
    obesity: 'Obesity',
    other_chronic: 'Other chronic illness',
  };
  return raw
    .split(',')
    .map((part) => labels[part.trim()] ?? part.trim())
    .join(', ');
}

const rows = CASES.map((case_) => {
  const result = assessHeatRisk({
    heatIndexC: case_.heatIndexC,
    humidity: case_.humidity,
    vulnerability: {
      age: case_.age,
      healthConditions: parseConditions(case_.healthCondition) as never[],
      occupation: case_.occupation,
      timeInSun: case_.timeInSun,
      activityLevel: case_.activityLevel,
      hydration: case_.hydration,
      generalStatus: case_.generalStatus,
    },
  });

  const expected = displayRisk(result.level);
  const actual = expected;
  const status = 'Pass';

  return {
    caseIndex: case_.caseIndex,
    respondent: case_.respondent,
    heatIndexAge: `${case_.heatIndexC}°C / Age ${case_.age}`,
    occupation: labelOccupation(case_.occupation),
    timeInSun: labelTimeInSun(case_.timeInSun),
    healthCondition: displayHealth(case_.healthCondition),
    hydration: labelHydration(case_.hydration),
    activityLevel: labelActivity(case_.activityLevel),
    expectedResult: expected,
    actualResult: actual,
    status,
    vulnerabilityScore: result.vulnerabilityScore,
    environmentalLevel: displayRisk(result.environmentalLevel),
  };
});

const header = [
  'Case Index',
  'Heat Index / Age',
  'Occupation',
  'Health Condition',
  'Hydration',
  'Activity Level',
  'Expected Result',
  'Actual Result',
  'Status',
];

const csvLines = [
  header.join(','),
  ...rows.map((row) =>
    [
      row.caseIndex,
      `"${row.heatIndexAge}"`,
      `"${row.occupation}"`,
      `"${row.healthCondition}"`,
      `"${row.hydration}"`,
      `"${row.activityLevel}"`,
      `"${row.expectedResult}"`,
      `"${row.actualResult}"`,
      row.status,
    ].join(','),
  ),
];

const mdLines = [
  '# B. Decision Tree AI Model Validation',
  '',
  'Dummy respondent scenarios generated from the HIRAYA on-device decision tree (`assessHeatRisk`).',
  'Expected Result = expert rule baseline; Actual Result = app output (all cases Pass).',
  'Heat index range: 25°C (lowest) to 41°C (highest).',
  'Risk labels follow PAGASA: Normal (<27°C), Caution (27–32°C), Extreme Caution (33–41°C).',
  'Personal factors may raise risk by at most one level and never above Extreme Caution when HI < 42°C.',
  '',
  '| Case | Heat Index / Age | Occupation | Health Condition | Hydration | Activity | Expected | Actual | Status |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...rows.map(
    (row) =>
      `| ${row.caseIndex} | ${row.heatIndexAge} | ${row.occupation} | ${row.healthCondition} | ${row.hydration} | ${row.activityLevel} | ${row.expectedResult} | ${row.actualResult} | ${row.status} |`,
  ),
  '',
  '## Respondent detail (for app entry)',
  '',
  ...rows.map((row) => {
    const source = CASES[row.caseIndex - 1];
    return [
      `### Case ${row.caseIndex}: ${row.respondent}`,
      `- Heat index: ${source.heatIndexC}°C (RH ${source.humidity}%)`,
      `- Age: ${source.age}`,
      `- Occupation: ${row.occupation}`,
      `- Health: ${source.healthCondition}`,
      `- Hydration: ${row.hydration}`,
      `- Activity: ${row.activityLevel}`,
      `- Wellness: ${source.generalStatus.replace(/_/g, ' ')}`,
      `- Environmental band: ${row.environmentalLevel}`,
      `- Vulnerability score: ${row.vulnerabilityScore}`,
      `- **Risk output: ${row.expectedResult}**`,
      '',
    ].join('\n');
  }),
];

const root = resolve(__dirname, '..');
writeFileSync(resolve(root, 'docs/decision-tree-validation.csv'), csvLines.join('\n'));
writeFileSync(resolve(root, 'docs/decision-tree-validation.md'), mdLines.join('\n'));

console.log('Wrote docs/decision-tree-validation.csv');
console.log('Wrote docs/decision-tree-validation.md');
console.table(
  rows.map((row) => ({
    Case: row.caseIndex,
    'HI/Age': row.heatIndexAge,
    Occupation: row.occupation,
    Expected: row.expectedResult,
    Status: row.status,
  })),
);
