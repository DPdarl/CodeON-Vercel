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
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
  CalendarDays,
  Copy,
  Eye,
  EyeOff,
  Briefcase,
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
interface Instructor {
  id: string;
  student_id: string; // Used as Employee ID
  display_name: string;
  email: string;
  section: string; // Used as Department (Always CSIT)
  role: string;
  created_at: string;
  google_bound: boolean;
  birthdate?: string;
}

export function InstructorManagementTab() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null);

  // Form & UI State
  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    email: "",
    birthdate: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setIsLoading(true);

    // Fetch Instructors Only
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "instructor")
      .order("student_id", { ascending: true });

    if (error) {
      console.error("Error fetching instructors:", error);
      toast.error("Failed to load instructors.");
    } else {
      setInstructors(data || []);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---

  const handleBirthdateChange = (date: string) => {
    // Password Format: ProfYYYY-MM-DD
    const generatedPass = date ? `Prof${date}` : "";

    setFormData((prev) => ({
      ...prev,
      birthdate: date,
      password: generatedPass,
    }));
  };

  const handleCreateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create Profile Record
      const { error } = await supabase.from("users").insert([
        {
          student_id: formData.employeeId,
          display_name: formData.fullName,
          email: formData.email,
          section: "CSIT", // ✅ Hardcoded to CSIT
          birthdate: formData.birthdate,
          role: "instructor",
        },
      ]);

      if (error) throw error;

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Instructor Added!</span>
          <span className="text-xs">
            Password: <span className="font-mono">{formData.password}</span>
          </span>
        </div>,
      );

      setIsAddOpen(false);
      fetchData();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to create: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInstructor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstructor) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          student_id: formData.employeeId,
          display_name: formData.fullName,
          email: formData.email,
          section: "CSIT", // ✅ Ensure it stays CSIT
          birthdate: formData.birthdate,
        })
        .eq("id", selectedInstructor.id);

      if (error) throw error;

      toast.success("Instructor updated");
      setIsEditOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInstructor = async () => {
    if (!selectedInstructor) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", selectedInstructor.id);
      if (error) throw error;
      toast.success("Instructor deleted");
      setIsDeleteOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Delete failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Password copied");
  };

  // Helpers
  const openAddModal = () => {
    setFormData({
      employeeId: "",
      fullName: "",
      email: "",
      birthdate: "",
      password: "",
    });
    setIsAddOpen(true);
  };

  const openEditModal = (inst: Instructor) => {
    setSelectedInstructor(inst);
    setFormData({
      employeeId: inst.student_id,
      fullName: inst.display_name,
      email: inst.email,
      birthdate: inst.birthdate || "",
      password: "",
    });
    setIsEditOpen(true);
  };

  const filteredInstructors = instructors.filter(
    (i) =>
      i.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.student_id?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-indigo-500" />
            Instructor Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage CSIT faculty accounts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={isLoading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </Button>
          <Button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Instructor
          </Button>
        </div>
      </div>

      <Card className="border-gray-200 dark:border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Faculty Directory (CSIT)</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search name, ID..."
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
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Birthdate</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        <div className="flex justify-center items-center gap-2">
                          <Loader2 className="animate-spin h-4 w-4" />
                          Loading...
                        </div>
                      </td>
                    </tr>
                  ) : filteredInstructors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No instructors found.
                      </td>
                    </tr>
                  ) : (
                    filteredInstructors.map((inst) => (
                      <tr
                        key={inst.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">
                          {inst.student_id}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                          {inst.display_name}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {inst.email}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {inst.birthdate || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {inst.google_bound ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                              Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-gray-500"
                            >
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
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
                                onClick={() => openEditModal(inst)}
                              >
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedInstructor(inst);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            ) : filteredInstructors.length === 0 ? (
              <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50 dark:bg-gray-900 border-dashed">
                No instructors found.
              </div>
            ) : (
              filteredInstructors.map((inst) => (
                <div
                  key={inst.id}
                  className="p-4 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {inst.display_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          {inst.student_id}
                        </p>
                        {inst.google_bound ? (
                          <Badge className="text-[10px] h-5 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 text-gray-500"
                          >
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
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
                        <DropdownMenuItem onClick={() => openEditModal(inst)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedInstructor(inst);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {inst.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 border-t pt-3 mt-3 border-gray-100 dark:border-gray-800">
                    <CalendarDays className="w-3 h-3" />
                    Birthdate: {inst.birthdate || "Not set"}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- ADD/EDIT MODAL --- */}
      <Dialog
        open={isAddOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setIsEditOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isAddOpen ? "Add Instructor" : "Edit Instructor"}
            </DialogTitle>
            <DialogDescription>
              {isAddOpen ? "Create faculty account." : "Update details."}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={
              isAddOpen ? handleCreateInstructor : handleUpdateInstructor
            }
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input
                  required
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
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
                <p className="text-[10px] text-muted-foreground">
                  Format: <span className="font-mono">ProfYYYY-MM-DD</span>
                </p>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : isAddOpen ? (
                  "Create Instructor"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- DELETE MODAL --- */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Instructor?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteInstructor}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
