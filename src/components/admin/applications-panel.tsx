import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getCvDownloadUrl,
  rescanApplication,
  updateApplicationFlags,
  type AdminApplication,
  type AdminJob,
} from "@/lib/admin.functions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rivets } from "@/components/industrial";
import { Download, Archive, MailOpen, ShieldAlert, RefreshCw } from "lucide-react";

function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const pill =
  "inline-block rounded-[2px] border px-2 py-0.5 font-mono text-[10px] tracking-[1.5px] uppercase";

function scanBadge(status: string) {
  if (status === "clean")
    return <span className={`${pill} border-success/50 bg-success/10 text-success`}>Clean</span>;
  if (status === "infected")
    return (
      <span className={`${pill} border-destructive/60 bg-destructive/10 text-destructive`}>
        Threat
      </span>
    );
  if (status === "error")
    return <span className={`${pill} border-steel bg-muted/40 text-muted-foreground`}>Scan error</span>;
  return <span className={`${pill} border-accent/50 bg-accent/10 text-accent`}>Pending</span>;
}

export function ApplicationsPanel({
  jobs,
  applications,
}: {
  jobs: AdminJob[];
  applications: AdminApplication[];
}) {
  const [selected, setSelected] = useState<AdminApplication | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [scanFilter, setScanFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const setFlags = useServerFn(updateApplicationFlags);
  const rescan = useServerFn(rescanApplication);
  const download = useServerFn(getCvDownloadUrl);

  const flagMutation = useMutation({
    mutationFn: (input: { id: string; is_read?: boolean; is_archived?: boolean }) =>
      setFlags({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
  });

  const downloadMutation = useMutation({
    mutationFn: (id: string) => download({ data: { id } }),
    onSuccess: (result) => {
      if (!result.url) {
        toast.error(result.message ?? "Download unavailable");
        return;
      }
      window.open(result.url, "_blank", "noopener");
    },
  });

  const rescanMutation = useMutation({
    mutationFn: (id: string) => rescan({ data: { id } }),
    onSuccess: (result) => {
      if (result.status === "clean") toast.success("Rescan complete — file is clean");
      else if (result.status === "infected") toast.error("Rescan flagged a threat — file quarantined");
      else toast.error(result.details ?? "Scan error");
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: () => toast.error("Rescan failed"),
  });

  const term = search.trim().toLowerCase();
  const visible = applications.filter(
    (application) =>
      application.is_archived === showArchived &&
      (scanFilter === "all" || application.virus_scan_status === scanFilter) &&
      (term === "" ||
        application.full_name.toLowerCase().includes(term) ||
        application.email.toLowerCase().includes(term)),
  );

  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentInfected = applications.filter(
    (application) =>
      application.virus_scan_status === "infected" &&
      new Date(application.created_at).getTime() >= dayAgo,
  ).length;
  const jobTitle = (id: string) => jobs.find((job) => job.id === id)?.title ?? "—";

  return (
    <div className="space-y-4">
      {recentInfected > 0 && (
        <div className="flex items-center gap-3 rounded-[4px] border-2 border-destructive/60 bg-destructive/10 p-4 text-sm">
          <ShieldAlert className="size-5 text-destructive" />
          <span>
            {recentInfected} application{recentInfected === 1 ? "" : "s"} flagged as infected in the
            last 24 hours. The files were quarantined.
          </span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-[2px]">
          {showArchived ? "Archived applications" : "Applications"}
        </h2>
        <Button variant="outline" size="sm" onClick={() => setShowArchived((value) => !value)}>
          {showArchived ? "Show active" : "Show archived"}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-none border-0 border-b-2 border-steel bg-transparent px-0 shadow-none focus-visible:border-primary focus-visible:ring-0 max-w-xs"
        />
        <Select value={scanFilter} onValueChange={setScanFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All scan states" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="clean">Clean</SelectItem>
            <SelectItem value="infected">Infected</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="metal-plate relative overflow-x-auto">
        <Rivets />
        <Table className="steel-table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Phone</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Scan</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No applications yet.
                </TableCell>
              </TableRow>
            )}
            {visible.map((application) => (
              <TableRow
                key={application.id}
                className="cursor-pointer"
                onClick={() => {
                  setSelected(application);
                  if (!application.is_read) {
                    flagMutation.mutate({ id: application.id, is_read: true });
                  }
                }}
              >
                <TableCell className="font-medium">
                  {!application.is_read && (
                    <span className="mr-2 inline-block size-2 rounded-full bg-gold align-middle" />
                  )}
                  {application.full_name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {jobTitle(application.job_listing_id)}
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {application.email}
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {application.phone ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(application.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{scanBadge(application.virus_scan_status)}</TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Download CV"
                      disabled={application.virus_scan_status !== "clean"}
                      onClick={() => downloadMutation.mutate(application.id)}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={application.is_archived ? "Restore" : "Archive"}
                      onClick={() =>
                        flagMutation.mutate({
                          id: application.id,
                          is_archived: !application.is_archived,
                        })
                      }
                    >
                      {application.is_archived ? (
                        <MailOpen className="size-4" />
                      ) : (
                        <Archive className="size-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
        <DialogContent className="metal-plate sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">{selected.full_name}</DialogTitle>
                <DialogDescription>
                  {jobTitle(selected.job_listing_id)} ·{" "}
                  {new Date(selected.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{selected.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{selected.phone ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Cover message</dt>
                  <dd className="whitespace-pre-wrap">{selected.cover_message ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">CV</dt>
                  <dd>
                    {selected.file_name ?? "—"}
                    {selected.file_size ? ` · ${formatFileSize(selected.file_size)}` : ""}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  {scanBadge(selected.virus_scan_status)}
                  {selected.email_sent && <Badge variant="secondary">Confirmation sent</Badge>}
                </div>
              </dl>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="rust"
                  disabled={selected.virus_scan_status !== "clean"}
                  onClick={() => downloadMutation.mutate(selected.id)}
                >
                  <Download className="size-4" /> Download CV
                </Button>
                <Button
                  variant="outline"
                  disabled={!selected.file_path || rescanMutation.isPending}
                  onClick={() => rescanMutation.mutate(selected.id)}
                >
                  <RefreshCw className="size-4" />
                  {rescanMutation.isPending ? "Rescanning…" : "Rescan file"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
