import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import clsx from "clsx";
import {
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { PageSpinner } from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { getMatchedSchemes, getAllSchemes } from "../api/schemes";
import { extractErrorMessage } from "../api/client";

function ScoreBadge({ score }) {
  const tone =
    score >= 70 ? "bg-brand-50 text-brand-700" : score >= 40 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700";
  return (
    <span className={clsx("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", tone)}>
      {score}% match
    </span>
  );
}

function MatchedSchemeCard({ result }) {
  const scheme = result.scheme || {};
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{scheme.name || result.name}</p>
          <p className="mt-0.5 text-sm text-slate-500">{scheme.ministry}</p>
        </div>
        <ScoreBadge score={result.eligibilityScore ?? 0} />
      </div>

      <p className="mt-3 text-sm text-slate-600">{scheme.benefit || result.benefit}</p>
      {scheme.description && <p className="mt-2 text-sm text-slate-500">{scheme.description}</p>}

      {(result.matchedCriteria?.length > 0 || result.unmatchedCriteria?.length > 0) && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {result.matchedCriteria?.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700">
                Matched
              </p>
              <ul className="space-y-1">
                {result.matchedCriteria.map((c) => (
                  <li key={c} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-brand-600" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.unmatchedCriteria?.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-600">
                Not matched
              </p>
              <ul className="space-y-1">
                {result.unmatchedCriteria.map((c) => (
                  <li key={c} className="flex items-start gap-1.5 text-xs text-slate-600">
                    <XCircle size={14} className="mt-0.5 shrink-0 text-rose-500" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
        {(result.requiredDocuments?.length ?? scheme.documents?.length) > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FileCheck2 size={14} />
            {(result.requiredDocuments || scheme.documents).length} documents required
          </div>
        )}
        {(result.applyLink || scheme.applyLink) && (
          <a
            href={result.applyLink || scheme.applyLink}
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          >
            Apply now <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}

function AllSchemeCard({ scheme }) {
  return (
    <div className="card p-5">
      <p className="font-semibold text-slate-900">{scheme.name}</p>
      <p className="mt-0.5 text-xs text-slate-400">{scheme.ministry}</p>
      <p className="mt-3 text-sm text-slate-600">{scheme.benefit}</p>
      {scheme.applyLink && (
        <a
          href={scheme.applyLink}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          Learn more <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}

export default function Schemes() {
  const [tab, setTab] = useState("matched");
  const [matched, setMatched] = useState(null);
  const [all, setAll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([getMatchedSchemes(), getAllSchemes()])
      .then(([matchedRes, allRes]) => {
        setMatched(matchedRes);
        setAll(allRes);
      })
      .catch((err) => setError(extractErrorMessage(err, "Could not load government schemes")))
      .finally(() => setLoading(false));
  }, []);

  const sortedMatched = matched
    ? [...matched].sort((a, b) => (b.eligibilityScore ?? 0) - (a.eligibilityScore ?? 0))
    : [];

  return (
    <div>
      <PageHeader
        title="Government Schemes"
        description="Discover schemes you're eligible for, matched to your profile."
      />

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setTab("matched")}
          className={clsx(
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            tab === "matched" ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          <Sparkles size={14} className="mr-1.5 inline" />
          Matched for you {matched ? `(${matched.length})` : ""}
        </button>
        <button
          onClick={() => setTab("all")}
          className={clsx(
            "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
            tab === "all" ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          All schemes {all ? `(${all.length})` : ""}
        </button>
      </div>

      {loading && <PageSpinner label="Finding schemes for you..." />}

      {!loading && error && (
        <EmptyState icon={FileText} title="Couldn't load schemes" description={error} />
      )}

      {!loading && !error && tab === "matched" && (
        sortedMatched.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No matching schemes found"
            description="Complete your profile with land size, income and category for better matches."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {sortedMatched.map((result, idx) => (
              <MatchedSchemeCard key={result.scheme?.schemeId ?? idx} result={result} />
            ))}
          </div>
        )
      )}

      {!loading && !error && tab === "all" && (
        (all?.length ?? 0) === 0 ? (
          <EmptyState icon={FileText} title="No schemes available" />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {all.map((scheme) => (
              <AllSchemeCard key={scheme.schemeId} scheme={scheme} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
