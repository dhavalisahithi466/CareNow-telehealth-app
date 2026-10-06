# CareNow — product and safety architecture

## Status and intended use

CareNow is currently a **non-clinical prototype**. Its mobile app demonstrates an emergency access screen, a short rule-based warning-sign screen, map-app search shortcuts, and an optional on-device profile. It does not connect users to practitioners, create appointments, diagnose or treat symptoms, dispatch emergency services, or provide a verified directory.

The profile is saved with ordinary local app storage and is **not encrypted**. It is deliberately gated by a warning not to enter real medical or identifying information. Do not use this prototype with patients or store actual health records in it.

This document is a product and engineering plan, not evidence of HIPAA, GDPR, HITECH, medical-device, or other regulatory compliance. Compliance and clinical safety require jurisdiction-specific counsel, clinical governance, security implementation, operational controls, and independent assessment.

## 1. UX flows and patient safety

### Emergency access without an account

1. The home screen exposes **Emergency help** without requiring registration.
2. One tap opens emergency calling options; a second tap explicitly opens the device phone app for the selected number. CareNow never places a call or sends location automatically.
3. A separate action opens the user's map app to search for an emergency department nearby.
4. The user must confirm that a number and map listing apply to their current country and situation. The prototype lists example numbers for India and the United States; it is not a complete international emergency-number directory.

For a production launch, emergency numbers must come from a maintained, region-reviewed source. Never infer a user's emergency number solely from device language, timezone, or IP address. Show local-number uncertainty and give users a safe way to use their phone's emergency calling feature.

### Symptom warning-sign flow

1. Explain that the screen is not diagnosis or validated clinical triage.
2. Ask whether any emergency warning sign applies now.
3. A selected warning sign ends the non-emergency path and displays emergency call and nearby emergency-department actions. No appointment or consultation action is offered from that result.
4. If no listed warning sign is selected, state that this does not rule out an emergency; provide a non-urgent care next step and a prominent instruction to seek urgent in-person care if the user is worried or getting worse.

Prototype warning signs include severe/crushing chest pain, severe breathing difficulty, sudden one-sided weakness/facial droop/speech trouble, severe allergic reaction or collapse, unconsciousness/seizure, uncontrolled bleeding, and major injury/head trauma. This short list is intentionally conservative but **incomplete and unvalidated**. Before clinical use, qualified clinicians must author and test an approved, versioned protocol for each market, including age-specific and pregnancy-related pathways, safeguarding, language, accessibility, and escalation failure handling.

Production rules:

- A high-risk result blocks online booking and non-emergency queue entry for that episode.
- A user's screen must not delay emergency contact. Do not make the user finish a questionnaire before showing emergency options.
- Provide human-reviewed protocol versioning, change approval, audit trails, monitoring, and a rollback process.
- Do not market a sensitivity, accuracy rate, or “zero-latency” guarantee without prospective validation.
- Accessibility, low bandwidth, translation quality, and screen-reader paths are part of safety validation.

### Consultation, directory, and profile flows

- **Text/audio/video:** the prototype states that no clinician network is connected and sends no message or appointment. A live service needs a verified provider, jurisdiction eligibility, informed consent, availability/queue handling, connection-failure handling, and escalation controls before enabling any channel.
- **Directory:** the prototype hands searches to the user's external map app. It does not verify provider identity, emergency capability, hours, accessibility, or availability. A production directory needs source provenance, freshness indicators, correction reporting, and explicit emergency-service filters.
- **Health profile and export:** a user can edit a demo summary and review it in the system share sheet. This is not an EHR export or clinical record. Production export must follow an authenticated, auditable, consent-based workflow with a portable standard such as FHIR where applicable.

## 2. Triage engine decision outline

```text
Show emergency disclaimer before questions
  ├─ User says this is an emergency / symptoms are severe or worsening
  │    └─ Show local emergency contact and in-person care immediately
  ├─ Any approved red-flag answer is yes
  │    ├─ Set risk tier to EMERGENCY
  │    ├─ Stop the non-emergency booking path for this triage episode
  │    ├─ Show and repeat clear, accessible emergency instructions
  │    └─ Let the user choose to open phone/maps; never call automatically
  └─ No listed red flag selected
       ├─ State clearly that emergency is not ruled out
       ├─ Offer only the market-approved next step
       └─ Re-escalate if the user reports worsening symptoms
```

The implemented screen is a small demonstration of the red-flag branch only. It does not ask a complete clinical history, calculate a diagnostic score, or persist a clinically usable triage record.

For production, define risk tiers, inclusion/exclusion logic, missing-answer behavior, language/version metadata, disposition rationale, and independent clinical validation. If required answers are missing, an engine is unavailable, or a user's answer is ambiguous, fail toward human/emergency advice rather than silently lowering urgency.

## 3. Target system architecture and security controls

### Prototype stack

- Cross-platform mobile UI: Expo + React Native.
- Optional demo profile: local AsyncStorage; unencrypted and not for real patient data.
- Emergency calls and map searches: explicit user-initiated operating-system handoffs.
- No authentication, practitioner service, backend health-data persistence, WebRTC calls, chat transport, Redis queue, or production monitoring is implemented.

### Production target (subject to architecture and security review)

- **Mobile clients:** React Native/Expo for low-bandwidth accessible flows; secure credential storage, explicit permission requests, resilient offline emergency guidance, minimum app logging, and a privacy review.
- **API:** versioned Node.js/TypeScript REST services using OpenAPI contracts, schema validation, authorization on every patient/practitioner object, rate limits, idempotency, and audit events.
- **Data:** PostgreSQL for transactional records; Redis only for short-lived queue/session coordination and never as the sole clinical record. Regional hosting and backups must match legal obligations.
- **Calls and messaging:** vetted WebRTC provider/architecture for encrypted real-time audio/video and a separately designed authenticated messaging service. Confirm encryption boundaries, recording defaults, data retention, key management, and incident response before launch.
- **Transport/storage:** TLS 1.2+ (prefer TLS 1.3 where supported), managed encryption at rest with documented key rotation, least-privilege access, environment isolation, encrypted backups, and tested restoration.
- **Operations:** clinical-safety incident process, on-call coverage, immutable access/audit records, dependency scanning, penetration testing, breach response, uptime and queue alarms, and regional disaster recovery.

AES-256 and TLS alone do not establish regulatory compliance. Before handling protected or special-category health data, obtain legal and privacy review for each market, execute required business-associate/data-processing agreements, establish retention/deletion and data-subject-rights processes, restrict staff access, and complete security risk assessments. No compliance claim is made by this prototype.

## 4. Relational schema draft

The following is a **starting draft**, not a migration. It omits jurisdiction-specific fields and must be reviewed by clinical, privacy, security, and database owners before implementation. Use opaque identifiers, keep direct identifiers separate where appropriate, and never put clinical details in general analytics or application logs.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject TEXT NOT NULL UNIQUE,
  email_verified_at TIMESTAMPTZ,
  home_jurisdiction TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id),
  display_name TEXT NOT NULL,
  relationship TEXT,
  date_of_birth DATE,
  guardian_consent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_subject TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  online_status TEXT NOT NULL DEFAULT 'offline'
    CHECK (online_status IN ('offline', 'available', 'busy', 'suspended')),
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'expired', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE practitioner_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  jurisdiction TEXT NOT NULL,
  license_type TEXT NOT NULL,
  license_number_encrypted BYTEA NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'revoked')),
  verification_source TEXT NOT NULL,
  UNIQUE (jurisdiction, license_type, license_number_encrypted)
);

CREATE TABLE malpractice_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  insurer TEXT NOT NULL,
  policy_reference_encrypted BYTEA NOT NULL,
  coverage_jurisdictions TEXT[] NOT NULL,
  valid_from DATE NOT NULL,
  expires_at DATE NOT NULL,
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'rejected'))
);

CREATE TABLE medical_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id),
  subject_user_id UUID REFERENCES users(id),
  dependent_id UUID REFERENCES dependents(id),
  blood_type TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (num_nonnulls(subject_user_id, dependent_id) = 1)
);
CREATE UNIQUE INDEX medical_profiles_for_user
  ON medical_profiles(subject_user_id) WHERE subject_user_id IS NOT NULL;
CREATE UNIQUE INDEX medical_profiles_for_dependent
  ON medical_profiles(dependent_id) WHERE dependent_id IS NOT NULL;

CREATE TABLE profile_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_profile_id UUID NOT NULL REFERENCES medical_profiles(id),
  item_type TEXT NOT NULL CHECK (item_type IN ('allergy', 'condition', 'medication')),
  display_value TEXT NOT NULL,
  clinical_code_system TEXT,
  clinical_code TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE triage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES users(id),
  medical_profile_id UUID REFERENCES medical_profiles(id),
  protocol_id TEXT NOT NULL,
  protocol_version TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  answers JSONB NOT NULL,
  triggered_rule_codes TEXT[] NOT NULL DEFAULT '{}',
  risk_tier TEXT NOT NULL
    CHECK (risk_tier IN ('emergency', 'urgent', 'routine', 'incomplete')),
  disposition_code TEXT NOT NULL,
  booking_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medical_profile_id UUID NOT NULL REFERENCES medical_profiles(id),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  triage_log_id UUID REFERENCES triage_logs(id),
  channel TEXT NOT NULL CHECK (channel IN ('text', 'audio', 'video')),
  status TEXT NOT NULL
    CHECK (status IN ('requested', 'scheduled', 'active', 'completed', 'cancelled', 'escalated')),
  jurisdiction TEXT NOT NULL,
  consent_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE consultation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id),
  author_practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  note_ciphertext BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id),
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  medication_code TEXT NOT NULL,
  instructions_ciphertext BYTEA NOT NULL,
  jurisdiction TEXT NOT NULL,
  controlled_substance BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'cancelled')),
  issued_at TIMESTAMPTZ
);

CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID NOT NULL REFERENCES consultations(id),
  due_at TIMESTAMPTZ NOT NULL,
  reason_ciphertext BYTEA NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE access_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT NOT NULL,
  actor_id UUID,
  subject_profile_id UUID REFERENCES medical_profiles(id),
  action TEXT NOT NULL,
  reason_code TEXT,
  request_id TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Schema implementation requirements: validate that a dependent belongs to the same owner; restrict table access with service-level authorization and, where appropriate, PostgreSQL row-level security; encrypt high-risk identifiers using managed keys; define retention and deletion behavior; use transactionally consistent audit events; and ensure logs never contain answers, notes, medication instructions, tokens, or direct identifiers.

## 5. Clinical, legal, and provider guardrails

### User-facing disclaimer copy (draft)

> CareNow is not a substitute for emergency services or an in-person medical assessment. This symptom screen is not a diagnosis and may miss emergencies. If you believe someone is in immediate danger, symptoms are severe or worsening, or you are unsure, call the emergency number for your current location or go to an emergency department now. CareNow does not contact emergency services automatically.

Have counsel and a clinical safety lead review, localize, and approve all wording before any real service is offered. A disclaimer does not replace safe design, clinical validation, informed consent, or professional duties.

### Prescribing policy

- Do not implement controlled-substance prescribing in the initial service.
- Block restricted medication classes at API and prescribing-workflow levels, not just in the UI.
- Use a jurisdiction-maintained formulary and clinician review for any future prescribing feature.
- Require identity, license, scope-of-practice, patient-location, interaction/allergy, and pharmacy checks before transmission.
- Retain an auditable decision and provide a clear route to in-person care when remote prescribing is unsuitable.

### Practitioner verification

1. Validate government identity and professional credential against the authoritative licensing registry for every intended practice jurisdiction.
2. Verify current, unrestricted license status, permitted specialty/scope, and expiration; re-check periodically and before jurisdiction-sensitive consultations.
3. Verify malpractice coverage, coverage limits, covered regions, and renewal dates.
4. Review sanctions, exclusions, disciplinary actions, and required training using lawful, documented sources.
5. Approve manually by an authorized reviewer; separate submitter and approver; record source, timestamp, reviewer, and evidence reference.
6. Suspend booking immediately for expired, suspended, or uncertain status; notify affected users and preserve a safe handoff.

Automated credential checks support, but do not replace, accountable human review.

## 6. Go-to-market, rollout, and measurement

### Stages

1. **Internal prototype:** usability and accessibility review with synthetic data only; no patient care or clinician claims.
2. **Clinical design partner beta:** one carefully selected jurisdiction, approved protocols, verified practitioners, consent, privacy/security review, incident response rehearsal, and independent penetration test before real users.
3. **Limited regional launch:** controlled enrollment and staffed operating hours; monitor safety events and service quality; expand only after clinical governance signs off.
4. **Regional scale:** add each new jurisdiction only after legal, licensing, data-residency, emergency-number, prescribing, localization, and clinical protocol review.

### KPIs (define denominator and segment before reporting)

- **Time to clinician:** median and 90th percentile from completed eligibility/consent to a verified clinician joining; exclude or separately report abandoned sessions.
- **Emergency triage safety:** sensitivity for protocol-defined red flags, under-triage rate, over-triage rate, and adjudication agreement, based on an independently reviewed dataset and post-launch safety review. Do not optimize conversion at the expense of sensitivity.
- **Session drop-off:** users who abandon after requesting a consultation divided by users who submit a valid request, segmented by channel, network quality, accessibility path, and jurisdiction.
- **Availability:** monthly API availability against a defined service-level objective; 99.99% is a future target, not a current claim. Report critical dependency and clinician-network availability separately.
- **Operational safety:** emergency escalation failures, time to safety review, unresolved critical incidents, stale provider credentials, privacy incidents, and time to correct unsafe content.

Do not collect more health data for analytics than is required. Prefer de-identified, aggregated metrics, suppress small cohorts, and have privacy counsel review analytics definitions.
