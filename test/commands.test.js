import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  handleStart,
  handleHelp,
  handlePrivacy,
  handleDev,
} from "../src/commands.js";

// Mock do fetch global
global.fetch = mock(() =>
  Promise.resolve({
    json: async () => ({ ok: true }),
  })
);

describe("Commands", () => {
  beforeEach(() => {
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({
      json: async () => ({ ok: true }),
    });
  });

  const mockEnv = {
    TELEGRAM_TOKEN: "test-token-123",
  };

  describe("handleStart", () => {
    it("deve enviar mensagem de boas-vindas em português", async () => {
      const update = {
        message: {
          chat: { id: 12345 },
          from: { language_code: "pt-br" },
        },
      };

      await handleStart(update, mockEnv);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const callArgs = global.fetch.mock.calls[0];

      expect(callArgs[0]).toContain("sendMessage");
      expect(callArgs[0]).toContain("test-token-123");

      const body = JSON.parse(callArgs[1].body);
      expect(body.chat_id).toBe(12345);
      expect(body.text).toContain("Bem-vindo");
      expect(body.parse_mode).toBe("HTML");
    });

    it("deve enviar mensagem de boas-vindas em inglês", async () => {
      const update = {
        message: {
          chat: { id: 12345 },
          from: { language_code: "en" },
        },
      };

      await handleStart(update, mockEnv);

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.text).toContain("Welcome");
    });
  });

  describe("handleHelp", () => {
    it("deve enviar mensagem de ajuda em português", async () => {
      const update = {
        message: {
          chat: { id: 12345 },
          from: { language_code: "pt" },
        },
      };

      await handleHelp(update, mockEnv);

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.text).toContain("Como usar o bot");
      expect(body.text).toContain("texto");
      expect(body.text).toContain("foto");
    });

    it("deve enviar mensagem de ajuda em inglês", async () => {
      const update = {
        message: {
          chat: { id: 54321 },
          from: { language_code: "en" },
        },
      };

      await handleHelp(update, mockEnv);

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.chat_id).toBe(54321);
      expect(body.text).toContain("How to use");
      expect(body.text).toContain("text");
      expect(body.text).toContain("photo");
    });
  });

  describe("handlePrivacy", () => {
    it("deve enviar mensagem de privacidade com botão em português", async () => {
      const update = {
        message: {
          chat: { id: 12345 },
          from: { language_code: "pt-br" },
        },
      };

      await handlePrivacy(update, mockEnv);

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.text).toContain("não armazena");
      expect(body.reply_markup.inline_keyboard).toBeDefined();
      expect(body.reply_markup.inline_keyboard[0][0].text).toContain("Likn");
      expect(body.reply_markup.inline_keyboard[0][0].url).toContain(
        "privacy.likn.com.br"
      );
    });

    it("deve enviar mensagem de privacidade em inglês", async () => {
      const update = {
        message: {
          chat: { id: 12345 },
          from: { language_code: "en" },
        },
      };

      await handlePrivacy(update, mockEnv);

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.text).toContain("does not store");
      expect(body.reply_markup.inline_keyboard[0][0].text).toContain(
        "Privacy Policy"
      );
    });
  });

  describe("handleDev", () => {
    it("deve enviar informações do desenvolvedor em português", async () => {
      const update = {
        message: {
          chat: { id: 12345 },
          from: { language_code: "pt" },
        },
      };

      await handleDev(update, mockEnv);

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.text).toContain("Desenvolvido");
      expect(body.text).toContain("@RibasSu");
      expect(body.reply_markup.inline_keyboard[0][0].url).toContain(
        "likn.com.br"
      );
    });

    it("deve enviar informações do desenvolvedor em inglês", async () => {
      const update = {
        message: {
          chat: { id: 12345 },
          from: { language_code: "en" },
        },
      };

      await handleDev(update, mockEnv);

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(body.text).toContain("Developed");
      expect(body.text).toContain("@RibasSu");
    });
  });

  describe("Error handling", () => {
    it("deve lidar com erro de rede", async () => {
      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      const update = {
        message: {
          chat: { id: 12345 },
          from: { language_code: "en" },
        },
      };

      await expect(handleStart(update, mockEnv)).rejects.toThrow(
        "Network error"
      );
    });

    it("deve usar token correto do ambiente", async () => {
      const customEnv = {
        TELEGRAM_TOKEN: "custom-token-456",
      };

      const update = {
        message: {
          chat: { id: 99999 },
          from: { language_code: "en" },
        },
      };

      await handleStart(update, customEnv);

      expect(global.fetch.mock.calls[0][0]).toContain("custom-token-456");
    });
  });
});
