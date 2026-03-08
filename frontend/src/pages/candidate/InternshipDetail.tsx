import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";

const proficiencyLabels: Record<number, string> = {
  1: "Beginner",
  2: "Basic",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

interface PostingData {
  id: string;
  title: string;
  description: string;
  recruiter?: { companyName: string; companySize?: string };
  postingSkills: { skillName: string; weight: number }[];
  stipend: number | null;
  duration: string | null;
  deadline: string;
  location: string | null;
  remote: boolean;
}

interface ScoreData {
  score: number;
  breakdown: {
    skillName: string;
    weight: number;
    candidateProficiency: number;
    contribution: number;
    maxContribution: number;
    matched: boolean;
  }[];
  gaps: {
    skillName: string;
    currentProficiency: number;
    requiredWeight: number;
    suggestions: string[];
  }[];
}

interface RankingEntry {
  rank: number;
  candidateName: string;
  score: number;
  applicationStatus: { applied: boolean; withdrawn: boolean };
}

const InternshipDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState<PostingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScorecard, setShowScorecard] = useState(false);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [showRanking, setShowRanking] = useState(false);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [rankLoading, setRankLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPosting = async () => {
      try {
        const { data: res } = await api.get(`/postings/${id}`);
        setData(res.posting);
      } catch {
        setNotFound(true);
        toast.error("Internship not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchPosting();
  }, [id]);

  const handleCheck = async () => {
    setScoreLoading(true);
    try {
      const { data: res } = await api.post(`/scores/check/${id}`);
      setScoreData({
        score: res.score,
        breakdown: res.breakdown,
        gaps: res.gaps,
      });
      setShowScorecard(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to check score.");
    } finally {
      setScoreLoading(false);
    }
  };

  const handleViewRanking = async () => {
    if (showRanking) {
      setShowRanking(false);
      return;
    }
    setRankLoading(true);
    try {
      const { data: res } = await api.get(`/rankings/${id}`);
      setRankings(res.rankings || []);
      setShowRanking(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to load rankings.");
    } finally {
      setRankLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post(`/applications/${id}`);
      setApplied(true);
      toast.success("Application submitted!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to apply.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-retro-olive" />
        </div>
      </DashboardLayout>
    );
  }

  if (notFound || !data) {
    return (
      <DashboardLayout role="candidate">
        <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-fade-in">
          <XCircle className="h-12 w-12 text-retro-orange" />
          <h2 className="text-xl font-bold font-heading text-retro-charcoal">
            Internship Not Found
          </h2>
          <p className="text-retro-brown text-sm">
            The internship you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/internships"
            className="inline-flex items-center gap-1.5 text-sm text-retro-olive hover:text-retro-charcoal font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Internships
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const percentage = scoreData?.score || 0;
  const eligible = percentage >= 80;

  return (
    <DashboardLayout role="candidate">
      <div className="max-w-3xl animate-fade-in space-y-6">
        <Link
          to="/internships"
          className="inline-flex items-center gap-1.5 text-sm text-retro-brown hover:text-retro-charcoal font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Internships
        </Link>

        <div className="polished-card-static p-8 space-y-5">
          <h1 className="text-2xl font-heading font-bold text-retro-charcoal">
            {data.title}
          </h1>
          <p className="text-retro-brown text-sm font-medium">
            {data.recruiter?.companyName || "Company"}
          </p>
          <p className="text-sm leading-relaxed text-retro-charcoal/80">
            {data.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {data.postingSkills.map((s) => (
              <span key={s.skillName} className="tag">
                {s.skillName} (w:{s.weight})
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              ["Stipend", data.stipend ? `$${data.stipend}/mo` : "Unpaid"],
              ["Duration", data.duration || "N/A"],
              ["Deadline", new Date(data.deadline).toLocaleDateString()],
              ["Location", data.remote ? "Remote" : data.location || "On-site"],
            ].map(([l, v]) => (
              <div key={l} className="stat-box !p-3">
                <span className="text-retro-brown text-[10px] uppercase tracking-wider block font-medium">
                  {l}
                </span>
                <strong className="text-retro-charcoal text-sm">{v}</strong>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCheck}
              disabled={scoreLoading || showScorecard}
              className="btn-gold rounded-xl gap-2 px-6"
            >
              {scoreLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking…
                </>
              ) : (
                "Check Eligibility"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleViewRanking}
              disabled={rankLoading}
              className="btn-outline-dark rounded-xl px-6"
            >
              {rankLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : showRanking ? (
                "Hide Ranking"
              ) : (
                "View Ranking"
              )}
            </Button>
          </div>
        </div>

        {showScorecard && scoreData && (
          <div className="polished-card-static p-8 space-y-5 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-lg text-retro-charcoal">
                Weighted Match
              </h2>
              <div
                className={`stamp text-sm ${eligible ? "stamp-olive" : "stamp-orange"}`}
              >
                {eligible ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}{" "}
                {Number(percentage).toFixed(2)}%
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-retro-charcoal/15">
                    <th className="text-left py-3 text-xs uppercase tracking-wider text-retro-brown font-semibold">
                      Skill
                    </th>
                    <th className="text-center py-3 text-xs uppercase tracking-wider text-retro-brown font-semibold">
                      Weight
                    </th>
                    <th className="text-center py-3 text-xs uppercase tracking-wider text-retro-brown font-semibold">
                      Level
                    </th>
                    <th className="text-center py-3 text-xs uppercase tracking-wider text-retro-brown font-semibold">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scoreData.breakdown.map((r) => (
                    <tr
                      key={r.skillName}
                      className="border-b border-retro-charcoal/8"
                    >
                      <td className="py-3 font-medium text-retro-charcoal">
                        {r.skillName}
                      </td>
                      <td className="py-3 text-center text-retro-brown">
                        {r.weight}
                      </td>
                      <td className="py-3 text-center text-retro-brown">
                        {r.candidateProficiency} (
                        {proficiencyLabels[r.candidateProficiency] || "N/A"})
                      </td>
                      <td className="py-3 text-center text-retro-charcoal font-semibold">
                        {r.contribution}/{r.maxContribution}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {eligible ? (
              <div className="info-box-olive p-5 space-y-3">
                <div className="flex items-center gap-2 text-retro-olive font-bold">
                  <CheckCircle2 className="h-5 w-5" /> Eligible — score exceeds
                  80%.
                </div>
                <Button
                  onClick={handleApply}
                  disabled={applied || applying}
                  className="btn-gold rounded-xl gap-2"
                >
                  {applied ? (
                    "Applied ✓"
                  ) : applying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Applying…
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4" /> Apply Now
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="info-box-orange p-5 space-y-3">
                <div className="flex items-center gap-2 text-retro-orange font-bold">
                  <XCircle className="h-5 w-5" /> Not eligible — need 80%.
                </div>
                <p className="text-sm text-retro-brown">
                  Current: <strong>{Number(percentage).toFixed(2)}%</strong>.
                  Need <strong>{(80 - percentage).toFixed(2)}%</strong> more.
                </p>
                {scoreData.gaps.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-retro-charcoal">
                      Skills to improve:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {scoreData.gaps.map((g) => (
                        <span key={g.skillName} className="tag-gold">
                          {g.skillName}:{" "}
                          {proficiencyLabels[g.currentProficiency] || "None"} →
                          improve
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showRanking && (
          <div className="polished-card-static p-8 space-y-4 animate-fade-in-up">
            <h2 className="font-heading font-bold text-lg text-retro-charcoal">
              Rankings
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-retro-charcoal/15">
                  <th className="text-left py-3 text-xs uppercase tracking-wider text-retro-brown font-semibold">
                    Rank
                  </th>
                  <th className="text-left py-3 text-xs uppercase tracking-wider text-retro-brown font-semibold">
                    Candidate
                  </th>
                  <th className="text-center py-3 text-xs uppercase tracking-wider text-retro-brown font-semibold">
                    Score
                  </th>
                  <th className="text-center py-3 text-xs uppercase tracking-wider text-retro-brown font-semibold">
                    Applied
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((c) => (
                  <tr key={c.rank} className="border-b border-retro-charcoal/8">
                    <td className="py-3">{c.rank}</td>
                    <td className="py-3">{c.candidateName}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`tag ${c.score >= 80 ? "tag-olive" : ""}`}
                      >
                        {Number(c.score).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {c.applicationStatus.applied ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rankings.length === 0 && (
              <p className="text-muted-foreground text-sm text-center">
                No rankings available yet.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InternshipDetail;
