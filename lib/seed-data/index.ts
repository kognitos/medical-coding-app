// Seed data for the Medical Coding (CPT/ICD-10) application

// ── Organization ───────────────────────────────────────────────

export const organizations = [
  {
    id: "org-1",
    name: "Mercy Health System",
    slug: "mercy-health",
    created_at: "2026-01-02T09:00:00Z",
  },
];

// ── Users ──────────────────────────────────────────────────────

export const users = [
  { id: "user-1", org_id: "org-1", full_name: "Sarah Chen", email: "sarah.chen@mercy-health.org", role: "coder", avatar_url: null, created_at: "2026-01-03T10:00:00Z" },
  { id: "user-2", org_id: "org-1", full_name: "James Rivera", email: "james.rivera@mercy-health.org", role: "auditor", avatar_url: null, created_at: "2026-01-03T10:05:00Z" },
  { id: "user-3", org_id: "org-1", full_name: "Patricia Walsh", email: "patricia.walsh@mercy-health.org", role: "coding_manager", avatar_url: null, created_at: "2026-01-03T10:10:00Z" },
  { id: "user-4", org_id: "org-1", full_name: "Michael Torres", email: "michael.torres@mercy-health.org", role: "admin", avatar_url: null, created_at: "2026-01-03T10:15:00Z" },
];

// ── Rules ──────────────────────────────────────────────────────

export const rules = [
  {
    id: "rule-1",
    name: "CCI Edit — E/M with Procedure",
    description: "Correct Coding Initiative edit: Evaluation and Management codes should not be billed with certain procedures on the same date of service unless modifier 25 is appended.",
    category: "Bundling",
    is_active: true,
    criteria: `## CCI Bundling Edit: E/M with Procedure

### Step 1: Identify Bundling Conflict
Check whether the chart contains both:
- An E/M code (99201–99215, 99221–99223, 99231–99233)
- A procedure code (10000–69999)
on the same date of service.

### Step 2: Check for Modifier 25
If both are present, check whether modifier 25 is appended to the E/M code.
- Modifier 25 indicates a significant, separately identifiable E/M service
- The E/M must be above and beyond the pre/post-operative care of the procedure

### Step 3: Resolve
If modifier 25 is present and documentation supports a separate E/M service: allow both codes.
If modifier 25 is missing: deny the E/M code and flag for coder review.

### Exception
- Critical care codes (99291–99292) have separate bundling rules
- Global surgical package rules may apply for post-operative E/M visits`,
    created_at: "2026-01-05T08:00:00Z",
    updated_at: "2026-01-05T08:00:00Z",
  },
  {
    id: "rule-2",
    name: "ICD-10 Specificity Check",
    description: "ICD-10 codes must be coded to the highest level of specificity available. Unspecified codes should only be used when clinical documentation does not support a more specific code.",
    category: "Specificity",
    is_active: true,
    criteria: `## ICD-10 Code Specificity Validation

### Step 1: Scan for Unspecified Codes
Review each ICD-10 code on the chart.
Flag any code ending in .9 or .0 — these indicate an unspecified diagnosis.

### Step 2: Check Documentation
For each flagged code, review the clinical documentation:
- Is there enough detail to assign a more specific code?
- Does the note specify laterality, type, stage, or trimester?
- Are comorbidities documented that would support a more precise code?

### Step 3: Resolve
If documentation supports a more specific code: replace the unspecified code.
If documentation does not support further specificity: accept the code and note the reason.

### Common Examples
- E11.9 (Type 2 diabetes, unspecified) → check for E11.65, E11.21, etc.
- J18.9 (Pneumonia, unspecified) → check for organism-specific codes
- M54.5 (Low back pain) → check for radiculopathy, laterality
- I10 (Essential hypertension) → acceptable, already at highest specificity`,
    created_at: "2026-01-05T08:30:00Z",
    updated_at: "2026-02-10T14:00:00Z",
  },
  {
    id: "rule-3",
    name: "DRG Validation — Principal Dx",
    description: "The principal diagnosis must be the condition established after study to be chiefly responsible for the admission. Verify DRG assignment aligns with principal diagnosis.",
    category: "DRG",
    is_active: true,
    criteria: `## DRG Validation: Principal Diagnosis Alignment

### Step 1: Identify the Principal Diagnosis
The principal diagnosis is the condition established after study to be chiefly responsible for the admission.
- Must be supported by the attending physician's documentation
- Must follow UHDDS (Uniform Hospital Discharge Data Set) guidelines

### Step 2: Validate DRG Assignment
Look up the expected principal diagnoses for the assigned DRG.
Confirm the chart's principal diagnosis is among them.

### Step 3: Check for Common Errors
- Symptom coded as principal when a definitive diagnosis was established
- Secondary diagnosis sequenced as principal (changes DRG and reimbursement)
- Complications or comorbidities (CC/MCC) missed that would change DRG tier

### Step 4: Resolve
If DRG matches principal diagnosis: accept.
If mismatch found: flag for coder review with the expected DRG and reimbursement difference.

### Note
When multiple conditions are treated, the one consuming the most resources should be principal.`,
    created_at: "2026-01-05T09:00:00Z",
    updated_at: "2026-01-05T09:00:00Z",
  },
  {
    id: "rule-4",
    name: "Modifier 59 — Distinct Procedural Service",
    description: "Modifier 59 should only be used when procedures are performed at different anatomical sites, during different encounters, or are truly distinct services.",
    category: "Bundling",
    is_active: true,
    criteria: `## Modifier 59: Distinct Procedural Service Validation

### Step 1: Identify Modifier 59 Usage
Flag any procedure code that has modifier 59 (Distinct Procedural Service) appended.

### Step 2: Verify Distinct Service Criteria
The modifier is valid only when at least ONE of the following is true:
- Procedures were performed at different anatomical sites
- Procedures were performed during different encounters on the same day
- Procedures are truly separate and distinct services

### Step 3: Check Documentation
The operative note must clearly support the distinct nature of each procedure:
- Different incision sites documented
- Separate dictated reports for each procedure
- Different diagnoses driving each procedure

### Step 4: Resolve
If criteria met and documentation supports: accept modifier 59.
If criteria not met: deny the modifier and flag for coder review.

### Note
Consider whether XE, XS, XP, or XU modifiers (HCPCS subset) are more appropriate than modifier 59.`,
    created_at: "2026-01-06T08:00:00Z",
    updated_at: "2026-01-06T08:00:00Z",
  },
  {
    id: "rule-5",
    name: "Query Required — Missing Laterality",
    description: "When documentation does not specify laterality (left, right, bilateral) for procedures or diagnoses that require it, a physician query must be generated.",
    category: "Documentation",
    is_active: true,
    criteria: `## Physician Query: Missing Laterality

### Step 1: Check Laterality Requirement
Determine whether the procedure or diagnosis requires laterality:
- Joint procedures (knee, hip, shoulder, wrist)
- Fracture codes
- Eye procedures
- Breast procedures
- Extremity conditions (carpal tunnel, rotator cuff)

### Step 2: Review Documentation
Search the clinical notes, operative report, and radiology results for:
- Explicit mention of "left," "right," or "bilateral"
- Diagram or body site markings
- Imaging laterality (e.g., "MRI right knee")

### Step 3: Generate Query
If laterality is required but not documented:
1. Generate a physician query to the attending provider
2. Include the specific code and what laterality is needed
3. Reference the relevant documentation gap

### Exception
Midline structures (spine, sternum, trachea) do not require laterality.`,
    created_at: "2026-01-06T09:00:00Z",
    updated_at: "2026-01-06T09:00:00Z",
  },
  {
    id: "rule-6",
    name: "Upcoding Detection — E/M Level",
    description: "Flag cases where the E/M level assigned exceeds what the documentation supports based on medical decision-making complexity, time, or key components.",
    category: "Compliance",
    is_active: true,
    criteria: `## Upcoding Detection: E/M Level Validation

### Step 1: Determine E/M Level from Documentation
Review the clinical note to assess the level of service using CMS guidelines:
- Medical Decision Making (MDM) complexity: straightforward, low, moderate, high
- Total time on the date of the encounter (for time-based billing)

### Step 2: Compare to Assigned Code
Map the documented MDM or time to the expected E/M level:
- 99211: Minimal problem (nurse visit)
- 99212: Straightforward MDM or 10–19 minutes
- 99213: Low MDM or 20–29 minutes
- 99214: Moderate MDM or 30–39 minutes
- 99215: High MDM or 40–54 minutes

### Step 3: Evaluate
If the assigned level matches or is below the documented level: accept.
If the assigned level is higher than documentation supports: flag for potential upcoding.

### Review Factors
- Number and complexity of problems addressed
- Amount and complexity of data reviewed
- Risk of complications, morbidity, or mortality`,
    created_at: "2026-01-07T08:00:00Z",
    updated_at: "2026-01-07T08:00:00Z",
  },
];

// ── Charts ─────────────────────────────────────────────────────

export const charts = [
  // pending_coding (3)
  {
    id: "cht-1", org_id: "org-1", title: "Johnson, Robert — ED Visit, Chest Pain", description: "62-year-old male presented with acute chest pain. Troponins negative. Stress test ordered.",
    patient_mrn: "MRN-100234", encounter_number: "ENC-2026-0101", encounter_date: "2026-02-24T14:00:00Z", discharge_date: "2026-02-24T22:30:00Z",
    provider_name: "Dr. Amanda Foster", department: "Emergency", assigned_to: null, status: "pending_coding", priority: "stat", category: "Emergency",
    suggested_codes: [], final_codes: [], drg: null, estimated_reimbursement: 3200, coding_accuracy_score: null,
    coded_at: null, finalized_at: null, created_at: "2026-02-25T06:00:00Z", updated_at: "2026-02-25T06:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-2", org_id: "org-1", title: "Williams, Maria — Observation, Syncope", description: "45-year-old female admitted for observation after syncopal episode. Cardiac workup pending.",
    patient_mrn: "MRN-100567", encounter_number: "ENC-2026-0102", encounter_date: "2026-02-24T08:00:00Z", discharge_date: "2026-02-25T10:00:00Z",
    provider_name: "Dr. Kevin Park", department: "Observation", assigned_to: null, status: "pending_coding", priority: "routine", category: "Observation",
    suggested_codes: [], final_codes: [], drg: null, estimated_reimbursement: 4800, coding_accuracy_score: null,
    coded_at: null, finalized_at: null, created_at: "2026-02-25T12:00:00Z", updated_at: "2026-02-25T12:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-20", org_id: "org-1", title: "Garcia, Luis — Outpatient, Diabetes Follow-up", description: "58-year-old male with Type 2 diabetes, HbA1c review and medication adjustment.",
    patient_mrn: "MRN-100890", encounter_number: "ENC-2026-0120", encounter_date: "2026-02-25T09:00:00Z", discharge_date: null,
    provider_name: "Dr. Lisa Nguyen", department: "Outpatient", assigned_to: null, status: "pending_coding", priority: "routine", category: "Outpatient",
    suggested_codes: [], final_codes: [], drg: null, estimated_reimbursement: 280, coding_accuracy_score: null,
    coded_at: null, finalized_at: null, created_at: "2026-02-25T15:00:00Z", updated_at: "2026-02-25T15:00:00Z", kognitos_run_id: null, episode_id: null,
  },

  // auto_coded (3)
  {
    id: "cht-3", org_id: "org-1", title: "Davis, Patricia — Inpatient, COPD Exacerbation", description: "71-year-old female admitted with acute COPD exacerbation. IV steroids and nebulizer treatments.",
    patient_mrn: "MRN-100891", encounter_number: "ENC-2026-0103", encounter_date: "2026-02-18T16:00:00Z", discharge_date: "2026-02-22T11:00:00Z",
    provider_name: "Dr. David Kim", department: "Inpatient", assigned_to: "user-1", status: "auto_coded", priority: "routine", category: "Inpatient",
    suggested_codes: [
      { code: "99223", type: "CPT", description: "Initial hospital care, high complexity", confidence: 0.94 },
      { code: "99232", type: "CPT", description: "Subsequent hospital care, moderate complexity", confidence: 0.91 },
      { code: "J44.1", type: "ICD-10", description: "COPD with acute exacerbation", confidence: 0.97 },
      { code: "I10", type: "ICD-10", description: "Essential hypertension", confidence: 0.92 },
      { code: "E11.9", type: "ICD-10", description: "Type 2 diabetes without complications", confidence: 0.88 },
    ],
    final_codes: [], drg: "MS-DRG 191", estimated_reimbursement: 8950, coding_accuracy_score: 92,
    coded_at: null, finalized_at: null, created_at: "2026-02-22T14:00:00Z", updated_at: "2026-02-22T18:00:00Z", kognitos_run_id: "run-1", episode_id: null,
  },
  {
    id: "cht-4", org_id: "org-1", title: "Brown, James — Outpatient Surgery, Colonoscopy", description: "55-year-old male presenting for screening colonoscopy. Two polyps found and removed.",
    patient_mrn: "MRN-100345", encounter_number: "ENC-2026-0104", encounter_date: "2026-02-20T07:00:00Z", discharge_date: null,
    provider_name: "Dr. Sarah Mitchell", department: "Outpatient", assigned_to: "user-1", status: "auto_coded", priority: "routine", category: "Outpatient",
    suggested_codes: [
      { code: "45385", type: "CPT", description: "Colonoscopy with polypectomy", confidence: 0.96 },
      { code: "Z12.11", type: "ICD-10", description: "Encounter for screening for colon malignancies", confidence: 0.98 },
      { code: "K63.5", type: "ICD-10", description: "Polyp of colon", confidence: 0.94 },
    ],
    final_codes: [], drg: null, estimated_reimbursement: 2100, coding_accuracy_score: 96,
    coded_at: null, finalized_at: null, created_at: "2026-02-20T12:00:00Z", updated_at: "2026-02-20T16:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-21", org_id: "org-1", title: "Martinez, Ana — ED Visit, Laceration Repair", description: "32-year-old female with 4cm laceration to right forearm from glass. Simple repair performed.",
    patient_mrn: "MRN-100456", encounter_number: "ENC-2026-0121", encounter_date: "2026-02-23T19:00:00Z", discharge_date: "2026-02-23T21:00:00Z",
    provider_name: "Dr. Amanda Foster", department: "Emergency", assigned_to: "user-1", status: "auto_coded", priority: "routine", category: "Emergency",
    suggested_codes: [
      { code: "12002", type: "CPT", description: "Simple repair, 2.6-7.5 cm", confidence: 0.95 },
      { code: "99283", type: "CPT", description: "ED visit, moderate severity", confidence: 0.90 },
      { code: "S51.811A", type: "ICD-10", description: "Laceration without FB, right forearm, initial", confidence: 0.97 },
    ],
    final_codes: [], drg: null, estimated_reimbursement: 1450, coding_accuracy_score: 94,
    coded_at: null, finalized_at: null, created_at: "2026-02-24T02:00:00Z", updated_at: "2026-02-24T06:00:00Z", kognitos_run_id: null, episode_id: null,
  },

  // in_review (3)
  {
    id: "cht-5", org_id: "org-1", title: "Thompson, Michael — Surgical, Total Knee Replacement", description: "68-year-old male with severe right knee osteoarthritis. Total knee arthroplasty performed.",
    patient_mrn: "MRN-100678", encounter_number: "ENC-2026-0105", encounter_date: "2026-02-15T06:00:00Z", discharge_date: "2026-02-18T14:00:00Z",
    provider_name: "Dr. Robert Chang", department: "Surgical", assigned_to: "user-1", status: "in_review", priority: "routine", category: "Surgical",
    suggested_codes: [
      { code: "27447", type: "CPT", description: "Total knee arthroplasty", confidence: 0.97 },
      { code: "M17.11", type: "ICD-10", description: "Primary osteoarthritis, right knee", confidence: 0.96 },
      { code: "Z96.651", type: "ICD-10", description: "Presence of right artificial knee joint", confidence: 0.94 },
    ],
    final_codes: [], drg: "MS-DRG 470", estimated_reimbursement: 22500, coding_accuracy_score: 97,
    coded_at: null, finalized_at: null, created_at: "2026-02-19T08:00:00Z", updated_at: "2026-02-23T10:00:00Z", kognitos_run_id: "run-2", episode_id: null,
  },
  {
    id: "cht-6", org_id: "org-1", title: "Anderson, Linda — Inpatient, Pneumonia with Resp Failure", description: "78-year-old female admitted with community-acquired pneumonia and acute respiratory failure. Intubated on day 2.",
    patient_mrn: "MRN-100789", encounter_number: "ENC-2026-0106", encounter_date: "2026-02-12T20:00:00Z", discharge_date: "2026-02-20T10:00:00Z",
    provider_name: "Dr. David Kim", department: "Inpatient", assigned_to: "user-1", status: "in_review", priority: "stat", category: "Inpatient",
    suggested_codes: [
      { code: "99223", type: "CPT", description: "Initial hospital care, high complexity", confidence: 0.93 },
      { code: "94002", type: "CPT", description: "Ventilation management, first day", confidence: 0.91 },
      { code: "J18.9", type: "ICD-10", description: "Pneumonia, unspecified organism", confidence: 0.85 },
      { code: "J96.01", type: "ICD-10", description: "Acute respiratory failure with hypoxia", confidence: 0.95 },
      { code: "N17.9", type: "ICD-10", description: "Acute kidney failure, unspecified", confidence: 0.82 },
    ],
    final_codes: [], drg: "MS-DRG 193", estimated_reimbursement: 18750, coding_accuracy_score: 89,
    coded_at: null, finalized_at: null, created_at: "2026-02-20T14:00:00Z", updated_at: "2026-02-22T09:00:00Z", kognitos_run_id: "run-5", episode_id: null,
  },
  {
    id: "cht-22", org_id: "org-1", title: "Lee, David — Radiology, CT Abdomen/Pelvis", description: "42-year-old male with abdominal pain. CT abdomen/pelvis with contrast showing appendicitis.",
    patient_mrn: "MRN-100912", encounter_number: "ENC-2026-0122", encounter_date: "2026-02-22T13:00:00Z", discharge_date: null,
    provider_name: "Dr. Jennifer Wu", department: "Radiology", assigned_to: "user-1", status: "in_review", priority: "stat", category: "Radiology",
    suggested_codes: [
      { code: "74178", type: "CPT", description: "CT abdomen and pelvis with contrast", confidence: 0.98 },
      { code: "K35.80", type: "ICD-10", description: "Unspecified acute appendicitis without abscess", confidence: 0.93 },
      { code: "R10.9", type: "ICD-10", description: "Unspecified abdominal pain", confidence: 0.88 },
    ],
    final_codes: [], drg: null, estimated_reimbursement: 1800, coding_accuracy_score: 93,
    coded_at: null, finalized_at: null, created_at: "2026-02-22T16:00:00Z", updated_at: "2026-02-23T08:00:00Z", kognitos_run_id: null, episode_id: null,
  },

  // query_sent (2)
  {
    id: "cht-8", org_id: "org-1", title: "Wilson, Charles — Surgical, Knee Arthroscopy", description: "52-year-old male with meniscal tear. Arthroscopic partial meniscectomy performed. Laterality unclear in op report.",
    patient_mrn: "MRN-100012", encounter_number: "ENC-2026-0108", encounter_date: "2026-02-14T07:00:00Z", discharge_date: null,
    provider_name: "Dr. Robert Chang", department: "Surgical", assigned_to: "user-1", status: "query_sent", priority: "routine", category: "Surgical",
    suggested_codes: [
      { code: "29881", type: "CPT", description: "Arthroscopy, knee, meniscectomy", confidence: 0.94 },
      { code: "M23.30", type: "ICD-10", description: "Other meniscus derangements, unspecified knee", confidence: 0.72 },
    ],
    final_codes: [], drg: null, estimated_reimbursement: 5600, coding_accuracy_score: 72,
    coded_at: null, finalized_at: null, created_at: "2026-02-15T08:00:00Z", updated_at: "2026-02-23T14:00:00Z", kognitos_run_id: "run-4", episode_id: null,
  },
  {
    id: "cht-23", org_id: "org-1", title: "Patel, Ravi — Inpatient, CHF Exacerbation", description: "75-year-old male with acute on chronic systolic CHF. Diuretics administered. Unclear if diastolic component present.",
    patient_mrn: "MRN-100678", encounter_number: "ENC-2026-0123", encounter_date: "2026-02-19T12:00:00Z", discharge_date: "2026-02-23T09:00:00Z",
    provider_name: "Dr. Kevin Park", department: "Inpatient", assigned_to: "user-1", status: "query_sent", priority: "routine", category: "Inpatient",
    suggested_codes: [
      { code: "99222", type: "CPT", description: "Initial hospital care, moderate complexity", confidence: 0.90 },
      { code: "I50.21", type: "ICD-10", description: "Acute systolic heart failure", confidence: 0.85 },
      { code: "I50.9", type: "ICD-10", description: "Heart failure, unspecified", confidence: 0.70 },
    ],
    final_codes: [], drg: "MS-DRG 291", estimated_reimbursement: 9200, coding_accuracy_score: 78,
    coded_at: null, finalized_at: null, created_at: "2026-02-23T12:00:00Z", updated_at: "2026-02-24T10:00:00Z", kognitos_run_id: null, episode_id: null,
  },

  // coded (3)
  {
    id: "cht-9", org_id: "org-1", title: "Taylor, Susan — Outpatient, Office Visit, Hypertension", description: "65-year-old female with uncontrolled hypertension. Medication adjusted.",
    patient_mrn: "MRN-100234", encounter_number: "ENC-2026-0109", encounter_date: "2026-02-10T10:00:00Z", discharge_date: null,
    provider_name: "Dr. Lisa Nguyen", department: "Outpatient", assigned_to: "user-2", status: "coded", priority: "routine", category: "Outpatient",
    suggested_codes: [
      { code: "99214", type: "CPT", description: "Office visit, moderate complexity", confidence: 0.93 },
      { code: "I10", type: "ICD-10", description: "Essential hypertension", confidence: 0.98 },
    ],
    final_codes: [
      { code: "99214", type: "CPT", description: "Office visit, moderate complexity", source: "auto" },
      { code: "I10", type: "ICD-10", description: "Essential hypertension", source: "auto" },
    ],
    drg: null, estimated_reimbursement: 195, coding_accuracy_score: 98,
    coded_at: "2026-02-12T09:00:00Z", finalized_at: null, created_at: "2026-02-10T14:00:00Z", updated_at: "2026-02-12T09:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-10", org_id: "org-1", title: "Moore, David — ED Visit, Ankle Fracture", description: "34-year-old male with displaced lateral malleolus fracture, right ankle. Splinted and referred to ortho.",
    patient_mrn: "MRN-100456", encounter_number: "ENC-2026-0110", encounter_date: "2026-02-08T18:00:00Z", discharge_date: "2026-02-08T23:00:00Z",
    provider_name: "Dr. Amanda Foster", department: "Emergency", assigned_to: "user-2", status: "coded", priority: "routine", category: "Emergency",
    suggested_codes: [
      { code: "99284", type: "CPT", description: "ED visit, high severity", confidence: 0.91 },
      { code: "29515", type: "CPT", description: "Application of short leg splint", confidence: 0.88 },
      { code: "S82.61XA", type: "ICD-10", description: "Displaced fracture of lateral malleolus, right fibula", confidence: 0.95 },
    ],
    final_codes: [
      { code: "99284", type: "CPT", description: "ED visit, high severity", source: "auto" },
      { code: "29515", type: "CPT", description: "Application of short leg splint", source: "auto" },
      { code: "S82.61XA", type: "ICD-10", description: "Displaced fracture of lateral malleolus, right fibula", source: "auto" },
    ],
    drg: null, estimated_reimbursement: 2850, coding_accuracy_score: 91,
    coded_at: "2026-02-10T11:00:00Z", finalized_at: null, created_at: "2026-02-09T06:00:00Z", updated_at: "2026-02-10T11:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-11", org_id: "org-1", title: "Jackson, Mary — Inpatient, Hip Replacement", description: "72-year-old female with left femoral neck fracture. Total hip arthroplasty performed.",
    patient_mrn: "MRN-100789", encounter_number: "ENC-2026-0111", encounter_date: "2026-02-05T08:00:00Z", discharge_date: "2026-02-09T12:00:00Z",
    provider_name: "Dr. Robert Chang", department: "Surgical", assigned_to: "user-2", status: "coded", priority: "routine", category: "Surgical",
    suggested_codes: [
      { code: "27130", type: "CPT", description: "Total hip arthroplasty", confidence: 0.96 },
      { code: "S72.001A", type: "ICD-10", description: "Fracture of neck of left femur, initial", confidence: 0.94 },
      { code: "W01.0XXA", type: "ICD-10", description: "Fall on same level from slipping, initial", confidence: 0.85 },
    ],
    final_codes: [
      { code: "27130", type: "CPT", description: "Total hip arthroplasty", source: "auto" },
      { code: "S72.001A", type: "ICD-10", description: "Fracture of neck of left femur, initial", source: "auto" },
      { code: "W01.0XXA", type: "ICD-10", description: "Fall on same level from slipping, initial", source: "auto" },
      { code: "M80.052A", type: "ICD-10", description: "Age-related osteoporosis with pathological fracture, left femur", source: "manual" },
    ],
    drg: "MS-DRG 480", estimated_reimbursement: 19800, coding_accuracy_score: 88,
    coded_at: "2026-02-11T15:00:00Z", finalized_at: null, created_at: "2026-02-09T16:00:00Z", updated_at: "2026-02-11T15:00:00Z", kognitos_run_id: null, episode_id: null,
  },

  // audited (3)
  {
    id: "cht-12", org_id: "org-1", title: "White, Jennifer — Inpatient, Appendectomy", description: "28-year-old female with acute appendicitis. Laparoscopic appendectomy performed.",
    patient_mrn: "MRN-100345", encounter_number: "ENC-2026-0112", encounter_date: "2026-02-01T22:00:00Z", discharge_date: "2026-02-03T10:00:00Z",
    provider_name: "Dr. Sarah Mitchell", department: "Surgical", assigned_to: "user-2", status: "audited", priority: "routine", category: "Surgical",
    suggested_codes: [
      { code: "44970", type: "CPT", description: "Laparoscopic appendectomy", confidence: 0.98 },
      { code: "K35.80", type: "ICD-10", description: "Unspecified acute appendicitis without abscess", confidence: 0.96 },
    ],
    final_codes: [
      { code: "44970", type: "CPT", description: "Laparoscopic appendectomy", source: "auto" },
      { code: "K35.80", type: "ICD-10", description: "Unspecified acute appendicitis without abscess", source: "auto" },
    ],
    drg: "MS-DRG 343", estimated_reimbursement: 11200, coding_accuracy_score: 98,
    coded_at: "2026-02-04T09:00:00Z", finalized_at: null, created_at: "2026-02-03T14:00:00Z", updated_at: "2026-02-06T10:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-13", org_id: "org-1", title: "Harris, Robert — Outpatient, Cardiac Cath", description: "62-year-old male with chest pain. Diagnostic cardiac catheterization showing 70% LAD stenosis.",
    patient_mrn: "MRN-100567", encounter_number: "ENC-2026-0113", encounter_date: "2026-02-03T08:00:00Z", discharge_date: null,
    provider_name: "Dr. Kevin Park", department: "Outpatient", assigned_to: "user-2", status: "audited", priority: "routine", category: "Outpatient",
    suggested_codes: [
      { code: "93458", type: "CPT", description: "Left heart catheterization", confidence: 0.95 },
      { code: "I25.10", type: "ICD-10", description: "Atherosclerotic heart disease of native coronary artery", confidence: 0.93 },
      { code: "R07.9", type: "ICD-10", description: "Chest pain, unspecified", confidence: 0.90 },
    ],
    final_codes: [
      { code: "93458", type: "CPT", description: "Left heart catheterization", source: "auto" },
      { code: "I25.10", type: "ICD-10", description: "Atherosclerotic heart disease of native coronary artery", source: "auto" },
      { code: "R07.9", type: "ICD-10", description: "Chest pain, unspecified", source: "auto" },
    ],
    drg: null, estimated_reimbursement: 4500, coding_accuracy_score: 95,
    coded_at: "2026-02-05T10:00:00Z", finalized_at: null, created_at: "2026-02-03T14:00:00Z", updated_at: "2026-02-07T11:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-24", org_id: "org-1", title: "Nguyen, Thi — Inpatient, Stroke", description: "69-year-old female with acute ischemic stroke, left MCA territory. tPA administered within window.",
    patient_mrn: "MRN-101234", encounter_number: "ENC-2026-0124", encounter_date: "2026-02-07T04:00:00Z", discharge_date: "2026-02-14T12:00:00Z",
    provider_name: "Dr. David Kim", department: "Inpatient", assigned_to: "user-2", status: "audited", priority: "stat", category: "Inpatient",
    suggested_codes: [
      { code: "99223", type: "CPT", description: "Initial hospital care, high complexity", confidence: 0.95 },
      { code: "I63.512", type: "ICD-10", description: "Cerebral infarction due to unspecified occlusion of left MCA", confidence: 0.92 },
      { code: "Z92.82", type: "ICD-10", description: "Status post administration of tPA in last 24 hours", confidence: 0.90 },
    ],
    final_codes: [
      { code: "99223", type: "CPT", description: "Initial hospital care, high complexity", source: "auto" },
      { code: "I63.512", type: "ICD-10", description: "Cerebral infarction due to unspecified occlusion of left MCA", source: "auto" },
      { code: "Z92.82", type: "ICD-10", description: "Status post administration of tPA", source: "auto" },
      { code: "G81.91", type: "ICD-10", description: "Hemiplegia, unspecified affecting right dominant side", source: "manual" },
    ],
    drg: "MS-DRG 061", estimated_reimbursement: 15600, coding_accuracy_score: 90,
    coded_at: "2026-02-16T09:00:00Z", finalized_at: null, created_at: "2026-02-14T16:00:00Z", updated_at: "2026-02-18T14:00:00Z", kognitos_run_id: null, episode_id: null,
  },

  // finalized (6)
  {
    id: "cht-14", org_id: "org-1", title: "Clark, Thomas — Outpatient, Office Visit, Back Pain", description: "48-year-old male with chronic low back pain. Physical therapy referral.",
    patient_mrn: "MRN-100012", encounter_number: "ENC-2026-0114", encounter_date: "2026-01-20T09:00:00Z", discharge_date: null,
    provider_name: "Dr. Lisa Nguyen", department: "Outpatient", assigned_to: "user-1", status: "finalized", priority: "routine", category: "Outpatient",
    suggested_codes: [
      { code: "99213", type: "CPT", description: "Office visit, low complexity", confidence: 0.94 },
      { code: "M54.5", type: "ICD-10", description: "Low back pain", confidence: 0.97 },
    ],
    final_codes: [
      { code: "99213", type: "CPT", description: "Office visit, low complexity", source: "auto" },
      { code: "M54.5", type: "ICD-10", description: "Low back pain", source: "auto" },
    ],
    drg: null, estimated_reimbursement: 150, coding_accuracy_score: 97,
    coded_at: "2026-01-22T10:00:00Z", finalized_at: "2026-01-24T14:00:00Z", created_at: "2026-01-20T14:00:00Z", updated_at: "2026-01-24T14:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-15", org_id: "org-1", title: "Lewis, Angela — Inpatient, Cesarean Section", description: "32-year-old female, term pregnancy with cephalopelvic disproportion. Cesarean delivery performed.",
    patient_mrn: "MRN-100891", encounter_number: "ENC-2026-0115", encounter_date: "2026-01-18T06:00:00Z", discharge_date: "2026-01-21T10:00:00Z",
    provider_name: "Dr. Jennifer Wu", department: "Surgical", assigned_to: "user-1", status: "finalized", priority: "stat", category: "Surgical",
    suggested_codes: [
      { code: "59510", type: "CPT", description: "Cesarean delivery", confidence: 0.97 },
      { code: "O33.0", type: "ICD-10", description: "Maternal care for disproportion due to deformity of pelvis", confidence: 0.91 },
      { code: "Z37.0", type: "ICD-10", description: "Single live birth", confidence: 0.99 },
    ],
    final_codes: [
      { code: "59510", type: "CPT", description: "Cesarean delivery", source: "auto" },
      { code: "O33.0", type: "ICD-10", description: "Maternal care for disproportion due to deformity of pelvis", source: "auto" },
      { code: "Z37.0", type: "ICD-10", description: "Single live birth", source: "auto" },
    ],
    drg: "MS-DRG 788", estimated_reimbursement: 8900, coding_accuracy_score: 96,
    coded_at: "2026-01-22T14:00:00Z", finalized_at: "2026-01-25T09:00:00Z", created_at: "2026-01-21T14:00:00Z", updated_at: "2026-01-25T09:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-16", org_id: "org-1", title: "Robinson, Kevin — ED Visit, Migraine", description: "38-year-old male with intractable migraine with aura. IV fluids and anti-emetics administered.",
    patient_mrn: "MRN-100345", encounter_number: "ENC-2026-0116", encounter_date: "2026-01-25T14:00:00Z", discharge_date: "2026-01-25T20:00:00Z",
    provider_name: "Dr. Amanda Foster", department: "Emergency", assigned_to: "user-1", status: "finalized", priority: "routine", category: "Emergency",
    suggested_codes: [
      { code: "99283", type: "CPT", description: "ED visit, moderate severity", confidence: 0.92 },
      { code: "96374", type: "CPT", description: "IV push, single substance", confidence: 0.88 },
      { code: "G43.111", type: "ICD-10", description: "Migraine with aura, intractable, with status migrainosus", confidence: 0.94 },
    ],
    final_codes: [
      { code: "99283", type: "CPT", description: "ED visit, moderate severity", source: "auto" },
      { code: "96374", type: "CPT", description: "IV push, single substance", source: "auto" },
      { code: "G43.111", type: "ICD-10", description: "Migraine with aura, intractable, with status migrainosus", source: "auto" },
    ],
    drg: null, estimated_reimbursement: 1950, coding_accuracy_score: 94,
    coded_at: "2026-01-27T09:00:00Z", finalized_at: "2026-01-29T11:00:00Z", created_at: "2026-01-26T06:00:00Z", updated_at: "2026-01-29T11:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-17", org_id: "org-1", title: "Walker, Helen — Radiology, MRI Brain", description: "55-year-old female with new-onset seizure. MRI brain without and with contrast performed.",
    patient_mrn: "MRN-100567", encounter_number: "ENC-2026-0117", encounter_date: "2026-01-28T11:00:00Z", discharge_date: null,
    provider_name: "Dr. Jennifer Wu", department: "Radiology", assigned_to: "user-1", status: "finalized", priority: "routine", category: "Radiology",
    suggested_codes: [
      { code: "70553", type: "CPT", description: "MRI brain without and with contrast", confidence: 0.97 },
      { code: "R56.9", type: "ICD-10", description: "Unspecified convulsions", confidence: 0.93 },
    ],
    final_codes: [
      { code: "70553", type: "CPT", description: "MRI brain without and with contrast", source: "auto" },
      { code: "R56.9", type: "ICD-10", description: "Unspecified convulsions", source: "auto" },
    ],
    drg: null, estimated_reimbursement: 2200, coding_accuracy_score: 97,
    coded_at: "2026-01-30T08:00:00Z", finalized_at: "2026-02-01T10:00:00Z", created_at: "2026-01-28T16:00:00Z", updated_at: "2026-02-01T10:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-18", org_id: "org-1", title: "Young, Daniel — Inpatient, CABG x3", description: "70-year-old male with triple vessel coronary artery disease. CABG x3 performed.",
    patient_mrn: "MRN-100678", encounter_number: "ENC-2026-0118", encounter_date: "2026-01-10T07:00:00Z", discharge_date: "2026-01-18T14:00:00Z",
    provider_name: "Dr. Robert Chang", department: "Surgical", assigned_to: "user-2", status: "finalized", priority: "stat", category: "Surgical",
    suggested_codes: [
      { code: "33533", type: "CPT", description: "CABG, arterial, three coronary grafts", confidence: 0.96 },
      { code: "I25.10", type: "ICD-10", description: "Atherosclerotic heart disease of native coronary artery", confidence: 0.97 },
      { code: "I25.110", type: "ICD-10", description: "Atherosclerotic heart disease with unstable angina", confidence: 0.90 },
    ],
    final_codes: [
      { code: "33533", type: "CPT", description: "CABG, arterial, three coronary grafts", source: "auto" },
      { code: "I25.10", type: "ICD-10", description: "Atherosclerotic heart disease of native coronary artery", source: "auto" },
      { code: "I25.110", type: "ICD-10", description: "Atherosclerotic heart disease with unstable angina", source: "auto" },
    ],
    drg: "MS-DRG 236", estimated_reimbursement: 42000, coding_accuracy_score: 95,
    coded_at: "2026-01-20T10:00:00Z", finalized_at: "2026-01-23T14:00:00Z", created_at: "2026-01-18T18:00:00Z", updated_at: "2026-01-23T14:00:00Z", kognitos_run_id: null, episode_id: null,
  },
  {
    id: "cht-19", org_id: "org-1", title: "King, Elizabeth — Observation, Chest Pain Rule-out", description: "50-year-old female with atypical chest pain. Serial troponins negative, stress test negative.",
    patient_mrn: "MRN-100890", encounter_number: "ENC-2026-0119", encounter_date: "2026-01-30T16:00:00Z", discharge_date: "2026-01-31T14:00:00Z",
    provider_name: "Dr. Kevin Park", department: "Observation", assigned_to: "user-1", status: "finalized", priority: "routine", category: "Observation",
    suggested_codes: [
      { code: "99236", type: "CPT", description: "Observation care discharge, same day", confidence: 0.91 },
      { code: "R07.9", type: "ICD-10", description: "Chest pain, unspecified", confidence: 0.95 },
      { code: "Z03.89", type: "ICD-10", description: "Encounter for observation for other suspected conditions ruled out", confidence: 0.89 },
    ],
    final_codes: [
      { code: "99236", type: "CPT", description: "Observation care discharge, same day", source: "auto" },
      { code: "R07.9", type: "ICD-10", description: "Chest pain, unspecified", source: "auto" },
      { code: "Z03.89", type: "ICD-10", description: "Encounter for observation for other suspected conditions ruled out", source: "manual" },
    ],
    drg: null, estimated_reimbursement: 3800, coding_accuracy_score: 91,
    coded_at: "2026-02-02T09:00:00Z", finalized_at: "2026-02-04T15:00:00Z", created_at: "2026-01-31T18:00:00Z", updated_at: "2026-02-04T15:00:00Z", kognitos_run_id: null, episode_id: null,
  },
];

// ── Documents ──────────────────────────────────────────────────

export const documents = [
  { id: "doc-1", chart_id: "cht-1", file_name: "ed_physician_note.pdf", document_type: "physician_note", size_bytes: 245000, source: "ehr_import", created_at: "2026-02-25T06:10:00Z" },
  { id: "doc-2", chart_id: "cht-1", file_name: "ekg_results.pdf", document_type: "diagnostic_report", size_bytes: 128000, source: "ehr_import", created_at: "2026-02-25T06:15:00Z" },
  { id: "doc-3", chart_id: "cht-3", file_name: "discharge_summary.pdf", document_type: "discharge_summary", size_bytes: 890000, source: "ehr_import", created_at: "2026-02-22T12:00:00Z" },
  { id: "doc-4", chart_id: "cht-3", file_name: "h_and_p_notes.pdf", document_type: "h_and_p", size_bytes: 560000, source: "ehr_import", created_at: "2026-02-18T18:00:00Z" },
  { id: "doc-5", chart_id: "cht-5", file_name: "operative_report_tka.pdf", document_type: "operative_report", size_bytes: 720000, source: "ehr_import", created_at: "2026-02-15T14:00:00Z" },
  { id: "doc-6", chart_id: "cht-5", file_name: "anesthesia_record.pdf", document_type: "anesthesia_record", size_bytes: 410000, source: "ehr_import", created_at: "2026-02-15T12:00:00Z" },
  { id: "doc-7", chart_id: "cht-6", file_name: "discharge_summary_pneumonia.pdf", document_type: "discharge_summary", size_bytes: 980000, source: "ehr_import", created_at: "2026-02-20T12:00:00Z" },
  { id: "doc-8", chart_id: "cht-6", file_name: "ventilator_flow_sheet.pdf", document_type: "flow_sheet", size_bytes: 340000, source: "ehr_import", created_at: "2026-02-14T08:00:00Z" },
  { id: "doc-9", chart_id: "cht-8", file_name: "operative_report_knee.pdf", document_type: "operative_report", size_bytes: 650000, source: "ehr_import", created_at: "2026-02-14T10:00:00Z" },
  { id: "doc-10", chart_id: "cht-8", file_name: "physician_query_laterality.pdf", document_type: "physician_query", size_bytes: 85000, source: "system_generated", created_at: "2026-02-23T14:00:00Z" },
  { id: "doc-11", chart_id: "cht-9", file_name: "office_visit_note.pdf", document_type: "physician_note", size_bytes: 175000, source: "ehr_import", created_at: "2026-02-10T11:00:00Z" },
  { id: "doc-12", chart_id: "cht-10", file_name: "ed_note_ankle.pdf", document_type: "physician_note", size_bytes: 220000, source: "ehr_import", created_at: "2026-02-08T20:00:00Z" },
  { id: "doc-13", chart_id: "cht-10", file_name: "xray_ankle_right.pdf", document_type: "diagnostic_report", size_bytes: 1800000, source: "ehr_import", created_at: "2026-02-08T19:00:00Z" },
  { id: "doc-14", chart_id: "cht-11", file_name: "operative_report_hip.pdf", document_type: "operative_report", size_bytes: 780000, source: "ehr_import", created_at: "2026-02-05T14:00:00Z" },
  { id: "doc-15", chart_id: "cht-12", file_name: "operative_report_appy.pdf", document_type: "operative_report", size_bytes: 540000, source: "ehr_import", created_at: "2026-02-02T02:00:00Z" },
  { id: "doc-16", chart_id: "cht-15", file_name: "operative_report_csection.pdf", document_type: "operative_report", size_bytes: 620000, source: "ehr_import", created_at: "2026-01-18T10:00:00Z" },
  { id: "doc-17", chart_id: "cht-18", file_name: "operative_report_cabg.pdf", document_type: "operative_report", size_bytes: 1100000, source: "ehr_import", created_at: "2026-01-10T14:00:00Z" },
  { id: "doc-18", chart_id: "cht-18", file_name: "cardiac_cath_report.pdf", document_type: "diagnostic_report", size_bytes: 890000, source: "ehr_import", created_at: "2026-01-09T16:00:00Z" },
  { id: "doc-19", chart_id: "cht-4", file_name: "colonoscopy_report.pdf", document_type: "procedure_report", size_bytes: 450000, source: "ehr_import", created_at: "2026-02-20T09:00:00Z" },
  { id: "doc-20", chart_id: "cht-4", file_name: "pathology_report_polyps.pdf", document_type: "pathology_report", size_bytes: 320000, source: "ehr_import", created_at: "2026-02-21T10:00:00Z" },
];

// ── Comments ───────────────────────────────────────────────────

export const comments = [
  { id: "cmt-1", chart_id: "cht-3", author_id: "user-1", content: "Auto-coded with 92% confidence. Need to verify E11.9 specificity — checking if documentation supports E11.65 (Type 2 diabetes with hyperglycemia).", created_at: "2026-02-22T18:30:00Z" },
  { id: "cmt-2", chart_id: "cht-5", author_id: "user-1", content: "TKA codes look correct. High confidence from auto-coder. Verifying DRG assignment against MS-DRG 470 criteria.", created_at: "2026-02-23T10:15:00Z" },
  { id: "cmt-3", chart_id: "cht-6", author_id: "user-1", content: "J18.9 may need upgrade to organism-specific code if culture results are in the chart. Checking lab reports.", created_at: "2026-02-22T09:30:00Z" },
  { id: "cmt-4", chart_id: "cht-6", author_id: "user-3", content: "This is a high-value chart — prioritize review. DRG 193 with MCC needs careful validation.", created_at: "2026-02-22T11:00:00Z" },
  { id: "cmt-5", chart_id: "cht-8", author_id: "user-1", content: "Physician query sent regarding laterality. Op report states 'knee arthroscopy' but does not specify left or right.", created_at: "2026-02-23T14:15:00Z" },
  { id: "cmt-6", chart_id: "cht-9", author_id: "user-2", content: "Codes verified. Clean auto-code, no modifications needed. Ready for finalization.", created_at: "2026-02-12T09:30:00Z" },
  { id: "cmt-7", chart_id: "cht-11", author_id: "user-1", content: "Added M80.052A for osteoporotic fracture — documentation supports this as underlying cause of the femoral neck fracture.", created_at: "2026-02-11T15:30:00Z" },
  { id: "cmt-8", chart_id: "cht-12", author_id: "user-2", content: "Audit complete. Coding is accurate. Appendectomy codes and DRG 343 are correct.", created_at: "2026-02-06T10:30:00Z" },
  { id: "cmt-9", chart_id: "cht-13", author_id: "user-2", content: "Cardiac cath coding verified. All codes align with documentation.", created_at: "2026-02-07T11:30:00Z" },
  { id: "cmt-10", chart_id: "cht-18", author_id: "user-2", content: "CABG x3 codes are correct. DRG 236 validated. High-quality auto-coding on this surgical case.", created_at: "2026-01-22T14:00:00Z" },
  { id: "cmt-11", chart_id: "cht-4", author_id: "user-1", content: "Waiting for pathology results before finalizing. Polyp histology may affect coding.", created_at: "2026-02-20T16:30:00Z" },
  { id: "cmt-12", chart_id: "cht-23", author_id: "user-1", content: "Query sent to Dr. Park to clarify if diastolic dysfunction is present. This affects DRG assignment.", created_at: "2026-02-24T10:15:00Z" },
];

// ── Audit Events ───────────────────────────────────────────────

export const auditEvents = [
  { id: "evt-1", chart_id: "cht-3", action: "auto_coded", actor_id: null, details: { confidence: 92, codes_generated: 5 }, created_at: "2026-02-22T18:00:00Z" },
  { id: "evt-2", chart_id: "cht-3", action: "assigned", actor_id: "user-3", details: { assigned_to: "user-1" }, created_at: "2026-02-22T18:05:00Z" },
  { id: "evt-3", chart_id: "cht-5", action: "auto_coded", actor_id: null, details: { confidence: 97, codes_generated: 3 }, created_at: "2026-02-21T14:35:00Z" },
  { id: "evt-4", chart_id: "cht-5", action: "status_changed", actor_id: "user-1", details: { from: "auto_coded", to: "in_review" }, created_at: "2026-02-23T10:00:00Z" },
  { id: "evt-5", chart_id: "cht-6", action: "auto_coded", actor_id: null, details: { confidence: 89, codes_generated: 5 }, created_at: "2026-02-22T08:00:00Z" },
  { id: "evt-6", chart_id: "cht-6", action: "status_changed", actor_id: "user-1", details: { from: "auto_coded", to: "in_review" }, created_at: "2026-02-22T09:00:00Z" },
  { id: "evt-7", chart_id: "cht-8", action: "auto_coded", actor_id: null, details: { confidence: 72, codes_generated: 2 }, created_at: "2026-02-22T10:02:00Z" },
  { id: "evt-8", chart_id: "cht-8", action: "status_changed", actor_id: "user-1", details: { from: "auto_coded", to: "query_sent" }, created_at: "2026-02-23T14:00:00Z" },
  { id: "evt-9", chart_id: "cht-8", action: "query_sent", actor_id: "user-1", details: { query_type: "missing_laterality", provider: "Dr. Robert Chang" }, created_at: "2026-02-23T14:05:00Z" },
  { id: "evt-10", chart_id: "cht-9", action: "auto_coded", actor_id: null, details: { confidence: 98, codes_generated: 2 }, created_at: "2026-02-11T08:00:00Z" },
  { id: "evt-11", chart_id: "cht-9", action: "status_changed", actor_id: "user-1", details: { from: "auto_coded", to: "coded" }, created_at: "2026-02-12T09:00:00Z" },
  { id: "evt-12", chart_id: "cht-10", action: "status_changed", actor_id: "user-1", details: { from: "auto_coded", to: "coded" }, created_at: "2026-02-10T11:00:00Z" },
  { id: "evt-13", chart_id: "cht-11", action: "codes_modified", actor_id: "user-1", details: { added: "M80.052A", reason: "Osteoporotic fracture supported by documentation" }, created_at: "2026-02-11T15:00:00Z" },
  { id: "evt-14", chart_id: "cht-11", action: "status_changed", actor_id: "user-1", details: { from: "auto_coded", to: "coded" }, created_at: "2026-02-11T15:05:00Z" },
  { id: "evt-15", chart_id: "cht-12", action: "status_changed", actor_id: "user-1", details: { from: "coded", to: "audited" }, created_at: "2026-02-06T10:00:00Z" },
  { id: "evt-16", chart_id: "cht-12", action: "audit_passed", actor_id: "user-2", details: { accuracy_score: 98 }, created_at: "2026-02-06T10:15:00Z" },
  { id: "evt-17", chart_id: "cht-14", action: "status_changed", actor_id: "user-2", details: { from: "audited", to: "finalized" }, created_at: "2026-01-24T14:00:00Z" },
  { id: "evt-18", chart_id: "cht-15", action: "status_changed", actor_id: "user-2", details: { from: "audited", to: "finalized" }, created_at: "2026-01-25T09:00:00Z" },
  { id: "evt-19", chart_id: "cht-16", action: "status_changed", actor_id: "user-2", details: { from: "audited", to: "finalized" }, created_at: "2026-01-29T11:00:00Z" },
  { id: "evt-20", chart_id: "cht-17", action: "status_changed", actor_id: "user-2", details: { from: "audited", to: "finalized" }, created_at: "2026-02-01T10:00:00Z" },
  { id: "evt-21", chart_id: "cht-18", action: "status_changed", actor_id: "user-2", details: { from: "audited", to: "finalized" }, created_at: "2026-01-23T14:00:00Z" },
  { id: "evt-22", chart_id: "cht-19", action: "status_changed", actor_id: "user-2", details: { from: "audited", to: "finalized" }, created_at: "2026-02-04T15:00:00Z" },
  { id: "evt-23", chart_id: "cht-4", action: "auto_coded", actor_id: null, details: { confidence: 96, codes_generated: 3 }, created_at: "2026-02-20T16:00:00Z" },
  { id: "evt-24", chart_id: "cht-21", action: "auto_coded", actor_id: null, details: { confidence: 94, codes_generated: 3 }, created_at: "2026-02-24T06:00:00Z" },
  { id: "evt-25", chart_id: "cht-13", action: "status_changed", actor_id: "user-2", details: { from: "coded", to: "audited" }, created_at: "2026-02-07T11:00:00Z" },
  { id: "evt-26", chart_id: "cht-24", action: "codes_modified", actor_id: "user-1", details: { added: "G81.91", reason: "Right-sided hemiplegia documented in rehab notes" }, created_at: "2026-02-16T09:30:00Z" },
];

// ── Notifications ──────────────────────────────────────────────

export const notifications = [
  { id: "notif-1", user_id: "user-1", chart_id: "cht-3", message: "Chart auto-coded: Davis, Patricia — COPD Exacerbation (92% confidence). Review suggested codes.", is_read: true, created_at: "2026-02-22T18:00:00Z" },
  { id: "notif-2", user_id: "user-1", chart_id: "cht-5", message: "Chart auto-coded: Thompson, Michael — Total Knee Replacement (97% confidence).", is_read: true, created_at: "2026-02-21T14:35:00Z" },
  { id: "notif-3", user_id: "user-1", chart_id: "cht-6", message: "STAT chart assigned: Anderson, Linda — Pneumonia with Resp Failure. High-value DRG.", is_read: false, created_at: "2026-02-22T09:00:00Z" },
  { id: "notif-4", user_id: "user-1", chart_id: "cht-8", message: "Auto-coding flagged: Wilson, Charles — missing laterality. Physician query recommended.", is_read: true, created_at: "2026-02-22T10:02:00Z" },
  { id: "notif-5", user_id: "user-1", chart_id: "cht-1", message: "New chart pending coding: Johnson, Robert — ED Visit, Chest Pain (STAT).", is_read: false, created_at: "2026-02-25T06:00:00Z" },
  { id: "notif-6", user_id: "user-2", chart_id: "cht-9", message: "Chart ready for audit: Taylor, Susan — Office Visit, Hypertension.", is_read: true, created_at: "2026-02-12T09:00:00Z" },
  { id: "notif-7", user_id: "user-2", chart_id: "cht-11", message: "Chart coded with manual modifications: Jackson, Mary — Hip Replacement. Code M80.052A added.", is_read: true, created_at: "2026-02-11T15:05:00Z" },
  { id: "notif-8", user_id: "user-3", chart_id: "cht-6", message: "High-value chart in review: Anderson, Linda — est. reimbursement $18,750. DRG 193.", is_read: true, created_at: "2026-02-22T09:05:00Z" },
  { id: "notif-9", user_id: "user-3", chart_id: null, message: "Weekly DNFC report: 14 charts not yet finalized. Revenue at risk: $102,880.", is_read: false, created_at: "2026-02-24T08:00:00Z" },
  { id: "notif-10", user_id: "user-1", chart_id: "cht-22", message: "STAT chart assigned: Lee, David — CT Abdomen/Pelvis (Appendicitis). Review codes.", is_read: false, created_at: "2026-02-22T16:00:00Z" },
  { id: "notif-11", user_id: "user-2", chart_id: "cht-12", message: "Audit complete: White, Jennifer — Appendectomy. Coding accuracy: 98%.", is_read: true, created_at: "2026-02-06T10:15:00Z" },
  { id: "notif-12", user_id: "user-1", chart_id: "cht-23", message: "Query response pending: Patel, Ravi — CHF Exacerbation. Awaiting physician clarification.", is_read: false, created_at: "2026-02-24T10:00:00Z" },
];
