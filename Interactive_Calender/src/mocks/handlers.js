import { http, HttpResponse } from "msw";
import { initialEvents } from "../data/initialEvents.js";

export const handlers = [
  http.get("/api/events", () => {
    return HttpResponse.json(initialEvents);
  }),
];
