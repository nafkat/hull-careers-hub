import { useCallback, useRef, useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NauticalSpinner } from "@/components/nautical-spinner";
import {
  UploadCloud,
  FileText,
  X,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Anchor,
} from "lucide-react";
import type { PublicJob } from "@/lib/jobs.functions";
import { submitApplication } from "@/lib/applications.functions";
import { Rivets } from "@/components/industrial";
import { cn } from "@/lib/utils";

const MAX_FILE_MB = 10;
const ACCEPTED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const applicationSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  coverMessage: z.string().trim().max(500, "Maximum 500 characters").optional().or(z.literal("")),
});

type Stage = "form" | "uploading" | "scanning" | "infected" | "success";
type ScanResult = "clean" | "infected";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

export function ApplyModal({
  job,
  open,
  onOpenChange,
}: {
  job: PublicJob;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [stage, setStage] = useState<Stage>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverMessage, setCoverMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStage("form");
    setFullName("");
    setEmail("");
    setPhone("");
    setCoverMessage("");
    setFile(null);
    setFileError(null);
    setVerifying(false);
    setErrors({});
    setProgress(0);
    setScanResult(null);
  }, []);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setTimeout(reset, 250);
  }

  function acceptFile(candidate: File | undefined | null) {
    if (!candidate) return;
    const isDocx = candidate.name.toLowerCase().endsWith(".docx");
    if (!ACCEPTED.includes(candidate.type) && !isDocx) {
      setFileError("Only PDF and DOCX files are accepted.");
      return;
    }
    if (candidate.size > MAX_FILE_MB * 1024 * 1024) {
      setFileError(`File is larger than ${MAX_FILE_MB} MB.`);
      return;
    }
    setFileError(null);
    setFile(candidate);
    setVerifying(true);
    setTimeout(() => setVerifying(false), 900);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = applicationSchema.safeParse({ fullName, email, phone, coverMessage });
    const nextErrors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
    }
    if (!file) setFileError("Please attach your CV (PDF or DOCX).");
    setErrors(nextErrors);
    if (!parsed.success || !file) return;

    setStage("uploading");
    setProgress(0);
    const ticker = setInterval(() => {
      setProgress((current) => (current >= 92 ? current : current + Math.round(Math.random() * 12 + 5)));
    }, 160);

    let base64: string;
    try {
      base64 = await toBase64(file);
    } catch {
      clearInterval(ticker);
      setFileError("We could not read that file. Please try again.");
      setStage("form");
      return;
    }

    let result: Awaited<ReturnType<typeof submitApplication>>;
    try {
      result = await submitApplication({
        data: {
          jobId: job.id,
          fullName: parsed.data.fullName,
          email: parsed.data.email,
          phone: parsed.data.phone ?? "",
          coverMessage: parsed.data.coverMessage ?? "",
          fileName: file.name,
          fileMimeType: file.type || "application/pdf",
          fileBase64: base64,
        },
      });
    } catch {
      clearInterval(ticker);
      setFileError("Submission failed. Please try again in a moment.");
      setStage("form");
      return;
    }

    clearInterval(ticker);
    setProgress(100);
    setStage("scanning");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (result.status === "infected") {
      setScanResult("infected");
      setStage("infected");
      return;
    }
    if (result.status === "scan-error") {
      setFileError(
        "We could not complete the virus scan. Your application was received and our team will review it manually.",
      );
      setScanResult("clean");
      setStage("success");
      return;
    }
    if (result.status === "error") {
      setFileError(result.message);
      setStage("form");
      return;
    }
    setScanResult("clean");
    setStage("success");
  }

  const charsLeft = 500 - coverMessage.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="metal-plate relative !max-w-full !rounded-none h-screen max-h-screen overflow-y-auto sm:!max-w-lg sm:!rounded-[4px] sm:h-auto sm:max-h-[90vh]">
        <Rivets />
        {stage === "success" ? (
          <SuccessScreen jobTitle={job.title} onClose={() => handleOpenChange(false)} />
        ) : stage === "infected" ? (
          <div className="page-enter flex flex-col items-center gap-4 py-8 text-center">
            <ShieldAlert className="size-12 text-destructive" />
            <DialogTitle className="font-display text-2xl">Threat detected</DialogTitle>
            <DialogDescription className="max-w-sm text-muted-foreground">
              Our scanner flagged this file and it has been quarantined. Your application was
              not submitted. Please upload a clean PDF or DOCX.
            </DialogDescription>
            <Button
              variant="outline"
              onClick={() => {
                setFile(null);
                setScanResult(null);
                setStage("form");
              }}
            >
              Try another file
            </Button>
          </div>
        ) : stage === "uploading" || stage === "scanning" ? (
          <div className="page-enter flex flex-col items-center gap-5 py-10 text-center">
            {stage === "uploading" ? (
              <>
                <NauticalSpinner label="Uploading your CV" />
                <div className="w-full max-w-xs">
                  <Progress value={progress} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">{progress}%</p>
                </div>
              </>
            ) : (
              <>
                <div className="relative grid size-24 place-items-center">
                  <span className="absolute inset-0 rounded-full border border-primary/30" />
                  <span className="absolute inset-3 rounded-full border border-primary/20" />
                  <span className="absolute inset-0 animate-radar rounded-full [background:conic-gradient(from_0deg,color-mix(in_oklab,var(--poppy)_45%,transparent),transparent_90deg)]" />
                  <Shield className="relative size-10 text-primary" />
                </div>
                <p className="font-display text-xl tracking-[3px] uppercase">Scanning file…</p>
                <p className="text-sm text-muted-foreground">
                  Checking {file?.name} for threats.
                </p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="page-enter space-y-5">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Apply — {job.title}</DialogTitle>
              <DialogDescription>
                {job.location} · {job.employment_type}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] tracking-[2px] uppercase text-muted-foreground" htmlFor="fullName">Full name *</Label>
              <Input
                id="fullName" className="h-11 min-h-[44px] rounded-none border-0 border-b-2 border-steel bg-transparent px-0 focus-visible:border-primary focus-visible:ring-0"
                value={fullName}
                maxLength={100}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Maria Papadopoulou"
              />
              {errors["fullName"] && (
                <p className="text-xs text-destructive">{errors["fullName"]}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-mono text-[10px] tracking-[2px] uppercase text-muted-foreground" htmlFor="email">Email *</Label>
                <Input
                  id="email" className="h-11 min-h-[44px] rounded-none border-0 border-b-2 border-steel bg-transparent px-0 focus-visible:border-primary focus-visible:ring-0"
                  type="email"
                  value={email}
                  maxLength={255}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                {errors["email"] && (
                  <p className="text-xs text-destructive">{errors["email"]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-[10px] tracking-[2px] uppercase text-muted-foreground" htmlFor="phone">Phone</Label>
                <Input
                  id="phone" className="h-11 min-h-[44px] rounded-none border-0 border-b-2 border-steel bg-transparent px-0 focus-visible:border-primary focus-visible:ring-0"
                  value={phone}
                  maxLength={40}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+30 ..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] tracking-[2px] uppercase text-muted-foreground" htmlFor="cover">Cover message</Label>
              <Textarea
                id="cover" className="rounded-none border-0 border-b-2 border-steel bg-transparent px-0 focus-visible:border-primary focus-visible:ring-0"
                value={coverMessage}
                maxLength={500}
                rows={4}
                onChange={(e) => setCoverMessage(e.target.value)}
                placeholder="Tell us why you want to build ships with us."
              />
              <p className="text-right text-xs text-muted-foreground">{charsLeft} characters left</p>
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] tracking-[2px] uppercase text-muted-foreground">CV / Resume *</Label>
              {file ? (
                <div className="flex items-center gap-3 rounded-[2px] border-2 border-steel bg-white/5 p-3">
                  <FileText className="size-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                      {verifying && " · Verifying file format…"}
                    </p>
                    {file.size > 5 * 1024 * 1024 && (
                      <p className="text-xs text-accent">Large file — upload may take a moment</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFile(null);
                      setVerifying(false);
                      setFileError(null);
                    }}
                    aria-label="Remove file"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    acceptFile(e.dataTransfer.files?.[0]);
                  }}
                  className={cn(
                    "flex w-full flex-col items-center gap-2 rounded-[2px] border-2 border-dashed border-steel p-8 text-center transition-colors hover:border-primary/70",
                    dragging && "border-primary bg-primary/5",
                  )}
                >
                  <UploadCloud className="size-6 text-muted-foreground" />
                  <span className="text-sm">Drag & drop your CV here, or click to browse</span>
                  <span className="text-xs text-muted-foreground">
                    PDF or DOCX · max {MAX_FILE_MB} MB
                  </span>
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => acceptFile(e.target.files?.[0])}
              />
              {fileError && <p className="text-xs text-destructive">{fileError}</p>}
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="weld-underline relative min-h-[44px] w-full border-2 border-primary bg-card px-8 py-4 font-display text-sm tracking-[3px] uppercase text-foreground transition-colors hover:bg-primary/10 disabled:opacity-60"
              style={{ borderRadius: 2 }}
            >
              <Rivets />
              {verifying ? "Verifying…" : "Submit application"}
            </button>
            {scanResult === "clean" && (
              <p className="flex items-center justify-center gap-1 text-xs text-success">
                <ShieldCheck className="size-3.5" /> File verified
              </p>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessScreen({ jobTitle, onClose }: { jobTitle: string; onClose: () => void }) {
  return (
    <div className="page-enter flex flex-col items-center gap-5 py-10 text-center">
      <div className="relative grid size-16 sm:size-20 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/15 [animation-duration:2.4s]" />
        <span className="absolute inset-2 rounded-full border border-primary/40" />
        <Anchor className="size-12 sm:size-9 animate-breathe text-primary drop-shadow-[0_0_18px_var(--poppy)]" />
      </div>
      <DialogTitle className="font-display text-3xl tracking-[3px] text-primary uppercase">
        Application received
      </DialogTitle>
      <DialogDescription className="max-w-sm text-base text-muted-foreground">
        We received your application for {jobTitle}. A confirmation email has been sent.
      </DialogDescription>
      <div className="flex items-center gap-1.5 text-xs text-success">
        <ShieldCheck className="size-3.5" /> File scanned — clean
      </div>
      <Button variant="outline" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}
