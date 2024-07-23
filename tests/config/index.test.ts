import { shouldDisplayTestingMsg } from "@/config";

describe("shouldDisplayTestingMsg", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES;
  });
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES;
  });

  it("should return true if NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES is not set", () => {
    expect(shouldDisplayTestingMsg()).toBe(true);
  });

  it('should return true if NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES is "true"', () => {
    process.env.NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES = "true";
    expect(shouldDisplayTestingMsg()).toBe(true);
  });

  it('should return false if NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES is "false"', () => {
    process.env.NEXT_PUBLIC_DISPLAY_TESTING_MESSAGES = "false";
    expect(shouldDisplayTestingMsg()).toBe(false);
  });
});
