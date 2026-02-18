import { useState, useEffect, useRef } from "react";
import {
  getEmailTemplates,
  getEmailTemplate,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  uploadTemplateImage,
} from "@/lib/managerApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, FileText, ImagePlus } from "lucide-react";
import { format } from "date-fns";
import { apiBase } from "@/lib/apiBase";

const defaultForm = () => ({
  name: "",
  subject: "",
  body_text: "",
  body_html: "",
  image_url: "",
});

export default function EmailTemplates() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const loadList = async () => {
    setLoading(true);
    try {
      const data = await getEmailTemplates();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm());
    setFormOpen(true);
  };

  const openEdit = async (id) => {
    setEditingId(id);
    try {
      const t = await getEmailTemplate(id);
      if (t) {
        setForm({
          name: t.name || "",
          subject: t.subject || "",
          body_text: t.body_text || "",
          body_html: t.body_html || "",
          image_url: t.image_url || "",
        });
        setFormOpen(true);
      }
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    const name = (form.name || "").trim();
    if (!name) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const body = {
        name,
        subject: (form.subject || "").trim() || null,
        body_text: (form.body_text || "").trim() || null,
        body_html: (form.body_html || "").trim() || null,
        image_url: (form.image_url || "").trim() || null,
      };
      if (editingId) {
        await updateEmailTemplate(editingId, body);
        toast({ title: "Template updated" });
      } else {
        await createEmailTemplate(body);
        toast({ title: "Template created" });
      }
      setFormOpen(false);
      loadList();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteEmailTemplate(deleteId);
      toast({ title: "Template deleted" });
      setDeleteId(null);
      loadList();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const result = await uploadTemplateImage(formData);
      const url = result?.url ?? result?.image_url ?? result?.path;
      if (url) {
        setForm((prev) => ({ ...prev, image_url: url }));
        toast({ title: "Image uploaded" });
      } else {
        toast({ title: "Upload failed", description: "No URL returned", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const imageDisplayUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("data:") || url.startsWith("http")) return url;
    const base = apiBase || "";
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Email templates</h1>
          <p className="text-sm text-black/60 mt-0.5">Create and manage reusable email templates for Camages.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add template
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : list.length === 0 ? (
        <div className="rounded-lg border border-black/10 bg-black/[0.02] p-8 text-center">
          <FileText className="h-10 w-10 mx-auto text-black/40 mb-3" />
          <p className="text-black/70 font-medium">No templates yet</p>
          <p className="text-sm text-black/50 mt-1">Add a template to use when composing messages.</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add template
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-black/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name || "—"}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-black/70">{row.subject || "—"}</TableCell>
                  <TableCell>
                    {row.image_url ? (
                      <img
                        src={imageDisplayUrl(row.image_url)}
                        alt=""
                        className="h-8 w-8 object-cover rounded border border-black/10"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <span className="text-black/40 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-black/60 text-sm">
                    {row.updated_at ? format(new Date(row.updated_at), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row.id)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(row.id)}
                        aria-label="Delete"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit template" : "New template"}</DialogTitle>
            <DialogDescription>Use plain text, HTML, or both. Optional image for the email.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="et-name">Name</Label>
              <Input
                id="et-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Welcome email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="et-subject">Subject line</Label>
              <Input
                id="et-subject"
                value={form.subject}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Email subject"
              />
            </div>
            <div className="grid gap-2">
              <Label>Template image</Label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  {uploadingImage ? "Uploading…" : "Upload image"}
                </Button>
                <Input
                  className="flex-1 min-w-[200px]"
                  value={form.image_url}
                  onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
                  placeholder="Or paste image URL"
                />
              </div>
              {form.image_url && (
                <img
                  src={imageDisplayUrl(form.image_url)}
                  alt="Preview"
                  className="mt-2 h-24 object-contain rounded border border-black/10"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="et-body-text">Plain text body</Label>
              <Textarea
                id="et-body-text"
                value={form.body_text}
                onChange={(e) => setForm((p) => ({ ...p, body_text: e.target.value }))}
                placeholder="Plain text version"
                rows={3}
                className="font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="et-body-html">HTML body</Label>
              <Textarea
                id="et-body-html"
                value={form.body_html}
                onChange={(e) => setForm((p) => ({ ...p, body_html: e.target.value }))}
                placeholder="<p>HTML content</p>"
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The template will be removed from the list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
