import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../../backend";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

interface ImageUploaderProps {
  image: ExternalBlob | null;
  onImageChange: (image: ExternalBlob | null) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ImageUploader({
  image,
  onImageChange,
  disabled,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress(
        (percentage) => {
          setUploadProgress(percentage);
        },
      );

      onImageChange(blob);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {!image ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="w-full h-32 border-dashed"
        >
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload an image (max 5MB)
            </span>
          </div>
        </Button>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-border scrapbook-shadow">
          <img
            src={image.getDirectURL()}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
}
