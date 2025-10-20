import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

// Define handlers for API endpoints
export const handlers = [
  // Auth endpoints
  http.post("/api/auth/login", () => {
    return HttpResponse.json({ success: true });
  }),

  http.post("/api/auth/signup", () => {
    return HttpResponse.json({ success: true });
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ success: true });
  }),

  // Analysis endpoint
  http.post("/api/analyze", () => {
    return HttpResponse.json({
      correctedText: "This is corrected text.",
      explanations: [
        {
          original: "This is a text",
          corrected: "This is corrected text",
          explanation: "Grammar correction example",
          type: "grammar",
        },
      ],
    });
  }),

  // Learning items endpoints
  http.get("/api/learning-items", () => {
    return HttpResponse.json({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });
  }),

  http.post("/api/learning-items", () => {
    return HttpResponse.json({
      id: "1",
      originalText: "Original text",
      correctedText: "Corrected text",
      explanations: [],
      createdAt: new Date().toISOString(),
    });
  }),

  http.delete("/api/learning-items/:id", () => {
    return HttpResponse.json({ success: true });
  }),
];

// Setup MSW server
export const server = setupServer(...handlers);
