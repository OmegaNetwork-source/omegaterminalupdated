import { NextRequest } from "next/server";

const createSecureResponseMock = jest.fn();
const handleApiErrorMock = jest.fn();
let capturedHandler: (request: NextRequest) => Promise<Response>;

jest.mock("@/lib/middleware", () => ({
  createSecureResponse: (...args: unknown[]) =>
    createSecureResponseMock(...args),
  handleApiError: (...args: unknown[]) => handleApiErrorMock(...args),
  withRateLimit: (handler: any) => {
    capturedHandler = handler;
    return handler;
  },
}));

jest.mock("@/lib/validation", () => ({
  validateRequest: jest.fn((schema, data) => {
    try {
      schema.parse(data);
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.errors?.[0]?.message ?? "Invalid" };
    }
  }),
}));

// Import after mocks so capturedHandler is assigned
import "./route";

describe("Jupiter Quote API Route", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    createSecureResponseMock.mockImplementation(
      (payload, status) => new Response(JSON.stringify(payload), { status })
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

  const createRequest = (body: unknown) =>
    NextRequest.from(
      new Request("http://localhost/api/jupiter/quote", {
        method: "POST",
        body: JSON.stringify(body),
      })
    );

  it("validates request body", async () => {
    const request = createRequest({});
    await capturedHandler(request);

    expect(createSecureResponseMock).toHaveBeenCalledWith(
      expect.objectContaining({ success: false }),
      400,
      undefined,
      { maxAge: 0 }
    );
  });

  it("fetches quote from Jupiter API", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ quote: "data" }),
    });

    const body = {
      inputMint: "mintA",
      outputMint: "mintB",
      amount: "1000",
      slippageBps: 50,
    };

    await capturedHandler(createRequest(body));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://quote-api.jup.ag/v6/quote?"),
      expect.objectContaining({ method: "GET" })
    );
    expect(createSecureResponseMock).toHaveBeenCalledWith(
      { success: true, data: { quote: "data" } },
      200,
      undefined,
      { maxAge: 10, staleWhileRevalidate: 20 }
    );
  });

  it("handles Jupiter API errors", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      text: jest.fn().mockResolvedValue("error"),
    });

    await capturedHandler(
      createRequest({ inputMint: "a", outputMint: "b", amount: "1000" })
    );

    expect(handleApiErrorMock).toHaveBeenCalled();
  });
});
