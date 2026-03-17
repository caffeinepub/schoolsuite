import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Megaphone, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddNotice, useGetAllNotices } from "../hooks/useQueries";

export default function Notices() {
  const { data: notices, isLoading } = useGetAllNotices();
  const addNotice = useAddNotice();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const sorted = notices
    ? [...notices].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addNotice.mutateAsync(form);
      toast.success("Notice posted");
      setDialogOpen(false);
      setForm({ title: "", content: "" });
    } catch {
      toast.error("Failed to post notice");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setDialogOpen(true)}
          data-ocid="notices.add_button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post Notice
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="notices.empty_state"
        >
          <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium">No notices yet</p>
          <p className="text-sm mt-1">
            Post a notice to inform students and parents.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((notice, i) => (
            <motion.div
              key={Number(notice.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="shadow-card card-hover border-l-4 border-l-primary">
                <CardHeader className="pb-1 pt-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="font-display text-base">
                      {notice.title}
                    </CardTitle>
                    <span className="text-xs text-muted-foreground shrink-0 ml-4">
                      {new Date(notice.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <p className="text-sm text-muted-foreground">
                    {notice.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="notices.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Post New Notice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Notice title"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea
                required
                rows={5}
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Write your notice..."
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addNotice.isPending}
                data-ocid="notices.submit_button"
              >
                {addNotice.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Post Notice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
