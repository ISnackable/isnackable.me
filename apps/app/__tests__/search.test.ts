// @vitest-environment node
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { GraphItem } from "@/lib/files/graph";
import { searchFiles } from "@/lib/files/search";

const drive = {
  accessToken: () => "fixture-token",
  driveId: "my-drive",
  rootId: "my-root",
  rootPath: ["Public"],
};
const network = vi.fn<typeof fetch>();

vi.mock("server-only", () => ({}));
vi.mock("@/env", () => ({ env: {} }));
vi.mock("@/lib/files/connection", () => ({
  openPublishedDrive: () => Promise.resolve(drive),
}));

function result(name: string, parent = "Public/Docs"): GraphItem {
  return {
    file: {},
    id: "result",
    name,
    parentReference: { driveId: drive.driveId, path: `/drive/root:/${parent}` },
  };
}

beforeEach(() => {
  network.mockReset();
  vi.stubGlobal("fetch", network);
  network.mockResolvedValueOnce(
    Response.json({
      folder: {},
      id: drive.rootId,
      name: "Public",
      parentReference: { driveId: drive.driveId, path: "/drive/root:" },
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("scopes native search to the verified folder and accepts only published results", async () => {
  const title = "O'Neil #1.txt";
  network.mockResolvedValueOnce(
    Response.json({
      value: [
        result(title),
        result(title),
        result("sibling.txt", "Publicity"),
        result("outside.txt", "Private/Docs"),
        { ...result("missing-parent.txt"), parentReference: undefined },
        { ...result("shortcut.txt"), remoteItem: {} },
      ],
    })
  );

  await expect(searchFiles("O'Neil #1")).resolves.toEqual({
    entries: [{ kind: "file", name: title, path: ["Docs", title] }],
    hasMore: false,
  });
  expect(network).toHaveBeenCalledTimes(2);
  const url = new URL(String(network.mock.calls[1]?.[0]));
  expect(decodeURIComponent(url.pathname)).toBe(
    "/v1.0/drives/my-drive/items/my-root/search(q='O''Neil #1')"
  );
  expect(url.searchParams.get("$top")).toBe("30");
});

test("large searches return at most 30 verified matches and a refine prompt flag", async () => {
  network.mockResolvedValueOnce(
    Response.json({
      "@odata.nextLink": "https://graph.microsoft.com/next",
      value: Array.from({ length: 31 }, (_, index) =>
        result(`Match ${index}.txt`)
      ),
    })
  );
  const matches = await searchFiles("Match");
  expect(matches.entries).toHaveLength(30);
  expect(matches.hasMore).toBe(true);
  expect(network).toHaveBeenCalledTimes(2);
});

test("search fills incomplete work or school paths in one batch and checks publication scope", async () => {
  const parentReference = { id: "docs", driveId: drive.driveId };
  network
    .mockResolvedValueOnce(
      Response.json({
        value: [
          { ...result("Report.txt"), id: "inside", parentReference },
          { ...result("Private.txt"), id: "outside", parentReference },
        ],
      })
    )
    .mockResolvedValueOnce(
      Response.json({
        responses: [
          {
            id: "outside",
            status: 200,
            body: { ...result("Private.txt", "Private"), id: "outside" },
          },
          {
            id: "inside",
            status: 200,
            body: { ...result("Report.txt"), id: "inside" },
          },
        ],
      })
    );

  await expect(searchFiles("Report")).resolves.toEqual({
    entries: [
      { kind: "file", name: "Report.txt", path: ["Docs", "Report.txt"] },
    ],
    hasMore: false,
  });
  expect(network).toHaveBeenCalledTimes(3);
  const [url, init] = network.mock.calls[2] ?? [];
  expect(String(url)).toBe("https://graph.microsoft.com/v1.0/$batch");
  expect(init?.method).toBe("POST");
  const { requests } = JSON.parse(String(init?.body));
  expect(
    requests.map((request: { url: string }) => request.url.split("?")[0])
  ).toEqual([
    "/drives/my-drive/items/inside",
    "/drives/my-drive/items/outside",
  ]);
});
