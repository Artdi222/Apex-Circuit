"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatsCard } from "@/components/admin/stats-card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { BookingChart } from "@/components/admin/booking-chart";
import { ActiveSessions } from "@/components/admin/active-sessions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Calendar,
  Users,
  Activity,
  TrendingUp,
  Car,
  Gauge,
} from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      const res = await api.api.v1.analytics.get();
      if (res.error)
        throw new Error(
          (res.error.value as any)?.message || "Failed to load dashboard",
        );
      return (res.data as any)?.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Loading dashboard data...
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-red-500 mt-1">
            Failed to load dashboard: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const revenueOverview = data?.revenueOverview || {};
  const monthlyRevenue = data?.monthlyRevenue || [];
  const dailyBookings = data?.dailyBookings || [];
  const statusDistribution = data?.statusDistribution || [];
  const activeSessions = data?.activeSessions || [];
  const topVehicles = data?.topVehicles || [];
  const capacity = data?.capacityUtilization || {};

  const bookingsGrowth =
    Number(stats.bookings_last_month) > 0
      ? ((Number(stats.bookings_this_month) -
          Number(stats.bookings_last_month)) /
          Number(stats.bookings_last_month)) *
        100
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Performance metrics and operational insights
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          Auto-refreshing • 30s
        </Badge>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(Number(revenueOverview.total_revenue || 0))}
          description="All time"
          icon={DollarSign}
          trend={{
            value: Number(
              Number(revenueOverview.last_month) > 0
                ? ((Number(revenueOverview.this_month) -
                    Number(revenueOverview.last_month)) /
                    Number(revenueOverview.last_month)) *
                    100
                : 0,
            ),
            label: "vs last month",
            isPositive:
              Number(revenueOverview.this_month) >=
              Number(revenueOverview.last_month),
          }}
        />
        <StatsCard
          title="Bookings This Month"
          value={stats.bookings_this_month || 0}
          description="Active reservations"
          icon={Calendar}
          trend={{
            value: Math.abs(Math.round(bookingsGrowth)),
            label: "vs last month",
            isPositive: bookingsGrowth >= 0,
          }}
        />
        <StatsCard
          title="Active Users"
          value={stats.total_users || 0}
          description={`${stats.new_users_this_month || 0} new this month`}
          icon={Users}
          trend={{
            value: stats.new_users_this_month || 0,
            label: "new users",
            isPositive: true,
          }}
        />
        <StatsCard
          title="Capacity Utilization"
          value={`${Number(capacity.avg_utilization_pct || 0).toFixed(0)}%`}
          description={`${capacity.total_booked || 0} / ${capacity.total_capacity || 0} slots`}
          icon={Gauge}
          trend={{
            value: Number(Number(capacity.avg_utilization_pct || 0).toFixed(0)),
            label: "avg fill rate",
            isPositive: Number(capacity.avg_utilization_pct || 0) > 50,
          }}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart data={monthlyRevenue} overview={revenueOverview} />

      {/* Booking Charts */}
      <BookingChart
        dailyData={dailyBookings}
        statusDistribution={statusDistribution}
      />

      {/* Bottom Section: Active Sessions + Top Vehicles */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Sessions */}
        <ActiveSessions sessions={activeSessions} />

        {/* Top Vehicles */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Car className="h-4 w-4 text-gray-500" />
              Top Vehicles
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Most booked vehicles by count
            </p>
          </CardHeader>
          <CardContent>
            {topVehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Car className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No vehicle booking data yet
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topVehicles.map((vehicle: any, index: number) => {
                  const maxCount = topVehicles[0]?.booking_count || 1;
                  const widthPercent =
                    (Number(vehicle.booking_count) / maxCount) * 100;

                  return (
                    <div key={vehicle.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground w-5">
                            #{index + 1}
                          </span>
                          <span className="text-sm font-medium truncate">
                            {vehicle.name}
                          </span>
                          {vehicle.model_name && (
                            <span className="text-xs text-muted-foreground">
                              {vehicle.model_name}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-bold">
                            {vehicle.booking_count}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            bookings
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full transition-all duration-500"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
