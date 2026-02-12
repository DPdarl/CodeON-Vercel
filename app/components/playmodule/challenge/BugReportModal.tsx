import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { ImagePlus, X, Loader2, Bug } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "~/lib/supabase";
import { useAuth } from "~/contexts/AuthContext";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId?: string;
}

export const BugReportModal = ({
  isOpen,
  onClose,
  challengeId,
}: BugReportModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size too large (Max 5MB)");
        return;
      }
      setScreenshot(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setScreenshot(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error("Please describe the issue.");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to report a bug.");
      return;
    }

    setIsSubmitting(true);
    try {
      let screenshotUrl = null;

      // 1. Upload Screenshot if exists
      if (screenshot) {
        const fileExt = screenshot.name.split(".").pop();
        const fileName = `${user.uid}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("bug-reports")
          .upload(fileName, screenshot);

        if (uploadError) throw uploadError;

        // Get Public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("bug-reports").getPublicUrl(fileName);

        screenshotUrl = publicUrl;
      }

      // 2. Insert Record
      const { error: insertError } = await supabase.from("bug_reports").insert({
        user_id: user.uid,
        challenge_id: challengeId,
        title: title || "Untitled Report",
        description: description,
        screenshot_url: screenshotUrl,
        status: "open",
      });

      if (insertError) throw insertError;

      toast.success("Bug report submitted! Thank you.");
      onClose();
      // Reset form
      setTitle("");
      setDescription("");
      clearFile();
    } catch (error: any) {
      console.error("Bug report error:", error);
      toast.error(`Failed to submit: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-500" /> Report an Issue
          </DialogTitle>
          <DialogDescription>
            Found a bug? Help us improve by providing details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <Label htmlFor="title">Subject (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g. Timer not stopping"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Describe what happened..."
              className="resize-none h-24"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-2">
            <Label>Screenshot</Label>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all gap-2"
              >
                <ImagePlus className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">
                  Click to upload screenshot
                </span>
                <span className="text-xs text-muted-foreground/70">
                  Max 5MB (PNG, JPG)
                </span>
              </div>
            ) : (
              <div className="relative group rounded-lg overflow-hidden border border-border">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                />
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
