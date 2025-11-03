import { NextRequest } from "next/server";

const createSecureResponseMock = jest.fn();
const handleApiErrorMock = jest.fn();
const createApiErrorMock = jest.fn((...args: unknown[]) =>
  Object.assign(new Error(String(args[0] ?? "Kalshi error")), {
    status: args[1] ?? 500,
  })
);
const createKalshiHeadersMock = jest.fn(() => ({
  "KALSHI-ACCESS-KEY": "key",
  "KALSHI-ACCESS-SIGNATURE": "signature",
  "KALSHI-ACCESS-TIMESTAMP": "timestamp",
}));
const isKalshiConfiguredMock = jest.fn(() => true);
let handlerRef: (request: NextRequest) => Promise<Response>;

jest.mock("@/lib/middleware", () => ({
  createSecureResponse: (...args: unknown[]) =>
    createSecureResponseMock(...args),
  handleApiError: (...args: unknown[]) => handleApiErrorMock(...args),
  createApiError: (...args: unknown[]) => createApiErrorMock(...args),
  withRateLimit: (handler: any) => {
    handlerRef = handler;
    return handler;
  },
}));

jest.mock("@/lib/utils/kalshi", () => ({
  createKalshiHeaders: (...args: unknown[]) => createKalshiHeadersMock(...args),
  isKalshiConfigured: (...args: unknown[]) => isKalshiConfiguredMock(...args),
}));

import "./route";

describe("Kalshi Markets API Route", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    createSecureResponseMock.mockImplementation(
      (payload) => new Response(JSON.stringify(payload), { status: 200 })
    );
    handleApiErrorMock.mockImplementation(
      (error: unknown) =>
        new Response(JSON.stringify({ success: false, error: String(error) }), {
          status: 500,
        })
    );
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const createRequest = (query = "") =>
    new NextRequest(`http://localhost/api/kalshi/markets${query}`);

  it("returns error when Kalshi credentials missing", async () => {
    isKalshiConfiguredMock.mockReturnValueOnce(false);

    await handlerRef(createRequest());

    expect(createApiErrorMock).toHaveBeenCalledWith(
      "Kalshi credentials not configured",
      503,
      "KALSHI_UNAVAILABLE"
    );
    expect(handleApiErrorMock).toHaveBeenCalled();
  });

  it("fetches Kalshi markets with signed headers", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ markets: [] }),
    });

    await handlerRef(createRequest("?limit=10"));

    expect(createKalshiHeadersMock).toHaveBeenCalledWith(
      "GET",
      "/markets?limit=10"
    );
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "https://api.elections.kalshi.com/trade-api/v2/markets?limit=10"
      ),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ "KALSHI-ACCESS-KEY": "key" }),
      })
    );
    expect(createSecureResponseMock).toHaveBeenCalledWith({
      success: true,
      data: { markets: [] },
    });
  });

  it("handles upstream API errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue("error"),
    });

    await handlerRef(createRequest());

    expect(createApiErrorMock).toHaveBeenCalledWith(
      "Kalshi markets request failed",
      500,
      "KALSHI_UPSTREAM_ERROR",
      "error"
    );
    expect(handleApiErrorMock).toHaveBeenCalled();
  });
});
