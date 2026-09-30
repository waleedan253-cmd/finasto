"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Input,
  Popover,
  Progress,
  Tag,
  Tooltip,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  StarFilled,
  StarOutlined,
} from "@ant-design/icons";
import imageCompression from "browser-image-compression";
import pLimit from "p-limit";
import { createClient } from "../../lib/supabase/client"; // adjust to your browser client helper
import { cn } from "@/lib/utils";

// Client-side image uploader for the product form. Files go straight to
// Supabase Storage as the admin adds them, but rows are only written to
// product_images when the surrounding form is submitted
// (product-actions.ts). This component manages files and hands the
// current list up via onChange.
//
// UI: a drop zone plus a compact thumbnail grid. Drag a tile to reorder;
// hover a tile for primary / alt text / remove.
//
// Speed: images are compressed to WebP in the browser, uploaded up to 3
// at a time, and shown instantly as local previews while the upload
// finishes. Pending previews live in local state only, so the parent form
// never sees half-uploaded images.

const BUCKET = "product-images";
const MAX_IMAGES = 1;
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10MB original (compressed before upload)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const UPLOAD_CONCURRENCY = 3;

export type ProductImageDraft = {
  id: string; // existing product_images.id, or a client-generated temp id
  url: string; // public URL, used for the preview and saved to the DB
  path: string; // storage path, needed to delete the file later
  alt: string;
  isPrimary: boolean;
};

type PendingUpload = {
  id: string;
  previewUrl: string; // local blob URL for instant preview
  name: string;
  progress: number; // 0-100
};

const limit = pLimit(UPLOAD_CONCURRENCY);

function uploadWithProgress(
  url: string,
  file: Blob,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(xhr.responseText || `HTTP ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error"));
    const form = new FormData();
    form.append("cacheControl", "31536000");
    form.append("", file);
    xhr.send(form);
  });
}

export function ProductImageUploader({
  folderId,
  value,
  onChange,
}: {
  folderId: string;
  value: ProductImageDraft[];
  onChange: (images: ProductImageDraft[]) => void;
}) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Always holds the latest list, so async uploads don't merge into stale state.
  const valueRef = useRef(value);
  valueRef.current = value;

  const isUploading = pending.length > 0;

  function setProgress(id: string, progress: number) {
    setPending((prev) =>
      prev.map((p) => (p.id === id ? { ...p, progress } : p)),
    );
  }
  const remainingSlots = MAX_IMAGES - value.length - pending.length;

  // Revoke any leftover blob URLs on unmount.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(() => {
    return () => {
      pendingRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  async function uploadFiles(files: File[]) {
    setError(null);
    const list = files.slice(0, Math.max(remainingSlots, 0));
    if (list.length === 0) return;

    const invalid = list.find(
      (f) => !ALLOWED_TYPES.includes(f.type) || f.size > MAX_INPUT_BYTES,
    );
    if (invalid) {
      setError(
        invalid.size > MAX_INPUT_BYTES
          ? `"${invalid.name}" is over 10MB.`
          : `"${invalid.name}" must be a JPG, PNG or WebP image.`,
      );
      return;
    }

    // Show local previews immediately.
    const items: PendingUpload[] = list.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      progress: 0,
    }));
    setPending((prev) => [...prev, ...items]);

    const supabase = createClient();

    const results = await Promise.all(
      list.map((file, i) =>
        limit(async (): Promise<ProductImageDraft | null> => {
          const item = items[i];
          try {
            // Phase 1: compression = 0-30%
            const compressed = await imageCompression(file, {
              maxSizeMB: 0.3,
              maxWidthOrHeight: 1200,
              fileType: "image/webp",
              useWebWorker: true,
              onProgress: (p) => setProgress(item.id, Math.round(p * 0.3)),
            });

            const path = `${folderId}/${crypto.randomUUID()}.webp`;
            const { data: signed, error: signError } = await supabase.storage
              .from(BUCKET)
              .createSignedUploadUrl(path);

            if (signError || !signed) {
              setError(
                `Could not upload "${file.name}": ${signError?.message}`,
              );
              return null;
            }

            // Phase 2: upload = 30-100%
            await uploadWithProgress(signed.signedUrl, compressed, (pct) =>
              setProgress(item.id, 30 + Math.round(pct * 0.7)),
            );

            const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
            return {
              id: crypto.randomUUID(),
              url: data.publicUrl,
              path,
              alt: "",
              isPrimary: false,
            };
          } catch (err) {
            setError(
              `Could not upload "${file.name}": ${
                err instanceof Error ? err.message : "unknown error"
              }`,
            );
            return null;
          }
        }),
      ),
    );

    const uploaded = results.filter((r): r is ProductImageDraft => r !== null);

    // Swap previews for real images in one go (no flicker).
    items.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPending((prev) => prev.filter((p) => !items.some((i) => i.id === p.id)));

    if (uploaded.length === 0) return;

    const merged = [...valueRef.current, ...uploaded].slice(0, MAX_IMAGES);
    // First image ever added becomes primary automatically.
    if (!merged.some((img) => img.isPrimary) && merged.length > 0) {
      merged[0] = { ...merged[0], isPrimary: true };
    }
    onChange(merged);
  }

  async function removeImage(image: ProductImageDraft) {
    // Best-effort: remove the file from Storage (only possible for files
    // uploaded in this session, which are the only ones with a path). The
    // UI updates regardless, since an orphaned file is a minor cleanup
    // and a stuck form isn't.
    if (image.path) {
      const supabase = createClient();
      await supabase.storage.from(BUCKET).remove([image.path]);
    }

    const next = valueRef.current.filter((img) => img.id !== image.id);
    if (image.isPrimary && next.length > 0)
      next[0] = { ...next[0], isPrimary: true };
    onChange(next);
  }

  function setPrimary(id: string) {
    onChange(value.map((img) => ({ ...img, isPrimary: img.id === id })));
  }

  function setAlt(id: string, alt: string) {
    onChange(value.map((img) => (img.id === id ? { ...img, alt } : img)));
  }

  function reorder(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  function endDrag() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div>
      <Upload.Dragger
        multiple
        showUploadList={false}
        accept="image/jpeg,image/png,image/webp"
        disabled={remainingSlots <= 0}
        // Return false so antd never tries its own upload; hand the whole
        // batch to uploadFiles once (on the first file of the batch).
        beforeUpload={(file, fileList) => {
          if (file === fileList[0]) void uploadFiles(fileList as File[]);
          return false;
        }}
        style={{ padding: "8px 0" }}
      >
        <p className="ant-upload-drag-icon !mb-1">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          {isUploading ? "Uploading..." : "Click or drag images here to upload"}
        </p>
        <p className="ant-upload-hint">
          PNG, JPG or WebP, up to 10MB each (auto-optimized).{" "}
          {Math.max(remainingSlots, 0)} of {MAX_IMAGES} slots left.
        </p>
      </Upload.Dragger>

      {error && (
        <Alert
          type="error"
          showIcon
          closable
          message={error}
          onClose={() => setError(null)}
          className="mt-3"
        />
      )}

      {(value.length > 0 || pending.length > 0) && (
        <>
          {value.length > 1 && (
            <p className="mb-2 mt-4 text-[13px] text-neutral-500">
              Drag to reorder. The first image is shown first in the shop.
            </p>
          )}

          <ul
            className={cn(
              "grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:grid-cols-4",
              value.length <= 1 && "mt-4",
            )}
          >
            {value.map((image, index) => (
              <li
                key={image.id}
                draggable={value.length > 1}
                onDragStart={(e) => {
                  // Ignore drags that start inside the alt-text popover.
                  if (e.target !== e.currentTarget) return;
                  e.dataTransfer.effectAllowed = "move";
                  setDragIndex(index);
                }}
                onDragOver={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  setOverIndex(index);
                }}
                onDrop={(e) => {
                  if (dragIndex === null) return;
                  e.preventDefault();
                  reorder(dragIndex, index);
                  endDrag();
                }}
                onDragEnd={endDrag}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border border-[#d9d9d9] bg-[#fafafa] transition-shadow",
                  value.length > 1 && "cursor-grab active:cursor-grabbing",
                  dragIndex === index && "opacity-40",
                  overIndex === index &&
                    dragIndex !== index &&
                    "ring-2 ring-[#1677ff]",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL */}
                <img
                  src={image.url}
                  alt={image.alt || "Product photo"}
                  draggable={false}
                  className="h-full w-full object-contain p-2"
                />

                {image.isPrimary && (
                  <Tag
                    color="gold"
                    icon={<StarFilled />}
                    className="!absolute left-1.5 top-1.5 !m-0"
                  >
                    Primary
                  </Tag>
                )}

                {/* Actions: visible on hover/focus, always visible on touch */}
                <div
                  className={cn(
                    "absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 p-1.5 opacity-0 transition-opacity",
                    "group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100",
                  )}
                >
                  <Tooltip
                    title={image.isPrimary ? "Primary image" : "Set as primary"}
                  >
                    <Button
                      size="small"
                      type="text"
                      aria-pressed={image.isPrimary}
                      aria-label={
                        image.isPrimary
                          ? "Primary image"
                          : "Set as primary image"
                      }
                      icon={
                        image.isPrimary ? (
                          <StarFilled style={{ color: "#faad14" }} />
                        ) : (
                          <StarOutlined style={{ color: "#fff" }} />
                        )
                      }
                      onClick={() => setPrimary(image.id)}
                    />
                  </Tooltip>

                  <Popover
                    trigger="click"
                    title="Alt text"
                    content={
                      <Input
                        autoFocus
                        value={image.alt}
                        onChange={(e) => setAlt(image.id, e.target.value)}
                        placeholder="Describe this image (SEO and accessibility)"
                        style={{ width: 240 }}
                      />
                    }
                  >
                    <Button
                      size="small"
                      type="text"
                      aria-label={`Edit alt text for image ${index + 1}`}
                      icon={
                        <EditOutlined
                          style={{ color: image.alt ? "#52c41a" : "#fff" }}
                        />
                      }
                    />
                  </Popover>

                  <Tooltip title="Remove">
                    <Button
                      size="small"
                      type="text"
                      aria-label="Remove image"
                      icon={<DeleteOutlined style={{ color: "#ff7875" }} />}
                      onClick={() => void removeImage(image)}
                    />
                  </Tooltip>
                </div>
              </li>
            ))}

            {/* Instant local previews while uploads finish in the background */}
            {pending.map((item) => (
              <li
                key={item.id}
                aria-busy="true"
                className="relative aspect-square overflow-hidden rounded-lg border border-[#d9d9d9] bg-[#fafafa]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img
                  src={item.previewUrl}
                  alt=""
                  className="h-full w-full object-contain p-2 opacity-40"
                />
                <div className="absolute inset-x-3 bottom-3">
                  <Progress
                    percent={item.progress}
                    size="small"
                    showInfo={false}
                    strokeColor="#B87333"
                    trailColor="#F1EBE1"
                  />
                  <p className="mt-1 text-center text-[12px] text-[#3B2A24]">
                    Uploading {item.progress}%
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
