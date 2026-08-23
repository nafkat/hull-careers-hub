import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  checkSocialConnection,
  getSettings,
  previewConfirmationEmail,
  saveSettings,
  testScan,
} from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NauticalSpinner } from "@/components/nautical-spinner";

const networks = [
  { id: "linkedin", label: "LinkedIn", extraKey: "linkedin_org_id", extraLabel: "Organization ID" },
  { id: "facebook", label: "Facebook", extraKey: "facebook_page_id", extraLabel: "Page ID" },
  {
    id: "instagram",
    label: "Instagram",
    extraKey: "instagram_account_id",
    extraLabel: "Instagram account ID",
  },
] as const;

type NetworkId = (typeof networks)[number]["id"];

export function SettingsForm() {
  const fetchSettings = useServerFn(getSettings);
  const persist = useServerFn(saveSettings);
  const runTestScan = useServerFn(testScan);
  const [form, setForm] = useState<{
    max_file_size_mb: number;
    email_from: string;
    email_subject: string;
    email_body_template: string;
    virus_scan_enabled: boolean;
    social_api_keys: Record<string, string>;
    clamav_api_url: string;
    rate_limit_per_day: number;
  } | null>(null);

  const query = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const result = await fetchSettings();
      if (result.settings) {
        setForm({
          max_file_size_mb: result.settings.max_file_size_mb,
          email_from: result.settings.email_from,
          email_subject: result.settings.email_subject,
          email_body_template: result.settings.email_body_template,
          virus_scan_enabled: result.settings.virus_scan_enabled,
          social_api_keys: result.settings.social_api_keys ?? {},
          clamav_api_url: result.settings.clamav_api_url ?? "",
          rate_limit_per_day: result.settings.rate_limit_per_day ?? 3,
        });
      }
      return result;
    },
  });

  const mutation = useMutation({
    mutationFn: () => persist({ data: form! }),
    onSuccess: (result) =>
      result.ok ? toast.success("Settings saved") : toast.error(result.message ?? "Save failed"),
    onError: () => toast.error("Save failed"),
  });

  const testMutation = useMutation({
    mutationFn: () => runTestScan(),
    onSuccess: (result) => {
      if (result.status === "clean") toast.success(`Scanner OK — ${result.details}`);
      else if (result.status === "infected") toast.error(`Test file flagged — ${result.details}`);
      else toast.error(`Scan error — ${result.details}`);
    },
    onError: () => toast.error("Test scan failed"),
  });

  if (query.isLoading || !form) return <NauticalSpinner label="Loading settings" />;

  return (
    <form
      className="glass max-w-2xl space-y-5 rounded-xl p-6"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email-from">Email from address</Label>
          <Input
            id="email-from"
            type="email"
            value={form.email_from}
            onChange={(e) => setForm({ ...form, email_from: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="max-size">Max file size (MB)</Label>
          <Input
            id="max-size"
            type="number"
            min={1}
            max={50}
            value={form.max_file_size_mb}
            onChange={(e) => setForm({ ...form, max_file_size_mb: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-subject">Confirmation subject</Label>
        <Input
          id="email-subject"
          value={form.email_subject}
          onChange={(e) => setForm({ ...form, email_subject: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-body">Confirmation body</Label>
        <Textarea
          id="email-body"
          rows={5}
          value={form.email_body_template}
          onChange={(e) => setForm({ ...form, email_body_template: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Placeholders: {"{{full_name}}"} and {"{{job_title}}"}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clamav-url">ClamAV API URL</Label>
        <Input
          id="clamav-url"
          type="url"
          placeholder="https://your-clamav-host/scan"
          value={form.clamav_api_url}
          onChange={(e) => setForm({ ...form, clamav_api_url: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to use the built-in simulated scanner.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rate-limit">Applications per day (per email)</Label>
        <Input
          id="rate-limit"
          type="number"
          min={1}
          max={50}
          value={form.rate_limit_per_day}
          onChange={(e) => setForm({ ...form, rate_limit_per_day: Number(e.target.value) })}
        />
      </div>

      <label className="flex items-center gap-3 rounded-lg border border-border/60 p-4 text-sm">
        <Switch
          checked={form.virus_scan_enabled}
          onCheckedChange={(value) => setForm({ ...form, virus_scan_enabled: value })}
        />
        Virus scanning enabled
      </label>

      <div className="space-y-3">
        <h3 className="font-display text-lg">Social media API keys</h3>
        {networks.map((network) => (
          <div key={network} className="space-y-2">
            <Label htmlFor={`key-${network}`} className="capitalize">
              {network}
            </Label>
            <Input
              id={`key-${network}`}
              type="password"
              placeholder="Not configured"
              value={form.social_api_keys[network] ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  social_api_keys: { ...form.social_api_keys, [network]: e.target.value },
                })
              }
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="rust" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save settings"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={testMutation.isPending}
          onClick={() => testMutation.mutate()}
        >
          {testMutation.isPending ? "Testing…" : "Test scan"}
        </Button>
      </div>
    </form>
  );
}
