"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Save } from "lucide-react"
import Link from "next/link"

interface EntityFormProps {
  title: string
  description?: string
  backUrl: string
  onSubmit: (e: React.FormEvent) => void
  isLoading?: boolean
  children: ReactNode
  submitText?: string
}

export function EntityForm({
  title,
  description,
  backUrl,
  onSubmit,
  isLoading,
  children,
  submitText = "Save Changes",
}: EntityFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={backUrl}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button type="submit" loading={isLoading} className="bg-black text-white hover:bg-gray-800">
            <Save className="h-4 w-4 mr-2" />
            {submitText}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
        </CardContent>
      </Card>
    </form>
  )
}
