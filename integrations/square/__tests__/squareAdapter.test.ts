import { SquareAdapter } from "../squareAdapter";

describe("SquareAdapter", () => {
  let adapter: SquareAdapter;

  beforeEach(() => {
    adapter = new SquareAdapter({ accessToken: "test", locationId: "L1" });
  });

  test("sessionStart returns posId with sq_ prefix", async () => {
    const result = await adapter.sessionStart({ 
      id: "sess_demo", 
      table: "T-1", 
      lines: [] 
    });
    expect(result.posId).toMatch(/^sq_/);
  });

  test("sessionUpdate completes without error", async () => {
    await expect(adapter.sessionUpdate("sq_123", {
      id: "sess_demo",
      table: "T-1",
      lines: []
    })).resolves.toBeUndefined();
  });

  test("syncBill returns OK status", async () => {
    const result = await adapter.syncBill("sq_123", {
      id: "sess_demo",
      table: "T-1",
      lines: []
    });
    expect(result.status).toBe("OK");
  });

  test("closeBill returns receiptUrl", async () => {
    const result = await adapter.closeBill("sq_123");
    expect(result).toHaveProperty("receiptUrl");
  });

  test("refund returns refundId with rf_ prefix", async () => {
    const result = await adapter.refund("sq_123", 1500, "Customer request");
    expect(result.refundId).toMatch(/^rf_/);
  });
});
