import { getPollStatusClient } from "@/lib/data/client/get-poll-status";
import { API_ROUTES } from "@/lib/routes";

global.fetch = jest.fn();

describe("getPollStatusClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  test("returns status code when fetch succeeds", async () => {
    (fetch as jest.Mock).mockResolvedValue({
      status: 200,
      ok: true,
    });

    const pollId = "123";
    const expectedRoute = API_ROUTES.POLL_DETAIL_API(pollId);

    const status = await getPollStatusClient(pollId);

    expect(fetch).toHaveBeenCalledWith(expectedRoute, {
      method: "HEAD",
      cache: "no-store",
    });

    expect(status).toBe(200);
  });

  test("returns 0 when fetch throws error", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("Network failure"));

    const status = await getPollStatusClient("456");

    expect(status).toBe(0);
  });
});