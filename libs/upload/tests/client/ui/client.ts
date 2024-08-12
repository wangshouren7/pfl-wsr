import { EUploadClientState, IUploadClientActions } from "@client/types";
import { UploadClient } from "@client/ui/client";
import { filter, firstValueFrom } from "rxjs";
import { expectTime, nameOf } from "../../test-utils";

vi.mock("@client/workers/calculate-hash", () => {
  return {
    calculateChunksHashByWorker(
      chunks: Blob[],
      onProgress?: (percentage: number) => void,
    ): Promise<string> {
      return Promise.resolve("hash");
    },
  };
});

function createClientTestUtils(
  partialActions: Partial<IUploadClientActions> = {},
) {
  const file = new File(["hello world"], "test.name");
  const actions: IUploadClientActions = {
    async chunkExists(hash, index) {
      return false;
    },
    async uploadChunk(formData) {
      return;
    },
    async fileExists() {
      return false;
    },
    async merge(hash) {
      return;
    },
    async getLastExistedChunkIndex() {
      return -1;
    },
    ...partialActions,
  };
  const client = new UploadClient(file, actions);

  const stateObserver = vi.fn();
  client.state$.subscribe(stateObserver);

  const errorObserver = vi.fn();
  client.error$.subscribe(errorObserver);

  return {
    client,
    waitState: async (targetState: EUploadClientState) => {
      await firstValueFrom(
        client.state$.pipe(filter((state) => state === targetState)),
      );
    },
    expectStateSequence: (expectedStateSequence: EUploadClientState[]) => {
      expect(stateObserver).toHaveBeenCalledTimes(expectedStateSequence.length);
      expectedStateSequence.forEach((state, index) => {
        expect(stateObserver).toHaveBeenNthCalledWith(index + 1, state);
      });
    },
    expectError: (expectedError: Error) => {
      expect(errorObserver).toHaveBeenCalledWith(expectedError);
    },
    expectProgress: (expectedProgress: number) => {
      expect(client.progress$.value).toBe(expectedProgress);
    },
  };
}

describe(UploadClient.name, () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  test("normal upload", async () => {
    const { client, expectStateSequence, waitState } = createClientTestUtils();

    client.start();
    await waitState(UploadClient.EState.WaitForUpload);
    client.startPool();
    await waitState(UploadClient.EState.UploadSuccessfully);

    const expectedStateSequence = [
      UploadClient.EState.Default,
      UploadClient.EState.CalculatingHash,
      UploadClient.EState.CheckingFileExists,
      UploadClient.EState.WaitForUpload,
      UploadClient.EState.Uploading,
      UploadClient.EState.Merging,
      UploadClient.EState.UploadSuccessfully,
    ];
    expectStateSequence(expectedStateSequence);
  });

  test("auto upload", async () => {
    const { client, waitState, expectStateSequence } = createClientTestUtils();

    const autoUpload = true;
    client.start(autoUpload);
    await waitState(UploadClient.EState.UploadSuccessfully);
    expectStateSequence([
      UploadClient.EState.Default,
      UploadClient.EState.CalculatingHash,
      UploadClient.EState.CheckingFileExists,
      UploadClient.EState.Uploading,
      UploadClient.EState.Merging,
      UploadClient.EState.UploadSuccessfully,
    ]);
  });

  test("fast upload", async () => {
    const { client, waitState, expectStateSequence } = createClientTestUtils({
      fileExists: async () => true,
    });

    client.start();
    await waitState(UploadClient.EState.UploadSuccessfully);
    expectStateSequence([
      UploadClient.EState.Default,
      UploadClient.EState.CalculatingHash,
      UploadClient.EState.CheckingFileExists,
      UploadClient.EState.UploadSuccessfully,
    ]);
  });

  describe(nameOf<UploadClient>("progress$"), () => {
    test("normal upload", async () => {
      const { client, waitState, expectProgress } = createClientTestUtils();
      expectProgress(0);

      client.start();

      await waitState(UploadClient.EState.CheckingFileExists);
      expectProgress(0);

      await waitState(UploadClient.EState.WaitForUpload);
      expectProgress(0);

      client.startPool();

      await waitState(UploadClient.EState.Merging);
      expectProgress(100);

      await waitState(UploadClient.EState.UploadSuccessfully);
      expectProgress(100);
    });

    test("fast uploaded", async () => {
      const { client, waitState, expectProgress } = createClientTestUtils({
        fileExists: async () => true,
      });

      expectProgress(0);

      client.start();

      await waitState(UploadClient.EState.CheckingFileExists);
      expectProgress(0);

      await waitState(UploadClient.EState.UploadSuccessfully);
      expectProgress(100);
    });
  });

  test(nameOf<UploadClient>("destroy"), async () => {
    const { client, waitState } = createClientTestUtils({});

    client.start(true);
    await waitState(UploadClient.EState.Uploading);

    const completeFn = vi.fn();

    client.state$.subscribe({
      complete: completeFn,
    });
    client.progress$.subscribe({
      complete: completeFn,
    });
    client.error$.subscribe({
      complete: completeFn,
    });
    client.destroy();

    expect(completeFn).toHaveBeenCalledTimes(3);
  });

  test("UploadSuccessfully state should wait for merging", async () => {
    const delay = (ms: number) => new Promise<void>((rs) => setTimeout(rs, ms));
    const { client, waitState } = createClientTestUtils({
      merge: () => delay(100),
    });

    client.start(true);
    await waitState(UploadClient.EState.Merging);
    vi.advanceTimersByTime(100);
    await waitState(UploadClient.EState.UploadSuccessfully);
  });

  test("restart", async () => {
    const { client, waitState, expectStateSequence } = createClientTestUtils({
      merge: async () => {
        throw new Error();
      },
    });

    client.start(true);
    await waitState(UploadClient.EState.Error);

    expectStateSequence([
      UploadClient.EState.Default,
      UploadClient.EState.CalculatingHash,
      UploadClient.EState.CheckingFileExists,
      UploadClient.EState.Uploading,
      UploadClient.EState.Merging,
      UploadClient.EState.Error,
    ]);

    client.restart(true);
    expect(client.progress$.value).toBe(0);
    expect(client.state$.value).toBe(EUploadClientState.Default);
  });

  test("should get hash when upload successfully", async () => {
    const { client, waitState } = createClientTestUtils();

    client.start(true);
    await waitState(UploadClient.EState.UploadSuccessfully);

    expect(client.hash).toBeTypeOf("string");
  });

  test(nameOf<UploadClient>("toJSON"), async () => {
    const { client, waitState } = createClientTestUtils();
    expect(client.toJSON()).toEqual({
      chunkSize: expect.any(Number),
      concurrency: expect.any(Number),
      hash: "",
      name: expect.any(String),
      poolElapse: expect.any(Number),
      size: expect.any(Number),
      state: EUploadClientState.Default,
    });

    client.start(true);
    await waitState(UploadClient.EState.UploadSuccessfully);
    expect(client.toJSON()).toEqual({
      chunkSize: expect.any(Number),
      concurrency: expect.any(Number),
      hash: "hash",
      name: expect.any(String),
      poolElapse: expect.any(Number),
      size: expect.any(Number),
      state: EUploadClientState.UploadSuccessfully,
    });
  });

  describe(nameOf<UploadClient>("finisher"), () => {
    const doTest = async (
      client: UploadClient,
      waitState: (targetState: EUploadClientState) => Promise<void>,
    ) => {
      client.finisher = () => new Promise((rs) => setTimeout(rs, 1000));

      const now = Date.now();

      client.start(true);
      await waitState(EUploadClientState.Finishing);
      await vi.runOnlyPendingTimersAsync();
      await waitState(EUploadClientState.UploadSuccessfully);

      const elapsed = Date.now() - now;

      expectTime(elapsed, 1000);
    };

    test("normal upload", async () => {
      const { client, waitState, expectStateSequence } =
        createClientTestUtils();

      await doTest(client, waitState);

      expectStateSequence([
        EUploadClientState.Default,
        EUploadClientState.CalculatingHash,
        EUploadClientState.CheckingFileExists,
        EUploadClientState.Uploading,
        EUploadClientState.Merging,
        EUploadClientState.Finishing,
        EUploadClientState.UploadSuccessfully,
      ]);
    });

    test("fast upload", async () => {
      const { client, waitState, expectStateSequence } = createClientTestUtils({
        fileExists: async () => true,
      });
      await doTest(client, waitState);

      expectStateSequence([
        EUploadClientState.Default,
        EUploadClientState.CalculatingHash,
        EUploadClientState.CheckingFileExists,
        EUploadClientState.Finishing,
        EUploadClientState.UploadSuccessfully,
      ]);
    });
  });

  describe("errors", () => {
    const testActionError = (actionName: keyof IUploadClientActions) => {
      test(`should catch error throw from ${actionName}()`, async () => {
        const expectedError = new Error("error");
        const { client, waitState, expectError } = createClientTestUtils({
          [actionName]: async () => {
            throw expectedError;
          },
        });

        client.start(true);
        await waitState(UploadClient.EState.Error);
        expectError(expectedError);
      });
    };

    testActionError("chunkExists");
    testActionError("fileExists");
    testActionError("getLastExistedChunkIndex");
    testActionError("merge");
    testActionError("uploadChunk");

    test("should catch errors thrown by finisher()", async () => {
      const expectedError = new Error("error");
      const { client, waitState, expectError } = createClientTestUtils();
      client.finisher = () => Promise.reject(expectedError);

      client.start(true);
      await waitState(UploadClient.EState.Error);
      expectError(expectedError);
    });
  });
});
