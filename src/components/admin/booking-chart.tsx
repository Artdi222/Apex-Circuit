"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts"

interface BookingChartProps {
  dailyData: { date: string; count: number; revenue: number }[]
  statusDistribution: { status: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#D97706",
  confirmed: "#2563EB",
  checked_in: "#7C3AED",
  completed: "#16A34A",
  cancelled: "#DC2626",
  no_show: "#9CA3AF",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  checked_in: "Checked In",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function BookingChart({ dailyData, statusDistribution }: BookingChartProps) {
  const chartData = dailyData.map((d) => ({
    ...d,
    count: Number(d.count),
    revenue: Number(d.revenue),
    label: formatDate(d.date),
  }))

  const pieData = statusDistribution.map((d) => ({
    name: STATUS_LABELS[d.status] || d.status,
    value: Number(d.count),
    fill: STATUS_COLORS[d.status] || "#9CA3AF",
  }))

  const totalBookings = pieData.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Daily Bookings Bar Chart */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Daily Bookings</CardTitle>
          <p className="text-sm text-muted-foreground">Last 30 days booking activity</p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  interval={Math.floor(chartData.length / 6)}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  allowDecimals={false}
                  width={30}
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
                  formatter={(value: any, name: any) => [
                    value,
                    name === "count" ? "Bookings" : name,
                  ]}
                  labelFormatter={(label) => label}
                />
                <Bar
                  dataKey="count"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={16}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === chartData.length - 1 ? "#111827" : "#D1D5DB"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Donut */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Status Distribution</CardTitle>
          <p className="text-sm text-muted-foreground">{totalBookings} total bookings</p>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[180px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`pie-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#111827",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    fontSize: "12px",
                    padding: "6px 10px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-bold">{totalBookings}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="text-xs text-muted-foreground truncate">{entry.name}</span>
                <span className="text-xs font-semibold ml-auto">{entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
