import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit2,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  UserCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { UserAccount } from "../backend";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

type DialogMode = "add" | "edit" | null;

export default function UserManagement() {
  const { token } = useAuth();
  const { actor } = useActor();
  const [teachers, setTeachers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editTarget, setEditTarget] = useState<UserAccount | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formDisplayName, setFormDisplayName] = useState("");

  const loadTeachers = useCallback(async () => {
    if (!actor || !token) return;
    setLoading(true);
    try {
      const list = await actor.listTeachers(token);
      setTeachers(list);
    } catch {
      toast.error("Failed to load teacher accounts");
    } finally {
      setLoading(false);
    }
  }, [actor, token]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  function openAdd() {
    setFormUsername("");
    setFormPassword("");
    setFormDisplayName("");
    setEditTarget(null);
    setDialogMode("add");
  }

  function openEdit(teacher: UserAccount) {
    setFormUsername(teacher.username);
    setFormPassword("");
    setFormDisplayName(teacher.displayName);
    setEditTarget(teacher);
    setDialogMode("edit");
  }

  async function handleSave() {
    if (!actor || !token) return;
    setSaving(true);
    try {
      if (dialogMode === "add") {
        await actor.createTeacherAccount(
          token,
          formUsername,
          formPassword,
          formDisplayName,
        );
        toast.success("Teacher account created");
      } else if (dialogMode === "edit" && editTarget) {
        await actor.updateTeacherAccount(
          token,
          editTarget.id,
          formUsername,
          formDisplayName,
        );
        toast.success("Teacher account updated");
      }
      setDialogMode(null);
      await loadTeachers();
    } catch {
      toast.error("Failed to save teacher account");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!actor || !token || !deleteTarget) return;
    setDeleting(true);
    try {
      await actor.deleteTeacherAccount(token, deleteTarget.id);
      toast.success("Teacher account deleted");
      setDeleteTarget(null);
      await loadTeachers();
    } catch {
      toast.error("Failed to delete teacher account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            User Management
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Manage teacher accounts across EduLite
          </p>
        </div>
        <Button
          data-ocid="user_mgmt.add_button"
          onClick={openAdd}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Teacher
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : teachers.length === 0 ? (
          <div
            data-ocid="user_mgmt.empty_state"
            className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3"
          >
            <UserCircle className="w-10 h-10 opacity-30" />
            <p className="text-sm">
              No teacher accounts yet. Add one to get started.
            </p>
          </div>
        ) : (
          <Table data-ocid="user_mgmt.table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher, idx) => (
                <TableRow
                  key={teacher.id.toString()}
                  data-ocid={`user_mgmt.item.${idx + 1}`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {teacher.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {teacher.displayName}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {teacher.username}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      <ShieldCheck className="w-3 h-3" />
                      Teacher
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        data-ocid={`user_mgmt.edit_button.${idx + 1}`}
                        onClick={() => openEdit(teacher)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        data-ocid={`user_mgmt.delete_button.${idx + 1}`}
                        onClick={() => setDeleteTarget(teacher)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        open={dialogMode !== null}
        onOpenChange={(open) => !open && setDialogMode(null)}
      >
        <DialogContent data-ocid="user_mgmt.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "add"
                ? "Add Teacher Account"
                : "Edit Teacher Account"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Display Name</Label>
              <Input
                placeholder="Full name"
                value={formDisplayName}
                onChange={(e) => setFormDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Username</Label>
              <Input
                placeholder="Login username"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
              />
            </div>
            {dialogMode === "add" && (
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Set initial password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="user_mgmt.cancel_button"
              onClick={() => setDialogMode(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="user_mgmt.save_button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              {dialogMode === "add" ? "Create Account" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Teacher Account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.displayName}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="user_mgmt.cancel_button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="user_mgmt.confirm_button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
