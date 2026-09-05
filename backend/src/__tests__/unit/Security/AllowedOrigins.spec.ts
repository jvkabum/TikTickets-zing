import { getAllowedOrigins } from "../../../config/allowedOrigins";

describe("getAllowedOrigins", () => {
  it("rejeita wildcard, null e origens inválidas", () => {
    expect(
      getAllowedOrigins(
        "https://autotick.com.br, https://evil.example/path, *, null, https://autotick.com.br"
      )
    ).toEqual(["https://autotick.com.br"]);
  });
});
