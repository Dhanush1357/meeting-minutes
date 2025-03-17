"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Upload, Edit2, Image as ImageIcon, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import apiFactory from "@/factories/apiFactory";
import Image from "next/image";

interface ImageInfo {
  filename: string;
  url: string;
}

interface ImageUploadProps {
  initialImage?: string | null;
  onUploadSuccess?: (imagePath: string) => void;
  handleLogoRemove?: () => void;
}

export function ImageUpload({
  initialImage,
  onUploadSuccess,
  handleLogoRemove,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("gallery");
  const [galleryImages, setGalleryImages] = useState<ImageInfo[]>([]);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<
    string | null
  >(null);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      // Reset states when dialog closes
      setPreviewImage(null);
      setSelectedGalleryImage(null);
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [isDialogOpen]);

  // Fetch gallery images when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchGalleryImages();
    }
  }, [isDialogOpen]);

  const fetchGalleryImages = async () => {
    try {
      setLoadingGallery(true);
      const response = await apiFactory("/upload/images");
      const data: any = await response;
      setGalleryImages(data.images || []);
    } catch (err) {
      setError("Failed to load gallery images");
      console.error(err);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check file size and type
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    setError(null);

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      console.log(
        "FileReader result:",
        result ? "Image data loaded" : "No image data"
      );
      setPreviewImage(result);
      setActiveTab("upload");
    };
    reader.onerror = () => {
      console.error("FileReader error:", reader.error);
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (
      !fileInputRef.current?.files ||
      fileInputRef.current.files.length === 0
    ) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", fileInputRef.current.files[0]);

    try {
      const response = await apiFactory("/upload/image", {
        method: "POST",
        body: formData,
      });

      const data: any = await response;
      const imagePath = data.path;

      setImageSrc(imagePath);
      if (onUploadSuccess) {
        onUploadSuccess(imagePath);
      }

      // Close dialog and reset
      setIsDialogOpen(false);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGallerySelect = (imageUrl: string) => {
    setSelectedGalleryImage(imageUrl);
  };

  const confirmGallerySelection = () => {
    if (selectedGalleryImage) {
      setImageSrc(selectedGalleryImage);
      if (onUploadSuccess) {
        onUploadSuccess(selectedGalleryImage);
      }
      setIsDialogOpen(false);
      setSelectedGalleryImage(null);
    }
  };

  const openImageSelector = () => {
    setError(null);
    setPreviewImage(null);
    setSelectedGalleryImage(null);
    setActiveTab("gallery");
    setIsDialogOpen(true);
  };

  const renderGalleryContent = () => {
    if (loadingGallery) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (galleryImages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-2" />
          <p>No images available</p>
          <Button
            variant="outline"
            onClick={() => setActiveTab("upload")}
            className="mt-4"
          >
            Upload an image
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {galleryImages.map((image) => (
          <div
            key={image.filename}
            onClick={() => handleGallerySelect(image.url)}
            className={`
              border rounded-md p-2 cursor-pointer transition-colors hover:border-primary
              ${selectedGalleryImage === image.url ? "ring-2 ring-primary" : ""}
            `}
          >
            <div className="aspect-square relative">
              <Image
                src={`${process.env.NEXT_PUBLIC_SERVER_URL}${image.url}`}
                alt={image.filename}
                fill
                className="object-contain"
              />
            </div>
            <p
              className="mt-2 text-xs text-center truncate"
              title={image.filename}
            >
              {image.filename}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-2">
        {imageSrc ? (
          <div className="relative group">
            <Image
              src={`${process.env.NEXT_PUBLIC_SERVER_URL}${imageSrc}`}
              alt="Uploaded Image"
              width={100}
              height={50}
              className={`border rounded-md`}
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white"
                onClick={openImageSelector}
              >
                <Edit2 className="h-4 w-4" />
                <span className="ml-1">Change</span>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className={`w-24 h-24 flex flex-col items-center justify-center`}
            onClick={openImageSelector}
          >
            <Upload className="h-6 w-6 mb-1" />
            <span className="text-xs text-wrap">Upload/Select Image</span>
          </Button>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue="gallery"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="upload">Upload New</TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="mt-4">
              {renderGalleryContent()}
            </TabsContent>

            <TabsContent value="upload" className="mt-4">
              <div className="space-y-4">
                {previewImage ? (
                  <div className="relative">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SERVER_URL}${previewImage}`}
                      alt="Image preview"
                      width={100}
                      height={50}
                      className={`border rounded-md`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => {
                        setPreviewImage(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to select an image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, GIF (max 2MB)
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>

            {activeTab === "gallery" ? (
              <Button
                onClick={confirmGallerySelection}
                disabled={!selectedGalleryImage}
              >
                Select Image
              </Button>
            ) : (
              <Button
                onClick={handleUpload}
                disabled={!previewImage || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload & Select"
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                if (handleLogoRemove) handleLogoRemove();
                setImageSrc(null);
                setIsDialogOpen(false);
              }}
            >
              Remove Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
