import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import worker from "../src/worker.js";

// Mock global fetch
const originalFetch = global.fetch;

describe("Worker", () => {
  beforeEach(() => {
    global.fetch = mock(() =>
      Promise.resolve({
        json: async () => ({ ok: true }),
        arrayBuffer: async () => new ArrayBuffer(8),
        ok: true,
      })
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockEnv = {
    TELEGRAM_TOKEN: "test-token",
    URL_PAGE: "https://test.workers.dev",
  };

  describe("GET / - QR Code generation endpoint", () => {
    it("deve gerar QR Code com parâmetro text", async () => {
      const request = new Request(
        "https://test.workers.dev/?text=Hello+World",
        {
          method: "GET",
        }
      );

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("image/png");
    });

    it("deve retornar erro 400 se text não for fornecido", async () => {
      const request = new Request("https://test.workers.dev/", {
        method: "GET",
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toContain("required");
    });

    it("deve ter cache headers no QR Code gerado", async () => {
      const request = new Request("https://test.workers.dev/?text=test", {
        method: "GET",
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.headers.get("Cache-Control")).toBe(
        "public, max-age=3600"
      );
    });
  });

  describe("POST /webhook - Telegram webhook", () => {
    it("deve processar comando /start", async () => {
      const update = {
        message: {
          text: "/start",
          chat: { id: 12345 },
          from: { language_code: "en" },
        },
      };

      const request = new Request("https://test.workers.dev/webhook", {
        method: "POST",
        body: JSON.stringify(update),
        headers: { "Content-Type": "application/json" },
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(200);
      expect(await response.text()).toBe("OK");
      expect(global.fetch).toHaveBeenCalled();
    });

    it("deve processar comando /help", async () => {
      const update = {
        message: {
          text: "/help",
          chat: { id: 12345 },
          from: { language_code: "pt" },
        },
      };

      const request = new Request("https://test.workers.dev/webhook", {
        method: "POST",
        body: JSON.stringify(update),
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(200);
      expect(global.fetch).toHaveBeenCalled();
    });

    it("deve gerar QR Code para mensagem de texto", async () => {
      const update = {
        message: {
          text: "https://example.com",
          chat: { id: 12345 },
          from: { language_code: "en" },
        },
      };

      const request = new Request("https://test.workers.dev/webhook", {
        method: "POST",
        body: JSON.stringify(update),
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(200);
    });

    it("deve processar foto com QR Code", async () => {
      global.fetch = mock((url) => {
        if (typeof url === "string" && url.includes("getFile")) {
          return Promise.resolve({
            json: async () => ({
              ok: true,
              result: { file_path: "photos/file.jpg" },
            }),
          });
        }
        if (typeof url === "string" && url.includes("file/bot")) {
          return Promise.resolve({
            arrayBuffer: async () => new ArrayBuffer(100),
          });
        }
        return Promise.resolve({
          json: async () => ({ ok: true }),
        });
      });

      const update = {
        message: {
          photo: [{ file_id: "small-photo" }, { file_id: "large-photo" }],
          chat: { id: 12345 },
          from: { language_code: "en" },
        },
      };

      const request = new Request("https://test.workers.dev/webhook", {
        method: "POST",
        body: JSON.stringify(update),
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(200);
    });

    it("deve ignorar updates sem mensagem", async () => {
      const update = {
        update_id: 12345,
      };

      const request = new Request("https://test.workers.dev/webhook", {
        method: "POST",
        body: JSON.stringify(update),
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(200);
    });

    it("deve retornar 500 em caso de erro no processamento", async () => {
      const request = new Request("https://test.workers.dev/webhook", {
        method: "POST",
        body: "invalid-json",
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(500);
    });
  });

  describe("GET /setWebhook - Configure webhook", () => {
    it("deve configurar webhook do Telegram", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          json: async () => ({
            ok: true,
            result: true,
            description: "Webhook was set",
          }),
        })
      );

      const request = new Request("https://test.workers.dev/setWebhook", {
        method: "GET",
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.ok).toBe(true);
    });

    it("deve usar URL correto para webhook", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          json: async () => ({ ok: true }),
        })
      );

      const request = new Request("https://my-worker.workers.dev/setWebhook", {
        method: "GET",
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(200);
    });
  });

  describe("Fallback route", () => {
    it("deve retornar mensagem padrão para rotas desconhecidas", async () => {
      const request = new Request("https://test.workers.dev/unknown", {
        method: "GET",
      });

      const response = await worker.fetch(request, mockEnv, {});

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toContain("QR Code Bot");
    });
  });

  describe("Environment variables", () => {
    it("deve usar URL_PAGE do ambiente", async () => {
      const customEnv = {
        TELEGRAM_TOKEN: "token",
        URL_PAGE: "https://custom-url.com",
      };

      const update = {
        message: {
          text: "test message",
          chat: { id: 12345 },
          from: { language_code: "en" },
        },
      };

      const request = new Request("https://test.workers.dev/webhook", {
        method: "POST",
        body: JSON.stringify(update),
      });

      const response = await worker.fetch(request, customEnv, {});

      expect(response.status).toBe(200);
    });

    it("deve usar URL padrão se URL_PAGE não estiver definido", async () => {
      const envWithoutUrl = {
        TELEGRAM_TOKEN: "token",
      };

      const update = {
        message: {
          text: "test",
          chat: { id: 12345 },
          from: { language_code: "en" },
        },
      };

      const request = new Request("https://test.workers.dev/webhook", {
        method: "POST",
        body: JSON.stringify(update),
      });

      const response = await worker.fetch(request, envWithoutUrl, {});

      expect(response.status).toBe(200);
    });
  });
});
