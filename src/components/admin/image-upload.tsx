"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ImagePlus, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"
import { toast } from "sonner"

import { getImageUrl } from "@/lib/utils"

interface ImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  maxImages?: number
  subDir?: string
}

export function ImageUpload({
  value = [],
  onChange,
  disabled,
  maxImages = 5,
  subDir = "general"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    try {
      const newUrls = [...value]
      
      for (let i = 0; i < files.length; i++) {
        if (newUrls.length >= maxImages) break
        
        const response = await api.api.v1.uploads.image.post({
          image: files[i] as any,
          subDir: subDir
        })
        
        if (!response.error && response.data?.data?.url) {
          // Store the relative URL or path-only URL, getImageUrl will handle formatting for display
          newUrls.push(response.data.data.url)
        } else {
          toast.error(`Failed to upload image ${files[i].name}`)
        }
      }
      
      onChange(newUrls)
    } catch (error) {
      console.error("Upload failed", error)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const onRemove = (url: string) => {
    onChange(value.filter((current) => current !== url))
  }

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-40 h-40 rounded-md overflow-hidden border bg-gray-50"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                className="h-6 w-6"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Uploaded image"
              src={getImageUrl(url)}
            />
          </div>
        ))}
        
        {value.length < maxImages && (
          <div
            onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
            className={`
              w-40 h-40 rounded-md border-2 border-dashed flex flex-col items-center justify-center cursor-pointer
              transition-colors hover:bg-gray-50 hover:border-gray-400
              ${disabled || isUploading ? "opacity-50 cursor-not-allowed" : "border-gray-300"}
            `}
          >
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-xs text-gray-500 font-medium">Add Images</span>
              </>
            )}
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={onUpload}
        disabled={disabled || isUploading}
      />
      
      <p className="text-[10px] text-muted-foreground">
        Accepted formats: JPG, PNG, WEBP. Max {maxImages} images.
      </p>
    </div>
  )
}
