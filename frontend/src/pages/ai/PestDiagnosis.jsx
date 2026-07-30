import { useState } from "react";
import toast from "react-hot-toast";
import { Bug, Leaf, ShieldAlert, ShieldCheck, FlaskConical, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import ImageDropzone from "../../components/ui/ImageDropzone";
import Spinner from "../../components/ui/Spinner";
import { diagnosePest } from "../../api/ai";
import { extractErrorMessage } from "../../api/client";

const severityTone = {
  LOW: "bg-brand-50 text-brand-700",
  MODERATE: "bg-amber-50 text-amber-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
  SEVERE: "bg-rose-50 text-rose-700",
};

function RemedyList({ title, icon: Icon, items, tone }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
        <Icon size={15} className={tone} />
        {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PestDiagnosis() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await diagnosePest(file);
      setResult(res);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not diagnose the image"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/ai" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Back to AI Tools
      </Link>
      <PageHeader
        title="Pest & Disease Diagnosis"
        description="Upload a clear photo of the affected crop leaf or plant."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <ImageDropzone file={file} onChange={setFile} />
          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="btn-primary mt-4 w-full"
          >
            {loading ? <Spinner size={18} className="text-white" /> : <Bug size={18} />}
            {loading ? "Analyzing image..." : "Diagnose"}
          </button>
        </div>

        <div>
          {!result && !loading && (
            <div className="card flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-slate-400">
              <Bug size={28} />
              <p className="text-sm">Diagnosis results will appear here</p>
            </div>
          )}

          {loading && (
            <div className="card flex h-full flex-col items-center justify-center gap-3 p-10 text-center text-slate-500">
              <Spinner size={26} />
              <p className="text-sm">Our AI is examining the image...</p>
            </div>
          )}

          {result && (
            <div className="card space-y-5 p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {result.cropName}
                  </p>
                  <h3 className="text-lg font-bold text-slate-900">{result.diseaseName}</h3>
                </div>
                {result.severity && (
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      severityTone[result.severity?.toUpperCase()] ?? "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {result.severity}
                  </span>
                )}
              </div>

              <RemedyList title="Symptoms" icon={Leaf} tone="text-slate-500" items={result.symptoms} />
              <RemedyList
                title="Organic remedies"
                icon={ShieldCheck}
                tone="text-brand-600"
                items={result.organicRemedies}
              />
              <RemedyList
                title="Chemical remedies"
                icon={FlaskConical}
                tone="text-sky-600"
                items={result.chemicalRemedies}
              />
              <RemedyList
                title="Preventive measures"
                icon={ShieldAlert}
                tone="text-amber-600"
                items={result.preventiveMeasures}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
