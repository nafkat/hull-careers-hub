import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { saveJob, type AdminJob } from "@/lib/admin.functions";
import { departmentOptions } from "@/data/departments";
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Draft = {
  id?: string;
  title: string;
  department: string;
  summary: string;
  description: string;
  requirements: string;
  employment_type: string;
  location: string;
  status: string;
  social_auto_post: boolean;
};

export function emptyDraft(): Draft {
  return {
    title: "",
    department: departmentOptions[0] ?? "Engineering",
    summary: "",
    description: "",
    requirements: "",
    employment_type: "Full-time",
    location: "Elefsina, Greece",
    status: "draft",
    social_auto_post: false,
  };
}

export function draftFromJob(job: AdminJob): Draft {
  return {
    id: job.id,
    title: job.title,
    department: job.department,
    summary: job.summary,
    description: job.description,
    requirements: job.requirements.join("\n"),
    employment_type: job.employment_type,
    location: job.location,
    status: job.status,
    social_auto_post: job.social_auto_post,
  };
}

export function JobEditor({
  draft,
  onOpenChange,
}: {
  draft: Draft | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState<Draft>(draft ?? emptyDraft());
  const queryClient = useQueryClient();
  const save = useServerFn(saveJob);

  const mutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          ...(form.id ? { id: form.id } : {}),
          title: form.title,
          department: form.department,
          summary: form.summary,
          description: form.description,
          requirements: form.requirements
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
          employment_type: form.employment_type as "Full-time" | "Part-time" | "Contract",
          location: form.location,
          status: form.status as "draft" | "active" | "closed",
          social_auto_post: form.social_auto_post,
        },
      }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message ?? "Could not save the job");
        return;
      }
      const results = result.socialResults ?? [];
      if (results.length > 0) {
        const label = (network: string) =>
          `${network.charAt(0).toUpperCase()}${network.slice(1)}`;
        const summary = results
          .map((entry) => `${label(entry.network)} ${entry.posted ? "✓" : "✗"}`)
          .join(", ");
        const allPosted = results.every((entry) => entry.posted);
        if (allPosted) {
          toast.success(`Job published and shared to: ${summary}`);
        } else {
          toast.warning(`Job published. Social posts: ${summary}`);
        }
      } else {
        toast.success("Job saved");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Could not save the job"),
  });

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <Dialog open={draft !== null} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-h-[90vh] overflow-y-auto border-border/60 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {form.id ? "Edit position" : "New position"}
          </DialogTitle>
          <DialogDescription>
            Publishing a draft with auto-post enabled announces it on your social channels.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="job-title">Title</Label>
              <Input
                id="job-title"
                value={form.title}
                maxLength={150}
                onChange={(e) => set("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.department} onValueChange={(value) => set("department", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="job-location">Location</Label>
              <Input
                id="job-location"
                value={form.location}
                maxLength={150}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.employment_type}
                onValueChange={(value) => set("employment_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Full-time", "Part-time", "Contract"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-summary">Summary</Label>
            <Textarea
              id="job-summary"
              value={form.summary}
              maxLength={400}
              rows={2}
              onChange={(e) => set("summary", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-description">Description</Label>
            <Textarea
              id="job-description"
              value={form.description}
              rows={7}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Separate paragraphs with a blank line."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="job-requirements">Requirements (one per line)</Label>
            <Textarea
              id="job-requirements"
              value={form.requirements}
              rows={5}
              onChange={(e) => set("requirements", e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border/60 p-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => set("status", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["draft", "active", "closed"].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <Switch
                checked={form.social_auto_post}
                onCheckedChange={(value) => set("social_auto_post", value)}
              />
              Auto-post to social media
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="rust" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save position"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
