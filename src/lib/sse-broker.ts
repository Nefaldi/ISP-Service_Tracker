import { EventEmitter } from "events";

export type TicketEventType =
  | "ticket:created"
  | "ticket:assigned"
  | "ticket:status_change"
  | "ticket:resolved"
  | "ticket:closed";

export interface TicketSSEPayload {
  ticketId: string;
  ticketNumber?: string;
  title?: string;
  status?: string;
  previousStatus?: string;
  customerId?: string;
  technicianId?: string | null;
  message: string;
  timestamp: string;
}

class SSEBroker extends EventEmitter {
  constructor() {
    super();
    // Allow numerous concurrent listeners (SSE connections)
    this.setMaxListeners(200);
  }

  /**
   * Broadcast an event to all connected clients or filtered by channels
   */
  public broadcast(type: TicketEventType, payload: TicketSSEPayload) {
    this.emit("sse-event", {
      type,
      data: payload,
    });
  }

  /**
   * Subscribe to global ticket events
   */
  public subscribe(
    listener: (event: { type: TicketEventType; data: TicketSSEPayload }) => void
  ) {
    this.on("sse-event", listener);
    return () => {
      this.off("sse-event", listener);
    };
  }
}

// Preserve broker instance across Next.js HMR / module re-evaluations
const globalForSSE = globalThis as unknown as {
  sseBroker: SSEBroker | undefined;
};

export const sseBroker = globalForSSE.sseBroker ?? new SSEBroker();

if (process.env.NODE_ENV !== "production") {
  globalForSSE.sseBroker = sseBroker;
}

export default sseBroker;
