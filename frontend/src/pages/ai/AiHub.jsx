import { Link } from "react-router-dom";
import { Sprout, Bug, ScanLine, ArrowRight } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";

const tools = [
  {
    to: "/ai/crop-suggestion",
    icon: Sprout,
    title: "Crop Suggestion",
    description:
      "Get AI-recommended crops and a multi-year rotation plan based on your soil nutrients, budget and season.",
    tone: "bg-brand-50 text-brand-600",
  },
  {
    to: "/ai/pest-diagnosis",
    icon: Bug,
    title: "Pest & Disease Diagnosis",
    description:
      "Upload a photo of an affected crop to identify the disease and get organic and chemical remedies.",
    tone: "bg-rose-50 text-rose-600",
  },
  {
    to: "/ai/soil-ocr",
    icon: ScanLine,
    title: "Soil Report Scanner",
    description:
      "Upload a photo of your soil test report to automatically extract N, P, K and pH values.",
    tone: "bg-earth-50 text-earth-700",
  },
];

export default function AiHub() {
  return (
    <div>
      <PageHeader
        title="AI Tools"
        description="AI-powered assistants to help you make smarter farming decisions."
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.to} to={tool.to} className="card group flex flex-col gap-4 p-6 transition-shadow hover:shadow-md">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tool.tone}`}>
              <tool.icon size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{tool.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{tool.description}</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-700">
              Open tool
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
