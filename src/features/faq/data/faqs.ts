import type { FAQ } from "../types";

export const SEED_FAQS: FAQ[] = [
  {
    id: "imo-ship-recycling-regulations",
    question: "What are the latest IMO regulations regarding ship recycling?",
    answer: "Under the Hong Kong International Convention for the Safe and Environmentally Sound Recycling of Ships, all recycling facilities must prepare a Ship Recycling Facility Plan (SRFP). Ships destined for recycling must carry a verified Inventory of Hazardous Materials (IHM) detailing all onboard hazards.",
    category: "Compliance",
    status: "published",
    updatedAt: "2026-05-15T09:00:00.000Z",
  },
  {
    id: "ihm-survey-process",
    question: "How does SOS India facilitate the Inventory of Hazardous Materials (IHM) survey?",
    answer: "We deploy certified HazMat experts to conduct comprehensive onboard inspections and sampling. The samples are analyzed in accredited laboratories, after which we prepare the complete IHM report and assist the shipowner in obtaining the Statement of Compliance (SoC) from the classification society.",
    category: "Services",
    status: "published",
    updatedAt: "2026-05-18T14:30:00.000Z",
  },
  {
    id: "yard-worker-safety-training",
    question: "What safety training is mandatory for recycling yard workers?",
    answer: "Yard workers must complete training programs on handling hazardous materials, correct usage of personal protective equipment (PPE), confined space entry, fire prevention, hot work safety, and emergency response procedures to minimize operational risks.",
    category: "Training",
    status: "published",
    updatedAt: "2026-05-10T11:15:00.000Z",
  },
  {
    id: "sos-india-maritime-safety-role",
    question: "What is the primary role of SOS India in maritime safety consulting?",
    answer: "SOS India provides end-to-end consulting, technical audits, safety training, and certification advisory services for shipping companies, ports, and ship recycling yards, ensuring safe operations in alignment with both national laws and global maritime standards.",
    category: "General",
    status: "published",
    updatedAt: "2026-05-22T08:00:00.000Z",
  },
  {
    id: "eu-ssr-compliance-requirements",
    question: "How do EU Ship Recycling Regulation (EU SRR) requirements differ from the Hong Kong Convention?",
    answer: "While the Hong Kong Convention applies globally, the EU SRR imposes stricter requirements on ships flying EU flags or visiting EU ports. It requires recycling to take place only in facilities approved by the European Union and listed in the European List of Ship Recycling Facilities.",
    category: "Compliance",
    status: "published",
    updatedAt: "2026-05-20T10:45:00.000Z",
  },
];
