import FeatureFlagService from "@/ui/legacy/utils/FeatureFlagService";

describe("FeatureFlagService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore process.env after each test
    process.env = originalEnv;
  });

  describe("IsMultiStakingEnabled", () => {
    it("should return false when NEXT_PUBLIC_FF_MULTISTAKING is not set", () => {
      expect(FeatureFlagService.IsMultiStakingEnabled).toBe(false);
    });

    it('should return false when NEXT_PUBLIC_FF_MULTISTAKING is set to "false"', () => {
      process.env.NEXT_PUBLIC_FF_MULTISTAKING = "false";
      expect(FeatureFlagService.IsMultiStakingEnabled).toBe(false);
    });

    it('should return true when NEXT_PUBLIC_FF_MULTISTAKING is set to "true"', () => {
      process.env.NEXT_PUBLIC_FF_MULTISTAKING = "true";
      expect(FeatureFlagService.IsMultiStakingEnabled).toBe(true);
    });
  });

  describe("IsLedgerEnabled", () => {
    it("should return false when NEXT_PUBLIC_FF_ENABLE_LEDGER is not set", () => {
      expect(FeatureFlagService.IsLedgerEnabled).toBe(false);
    });

    it('should return false when NEXT_PUBLIC_FF_ENABLE_LEDGER is set to "false"', () => {
      process.env.NEXT_PUBLIC_FF_ENABLE_LEDGER = "false";
      expect(FeatureFlagService.IsLedgerEnabled).toBe(false);
    });

    it('should return true when NEXT_PUBLIC_FF_ENABLE_LEDGER is set to "true"', () => {
      process.env.NEXT_PUBLIC_FF_ENABLE_LEDGER = "true";
      expect(FeatureFlagService.IsLedgerEnabled).toBe(true);
    });
  });

  describe("IsPhase3Enabled", () => {
    it("should return false when NEXT_PUBLIC_FF_PHASE_3 is not set", () => {
      expect(FeatureFlagService.IsPhase3Enabled).toBe(false);
    });

    it('should return false when NEXT_PUBLIC_FF_PHASE_3 is set to "false"', () => {
      process.env.NEXT_PUBLIC_FF_PHASE_3 = "false";
      expect(FeatureFlagService.IsPhase3Enabled).toBe(false);
    });

    it('should return true when NEXT_PUBLIC_FF_PHASE_3 is set to "true"', () => {
      process.env.NEXT_PUBLIC_FF_PHASE_3 = "true";
      expect(FeatureFlagService.IsPhase3Enabled).toBe(true);
    });
  });

  describe("Feature flag behavior", () => {
    it("should handle multiple feature flags independently", () => {
      process.env.NEXT_PUBLIC_FF_MULTISTAKING = "true";
      process.env.NEXT_PUBLIC_FF_ENABLE_LEDGER = "false";
      process.env.NEXT_PUBLIC_FF_PHASE_3 = "true";

      expect(FeatureFlagService.IsMultiStakingEnabled).toBe(true);
      expect(FeatureFlagService.IsLedgerEnabled).toBe(false);
      expect(FeatureFlagService.IsPhase3Enabled).toBe(true);
    });

    it("should handle case sensitivity correctly", () => {
      process.env.NEXT_PUBLIC_FF_MULTISTAKING = "TRUE";
      process.env.NEXT_PUBLIC_FF_ENABLE_LEDGER = "True";
      process.env.NEXT_PUBLIC_FF_PHASE_3 = "TRUE";

      expect(FeatureFlagService.IsMultiStakingEnabled).toBe(false);
      expect(FeatureFlagService.IsLedgerEnabled).toBe(false);
      expect(FeatureFlagService.IsPhase3Enabled).toBe(false);
    });
  });
});
