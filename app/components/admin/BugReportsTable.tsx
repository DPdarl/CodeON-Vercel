import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Download,
  Search,
  MoreHorizontal,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Bug,
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "~/lib/supabase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

export interface BugReport {
  id: string;
  user_id: string;
  challenge_id?: string;
  title: string;
  description: string;
  screenshot_url?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  user_email?: string; // Optional if we join with users
}

interface BugReportsTableProps {
  initialReports: BugReport[];
}

export const BugReportsTable = ({ initialReports }: BugReportsTableProps) => {
  const [reports, setReports] = useState<BugReport[]>(initialReports);
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filter
  const filteredReports = reports.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.status.includes(search.toLowerCase()),
  );

  // Status Change Handler
  const handleStatusChange = async (
    id: string,
    newStatus: BugReport["status"],
  ) => {
    try {
      const { error } = await supabase
        .from("bug_reports")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "ID",
      "Date",
      "Title",
      "Description",
      "Status",
      "Screenshot URL",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredReports.map((r) =>
        [
          r.id,
          r.created_at,
          `"${r.title.replace(/"/g, '""')}"`,
          `"${r.description.replace(/"/g, '""')}"`,
          r.status,
          r.screenshot_url || "N/A",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `bug_reports_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Resolved</Badge>
        );
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      case "in_progress":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">In Progress</Badge>
        );
      default:
        return <Badge variant="destructive">Open</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bugs..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No reports found.
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="whitespace-nowrap font-medium">
                    {format(new Date(report.created_at), "MMM d, yyyy")}
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(report.created_at), "h:mm a")}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="font-semibold truncate">{report.title}</div>
                    <div
                      className="text-sm text-muted-foreground truncate"
                      title={report.description}
                    >
                      {report.description}
                    </div>
                    {report.screenshot_url && (
                      <button
                        onClick={() => setPreviewImage(report.screenshot_url!)}
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                      >
                        <ExternalLink size={10} /> View Screenshot
                      </button>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(report.id, "resolved")
                          }
                        >
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />{" "}
                          Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(report.id, "in_progress")
                          }
                        >
                          <Clock className="mr-2 h-4 w-4 text-blue-500" /> Mark
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleStatusChange(report.id, "closed")
                          }
                        >
                          <XCircle className="mr-2 h-4 w-4 text-gray-500" />{" "}
                          Mark Closed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(report.id, "open")}
                        >
                          <Bug className="mr-2 h-4 w-4 text-red-500" /> Re-open
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Image Preview Modal */}
      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Screenshot Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="flex justify-center bg-black/5 rounded-lg overflow-hidden">
              <img
                src={previewImage}
                alt="Validation"
                className="max-h-[80vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
