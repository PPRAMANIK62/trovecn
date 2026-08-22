"use client";

import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, GripHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ListDetailMorph } from "@/components/trovecn/navigation/list-detail-morph";

const INCIDENTS = [
  {
    id: "inc-418",
    ref: "INC-418",
    title: "Cache stampede at 03:00",
    severity: "Sev 2",
    status: "Resolved",
    duration: "41m",
    detail:
      "Every key in the session cache carried the same TTL, so they all expired in the same second and the miss storm took the origin down with it. Fixed by jittering the TTL by up to 10%. The alert fired four minutes in, which is the part that worked.",
  },
  {
    id: "inc-417",
    ref: "INC-417",
    title: "Regional routing fell back to us-east-1",
    severity: "Sev 3",
    status: "Resolved",
    duration: "2h 14m",
    detail:
      "Requests from eu-west-1 were served from us-east-1 whenever the regional pool saturated, which was silent because nothing in the response said where it had been handled. Every response now carries `x-served-region`.",
  },
  {
    id: "inc-416",
    ref: "INC-416",
    title: "Aborted streams leaked readers",
    severity: "Sev 3",
    status: "Monitoring",
    duration: "6h 02m",
    detail:
      "A client disconnecting mid-stream left the reader open, so memory climbed roughly 40MB an hour on every gateway node. The fix is one `finally` block. The reason it took six hours to find is that the graph looked like a slow leak rather than a per-request one.",
  },
];

/**
 * `value` and `onValueChange` driven entirely from outside, which is what lets
 * something other than a press open the detail: a deep link, a keyboard
 * shortcut, a notification, or the stepper below. The component holds no state
 * of its own in this mode.
 */
export default function ListDetailMorphControlledExample() {
  // Opens on the newest incident rather than closed, so the page shows the
  // detail state without the reader having to press anything first.
  const [value, setValue] = useState<string | null>(INCIDENTS[0].id);
  const index = INCIDENTS.findIndex((incident) => incident.id === value);

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      <div className="h-[320px]">
        <ListDetailMorph value={value} onValueChange={setValue} className="h-full">
          <ListDetailMorph.List label="Incidents">
            {INCIDENTS.map((incident) => (
              <ListDetailMorph.Item key={incident.id} value={incident.id}>
                <div className="flex items-center gap-3 p-3.5">
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {incident.ref}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                    {incident.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {incident.severity}
                  </span>
                </div>
              </ListDetailMorph.Item>
            ))}
          </ListDetailMorph.List>

          <ListDetailMorph.Detail label="Incident detail">
            {(id) => {
              const incident = INCIDENTS.find((item) => item.id === id);
              if (!incident) return null;
              return (
                <>
                  <ListDetailMorph.Handle label="Drag down to go back">
                    <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2">
                      <ListDetailMorph.Close
                        label="Back to incidents"
                        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-fast hover:text-foreground"
                      >
                        <ArrowLeft className="size-3.5" />
                        Incidents
                      </ListDetailMorph.Close>
                      <GripHorizontal className="size-4 shrink-0 text-muted-foreground/60" />
                    </div>
                  </ListDetailMorph.Handle>
                  <div className="px-4 pb-5">
                    <p className="font-mono text-xs text-muted-foreground">{incident.ref}</p>
                    <h3 className="mt-1 text-sm font-medium text-foreground">{incident.title}</h3>
                    <dl className="mt-3 flex gap-5">
                      {[
                        ["Severity", incident.severity],
                        ["Status", incident.status],
                        ["Duration", incident.duration],
                      ].map(([term, description]) => (
                        <div key={term}>
                          <dt className="text-xs text-muted-foreground">{term}</dt>
                          <dd className="mt-0.5 text-sm text-foreground">{description}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {incident.detail}
                    </p>
                  </div>
                </>
              );
            }}
          </ListDetailMorph.Detail>
        </ListDetailMorph>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={index <= 0}
          onClick={() => setValue(INCIDENTS[index - 1].id)}
        >
          <ChevronLeft className="size-3.5" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={index === -1 || index >= INCIDENTS.length - 1}
          onClick={() => setValue(INCIDENTS[index + 1].id)}
        >
          Next
          <ChevronRight className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={() => setValue(value === null ? INCIDENTS[0].id : null)}
        >
          {value === null ? "Open newest" : "Close"}
        </Button>
      </div>
    </div>
  );
}
