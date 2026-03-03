import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildIdentityKey, resolveSessionParticipant } from "./participant-resolver";

const prismaMock = vi.hoisted(() => ({
  session: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  participant: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  driftEvent: {
    create: vi.fn(),
  },
  $transaction: vi.fn(),
}));

describe("buildIdentityKey", () => {
  it("scopes identity by lounge", () => {
    const key = buildIdentityKey({ loungeId: "Aliethia", rawIdentity: "DeviceA" });
    expect(key).toBe("aliethia:devicea");
  });

  it("adds suffix when forceNew is true", () => {
    const key = buildIdentityKey({ loungeId: "Aliethia", rawIdentity: "DeviceA", forceNew: true });
    expect(key.startsWith("aliethia:devicea:new:")).toBe(true);
  });
});

describe("resolveSessionParticipant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates session + participant when no active session exists", async () => {
    prismaMock.session.findMany.mockResolvedValueOnce([]);
    prismaMock.$transaction.mockImplementationOnce(async (fn: any) =>
      fn({
        session: { create: vi.fn().mockResolvedValue({ id: "sess_new" }) },
        participant: { create: vi.fn().mockResolvedValue({ id: "part_new" }) },
      })
    );

    const result = await resolveSessionParticipant(prismaMock as any, {
      loungeId: "Aliethia",
      tableId: "T-001",
      identityKey: "aliethia:device",
      displayName: "Guest",
    });

    expect(result).toEqual({
      mode: "create",
      sessionId: "sess_new",
      participantId: "part_new",
    });
  });

  it("rejoins existing participant in active session", async () => {
    prismaMock.session.findMany.mockResolvedValueOnce([{ id: "sess_1" }]);
    prismaMock.participant.findFirst.mockResolvedValueOnce({ id: "part_existing" });

    const result = await resolveSessionParticipant(prismaMock as any, {
      loungeId: "Aliethia",
      tableId: "T-001",
      identityKey: "aliethia:device",
    });

    expect(result.mode).toBe("rejoin");
    expect(result.sessionId).toBe("sess_1");
    expect(result.participantId).toBe("part_existing");
    expect(prismaMock.participant.create).not.toHaveBeenCalled();
  });

  it("creates a new participant when notMe is true", async () => {
    prismaMock.session.findMany.mockResolvedValueOnce([{ id: "sess_1" }]);
    prismaMock.participant.create.mockResolvedValueOnce({ id: "part_new_guest" });

    const result = await resolveSessionParticipant(prismaMock as any, {
      loungeId: "Aliethia",
      tableId: "T-001",
      identityKey: "aliethia:device:new:xyz",
      notMe: true,
    });

    expect(result.mode).toBe("join");
    expect(result.sessionId).toBe("sess_1");
    expect(result.participantId).toBe("part_new_guest");
    expect(prismaMock.participant.findFirst).not.toHaveBeenCalled();
  });

  it("blocks and emits drift when multiple active sessions exist", async () => {
    prismaMock.session.findMany.mockResolvedValueOnce([{ id: "sess_1" }, { id: "sess_2" }]);
    prismaMock.driftEvent.create.mockResolvedValueOnce({});

    const result = await resolveSessionParticipant(prismaMock as any, {
      loungeId: "Aliethia",
      tableId: "T-007",
      identityKey: "aliethia:device",
    });

    expect(result.mode).toBe("blocked_multi_active");
    expect(result.conflictSessionIds).toEqual(["sess_1", "sess_2"]);
    expect(prismaMock.driftEvent.create).toHaveBeenCalledTimes(1);
  });
});

