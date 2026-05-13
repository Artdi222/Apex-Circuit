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

export default function NewVehiclePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model_code: "",
    year: new Date().getFullYear(),
    class: "gt",
    horsepower: 0,
    transmission: "Automatic",
    hourly_rate: 0,
    images: [] as string[],
    initial_stock: 1,
  })

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await api.api.v1.vehicles.post({
        ...formData,
        horsepower: Number(formData.horsepower),
        hourly_rate: Number(formData.hourly_rate),
        year: Number(formData.year),
        initial_stock: Number(formData.initial_stock),
      } as any)

      if (res.error) throw new Error((res.error.value as any)?.message || JSON.stringify(res.error.value))

      // Invalidate both admin and public caches so lists update immediately
      await queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] })
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] })

      toast.success("Vehicle created successfully")
      router.push("/admin/vehicles")
    } catch (error: any) {
      toast.error(error.message || "Failed to create vehicle")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <EntityForm
      title="Add New Vehicle"
      description="Enter the details for the new racing vehicle."
      backUrl="/admin/vehicles"
      onSubmit={onSubmit}
      isLoading={isLoading}
      submitText="Create Vehicle"
    >
      <div className="space-y-2 pb-4">
        <Label htmlFor="name">Vehicle Name</Label>
        <Input
          id="name"
          placeholder="e.g. Porsche 911 GT3 RS"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            placeholder="e.g. Porsche"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="model_code">Model Code / Version</Label>
          <Input
            id="model_code"
            placeholder="e.g. 992.1 GT3"
            value={formData.model_code}
            onChange={(e) => setFormData({ ...formData, model_code: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="class">Class</Label>
          <Select
            value={formData.class}
            onValueChange={(val) => setFormData({ ...formData, class: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gt">GT</SelectItem>
              <SelectItem value="touring">Touring</SelectItem>
              <SelectItem value="formula">Formula</SelectItem>
              <SelectItem value="drift">Drift</SelectItem>
              <SelectItem value="endurance">Endurance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="transmission">Transmission</Label>
          <Select
            value={formData.transmission}
            onValueChange={(val) => setFormData({ ...formData, transmission: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Automatic">Automatic (PDK/DCT)</SelectItem>
              <SelectItem value="Manual">Manual</SelectItem>
              <SelectItem value="Sequential">Sequential</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="horsepower">Horsepower</Label>
          <Input
            id="horsepower"
            type="number"
            value={formData.horsepower}
            onChange={(e) => setFormData({ ...formData, horsepower: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
          <Input
            id="hourly_rate"
            type="number"
            value={formData.hourly_rate}
            onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="initial_stock">Initial Stock (Number of physical cars)</Label>
        <Input
          id="initial_stock"
          type="number"
          min="1"
          max="50"
          value={formData.initial_stock}
          onChange={(e) => setFormData({ ...formData, initial_stock: Number(e.target.value) })}
          required
        />
        <p className="text-[10px] text-gray-500 italic">
          Tip: This will automatically create multiple individual car records for tracking.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Vehicle Images</Label>
        <ImageUpload
          value={formData.images}
          onChange={(urls) => setFormData({ ...formData, images: urls })}
          subDir="vehicles"
        />
      </div>
    </EntityForm>
  )
}
