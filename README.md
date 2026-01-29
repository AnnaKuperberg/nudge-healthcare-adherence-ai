# Healthcare Adherence AI Agent

> AI-powered conversational agent optimizing chronic disease treatment adherence and reducing no-show costs for healthcare systems

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Gemini-AI-orange.svg)](https://ai.google.dev/)

## Overview

This application demonstrates an AI agent designed to improve patient adherence to chronic disease treatment schedules, specifically targeting infusion therapy for conditions like Crohn's disease. The system uses behavioral science principles and LLM-powered conversational AI to reduce no-shows, optimize scheduling, and provide personalized patient engagement.

### Key Features

- **Behavioral Nudging**: Implements evidence-based strategies (social proof, loss aversion, positive reinforcement, educational content) tailored to individual patient profiles
- **Autonomous Tool Calling**: LLM agent with access to scheduling, transportation coordination, health education resources, and copay assistance
- **Clinical Integration Ready**: Designed for EHR/FHIR integration with structured data models for patient state, clinical notes, and appointments
- **Cost Optimization**: Addresses no-show costs by proactive engagement and barrier removal (transportation, financial, knowledge gaps)
- **Multi-stakeholder View**: Separate patient and clinic interfaces for appointment management and waitlist optimization

## Business Impact

Healthcare systems lose significant revenue from missed infusion appointments. This solution targets:

- **No-show reduction** through personalized, timely engagement
- **Revenue recovery** by optimizing schedule utilization and waitlist management  
- **Patient outcomes** through improved treatment adherence
- **Operational efficiency** by automating routine confirmations and barrier identification

### Revenue Opportunity

Based on conservative modeling using $1,000 marginal revenue per returned infusion (note: published literature shows infusion center marginal revenue ranging from $1,000 to $7,000+ per infusion depending on facility type and payer mix):

| Patient Panel | Annual Revenue Recovery* |
|--------------|-------------------------|
| 500 patients | $240,000 |
| 1,000 patients | $480,000 |
| 9,000 patients | $4.3M |

*Assumes 40% capture rate of preventable no-shows, 12% baseline no-show rate

**Key insight**: At $480/patient/year, approximately 208 patients generate $100K in annual revenue recovery.

📊 **[View Full Business Case & ROI Analysis](docs/Patient_Adherence_Platform_Presentation.pdf)**  
📄 **[Read Detailed Business Overview](docs/BUSINESS_CASE.md)**

## Technical Architecture

### Stack
- **Frontend**: React 19, TypeScript, Vite
- **AI**: Google Gemini API with autonomous tool calling
- **State Management**: React hooks with persistent patient state
- **Styling**: Tailwind CSS with custom healthcare UI components

### Core Components

- `App.tsx`: Main application orchestrating patient/clinic views
- `geminiService.ts`: LLM integration with behavioral strategy injection
- `sandboxService.ts`: Mock EHR data source (designed for FHIR API replacement)
- `types.ts`: Comprehensive TypeScript definitions for clinical data models
- `components/`: Reusable UI components (AppointmentCard, VisualCalendar, etc.)

### Behavioral Strategies

The agent selects and applies evidence-based nudge strategies based on patient history:

- **Social Proof**: Emphasizes impact on other patients and clinic capacity
- **Loss Aversion**: Highlights clinical risks and treatment efficacy windows
- **Accountability Focus**: Leverages nurse-patient relationship
- **Educational**: Builds health literacy through trivia and resources
- **Positive Reinforcement**: Celebrates adherence streaks and progress

## Getting Started

### Prerequisites

- Node.js 18+
- Gemini API key ([get one here](https://ai.google.dev/))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/healthcare-adherence-ai.git
cd healthcare-adherence-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Configuration

Edit `sandboxService.ts` to connect to your EHR/FHIR endpoints or customize patient data.

## Use Cases

### Primary Care & Specialty Clinics
- Chronic disease management (IBD, rheumatology, oncology)
- Infusion center scheduling optimization
- Preventive care appointment adherence

### Healthcare Systems
- Population health management
- Value-based care initiatives
- Patient engagement platforms

### Health Tech Companies
- Patient relationship management
- Care coordination platforms
- Digital health solutions

## Future Development

- [ ] FHIR API integration for live EHR data
- [ ] SMS/WhatsApp deployment via Twilio
- [ ] Multi-language support
- [ ] Analytics dashboard for adherence metrics
- [ ] A/B testing framework for nudge strategies
- [ ] HIPAA-compliant production deployment

## Clinical Validation

This system is designed following best practices in:
- Behavioral economics in healthcare
- Clinical decision support systems
- Health literacy and patient education
- Regulatory considerations (FDA, HIPAA)

## Author

**Anna Kuperberg, MD**  
Physician AI Product Leader | Clinical workflow optimization & health economics

- LinkedIn: [Anna Kuperberg](https://www.linkedin.com/in/anna-kuperberg)
- Email: kuperberg.anna@gmail.com

## License

MIT License - See [LICENSE](LICENSE) for details

## Acknowledgments

Built with insights from real-world chronic disease management programs and frontline clinical teams.

---

*Note: This is a demonstration system. Clinical deployment requires appropriate validation, regulatory review, and integration with certified EHR systems. The business case presentation uses conservative financial modeling ($1,000 per infusion) for ease of calculation; published literature indicates infusion center marginal revenue can range significantly higher ($3,000-$7,000+) depending on facility type, payer contracts, and drug-specific reimbursement.*
