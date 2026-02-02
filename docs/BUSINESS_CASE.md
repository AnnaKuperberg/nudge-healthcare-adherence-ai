# Business Case: Patient Adherence Platform

## Executive Summary

The Patient Adherence Platform addresses a $100B infusion center market by returning lost infusions back to the healthcare system. Infusion centers lose 15-25% of scheduled volume to non-adherence. By capturing 30% of these losses, the platform adds 0.5 infusions per patient per year—generating $500K-$3.5M for a 1,000-patient practice and $5M-$35M at 10,000 patients. Using LLM-powered conversational AI with behavioral science principles, Nudge. turns non-adherence into opportunity.

## The Problem: Lost Infusion Volume

### Market Context
- **$100B** infusion center industry in the US
- **15-25%** of scheduled infusions never happen due to non-adherence
- Every 100 Crohn's patients on infliximab = 120-200 lost infusions per year
- Empty chairs that could serve waitlist patients or new referrals

### Clinical Impact
- **15-25%** non-adherence rate for infliximab (industry standard)
- **All biologics** (~8 infusions/year) show similar patterns
- **Infliximab patients** represent 20% of all infusion center volume
- **2-3×** higher hospitalization risk with non-adherence (Crohn's disease)
- **~90%** higher medical costs for non-adherent patients

### Root Causes of Nonadherence (All Addressable)
1. **Logistical friction**: Travel burden, scheduling inflexibility
2. **Medication concerns**: Safety fears, perceived necessity
3. **Psychosocial factors**: Anxiety, depression, health literacy
4. **Treatment burden**: Adherence declines over time
5. **Socioeconomic barriers**: Insurance, access to support

## The Solution

### Core Capabilities
- **Behavioral nudging**: Evidence-based strategies (social proof, loss aversion, positive reinforcement)
- **Autonomous tool calling**: Scheduling, transportation, education, copay assistance
- **EHR integration**: FHIR-ready design for seamless clinical workflow
- **Multi-modal engagement**: SMS, WhatsApp, patient portal integration

### Differentiation
- Physician-designed clinical workflows
- Regulatory-aware implementation (HIPAA, FDA considerations)
- Health economics-driven design
- Real-world deployment experience informing product

## Financial Model

### The Volume Recovery Model

**Core Calculation**:
- Non-adherence rate: 15-25% of scheduled infusions
- Nudge. capture rate: 30% of lost infusions
- **Result**: 0.5 additional infusions returned per patient per year

**Marginal Revenue per Infusion**:
- Conservative: $1,000
- Realistic: $3,000-$5,000 (hospital-based)
- High-complexity: $7,000+

*Using $1,000 as floor for modeling simplicity*

### Revenue Recovery by Scale

| Patient Panel | Returned Infusions/Year | Revenue at $1K | Revenue at $7K |
|--------------|-------------------------|----------------|----------------|
| 500 patients | 250 | $250,000 | $1.75M |
| 1,000 patients | 500 | $500,000 | $3.5M |
| 5,000 patients | 2,500 | $2.5M | $17.5M |
| 10,000 patients | 5,000 | $5M | $35M |

**Key Metrics**:
- $500-$3,500 revenue recovery per patient per year
- ROI improves with scale (larger practices capture more value)
- Infliximab represents only 20% of infusion center volume—opportunity scales across all biologics

### Cost Structure

**Phase 1 (MVP)**: 
- Development: $50K-$100K (one-time)
- Integration: $25K-$50K (EHR/FHIR)
- Pilot operations: $10K/month

**Ongoing**:
- Platform fees: $5-$10/patient/month
- Support & maintenance: 15-20% of recurring revenue

**Payback Period**: 
- 1,000 patients: 3-6 months ($500K annual return vs. ~$100K implementation)
- 10,000 patients: 1-2 months ($5M annual return)
- ROI scales dramatically with patient volume

## Implementation Roadmap

### Phase 1: MVP Pilot (0-3 months)
- Behavioral nudge framework
- A/B testing infrastructure
- Single-condition focus (infliximab)

**Success Criteria**:
- ≥20% patient opt-in rate
- ≥40% sustained engagement
- ≥30% capture rate of lost infusions
- +0.5 infusions per patient per year
- 0 safety events

### Phase 2: Evaluation & Safety (3-5 months)
- Operational integration
- Safety monitoring
- Outcomes measurement

### Phase 3: Modular Expansion (5-12 months)
- Transportation coordination
- Health education library
- Copay assistance integration
- Multi-language support

### Phase 4: Condition Expansion (12+ months)
- Expand to other biologics (adalimumab, ustekinumab, etc.)
- Oncology infusions
- Chronic disease management beyond infusions

## Market Opportunity

### Total Addressable Market

**Infusion Center Industry**: $100B annually
- **Infliximab**: ~20% of volume, but similar adherence patterns exist across all biologics
- **All biologics**: ~8 infusions/year with 15-25% non-adherence
- **Beyond IBD**: Rheumatology (RA, PsA), dermatology (psoriasis), oncology infusions

**Opportunity Scale**:
- 1,000-patient practice → $500K-$3.5M/year
- 10,000-patient health system → $5M-$35M/year
- Each additional indication (adalimumab, ustekinumab, etc.) multiplies opportunity

### Target Segments

**Primary**: Hospital-based infusion centers
- 3,000+ facilities in US
- Average 500-2,000 chronic patients per facility
- Highest margin operations

**Secondary**: Ambulatory infusion centers
- Growing segment (shift from hospital-based)
- 1,500+ facilities
- Private equity interest

**Tertiary**: Integrated delivery networks
- Population health focus
- Value-based care alignment

### Competitive Landscape

**Existing Solutions**:
- Basic appointment reminders (SMS/email) - no behavioral intelligence
- EHR-native scheduling - limited engagement capability
- Patient portals - low adoption rates
- Generic digital health tools - not built for infusion-specific workflows

**Nudge. Advantages**:
- **Volume-focused design**: Returns lost infusions to the system, not just confirmation rates
- **Behavioral science engine**: 6 evidence-based strategies personalized to adherence patterns
- **Autonomous barrier removal**: AI handles transportation, education, copay assistance
- **Clinical safety integration**: Respects treatment efficacy windows (±3 days for infliximab)
- **Physician-designed workflows**: Built by MD with enterprise healthcare implementation experience
- **FHIR-ready architecture**: Modular, EHR-agnostic design

## Risk Mitigation

### Clinical Risks
- **Mitigation**: Physician oversight, safety escalation protocols, clinical validation

### Regulatory Risks  
- **Mitigation**: HIPAA-compliant architecture, FDA Digital Health Center of Excellence guidance alignment

### Adoption Risks
- **Mitigation**: Pilot-driven approach, minimize workflow disruption, demonstrate ROI early

### Technology Risks
- **Mitigation**: Proven LLM infrastructure (Gemini), graceful degradation, human escalation

## Next Steps

1. **Pilot partner identification**: 1-2 infusion centers (500-1,000 patients)
2. **IRB submission**: Prospective evaluation protocol
3. **EHR integration**: FHIR API implementation
4. **90-day pilot**: Demonstrate capture rate and safety
5. **Publication strategy**: Real-world evidence generation

---

**For visual walkthrough**: See [90-second demo video](https://github.com/AnnaKuperberg/healthcare-adherence-ai/assets/Nudge_Demo_Video.mp4) and [live demo](https://nudge-922488968064.us-west1.run.app/)

**Questions?** Contact Anna Kuperberg, MD at kuperberg.anna@gmail.com
