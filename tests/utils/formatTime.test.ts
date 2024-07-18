import { durationTillNow } from "@/utils/formatTime";

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
});
