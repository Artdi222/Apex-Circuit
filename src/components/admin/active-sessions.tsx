"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Clock, User, Car } from "lucide-react"
import { cn } from "@/lib/utils"

interface Session {
  booking_id: string
  checked_in_at: string
  username: string
  email: string
  avatar_url?: string | null
  date: string
  start_time: string
  end_time: string
  slot_type: string
  vehicle_name: string
}

interface ActiveSessionsProps {
  sessions: Session[]
}

function formatTime(timeStr: string) {
  if (!timeStr) return ""
  const parts = timeStr.split(":")
  const hours = Number(parts[0])
  const minutes = parts[1]
  const ampm = hours >= 12 ? "PM" : "AM"
  const h = hours % 12 || 12
  return `${h}:${minutes} ${ampm}`
}

function getTimeElapsed(checkedInAt: string) {
  const checkedIn = new Date(checkedInAt)
  const now = new Date()
  const diffMs = now.getTime() - checkedIn.getTime()
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function getSlotTypeColor(type: string) {
  switch (type) {
    case "exclusive":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "private":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-blue-100 text-blue-800 border-blue-200"
  }
}

export function ActiveSessions({ sessions }: ActiveSessionsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            Live Sessions
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sessions.length} active driver{sessions.length !== 1 ? "s" : ""} on track
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs font-bold",
            sessions.length > 0
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-gray-200 text-gray-500"
          )}
        >
          {sessions.length > 0 ? "LIVE" : "IDLE"}
        </Badge>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Activity className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No active sessions</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Sessions will appear here when drivers check in
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.booking_id}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-50/80 border border-transparent hover:border-gray-200 transition-all group"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 group-hover:bg-white transition-colors">
                    {session.avatar_url ? (
                      <img
                        src={session.avatar_url}
                        alt={session.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      session.username?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {session.username}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] h-5 px-1.5", getSlotTypeColor(session.slot_type))}
                    >
                      {session.slot_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Car className="h-3 w-3" />
                      {session.vehicle_name}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(session.start_time)} – {formatTime(session.end_time)}
                    </span>
                  </div>
                </div>

                {/* Time on track */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900 font-mono">
                    {getTimeElapsed(session.checked_in_at)}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    on track
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
