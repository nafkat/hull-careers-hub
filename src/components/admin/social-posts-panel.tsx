import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";
import { listSocialPosts, type SocialPostRow } from "@/lib/admin.functions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NauticalSpinner } from "@/components/nautical-spinner";

function statusBadge(status: string) {
  if (status === "success") return <Badge className="bg-success/15 text-success">Posted</Badge>;
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="secondary" className="capitalize">{status}</Badge>;
}

export function SocialPostsPanel() {
  const fetchPosts = useServerFn(listSocialPosts);
  const query = useQuery({
    queryKey: ["admin-social-posts"],
    queryFn: () => fetchPosts(),
    refetchInterval: 30000,
  });

  if (query.isLoading) return <NauticalSpinner label="Loading social history" />;
  const posts: SocialPostRow[] = query.data?.posts ?? [];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl">Social posts</h2>
      <div className="glass overflow-x-auto rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Link</TableHead>
              <TableHead className="hidden lg:table-cell">Error</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No social posts yet.
                </TableCell>
              </TableRow>
            )}
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.job_title}</TableCell>
                <TableCell className="text-muted-foreground capitalize">{post.platform}</TableCell>
                <TableCell>{statusBadge(post.status)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {post.post_url ? (
                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-gold hover:underline"
                    >
                      View <ExternalLink className="size-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden max-w-xs truncate text-muted-foreground lg:table-cell">
                  {post.error_message ?? "—"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {new Date(post.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
