import { AsyncQueue } from "@client/async-queue";
import { firstValueFrom } from "rxjs";
import { expectTime, nameOf } from "../test-utils";

describe(AsyncQueue.name, () => {
  beforeEach(() => {
    // tell vitest we use mocked time
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  describe(nameOf<AsyncQueue>("options"), () => {
    test("should set concurrency", () => {
      const queue = new AsyncQueue({
        concurrency: 1,
      });
      expect(queue.options.concurrency).toBe(1);
    });

    test("should with default concurrency 3", () => {
      const queue = new AsyncQueue();
      expect(queue.options.concurrency).toBe(3);
    });
  });

  describe(nameOf<AsyncQueue>("resumingTime"), () => {
    test("should be initial time", () => {
      const queue = new AsyncQueue();
      expectTime(queue.resumingTime, Date.now());
    });

    test("should be updated when resume", async () => {
      const now = Date.now();
      const queue = new AsyncQueue();

      queue.pause();
      vi.advanceTimersByTime(150);
      queue.resume();

      const expectedTime = now + 150;
      expectTime(queue.resumingTime, expectedTime);
    });

    test("should not be updated when resume on running", async () => {
      const now = Date.now();
      const queue = new AsyncQueue();

      vi.advanceTimersByTime(150);
      queue.resume();

      const expectedTime = now;
      expectTime(queue.resumingTime, expectedTime);
    });
  });

  describe(nameOf<AsyncQueue>("accumulativeTimeBeforeResuming"), () => {
    test("should be initial time", () => {
      const queue = new AsyncQueue();
      expect(queue.accumulativeTimeBeforeResuming).toBe(0);
    });

    test("should be updated when pause", async () => {
      const queue = new AsyncQueue();

      queue.push(() => new Promise((resolve) => setTimeout(resolve, 1000)));
      vi.advanceTimersByTime(150);

      queue.pause();

      const expectedTime = 150;
      expectTime(queue.accumulativeTimeBeforeResuming, expectedTime);
    });

    test("should not be updated when pause on paused", async () => {
      const queue = new AsyncQueue();
      queue.pause();

      queue.push(() => new Promise((resolve) => setTimeout(resolve, 1000)));
      vi.advanceTimersByTime(150);

      queue.pause();

      const expectedTime = 0;
      expectTime(queue.accumulativeTimeBeforeResuming, expectedTime);
    });
  });

  describe(nameOf<AsyncQueue>("runningTime"), () => {
    test("should be initial time", () => {
      const queue = new AsyncQueue();
      expect(queue.runningTime).toBe(0);
    });

    test("should be right when running", () => {
      const queue = new AsyncQueue();
      queue.push(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      vi.advanceTimersByTime(150);
      expectTime(queue.runningTime, 150);
    });

    test("should be right when paused", () => {
      const queue = new AsyncQueue();
      queue.pause();
      queue.push(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      vi.advanceTimersByTime(150);
      expectTime(queue.runningTime, 0);
    });

    test("should be right when mixed states", () => {
      const queue = new AsyncQueue();
      queue.push(
        () =>
          new Promise((resolve) =>
            setInterval(() => {
              resolve();
            }, 1000),
          ),
      );
      vi.advanceTimersByTime(150);

      queue.pause();

      vi.advanceTimersByTime(150);
      expectTime(queue.runningTime, 150);

      queue.resume();

      vi.advanceTimersByTime(150);
      expectTime(queue.runningTime, 300);
    });
  });

  describe(nameOf<AsyncQueue>("finishedCount"), () => {
    test("should be initial count", () => {
      const queue = new AsyncQueue();
      expect(queue.finishedCount).toBe(0);
    });

    test.todo("should be increase when task finish", async () => {
      const queue = new AsyncQueue({
        concurrency: 1,
      });

      const p1 = Promise.resolve();
      queue.push(() => p1);
      await queue.drain();

      expect(queue.finishedCount).toBe(1);
    });
  });

  describe(nameOf<AsyncQueue>("error$"), () => {
    test("should be subscribed", async () => {
      const queue = new AsyncQueue({
        concurrency: 1,
      });

      const expectedError = new Error();
      queue.push(() => Promise.reject(expectedError));

      const error = await firstValueFrom(queue.error$);
      expect(error).toBe(expectedError);
    });

    test("should be completed when kill", async () => {
      const queue = new AsyncQueue({
        concurrency: 1,
      });

      const expectToBeCalled = vi.fn();
      queue.error$.subscribe({
        complete: expectToBeCalled,
      });

      queue.kill();
      expect(expectToBeCalled).toBeCalled();
    });
  });

  describe(nameOf<AsyncQueue>("progress$"), () => {
    test("should be initial value", async () => {
      const queue = new AsyncQueue();
      expect(queue.progress$.value).toBe(0);
    });

    test.todo("should be increase when task start", async () => {
      const queue = new AsyncQueue();
    });

    test("should be completed when kill", async () => {
      const queue = new AsyncQueue({
        concurrency: 1,
      });

      const expectToBeCalled = vi.fn();
      queue.progress$.subscribe({
        complete: expectToBeCalled,
      });

      queue.kill();
      expect(expectToBeCalled).toBeCalled();
    });
  });
});
