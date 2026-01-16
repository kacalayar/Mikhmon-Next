"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { Upload, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface LogoFile {
  name: string;
  url: string;
}

export default function LogoSettingsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logos, setLogos] = useState<LogoFile[]>([]);
  const [sessionName, setSessionName] = useState("");

  useEffect(() => {
    // Get session name from cookie or use default
    const cookieMatch = document.cookie.match(/mikhmon_session=([^;]+)/);
    if (cookieMatch) {
      try {
        const session = JSON.parse(decodeURIComponent(cookieMatch[1]));
        setSessionName(session.name || "default");
      } catch {
        setSessionName("default");
      }
    }
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2000000) {
      toast.error("File size must be less than 2MB");
      return;
    }

    // Validate filename
    const expectedName = `logo-${sessionName}.png`;
    if (file.name !== expectedName) {
      toast.error(`File name must be ${expectedName}`);
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", selectedFile);

      // This would upload to server - for now just simulate
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Logo ${selectedFile.name} uploaded successfully`);
      setSelectedFile(null);
      loadLogos();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  }

  function loadLogos() {
    // This would load from server
    // For now just show placeholder
    setLogos([]);
  }

  function handlePreview(logo: LogoFile) {
    window.open(logo.url, "_blank", "width=300,height=300");
  }

  function handleDelete(logoName: string) {
    if (!confirm(`Sure to delete ${logoName}?`)) return;

    toast.success(`Logo ${logoName} deleted`);
    loadLogos();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Upload Logo</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <span>Upload Logo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Format File Name</Label>
              <p className="text-sm text-muted-foreground">
                logo-{sessionName}.png
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload
              </Button>
            </div>

            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo List</CardTitle>
        </CardHeader>
        <CardContent>
          {logos.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No logos uploaded yet
            </p>
          ) : (
            <div className="space-y-2">
              {logos.map((logo) => (
                <div
                  key={logo.name}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <NextImage
                      src={logo.url}
                      alt={logo.name}
                      width={32}
                      height={32}
                      className="h-8 w-auto"
                    />
                    <span className="text-sm">{logo.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(logo)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(logo.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
