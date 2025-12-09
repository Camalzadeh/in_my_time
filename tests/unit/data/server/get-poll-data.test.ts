import { getPollDataServer } from "@/lib/data/server/get-poll-data";
import { API_ROUTES } from "@/lib/routes";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

jest.mock("@/lib/data/get-base-url", () => ({
  getBaseUrl: jest.fn(),
}));

global.fetch = jest.fn();

import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/data/get-base-url";

describe("getPollDataServer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns JSON data when response is ok", async () => {
    (getBaseUrl as jest.Mock).mockResolvedValue("https://example.com");
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "123", question: "Test poll?" }),
    });

    const result = await getPollDataServer("123");

    const expectedUrl =
      "https://example.com" + API_ROUTES.POLL_DETAIL_API("123");

    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      cache: "no-store",
    });

    expect(result).toEqual({ id: "123", question: "Test poll?" });
  });

  test("calls notFound() when status is 404", async () => {
    (getBaseUrl as jest.Mock).mockResolvedValue("https://example.com");

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "Not found",
    });

    await getPollDataServer("999").catch(() => {});

    expect(notFound).toHaveBeenCalled();
  });

  test("throws error on other HTTP errors", async () => {
    (getBaseUrl as jest.Mock).mockResolvedValue("https://example.com");

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    await expect(getPollDataServer("123")).rejects.toThrow(
      "Failed to fetch poll data"
    );
  });
});