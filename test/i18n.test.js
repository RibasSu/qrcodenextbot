import { describe, it, expect } from "bun:test";
import { getTranslation, getUserLanguage } from "../src/i18n.js";

describe("i18n", () => {
  describe("getTranslation", () => {
    it("deve retornar tradução em português para pt-br", () => {
      const result = getTranslation("pt-br", "start_message");
      expect(result).toContain("Bem-vindo");
      expect(result).toContain("QR Codes");
    });

    it("deve retornar tradução em português para pt", () => {
      const result = getTranslation("pt", "start_message");
      expect(result).toContain("Bem-vindo");
    });

    it("deve retornar tradução em inglês para en", () => {
      const result = getTranslation("en", "start_message");
      expect(result).toContain("Welcome");
      expect(result).toContain("QR Codes");
    });

    it("deve retornar tradução em inglês para idiomas desconhecidos", () => {
      const result = getTranslation("fr", "start_message");
      expect(result).toContain("Welcome");
    });

    it("deve retornar a chave se tradução não existir", () => {
      const result = getTranslation("en", "nonexistent_key");
      expect(result).toBe("nonexistent_key");
    });

    it("deve retornar todas as traduções principais", () => {
      const keys = [
        "start_message",
        "help_message",
        "privacy_message",
        "dev_message",
        "qrcode_message",
        "error_generate_qrcode",
        "error_read_qrcode",
        "qrcode_content",
      ];

      keys.forEach((key) => {
        const ptResult = getTranslation("pt-br", key);
        const enResult = getTranslation("en", key);

        expect(ptResult).not.toBe(key);
        expect(enResult).not.toBe(key);
        expect(ptResult).not.toBe(enResult);
      });
    });
  });

  describe("getUserLanguage", () => {
    it("deve retornar pt-br para usuário português", () => {
      const update = {
        message: {
          from: {
            language_code: "pt",
          },
        },
      };

      const result = getUserLanguage(update);
      expect(result).toBe("pt-br");
    });

    it("deve retornar pt-br para pt-br", () => {
      const update = {
        message: {
          from: {
            language_code: "pt-br",
          },
        },
      };

      const result = getUserLanguage(update);
      expect(result).toBe("pt-br");
    });

    it("deve retornar en para usuário inglês", () => {
      const update = {
        message: {
          from: {
            language_code: "en",
          },
        },
      };

      const result = getUserLanguage(update);
      expect(result).toBe("en");
    });

    it("deve retornar en para idiomas desconhecidos", () => {
      const update = {
        message: {
          from: {
            language_code: "fr",
          },
        },
      };

      const result = getUserLanguage(update);
      expect(result).toBe("en");
    });

    it("deve retornar en quando language_code estiver ausente", () => {
      const update = {
        message: {
          from: {},
        },
      };

      const result = getUserLanguage(update);
      expect(result).toBe("en");
    });

    it("deve retornar en quando update for inválido", () => {
      const result = getUserLanguage({});
      expect(result).toBe("en");
    });
  });
});
