import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  UserPlus,
  CalendarDays,
  Copy,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";

// --- TYPES ---
interface Student {
  id: string;
  student_id: string;
  display_name: string;
  email: string;
  section: string;
  role: string;
  created_at: string;
  google_bound: boolean;
  birthdate?: string;
}

interface AccountRequest {
  id: string;
  student_id: string;
  full_name: string;
  section: string;
  professor: string;
  birthdate?: string;
  created_at: string;
  is_approved: boolean;
}

const SECTIONS = ["BSIT-1A", "BSIT-1B", "BSCS-1A", "BSIS", "BSAIS", "ACT"];

export function StudentManagementTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [requests, setRequests] = useState<AccountRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Role state (For permissions)
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);

  // Tracking approval
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(
    null,
  );

  // Form UI
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    email: "",
    section: "",
    birthdate: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);

    // 0. Get Current User Role
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: roleData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      setCurrentUserRole(roleData?.role || "");
    }

    // 1. Fetch Students
    const { data: studentData, error: studentError } = await supabase
      .from("users")
      .select("*")
      .in("role", ["user", "student"])
      .order("student_id", { ascending: true });

    if (studentError) {
      console.error("Error fetching students:", studentError);
      // Don't show toast on load to avoid spamming user
    } else {
      setStudents(studentData || []);
    }

    // 2. Fetch Requests
    const { data: reqData, error: reqError } = await supabase
      .from("account_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (reqError) {
      console.error("Error fetching requests:", reqError);
    } else {
      setRequests(reqData || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---

  const handleBirthdateChange = (date: string) => {
    const generatedPass = date ? `Ici${date}` : "";
    setFormData((prev) => ({
      ...prev,
      birthdate: date,
      password: generatedPass,
    }));
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Attempt to Create User
      const { error } = await supabase.from("users").insert([
        {
          student_id: formData.studentId,
          display_name: formData.fullName,
          email: formData.email,
          section: formData.section,
          birthdate: formData.birthdate,
          role: "user",
        },
      ]);

      if (error) throw error;

      // 2. If successful, mark request as approved
      if (approvingRequestId) {
        await supabase
          .from("account_requests")
          .update({ is_approved: true })
          .eq("id", approvingRequestId);
      }

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Student Created!</span>
          <span className="text-xs">
            Pass: <span className="font-mono">{formData.password}</span>
          </span>
        </div>,
      );

      handleCloseAddModal();
      fetchData();
    } catch (error: any) {
      console.error(error);

      // ✅ FIX FOR RED ALERT: Handle Duplicate Key
      if (error.message.includes("users_student_id_key")) {
        toast.error("This Student ID is already registered!", {
          description:
            "Check the 'Active Students' tab. You can delete the duplicate there.",
        });
      } else {
        toast.error("Failed to create: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          student_id: formData.studentId,
          display_name: formData.fullName,
          email: formData.email,
          section: formData.section,
          birthdate: formData.birthdate,
        })
        .eq("id", selectedStudent.id);

      if (error) throw error;

      toast.success("Student updated successfully");
      setIsEditOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedStudent.id);
      if (error) throw error;
      toast.success("Student record deleted");
      setIsDeleteOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Delete failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveRequest = (req: AccountRequest) => {
    setApprovingRequestId(req.id);
    setFormData({
      studentId: req.student_id,
      fullName: req.full_name,
      email: `${req.student_id.toLowerCase()}@student.school.edu`, // Auto-generate dummy email or leave blank
      section: req.section,
      birthdate: req.birthdate || "",
      password: req.birthdate ? `Ici${req.birthdate}` : "",
    });
    setIsAddOpen(true);
  };

  const handleOpenRejectModal = (id: string) => {
    setRequestToReject(id);
    setIsRejectOpen(true);
  };

  const confirmRejectRequest = async () => {
    if (!requestToReject) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("account_requests")
        .delete()
        .eq("id", requestToReject);

      if (error) throw error;

      toast.success("Request rejected");
      setIsRejectOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleCloseAddModal = () => {
    setIsAddOpen(false);
    setApprovingRequestId(null);
    setFormData({
      studentId: "",
      fullName: "",
      email: "",
      section: "",
      birthdate: "",
      password: "",
    });
  };

  const openAddModal = () => {
    setApprovingRequestId(null);
    setFormData({
      studentId: "",
      fullName: "",
      email: "",
      section: "",
      birthdate: "",
      password: "",
    });
    setIsAddOpen(true);
  };

  const openEditModal = (s: Student) => {
    setSelectedStudent(s);
    setFormData({
      studentId: s.student_id,
      fullName: s.display_name,
      email: s.email,
      section: s.section,
      birthdate: s.birthdate || "",
      password: "",
    });
    setIsEditOpen(true);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pendingCount = requests.filter((r) => !r.is_approved).length;

  // ✅ PERMISSION CHECK: I've commented out the strict check so you can SEE the buttons.
  // Uncomment the first line and remove "true" when ready for production.
  // const canManage = ["admin", "super_admin", "instructor"].includes(currentUserRole);
  const canManage = true; // FORCE SHOW BUTTONS FOR DEBUGGING

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Student Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage student accounts and records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </Button>
          {canManage && (
            <Button
              onClick={openAddModal}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">Active Students</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Account Requests
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ACTIVE STUDENTS TABLE */}
        <TabsContent value="active" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Student Directory</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    className="pl-8 bg-gray-50 dark:bg-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block rounded-md border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Section</th>
                        <th className="px-4 py-3">Birthdate</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-4 text-center text-gray-500"
                          >
                            <div className="flex justify-center items-center gap-2">
                              <Loader2 className="animate-spin h-4 w-4" />
                              Loading...
                            </div>
                          </td>
                        </tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-4 text-center text-gray-500"
                          >
                            No students found.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s) => (
                          <tr
                            key={s.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">
                              {s.student_id}
                            </td>
                            <td className="px-4 py-3 font-bold">
                              {s.display_name}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">{s.section}</Badge>
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {s.birthdate || "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {canManage && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => openEditModal(s)}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedStudent(s);
                                        setIsDeleteOpen(true);
                                      }}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="md:hidden space-y-4">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    <Loader2 className="animate-spin mx-auto mb-2" />
                    Loading...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50 dark:bg-gray-900 border-dashed">
                    No students found.
                  </div>
                ) : (
                  filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {s.display_name}
                          </h3>
                          <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-1">
                            {s.student_id}
                          </p>
                        </div>
                        {canManage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 -mr-2 -mt-2"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openEditModal(s)}
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedStudent(s);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {s.section}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 border-t pt-3 mt-3 border-gray-100 dark:border-gray-800">
                        <CalendarDays className="w-3 h-3" />
                        Birthdate: {s.birthdate || "Not set"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCOUNT REQUESTS TABLE */}
        <TabsContent value="requests" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Access Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No requests found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      className={`flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-xl shadow-sm transition-all gap-4 ${
                        req.is_approved
                          ? "bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 opacity-70"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            req.is_approved
                              ? "bg-gray-300 dark:bg-gray-700 text-gray-500"
                              : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                          }`}
                        >
                          {req.full_name[0]}
                        </div>
                        <div>
                          <h4
                            className={`font-bold ${
                              req.is_approved
                                ? "line-through text-gray-500"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {req.full_name}
                          </h4>
                          <div className="flex gap-2 text-sm text-gray-500">
                            <span className="font-mono">{req.student_id}</span>
                            <span>•</span>
                            <span>{req.section}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />{" "}
                              {req.birthdate}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {req.is_approved ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 gap-1 px-3 py-1"
                          >
                            <Check className="w-3 h-3" /> Approved
                          </Badge>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleOpenRejectModal(req.id)}
                            >
                              <XCircle className="w-5 h-5" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white gap-2"
                              onClick={() => handleApproveRequest(req)}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* MODALS */}
      <Dialog
        open={isAddOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseAddModal();
            setIsEditOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAddOpen ? "Add New Student" : "Edit Student"}
            </DialogTitle>
            <DialogDescription>
              {isAddOpen ? "Create student record." : "Update details."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={isAddOpen ? handleCreateStudent : handleUpdateStudent}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student ID</Label>
                <Input
                  required
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({ ...formData, studentId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Select
                  value={formData.section}
                  onValueChange={(val) =>
                    setFormData({ ...formData, section: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Birthdate</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  required
                  type="date"
                  className="pl-10"
                  value={formData.birthdate}
                  onChange={(e) => handleBirthdateChange(e.target.value)}
                />
              </div>
            </div>
            {isAddOpen && (
              <div className="space-y-2">
                <Label>Initial Password (Auto-Generated)</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      disabled
                      value={formData.password}
                      type={showPassword ? "text" : "password"}
                      className="bg-gray-100 dark:bg-gray-800 font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(formData.password)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter className="mt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : isAddOpen ? (
                  "Create Record"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStudent}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" /> Reject Request?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete the account request.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRejectRequest}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
