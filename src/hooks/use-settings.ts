import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

export interface Setting {
  key: string
  value: any
}

export function useSettings() {
  const { data: settings = [], isLoading, error } = useQuery({
    queryKey: ["public-settings"],
    queryFn: async () => {
      const res = await api.api.v1.settings.public.get()
      if (res.error) throw new Error((res.error.value as any)?.message || "Failed to load settings")
      return (res.data as any)?.data as Setting[]
    },
    // Keep settings for a long time as they don't change often
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  const getSetting = (key: string, defaultValue: any = null) => {
    const setting = settings.find((s) => s.key === key)
    return setting ? setting.value : defaultValue
  }

  return {
    settings,
    isLoading,
    error,
    getSetting,
  }
}
