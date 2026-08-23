import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Anchor, LogOut, Plus, Inbox, CalendarRange, MailWarning } from "lucide-react";
import {
  adminLogin,
  adminLogout,
  adminOverview,
  adminStatus,
  type AdminJob,
} from "@/lib/admin.functions";
import { JobEditor, draftFromJob, emptyDraft } from "@/components/admin/job-editor";
import { ApplicationsPanel } from "@/components/admin/applications-panel";
import { SettingsForm } from "@/components/admin/settings-form";
import { SocialPostsPanel } from "@/components/admin/social-posts-panel";
import { NauticalSpinner } from "@/components/nautical-spinner";
import { Rivets } from "@/components/industrial";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — EUROHULL Careers" },
      { name: "description", content: "Manage EUROHULL job listings and applications." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — EUROHULL Careers" },
      { property: "og:description", content: "Internal careers administration for EUROHULL." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => adminStatus() });

  if (status.isLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <NauticalSpinner label="Opening the bridge" />
      </div>
    );
  }

  return status.data?.unlocked ? <AdminConsole /> : <PasswordGate />;
}

function PasswordGate() {
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();
  const login = useServerFn(adminLogin);

  const mutation = useMutation({
    mutationFn: () => login({ data: { password } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("Incorrect password");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["admin-status"] });
    },
    onError: () => toast.error("Sign in failed"),
  });

  return (
    <div className="grid-bg grid min-h-screen place-items-center px-5">
      <form
        className="metal-plate page-enter relative w-full max-w-sm space-y-6 p-8"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <Rivets />
        <div className="flex flex-col items-center gap-3 text-center">
          <Anchor className="size-8 text-primary" />
          <h1 className="font-display text-[32px] tracking-[4px]">EUROHULL ADMIN</h1>
          <p className="font-mono text-[11px] tracking-[2px] text-muted-foreground uppercase">
            Restricted to yard recruitment staff
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="font-mono text-[11px] tracking-[2px] uppercase">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="industrial-input px-0"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <Button
          type="submit"
          className="w-full rounded-[2px] bg-primary font-mono tracking-[3px] text-primary-foreground uppercase hover:bg-primary/90"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Checking…" : "Enter"}
        </Button>
        <Link
          to="/"
          className="block text-center font-mono text-[10px] tracking-[2px] text-muted-foreground uppercase hover:text-primary"
        >
          Back to careers site
        </Link>
      </form>
    </div>
  );
}


function AdminConsole() {
  const queryClient = useQueryClient();
  const logout = useServerFn(adminLogout);
  const [draft, setDraft] = useState<ReturnType<typeof emptyDraft> | null>(null);

  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminOverview(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  // Near-real-time notifications: the applications table is service-role only
  // (no anon read access to applicant PII), so we poll instead of subscribing
  // with the public key and announce any newly arrived application.
  const seenIds = useRef<Set<string> | null>(null);
  const applicationsData = overview.data?.applications;
  const jobsData = overview.data?.jobs;

  useEffect(() => {
    if (!applicationsData) return;
    if (seenIds.current === null) {
      seenIds.current = new Set(applicationsData.map((application) => application.id));
      return;
    }
    const fresh = applicationsData.filter((application) => !seenIds.current!.has(application.id));
    for (const application of fresh) {
      seenIds.current.add(application.id);
      const jobTitle =
        jobsData?.find((job: AdminJob) => job.id === application.job_listing_id)?.title ?? "a role";
      toast.success(`New application from ${application.full_name} for ${jobTitle}`);
    }
    if (fresh.length > 0) playChime();
  }, [applicationsData, jobsData]);

  const signOut = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-status"] }),
  });

  if (overview.isLoading || !overview.data) {
    return (
      <div className="grid min-h-screen place-items-center">
        <NauticalSpinner label="Loading dashboard" />
      </div>
    );
  }

  const { jobs, applications, stats } = overview.data;

  return (
    <div className="page-enter mx-auto min-h-screen w-full max-w-6xl px-5 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[4px] text-primary uppercase">EUROHULL</p>
          <h1 className="mt-2 font-display text-[32px] tracking-[3px]">Recruitment console</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/jobs">View site</Link>
          </Button>
          <Button variant="ghost" onClick={() => signOut.mutate()}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <StatCard icon={Inbox} label="Total applications" value={stats.total} />
        <StatCard icon={CalendarRange} label="This month" value={stats.thisMonth} />
        <StatCard icon={MailWarning} label="Unread" value={stats.unread} />
      </div>

      <Tabs defaultValue="jobs" className="mt-10">
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b-2 border-steel/50 bg-transparent p-0">
          <TabsTrigger value="jobs" className="tab-steel px-1 pb-3">Jobs</TabsTrigger>
          <TabsTrigger value="applications" className="tab-steel px-1 pb-3">Applications</TabsTrigger>
          <TabsTrigger value="social" className="tab-steel px-1 pb-3">Social posts</TabsTrigger>
          <TabsTrigger value="settings" className="tab-steel px-1 pb-3">Settings</TabsTrigger>
        </TabsList>


        <TabsContent value="jobs" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Job manager</h2>
            <Button variant="rust" onClick={() => setDraft(emptyDraft())}>
              <Plus className="size-4" /> New position
            </Button>
          </div>
          <div className="metal-plate relative overflow-x-auto">
            <Rivets />
            <Table className="steel-table">

              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Department</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Auto-post</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job: AdminJob) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.title}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {job.department}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {job.location}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={job.status === "active" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {job.social_auto_post ? "On" : "Off"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setDraft(draftFromJob(job))}>
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <ApplicationsPanel jobs={jobs} applications={applications} />
        </TabsContent>

        <TabsContent value="social" className="mt-6">
          <SocialPostsPanel />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsForm />
        </TabsContent>
      </Tabs>

      {draft && <JobEditor draft={draft} onOpenChange={() => setDraft(null)} />}
    </div>
  );
}

function playChime() {
  try {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const context = new Ctor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.36);
    oscillator.onended = () => void context.close();
  } catch {
    // Audio is a nicety; ignore autoplay restrictions.
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Inbox;
  label: string;
  value: number;
}) {
  return (
    <div className="glass glass-hover rounded-xl p-6">
      <Icon className="size-5 text-gold" />
      <p className="mt-4 font-display text-4xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
