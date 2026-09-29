import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestionAnswer {
  section: string;
  question: string;
  key?: string;
  answer: string;
}

export interface IJoinSubmission extends Document {
  fullName: string;
  companyName: string;
  designation: string;
  email: string;
  linkedin?: string;
  instagram?: string;
  challenges: string;
  risks: string;
  businessStage: string;
  financialStatus: string;
  milestone: string;
  visionImpact: string;
  uniqueStrengths: string;
  supportNeeded: string;
  valueContribution: string;
  questionsAndAnswers?: IQuestionAnswer[];
  status: "pending" | "reviewed" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export const QUESTION_MAPPING = [
  {
    key: "fullName",
    section: "Section 1: Basic Information",
    question: "Full Name",
  },
  {
    key: "companyName",
    section: "Section 1: Basic Information",
    question: "Company / Startup Name",
  },
  {
    key: "designation",
    section: "Section 1: Basic Information",
    question: "Designation",
  },
  {
    key: "email",
    section: "Section 1: Basic Information",
    question: "Official Email Address",
  },
  {
    key: "linkedin",
    section: "Section 1: Basic Information",
    question: "LinkedIn Profile URL",
  },
  {
    key: "instagram",
    section: "Section 1: Basic Information",
    question: "Instagram Handle / URL",
  },
  {
    key: "challenges",
    section: "Section 2: Business Insights & Strategy",
    question: "What are the top 2 challenges currently holding back your business growth?",
  },
  {
    key: "risks",
    section: "Section 2: Business Insights & Strategy",
    question: "If unresolved, what risks do you foresee in the next 6–12 months?",
  },
  {
    key: "businessStage",
    section: "Section 2: Business Insights & Strategy",
    question: "At what stage is your business currently?",
  },
  {
    key: "financialStatus",
    section: "Section 2: Business Insights & Strategy",
    question: "Which of these best describes your current financial status?",
  },
  {
    key: "milestone",
    section: "Section 2: Business Insights & Strategy",
    question: "What is the most important milestone you aim to achieve in the next 12 months?",
  },
  {
    key: "visionImpact",
    section: "Section 2: Business Insights & Strategy",
    question: "In the Next 3–5 Years, what is the larger vision or impact you want your business to create?",
  },
  {
    key: "uniqueStrengths",
    section: "Section 2: Business Insights & Strategy",
    question: "What unique strengths set your business apart from competitors?",
  },
  {
    key: "supportNeeded",
    section: "Section 3: Nexus Community Support Exchange",
    question: "What support do you seek from the Nexus Founders community?",
  },
  {
    key: "valueContribution",
    section: "Section 3: Nexus Community Support Exchange",
    question: "What value, knowledge, or resources can you contribute to fellow founders?",
  },
];

export function buildQuestionsAndAnswers(body: any): IQuestionAnswer[] {
  return QUESTION_MAPPING.map((item) => ({
    section: item.section,
    question: item.question,
    key: item.key,
    answer: body[item.key] !== undefined && body[item.key] !== null ? String(body[item.key]).trim() : "",
  }));
}

const JoinSubmissionSchema = new Schema<IJoinSubmission>(
  {
    fullName: { type: String, required: true },
    companyName: { type: String, required: true },
    designation: { type: String, required: true },
    email: { type: String, required: true },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
    challenges: { type: String, required: true },
    risks: { type: String, required: true },
    businessStage: { type: String, required: true },
    financialStatus: { type: String, required: true },
    milestone: { type: String, required: true },
    visionImpact: { type: String, required: true },
    uniqueStrengths: { type: String, required: true },
    supportNeeded: { type: String, required: true },
    valueContribution: { type: String, required: true },
    questionsAndAnswers: [
      {
        section: { type: String },
        question: { type: String },
        key: { type: String },
        answer: { type: String },
      },
    ],
    status: { type: String, enum: ["pending", "reviewed", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const JoinSubmission: Model<IJoinSubmission> =
  mongoose.models.JoinSubmission ||
  mongoose.model<IJoinSubmission>("JoinSubmission", JoinSubmissionSchema);

export default JoinSubmission;
