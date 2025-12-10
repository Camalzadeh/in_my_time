import { getBaseUrl } from "@/lib/data/get-base-url";

jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

import { headers } from "next/headers";

describe("getBaseUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns http://host for localhost", async () => {
    (headers as jest.Mock).mockReturnValue({
      get: () => "localhost:3000",
    });

    const baseUrl = await getBaseUrl();
    expect(baseUrl).toBe("http://localhost:3000");
  });

  test("returns http://host for 127.0.0.1", async () => {
    (headers as jest.Mock).mockReturnValue({
      get: () => "127.0.0.1:5000",
    });

    const baseUrl = await getBaseUrl();
    expect(baseUrl).toBe("http://127.0.0.1:5000");
  });

  test("returns https://host for production domain", async () => {
    (headers as jest.Mock).mockReturnValue({
      get: () => "inmytime.me",
    });

    const baseUrl = await getBaseUrl();
    expect(baseUrl).toBe("https://inmytime.me");
  });

  test("returns empty string when host header is missing", async () => {
    (headers as jest.Mock).mockReturnValue({
      get: () => null,
    });

    const baseUrl = await getBaseUrl();
    expect(baseUrl).toBe("");
  });
});