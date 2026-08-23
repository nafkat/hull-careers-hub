import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getCvDownloadUrl,
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
import { Download, Archive, MailOpen } from "lucide-react";

function scanBadge(status: string) {
  if (status === "clean") return <Badge className="bg-success/15 text-success">Clean</Badge>;
  if (status === "infected") return <Badge variant="destructive">Threat</Badge>;
  if (status === "error") return <Badge variant="secondary">Scan error</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
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
  const queryClient = useQueryClient();
  const setFlags = useServerFn(updateApplicationFlags);
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

  const visible = applications.filter((application) => application.is_archived === showArchived);
  const jobTitle = (id: string) => jobs.find((job) => job.id === id)?.title ?? "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">
          {showArchived ? "Archived applications" : "Applications"}
        </h2>
        <Button variant="outline" size="sm" onClick={() => setShowArchived((value) => !value)}>
          {showArchived ? "Show active" : "Show archived"}
        </Button>
      </div>

      <div className="glass overflow-x-auto rounded-xl">
        <Table>
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
        <DialogContent className="glass border-border/60 sm:max-w-lg">
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
                    {selected.file_size ? ` · ${(selected.file_size / 1024).toFixed(0)} KB` : ""}
                  </dd>
                </div>
                <div className="flex items-center gap-2">
                  {scanBadge(selected.virus_scan_status)}
                  {selected.email_sent && <Badge variant="secondary">Confirmation sent</Badge>}
                </div>
              </dl>
              <Button
                variant="rust"
                disabled={selected.virus_scan_status !== "clean"}
                onClick={() => downloadMutation.mutate(selected.id)}
              >
                <Download className="size-4" /> Download CV
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
