"use client"

import { useRef, useState } from "react"
import { ImageIcon, Trash2, Upload } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Spinner } from "@workspace/ui/components/spinner"
import { cn } from "@workspace/ui/lib/utils"

type ImageUploadFieldProps = {
  name: string
  defaultValue?: string
  label: string
  description?: string
  error?: string
  required?: boolean
}

/** Uploads a file to ImgBB through the server route, then submits its URL. */
export function ImageUploadField({
  name,
  defaultValue = "",
  label,
  description,
  error,
  required,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(defaultValue)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setUploadError(null)

    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image file (JPG, PNG, WebP or GIF).")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be 5 MB or smaller.")
      return
    }

    setUploading(true)

    try {
      const body = new FormData()
      body.append("file", file)

      const response = await fetch("/api/uploads", { method: "POST", body })
      const payload = (await response.json()) as {
        url?: string
        error?: string
      }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Image upload failed.")
      }

      setUrl(payload.url)
    } catch (uploadFailure) {
      setUploadError(
        uploadFailure instanceof Error
          ? uploadFailure.message
          : "Image upload failed."
      )
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </p>
        {url ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUrl("")}
          >
            <Trash2 />
            Remove
          </Button>
        ) : null}
      </div>

      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      {url ? (
        <div className="relative overflow-hidden rounded-lg border">
          {/* Uploaded images are user-provided, so a plain img avoids remotePatterns. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="h-44 w-full object-cover"
            onError={() => setUploadError("The uploaded image could not load.")}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex h-32 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground transition-colors hover:bg-muted/60 disabled:opacity-60",
            error && "border-destructive/50"
          )}
        >
          {uploading ? (
            <>
              <Spinner />
              Uploading…
            </>
          ) : (
            <>
              <span className="flex size-9 items-center justify-center rounded-full bg-background">
                <Upload className="size-4" />
              </span>
              <span className="flex items-center gap-1.5">
                <ImageIcon className="size-3.5" />
                Choose an image
              </span>
            </>
          )}
        </button>
      )}

      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      {uploadError || error ? (
        <p className="text-sm text-destructive">{uploadError ?? error}</p>
      ) : null}
    </div>
  )
}
