import { Hono } from "hono";
import { cache } from "hono/cache";
import { cors } from "hono/cors";

const app = new Hono();

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed

  return `${year}-${month}-${day}`;
}

app.use(
  "/",
  cors({
    origin: [
      "https://wordle.inmeta.site",
      "https://inmeta.app",
      // For development 😉
      "http://localhost:3000",
    ],
    allowMethods: ["GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
  })
);

app.get(
  "/",
  cache({
    cacheName: "wordle",
    cacheControl: "max-age=600",
  })
);

app.get("/", async (c) => {
  const wordleUrl = `https://www.nytimes.com/svc/wordle/v2/${formatTimestamp(
    Date.now()
  )}.json`;

  try {
    const response = await fetch(wordleUrl);
    const data: {
      id: number;
      solution: string;
      print_date: string;
      days_since_launch: number;
      editor: string;
    } = await response.json();
    return c.json(data);
  } catch (error) {
    c.status(500);
    return c.json({ error: "Internal Server Error" });
  }
});

export default app;
