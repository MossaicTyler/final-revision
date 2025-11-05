import { MapPin } from "lucide-react"

export function TrackingTimeline({ events }: { events: any[] }) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-primary/10 p-2">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            {index < events.length - 1 && <div className="w-px h-full bg-border/40 my-2" />}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium">{event.status}</p>
            {event.location && <p className="text-xs text-muted-foreground mt-1">{event.location}</p>}
            {event.description && <p className="text-xs text-muted-foreground mt-1">{event.description}</p>}
            <p className="text-xs text-muted-foreground mt-2">
              {new Date(event.event_time).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
