# B. Decision Tree AI Model Validation

Dummy respondent scenarios generated from the HIRAYA on-device decision tree (`assessHeatRisk`).
Expected Result = expert rule baseline; Actual Result = app output (all cases Pass).
Heat index range: 25°C (lowest) to 41°C (highest).
Risk labels follow PAGASA: Normal (<27°C), Caution (27–32°C), Extreme Caution (33–41°C).
Personal factors may raise risk by at most one level and never above Extreme Caution when HI < 42°C.

| Case | Heat Index / Age | Occupation | Health Condition | Hydration | Activity | Expected | Actual | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 25°C / Age 28 | Indoor / office | None | Well hydrated | Low | Normal | Normal | Pass |
| 2 | 27°C / Age 17 | Student | None | Well hydrated | Moderate | Caution | Caution | Pass |
| 3 | 28°C / Age 63 | Other | None | Moderate | Low | Caution | Caution | Pass |
| 4 | 29°C / Age 35 | Outdoor work | Asthma | Moderate | Moderate | Extreme Caution | Extreme Caution | Pass |
| 5 | 30°C / Age 48 | Outdoor work | Hypertension | Moderate | High | Extreme Caution | Extreme Caution | Pass |
| 6 | 31°C / Age 52 | Mixed indoor & outdoor | Diabetes | Well hydrated | Moderate | Extreme Caution | Extreme Caution | Pass |
| 7 | 33°C / Age 29 | Outdoor work | None | Dehydrated | High | Extreme Caution | Extreme Caution | Pass |
| 8 | 34°C / Age 58 | Mixed indoor & outdoor | Heart disease | Moderate | Low | Extreme Caution | Extreme Caution | Pass |
| 9 | 35°C / Age 61 | Other | COPD, Obesity | Dehydrated | Moderate | Extreme Caution | Extreme Caution | Pass |
| 10 | 37°C / Age 55 | Outdoor work | Kidney disease | Dehydrated | High | Extreme Caution | Extreme Caution | Pass |
| 11 | 38°C / Age 11 | Student | None | Moderate | High | Extreme Caution | Extreme Caution | Pass |
| 12 | 39°C / Age 67 | Indoor / office | Hypertension, Diabetes | Moderate | Low | Extreme Caution | Extreme Caution | Pass |
| 13 | 41°C / Age 42 | Outdoor work | None | Dehydrated | High | Extreme Caution | Extreme Caution | Pass |

## Respondent detail (for app entry)

### Case 1: R01 – Healthy office worker
- Heat index: 25°C (RH 58%)
- Age: 28
- Occupation: Indoor / office
- Health: None
- Hydration: Well hydrated
- Activity: Low
- Wellness: feeling well
- Environmental band: Normal
- Vulnerability score: 0
- **Risk output: Normal**

### Case 2: R02 – Student, mild heat
- Heat index: 27°C (RH 62%)
- Age: 17
- Occupation: Student
- Health: None
- Hydration: Well hydrated
- Activity: Moderate
- Wellness: feeling well
- Environmental band: Caution
- Vulnerability score: 11
- **Risk output: Caution**

### Case 3: R03 – Senior indoor, caution band
- Heat index: 28°C (RH 65%)
- Age: 63
- Occupation: Other
- Health: None
- Hydration: Moderate
- Activity: Low
- Wellness: feeling well
- Environmental band: Caution
- Vulnerability score: 25
- **Risk output: Caution**

### Case 4: R04 – Asthma, outdoor vendor
- Heat index: 29°C (RH 72%)
- Age: 35
- Occupation: Outdoor work
- Health: asthma
- Hydration: Moderate
- Activity: Moderate
- Wellness: feeling well
- Environmental band: Caution
- Vulnerability score: 46
- **Risk output: Extreme Caution**

### Case 5: R05 – Hypertension, field worker
- Heat index: 30°C (RH 68%)
- Age: 48
- Occupation: Outdoor work
- Health: hypertension
- Hydration: Moderate
- Activity: High
- Wellness: mild discomfort
- Environmental band: Caution
- Vulnerability score: 62
- **Risk output: Extreme Caution**

### Case 6: R06 – Diabetes, mixed work
- Heat index: 31°C (RH 70%)
- Age: 52
- Occupation: Mixed indoor & outdoor
- Health: diabetes
- Hydration: Well hydrated
- Activity: Moderate
- Wellness: feeling well
- Environmental band: Caution
- Vulnerability score: 29
- **Risk output: Extreme Caution**

### Case 7: R07 – Construction worker, dehydrated
- Heat index: 33°C (RH 55%)
- Age: 29
- Occupation: Outdoor work
- Health: None
- Hydration: Dehydrated
- Activity: High
- Wellness: mild discomfort
- Environmental band: Extreme Caution
- Vulnerability score: 56
- **Risk output: Extreme Caution**

### Case 8: R08 – Heart disease, high heat
- Heat index: 34°C (RH 66%)
- Age: 58
- Occupation: Mixed indoor & outdoor
- Health: heart_disease
- Hydration: Moderate
- Activity: Low
- Wellness: not feeling well
- Environmental band: Extreme Caution
- Vulnerability score: 60
- **Risk output: Extreme Caution**

### Case 9: R09 – COPD + obesity, hot day
- Heat index: 35°C (RH 74%)
- Age: 61
- Occupation: Other
- Health: copd, obesity
- Hydration: Dehydrated
- Activity: Moderate
- Wellness: mild discomfort
- Environmental band: Extreme Caution
- Vulnerability score: 95
- **Risk output: Extreme Caution**

### Case 10: R10 – Kidney disease, outdoor labor
- Heat index: 37°C (RH 60%)
- Age: 55
- Occupation: Outdoor work
- Health: kidney_disease
- Hydration: Dehydrated
- Activity: High
- Wellness: not feeling well
- Environmental band: Extreme Caution
- Vulnerability score: 88
- **Risk output: Extreme Caution**

### Case 11: R11 – Child athlete
- Heat index: 38°C (RH 63%)
- Age: 11
- Occupation: Student
- Health: None
- Hydration: Moderate
- Activity: High
- Wellness: feeling well
- Environmental band: Extreme Caution
- Vulnerability score: 41
- **Risk output: Extreme Caution**

### Case 12: R12 – Elderly, multiple conditions
- Heat index: 39°C (RH 69%)
- Age: 67
- Occupation: Indoor / office
- Health: hypertension, diabetes
- Hydration: Moderate
- Activity: Low
- Wellness: mild discomfort
- Environmental band: Extreme Caution
- Vulnerability score: 74
- **Risk output: Extreme Caution**

### Case 13: R13 – Peak heat, outdoor labor
- Heat index: 41°C (RH 58%)
- Age: 42
- Occupation: Outdoor work
- Health: None
- Hydration: Dehydrated
- Activity: High
- Wellness: not feeling well
- Environmental band: Extreme Caution
- Vulnerability score: 64
- **Risk output: Extreme Caution**
