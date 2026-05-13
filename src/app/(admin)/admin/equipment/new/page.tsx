"use client"

import { EntityForm } from "@/components/admin/entity-form"
import { ImageUpload } from "@/components/admin/image-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export default function NewEquipmentPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "helmet",
    size: "M",
    brand: "",
    condition: "new",
    rental_price: 0,
    stock_quantity: 0,
    images: [] as string[],
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await api.api.v1.equipment.post({
        ...formData,
        rental_price: Number(formData.rental_price),
        stock_quantity: Number(formData.stock_quantity),
        available_quantity: Number(formData.stock_quantity), // Initial stock = available
      } as any)

      if (res.error) throw new Error((res.error.value as any)?.message || JSON.stringify(res.error.value))

      // Invalidate both admin and public caches so lists update immediately
      await queryClient.invalidateQueries({ queryKey: ["admin", "equipment"] })
      await queryClient.invalidateQueries({ queryKey: ["equipment"] })

      toast.success("Equipment created successfully")
      router.push("/admin/equipment")
    } catch (error: any) {
      toast.error(error.message || "Failed to create equipment")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <EntityForm
      title="Add New Equipment"
      description="Enter the details for the new racing gear."
      backUrl="/admin/equipment"
      onSubmit={onSubmit}
      isLoading={isLoading}
      submitText="Create Equipment"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            placeholder="e.g. Sparco Pro Helmet"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            placeholder="e.g. Sparco"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(val) => setFormData({ ...formData, category: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="helmet">Helmet</SelectItem>
              <SelectItem value="suit">Racing Suit</SelectItem>
              <SelectItem value="gloves">Gloves</SelectItem>
              <SelectItem value="shoes">Shoes</SelectItem>
              <SelectItem value="hans_device">HANS Device</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            placeholder="e.g. M, 42, Large"
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select
            value={formData.condition}
            onValueChange={(val) => setFormData({ ...formData, condition: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rental_price">Rental Price ($)</Label>
          <Input
            id="rental_price"
            type="number"
            value={formData.rental_price}
            onChange={(e) => setFormData({ ...formData, rental_price: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock_quantity">Total Stock</Label>
          <Input
            id="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Equipment Images</Label>
        <ImageUpload
          value={formData.images}
          onChange={(urls) => setFormData({ ...formData, images: urls })}
          subDir="equipment"
        />
      </div>
    </EntityForm>
  )
}
