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
import { Rivets } from "@/components/industrial";

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
  const testConnection = useServerFn(checkSocialConnection);
  const renderPreview = useServerFn(previewConfirmationEmail);
  const [preview, setPreview] = useState<string | null>(null);
  const [connections, setConnections] = useState<Record<string, "ok" | "failed" | "unknown">>({});
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

  const connectionMutation = useMutation({
    mutationFn: (network: NetworkId) => testConnection({ data: { network } }),
    onSuccess: (result) => {
      const label = networks.find((entry) => entry.id === result.network)?.label ?? result.network;
      setConnections((current) => ({ ...current, [result.network]: result.ok ? "ok" : "failed" }));
      if (result.ok) toast.success(`${label} connected ✓`);
      else toast.error(`${label} connection failed: ${result.message}`);
    },
    onError: () => toast.error("Connection test failed"),
  });

  const previewMutation = useMutation({
    mutationFn: () =>
      renderPreview({ data: { email_body_template: form?.email_body_template ?? "" } }),
    onSuccess: (result) => setPreview(result.html),
    onError: () => toast.error("Could not render the preview"),
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
    <>
    <form
      className="metal-plate relative max-w-2xl space-y-6 p-6"
      onSubmit={(event) => {
        event.preventDefault();
        mutation.mutate();
      }}
    >
      <Rivets />
      <h3 className="section-head">Delivery</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="font-mono text-[11px] tracking-[2px] uppercase" htmlFor="email-from">Email from address</Label>
          <Input
            className="!rounded-none !border-0 !border-b-2 !border-steel !bg-transparent px-0 !shadow-none focus-visible:!border-primary focus-visible:!ring-0"
            id="email-from"
            type="email"
            value={form.email_from}
            onChange={(e) => setForm({ ...form, email_from: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label className="font-mono text-[11px] tracking-[2px] uppercase" htmlFor="max-size">Max file size (MB)</Label>
          <Input
            className="!rounded-none !border-0 !border-b-2 !border-steel !bg-transparent px-0 !shadow-none focus-visible:!border-primary focus-visible:!ring-0"
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
        <Label className="font-mono text-[11px] tracking-[2px] uppercase" htmlFor="email-subject">Confirmation subject</Label>
        <Input
          className="!rounded-none !border-0 !border-b-2 !border-steel !bg-transparent px-0 !shadow-none focus-visible:!border-primary focus-visible:!ring-0"
          id="email-subject"
          value={form.email_subject}
          onChange={(e) => setForm({ ...form, email_subject: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label className="font-mono text-[11px] tracking-[2px] uppercase" htmlFor="email-body">Confirmation body</Label>
        <Textarea
          className="!rounded-none !border-0 !border-b-2 !border-steel !bg-transparent px-0 !shadow-none focus-visible:!border-primary focus-visible:!ring-0"
          id="email-body"
          rows={5}
          value={form.email_body_template}
          onChange={(e) => setForm({ ...form, email_body_template: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Placeholders: {"{{full_name}}"} and {"{{job_title}}"}
        </p>
      </div>

      <h3 className="section-head">Scanning &amp; limits</h3>
      <div className="space-y-2">
        <Label className="font-mono text-[11px] tracking-[2px] uppercase" htmlFor="clamav-url">ClamAV API URL</Label>
        <Input
          className="!rounded-none !border-0 !border-b-2 !border-steel !bg-transparent px-0 !shadow-none focus-visible:!border-primary focus-visible:!ring-0"
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
        <Label className="font-mono text-[11px] tracking-[2px] uppercase" htmlFor="rate-limit">Applications per day (per email)</Label>
        <Input
          className="!rounded-none !border-0 !border-b-2 !border-steel !bg-transparent px-0 !shadow-none focus-visible:!border-primary focus-visible:!ring-0"
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

      <div className="space-y-4">
        <h3 className="section-head">Social media API keys</h3>
        {networks.map((network) => {
          const state = connections[network.id];
          const configured = Boolean(form.social_api_keys[network.id]);
          const dotClass =
            state === "ok"
              ? "bg-success"
              : state === "failed" || !configured
                ? "bg-destructive"
                : "bg-muted-foreground";
          return (
            <div key={network.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-block size-2 rounded-full ${dotClass}`} />
                <Label className="font-mono text-[11px] tracking-[2px] uppercase" htmlFor={`key-${network.id}`}>{network.label}</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  className="!rounded-none !border-0 !border-b-2 !border-steel !bg-transparent px-0 !shadow-none focus-visible:!border-primary focus-visible:!ring-0"
                  id={`key-${network.id}`}
                  type="password"
                  placeholder="Access token — not configured"
                  value={form.social_api_keys[network.id] ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      social_api_keys: {
                        ...form.social_api_keys,
                        [network.id]: e.target.value,
                      },
                    })
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  className="hover:border-primary"
                  disabled={connectionMutation.isPending}
                  onClick={() => connectionMutation.mutate(network.id)}
                >
                  Test connection
                </Button>
              </div>
              <Input
                className="!rounded-none !border-0 !border-b-2 !border-steel !bg-transparent px-0 !shadow-none focus-visible:!border-primary focus-visible:!ring-0"
                id={`extra-${network.id}`}
                placeholder={network.extraLabel}
                value={form.social_api_keys[network.extraKey] ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    social_api_keys: {
                      ...form.social_api_keys,
                      [network.extraKey]: e.target.value,
                    },
                  })
                }
              />
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">
          Save settings before testing a connection — tests use the stored values.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="rust" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save settings"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="hover:border-primary"
          disabled={testMutation.isPending}
          onClick={() => testMutation.mutate()}
        >
          {testMutation.isPending ? "Testing…" : "Test scan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="hover:border-primary"
          disabled={previewMutation.isPending}
          onClick={() => previewMutation.mutate()}
        >
          {previewMutation.isPending ? "Rendering…" : "Preview email"}
        </Button>
      </div>
    </form>

    <Dialog open={preview !== null} onOpenChange={() => setPreview(null)}>
      <DialogContent className="metal-plate sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-[2px]">Confirmation email preview</DialogTitle>
          <DialogDescription>
            Sample applicant: Μαρία Παπαδοπούλου — Naval Architect, Engineering, Piraeus, Greece
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto rounded-lg border border-border/60">
          <iframe
            title="Email preview"
            srcDoc={preview ?? ""}
            className="h-[60vh] w-full bg-[#0a1628]"
          />
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
