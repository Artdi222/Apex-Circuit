"use client"

import { EntityForm } from "@/components/admin/entity-form"
import { ImageUpload } from "@/components/admin/image-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"

function parseImages(raw: any): string[] {
  let images = raw || [];
  if (typeof images === 'string') {
    try { images = JSON.parse(images); } catch (e) {}
  }
  if (Array.isArray(images) && images.length > 0 && typeof images[0] === 'string' && images[0].startsWith('[')) {
    try { images = JSON.parse(images[0]); } catch (e) {}
  }
  return Array.isArray(images) ? images : [];
}

export default function EditEquipmentPage() {
  const router = useRouter()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)

  const { data: item, isLoading } = useQuery({
    queryKey: ["admin", "equipment", id],
    queryFn: async () => {
      const res = await api.api.v1.equipment({ id: id as string }).get()
      if (res.error) throw new Error((res.error.value as any)?.message || JSON.stringify(res.error.value))
      return (res.data as any)?.data ?? res.data
    },
    enabled: !!id
  })

  const [formData, setFormData] = useState({
    name: "",
    category: "helmet",
    size: "M",
    brand: "",
    condition: "new",
    rental_price: 0,
    stock_quantity: 0,
    available_quantity: 0,
    images: [] as string[],
    status: "available",
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "helmet",
        size: item.size || "M",
        brand: item.brand || "",
        condition: item.condition || "new",
        rental_price: Number(item.rental_price) || 0,
        stock_quantity: item.stock_quantity || 0,
        available_quantity: item.available_quantity || 0,
        images: parseImages(item.images),
        status: item.status || "available",
      })
    }
  }, [item])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await api.api.v1.equipment({ id: id as string }).put({
        ...formData,
        rental_price: Number(formData.rental_price),
        stock_quantity: Number(formData.stock_quantity),
        available_quantity: Number(formData.available_quantity),
      } as any)

      if (res.error) throw new Error((res.error.value as any)?.message || JSON.stringify(res.error.value))

      await queryClient.invalidateQueries({ queryKey: ["admin", "equipment"] })
      await queryClient.invalidateQueries({ queryKey: ["equipment"] })

      toast.success("Equipment updated successfully")
      router.push("/admin/equipment")
    } catch (error: any) {
      toast.error(error.message || "Failed to update equipment")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading equipment data...</div>
  }

  return (
    <EntityForm
      title={`Edit ${formData.name}`}
      description="Update equipment details and stock levels."
      backUrl="/admin/equipment"
      onSubmit={onSubmit}
      isLoading={isSaving}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
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
            value={formData.size}
            onChange={(e) => setFormData({ ...formData, size: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(val) => setFormData({ ...formData, status: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
        <div className="space-y-2">
          <Label htmlFor="available_quantity">Available</Label>
          <Input
            id="available_quantity"
            type="number"
            value={formData.available_quantity}
            onChange={(e) => setFormData({ ...formData, available_quantity: Number(e.target.value) })}
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
