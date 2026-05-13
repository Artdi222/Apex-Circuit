"use client"

import { EntityForm } from "@/components/admin/entity-form"
import { ImageUpload } from "@/components/admin/image-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { api, unwrap } from "@/lib/api"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "@/components/admin/data-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditVehiclePage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [isSaving, setIsSaving] = useState(false)
  
  const { data: vehicleData, isLoading } = useQuery({
    queryKey: ["admin", "vehicles", id],
    queryFn: async () => {
      const res = await api.api.v1.vehicles({ id: id as string }).get()
      if (res.error) throw new Error((res.error.value as any)?.message || JSON.stringify(res.error.value))
      return res.data?.data
    },
    enabled: !!id
  })

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model_code: "",
    year: 2024,
    class: "gt",
    horsepower: 0,
    transmission: "Automatic",
    hourly_rate: 0,
    images: [] as string[],
  })

  useEffect(() => {
    if (vehicleData) {
      const v = vehicleData as any;
      setFormData({
        name: v.name || "",
        brand: v.brand || "",
        model_code: v.model_code || "",
        year: v.year || 2024,
        class: v.class || "gt",
        horsepower: v.horsepower || 0,
        transmission: v.transmission || "Automatic",
        hourly_rate: Number(v.hourly_rate) || 0,
        images: Array.isArray(v.images) ? v.images : [],
      })
    }
  }, [vehicleData])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await api.api.v1.vehicles({ id: id as string }).put({
        ...formData,
        horsepower: Number(formData.horsepower),
        hourly_rate: Number(formData.hourly_rate),
        year: Number(formData.year),
      } as any)

      if (res.error) throw new Error((res.error.value as any)?.message || JSON.stringify(res.error.value))

      await queryClient.invalidateQueries({ queryKey: ["admin", "vehicles"] })
      await queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      await queryClient.invalidateQueries({ queryKey: ["admin", "vehicles", id] })

      toast.success("Vehicle model updated successfully")
    } catch (error: any) {
      toast.error(error.message || "Failed to update vehicle")
    } finally {
      setIsSaving(false)
    }
  }

  const updateInstance = async (instanceId: string, data: any) => {
    try {
      const res = await api.api.v1.vehicles.instances({ id: instanceId }).put(data as any)
      unwrap(res)
      queryClient.invalidateQueries({ queryKey: ["admin", "vehicles", id] })
      toast.success("Unit updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to update instance")
    }
  }

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading vehicle data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{formData.brand} {formData.name}</h1>
          <p className="text-muted-foreground">Manage specifications and individual units.</p>
        </div>
      </div>

      <Tabs defaultValue="specs" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="specs">General Specs</TabsTrigger>
          <TabsTrigger value="units">Individual Units ({vehicleData?.instances?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="specs" className="mt-6">
          <EntityForm
            title="Edit Model Specifications"
            description="Update the general characteristics of this vehicle model."
            backUrl="/admin/vehicles"
            onSubmit={onSubmit}
            isLoading={isSaving}
          >
            <div className="space-y-2 pb-4">
              <Label htmlFor="name">Vehicle Name</Label>
              <Input
                id="name"
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
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model_code">Model Code / Version</Label>
                <Input
                  id="model_code"
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
                    <SelectValue />
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automatic">Automatic</SelectItem>
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
              <Label>Vehicle Images</Label>
              <ImageUpload
                value={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
                subDir="vehicles"
              />
            </div>
          </EntityForm>
        </TabsContent>

        <TabsContent value="units" className="mt-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Fleet Management</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  {
                    header: "Internal ID",
                    accessorKey: "internal_id",
                    cell: (row: any) => (
                      <Input 
                        className="h-8 w-64 text-xs font-mono font-bold"
                        defaultValue={row.internal_id}
                        onBlur={(e) => {
                          if (e.target.value !== row.internal_id) {
                            updateInstance(row.id, { internal_id: e.target.value })
                          }
                        }}
                      />
                    )
                  },
                  {
                    header: "VIN",
                    accessorKey: "vin",
                    cell: (row: any) => (
                      <Input 
                        className="h-8 w-48 text-xs font-mono uppercase"
                        placeholder="Enter VIN"
                        defaultValue={row.vin || ""}
                        onBlur={(e) => {
                          if (e.target.value !== (row.vin || "")) {
                            updateInstance(row.id, { vin: e.target.value })
                          }
                        }}
                      />
                    )
                  },
                  {
                    header: "Mileage (km)",
                    accessorKey: "mileage",
                    cell: (row: any) => (
                      <Input 
                        type="number"
                        className="h-8 w-28 text-xs"
                        defaultValue={row.mileage || 0}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val !== Number(row.mileage)) {
                            updateInstance(row.id, { mileage: val })
                          }
                        }}
                      />
                    )
                  },
                  {
                    header: "Status",
                    cell: (row: any) => (
                      <Select
                        value={row.status}
                        onValueChange={(val) => updateInstance(row.id, { status: val })}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="in_use">In Use</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="retired">Retired</SelectItem>
                        </SelectContent>
                      </Select>
                    )
                  }
                ]}
                data={vehicleData?.instances || []}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
