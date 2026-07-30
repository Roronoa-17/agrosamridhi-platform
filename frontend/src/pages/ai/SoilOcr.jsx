import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { ScanLine, ArrowLeft, ArrowRight } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import ImageDropzone from "../../components/ui/ImageDropzone";
import Spinner from "../../components/ui/Spinner";
import StatCard from "../../components/ui/StatCard";
import { extractSoilNutrients } from "../../api/ai";
import { extractErrorMessage } from "../../api/client";

export default function SoilOcr() {
  const navigate = useNavigate();
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
      const res = await extractSoilNutrients(file);
      setResult(res);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not read the soil report"));
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
        title="Soil Report Scanner"
        description="Upload a photo of your soil test report to extract nutrient values."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <ImageDropzone file={file} onChange={setFile} />
          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="btn-primary mt-4 w-full"
          >
            {loading ? <Spinner size={18} className="text-white" /> : <ScanLine size={18} />}
            {loading ? "Reading report..." : "Extract nutrients"}
          </button>
        </div>

        <div>
          {!result && !loading && (
            <div className="card flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-slate-400">
              <ScanLine size={28} />
              <p className="text-sm">Extracted nutrient values will appear here</p>
            </div>
          )}

          {loading && (
            <div className="card flex h-full flex-col items-center justify-center gap-3 p-10 text-center text-slate-500">
              <Spinner size={26} />
              <p className="text-sm">Reading your soil report...</p>
            </div>
          )}

          {result && (
            <div className="card space-y-5 p-6">
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Nitrogen (N)" value={result.nitrogen ?? "—"} tone="brand" />
                <StatCard label="Phosphorus (P)" value={result.phosphorus ?? "—"} tone="earth" />
                <StatCard label="Potassium (K)" value={result.potassium ?? "—"} tone="amber" />
                <StatCard label="pH" value={result.ph ?? "—"} tone="sky" />
              </div>

              <button
                onClick={() =>
                  navigate("/ai/crop-suggestion", {
                    state: {
                      nitrogen: result.nitrogen,
                      phosphorus: result.phosphorus,
                      potassium: result.potassium,
                      ph: result.ph,
                    },
                  })
                }
                className="btn-primary w-full"
              >
                Use these values in Crop Suggestion
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
