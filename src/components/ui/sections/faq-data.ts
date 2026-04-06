export const faqData = [
  {
    question: 'What is Sonarive and what is it actually for?',
    answer:
      'Sonarive is a health workflow app that helps users move across scan review, treatment planning, medication research, second opinions, and nearby hospital discovery. It is meant for decision support and question preparation, not autonomous diagnosis.',
  },
  {
    question: 'Does the AI replace a doctor or radiologist?',
    answer:
      'No. The app is designed to summarize, structure, and compare information so users and clinicians can think more clearly about next steps. Every result should be verified by a qualified medical professional before acting on it.',
  },
  {
    question: 'Which imaging types can the scan workflow accept?',
    answer:
      'The current UI accepts common image formats for MRI, CT, and X-ray style uploads. The output is a model-assisted summary, not a DICOM-native radiology pipeline.',
  },
  {
    question: 'How are hospital recommendations generated?',
    answer:
      'Hospital lookup uses open map and directory data through OpenStreetMap and Overpass. The app ranks nearby facilities using distance, tags, and likely specialty fit based on the condition or symptoms you provide.',
  },
  {
    question: 'Why does the app ask for structured inputs like age or symptom lists?',
    answer:
      'Structured inputs let the backend build cleaner prompts and return more stable output shapes. That makes the UI far easier to read and reduces the amount of vague, generic model text.',
  },
  {
    question: 'What AI provider does the rebuilt app use?',
    answer:
      'The current rewrite uses Groq for generation and scan-related reasoning. It keeps the stack simple with one provider for chat and vision-style requests while the frontend stays provider-agnostic.',
  },
];
