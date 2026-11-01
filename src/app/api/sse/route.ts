import { NextRequest } from "next/server";
import { sseBroker } from "@/lib/sse-broker";

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial handshake / connected notification
      const initMessage = `data: ${JSON.stringify({
        type: "connected",
        message: "SSE connection established successfully",
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(initMessage));

      // Listener for application-wide ticket events
      const unsubscribe = sseBroker.subscribe((event) => {
        try {
          const payload = `event: ${event.type}\ndata: ${JSON.stringify(
            event.data
          )}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (err) {
          console.error("Error enqueuing SSE event:", err);
        }
      });

      // Keep-alive heartbeat interval every 25 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`: heartbeat ${new Date().toISOString()}\n\n`)
          );
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      // Clean up when client disconnects
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // Stream might already be closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disables response buffering in NGINX
    },
  });
}
