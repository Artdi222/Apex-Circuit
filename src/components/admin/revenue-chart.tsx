"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"

interface RevenueChartProps {
  data: { month: string; revenue: number; bookings_count: number }[]
  overview?: {
    total_revenue: number
    this_month: number
    last_month: number
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatMonth(dateStr: string) {
  const [year, month] = dateStr.split("-")
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString("en-US", { month: "short" })
}

export function RevenueChart({ data, overview }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    revenue: Number(d.revenue),
    label: formatMonth(d.month),
  }))

  const percentChange =
    overview && Number(overview.last_month) > 0
      ? ((Number(overview.this_month) - Number(overview.last_month)) /
          Number(overview.last_month)) *
        100
      : 0

  const isPositive = percentChange >= 0

  return (
    <Card className="col-span-full lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">Monthly revenue trend</p>
        </div>
        {overview && (
          <div className="text-right">
            <p className="text-2xl font-bold tracking-tight">
              {formatCurrency(Number(overview.this_month))}
            </p>
            <div className="flex items-center justify-end gap-1 mt-0.5">
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {percentChange.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#111827" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#111827" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  fontSize: "12px",
                  padding: "8px 12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
                formatter={(value: any) => [formatCurrency(value as number), "Revenue"]}
                labelFormatter={(label) => label}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#111827"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{
                  r: 4,
                  stroke: "#111827",
                  strokeWidth: 2,
                  fill: "white",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
