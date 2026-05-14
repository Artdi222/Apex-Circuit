"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useSettings } from "@/hooks/use-settings"
import { useEffect } from "react"

interface AddSlotValues {
  date: Date
  start_time: string
  end_time: string
  slot_type: "open" | "exclusive" | "maintenance"
  max_capacity: number
}

const addSlotSchema = z.object({
  date: z.date({
    message: "A date is required.",
  }),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be in HH:MM format"),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be in HH:MM format"),
  slot_type: z.enum(["open", "exclusive", "maintenance"]),
  max_capacity: z.number().min(1).max(50),
}).superRefine((data, ctx) => {
  const [startH, startM] = data.start_time.split(':').map(Number);
  const [endH, endM] = data.end_time.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  if (endTotal <= startTotal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
      path: ["end_time"],
    });
  }
})

export function AddSlotDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AddSlotValues) => Promise<void>
  isLoading: boolean
}) {
  const { getSetting } = useSettings();
  const defaultCapacity = getSetting('schedule.default_max_capacity', 6);
  const defaultStartTime = getSetting('schedule.default_start_time', '09:00');
  const defaultEndTime = getSetting('schedule.default_end_time', '10:00');
  const defaultDuration = getSetting('schedule.default_slot_duration_minutes', 60);

  const form = useForm<AddSlotValues>({
    resolver: zodResolver(addSlotSchema),
    defaultValues: {
      date: new Date(),
      start_time: defaultStartTime,
      end_time: defaultEndTime,
      slot_type: "open",
      max_capacity: defaultCapacity,
    },
  })

  // Update default values when settings load
  useEffect(() => {
    form.reset({
      ...form.getValues(),
      max_capacity: defaultCapacity,
      start_time: defaultStartTime,
      end_time: defaultEndTime,
    });
  }, [defaultCapacity, defaultStartTime, defaultEndTime]);

  const handleStartTimeChange = (startTime: string) => {
    form.setValue('start_time', startTime);
    
    // Auto-calculate end time based on duration
    try {
      const [hours, mins] = startTime.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(mins)) {
        const totalMins = hours * 60 + mins + defaultDuration;
        const endH = Math.floor(totalMins / 60) % 24;
        const endM = totalMins % 60;
        const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        form.setValue('end_time', endTimeStr);
      }
    } catch (e) {
      // Ignore invalid time format
    }
  };

  async function onFormSubmit(values: AddSlotValues) {
    await onSubmit(values)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Schedule Slot</DialogTitle>
          <DialogDescription>
            Create a single time slot for the track.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => field.onChange(date)}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={defaultStartTime} 
                        {...field} 
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input placeholder={defaultEndTime} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="slot_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slot Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select slot type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open">Open Track</SelectItem>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Capacity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" loading={isLoading} className="bg-black text-white hover:bg-gray-800">
                Create Slot
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface GenerateSlotsValues {
  date_from: Date
  date_to: Date
  start_time: string
  end_time: string
  slot_duration_minutes: number
  slot_type: "open" | "exclusive" | "maintenance"
  max_capacity: number
  days_of_week: number[]
}

const generateSlotsSchema = z.object({
  date_from: z.date({
    message: "Start date is required.",
  }),
  date_to: z.date({
    message: "End date is required.",
  }),
  start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be in HH:MM format"),
  end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Must be in HH:MM format"),
  slot_duration_minutes: z.number().min(30).max(480),
  slot_type: z.enum(["open", "exclusive", "maintenance"]),
  max_capacity: z.number().min(1).max(50),
  days_of_week: z.array(z.number()).min(1, "Select at least one day"),
}).superRefine((data, ctx) => {
  const [startH, startM] = data.start_time.split(':').map(Number);
  const [endH, endM] = data.end_time.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const windowDuration = endTotal - startTotal;

  if (windowDuration <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be after start time",
      path: ["end_time"],
    });
  }

  if (data.slot_duration_minutes > windowDuration) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Duration (${data.slot_duration_minutes}m) cannot be longer than the time window (${windowDuration}m)`,
      path: ["slot_duration_minutes"],
    });
  }
})

export function GenerateSlotsDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: GenerateSlotsValues) => Promise<void>
  isLoading: boolean
}) {
  const { getSetting } = useSettings();
  const defaultDuration = getSetting('schedule.default_slot_duration_minutes', 60);
  const defaultCapacity = getSetting('schedule.default_max_capacity', 6);
  const defaultStartTime = getSetting('schedule.default_start_time', '08:00');
  const defaultEndTime = getSetting('schedule.default_end_time', '17:00');

  const form = useForm<GenerateSlotsValues>({
    resolver: zodResolver(generateSlotsSchema),
    defaultValues: {
      date_from: new Date(),
      date_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      start_time: defaultStartTime,
      end_time: defaultEndTime,
      slot_duration_minutes: defaultDuration,
      slot_type: "open",
      max_capacity: defaultCapacity,
      days_of_week: [1, 2, 3, 4, 5],
    },
  })

  useEffect(() => {
    form.reset({
      ...form.getValues(),
      slot_duration_minutes: defaultDuration,
      max_capacity: defaultCapacity,
      start_time: defaultStartTime,
      end_time: defaultEndTime,
    });
  }, [defaultDuration, defaultCapacity, defaultStartTime, defaultEndTime]);

  async function onFormSubmit(values: GenerateSlotsValues) {
    await onSubmit(values)
    form.reset()
  }

  const days = [
    { label: "Sun", value: 0 },
    { label: "Mon", value: 1 },
    { label: "Tue", value: 2 },
    { label: "Wed", value: 3 },
    { label: "Thu", value: 4 },
    { label: "Fri", value: 5 },
    { label: "Sat", value: 6 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Weekly Schedule</DialogTitle>
          <DialogDescription>
            Automatically create multiple slots for a date range.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_from"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>From Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_to"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>To Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date)}
                          disabled={(date) =>
                            date < form.getValues("date_from")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Start Time</FormLabel>
                    <FormControl>
                      <Input placeholder={defaultStartTime} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily End Time</FormLabel>
                    <FormControl>
                      <Input placeholder={defaultEndTime} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="slot_duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (mins)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity per Slot</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slot_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Slot Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select slot type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="open">Open Track</SelectItem>
                      <SelectItem value="exclusive">Exclusive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="days_of_week"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Days of Week</FormLabel>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {days.map((day) => (
                      <div
                        key={day.value}
                        className="flex flex-row items-start space-x-2 space-y-0"
                      >
                        <Checkbox
                          id={`day-${day.value}`}
                          checked={field.value?.includes(day.value)}
                          onCheckedChange={(checked: boolean | "indeterminate") => {
                            const value = field.value || []
                            return checked
                              ? field.onChange([...value, day.value])
                              : field.onChange(
                                  value.filter(
                                    (v: number) => v !== day.value
                                  )
                                )
                          }}
                        />
                        <FormLabel 
                          htmlFor={`day-${day.value}`}
                          className="font-normal cursor-pointer"
                        >
                          {day.label}
                        </FormLabel>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" loading={isLoading} className="bg-black text-white hover:bg-gray-800 w-full">
                Generate Slots
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
