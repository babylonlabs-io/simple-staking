import { blocksToDisplayTime, durationTillNow } from "@/ui/common/utils/time";

describe("blocksToDisplayTime", () => {
  it("should return '-' if block is 0", () => {
    expect(blocksToDisplayTime(0)).toBe("-");
  });

  it("should convert 1 block to 1 day", () => {
    expect(blocksToDisplayTime(1)).toBe("1 day");
  });

  it("should convert 200 blocks to 2 days", () => {
    expect(blocksToDisplayTime(200)).toBe("2 days");
  });

  it("should convert 900 blocks to 7 days", () => {
    expect(blocksToDisplayTime(900)).toBe("7 days");
  });

  it("should convert 30000 blocks to 30 weeks", () => {
    expect(blocksToDisplayTime(30000)).toBe("30 weeks");
  });

  it("should convert 4320 blocks to 5 weeks", () => {
    expect(blocksToDisplayTime(4320)).toBe("5 weeks");
  });

  it("should convert 63000 blocks to 65 weeks", () => {
    expect(blocksToDisplayTime(63000)).toBe("65 weeks");
  });
});

describe("durationTillNow", () => {
  const currentTime = new Date("2024-01-01T12:00:00Z").getTime();

  it('should return "Ongoing" if time is empty', () => {
    expect(durationTillNow("", currentTime)).toBe("Ongoing");
  });

  it('should return "Ongoing" if time starts with "000"', () => {
    expect(durationTillNow("0000-00-00T00:00:00Z", currentTime)).toBe(
      "Ongoing",
    );
  });

  it("should return the correct duration in days, hours, and minutes", () => {
    const pastTime = new Date("2023-12-31T10:00:00Z").toISOString();
    expect(durationTillNow(pastTime, currentTime)).toBe("1 day 2 hours ago");
  });

  it("should return the correct duration in hours", () => {
    const pastTime = new Date("2024-01-01T10:00:00Z").toISOString();
    expect(durationTillNow(pastTime, currentTime)).toBe("2 hours ago");
  });

  it("should return the correct duration in minutes", () => {
    const pastTime = new Date("2024-01-01T11:50:00Z").toISOString();
    expect(durationTillNow(pastTime, currentTime)).toBe("10 minutes ago");
  });

  it("should return the correct duration in seconds if less than a minute", () => {
    const pastTime = new Date("2024-01-01T11:59:30Z").toISOString();
    expect(durationTillNow(pastTime, currentTime)).toBe("30 seconds ago");
  });

  it('should return "Just now" if the duration is less than a second', () => {
    let pastTime = new Date("2024-01-01T12:00:00Z").toISOString();
    expect(durationTillNow(pastTime, currentTime)).toBe("Just now");

    // test the ms
    pastTime = new Date("2024-01-01T11:59:59.999Z").toISOString();
    expect(durationTillNow(pastTime, currentTime)).toBe("Just now");
  });

  it("should return only days in coarse mode", () => {
    const pastTime = new Date("2023-12-26T05:05:00Z").toISOString();
    expect(durationTillNow(pastTime, currentTime, false)).toBe("6 days ago");
  });

  it("should return hours in coarse mode when under a day", () => {
    const pastTime = new Date("2024-01-01T02:00:00Z").toISOString();
    expect(durationTillNow(pastTime, currentTime, false)).toBe("10 hours ago");
  });

  it("should return minutes in coarse mode when under an hour", () => {
    const pastTime = new Date("2024-01-01T11:15:00Z").toISOString();
    expect(durationTillNow(pastTime, currentTime, false)).toBe(
      "45 minutes ago",
    );
  });
});
