export interface FaqItem {
    question: string;
    answer: string;
  }
  
  export const faqData: FaqItem[] = [
    {
      question: "What types of medical scans can MediScan AI analyze?",
      answer: "MediScan AI is designed to analyze MRI (Magnetic Resonance Imaging), CT (Computed Tomography) scans, and X-ray images. We are continuously working to expand our capabilities."
    },
    {
      question: "How accurate is the AI analysis?",
      answer: "Our platform uses advanced AI models trained on vast datasets to ensure high accuracy. However, MediScan AI is intended as an informational tool and should not replace consultation with a qualified healthcare professional. All findings should be reviewed by a doctor."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we take data security and privacy very seriously. All uploaded scans are processed securely, and we adhere to strict privacy protocols. We recommend checking our full privacy policy for details. For this hackathon version, data handling is conceptual."
    },
    {
      question: "How quickly can I get results?",
      answer: "The analysis process is typically very fast, often providing results within minutes. Processing time can vary slightly depending on the complexity and size of the scan."
    },
    {
      question: "Who is MediScan AI for?",
      answer: "MediScan AI can be a valuable tool for individuals seeking to better understand their medical scans, as well as for healthcare professionals looking for supplementary insights. It is particularly useful in educational settings or for preliminary assessments."
    },
    {
      question: "What should I do with the analysis results?",
      answer: "The results provided by MediScan AI are for informational purposes. We strongly advise discussing any findings or concerns with your doctor or a qualified medical specialist for a formal diagnosis and treatment plan."
    }
  ];
  