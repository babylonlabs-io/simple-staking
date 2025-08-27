import { array, object, string } from "yup";

import { getNetworkConfigBBN } from "@/ui/common/config/network/bbn";

const { chainId: BBN_CHAIN_ID } = getNetworkConfigBBN();

describe("MultistakingState validation", () => {
  it("should validate finalityProviders correctly using context.originalValue", async () => {
    const schema = object({
      finalityProviders: array()
        .of(string())
        .transform((value) => Object.values(value))
        .required("Add Finality Provider")
        .min(1, "Add Finality Provider")
        .test(
          "containsBbnProvider",
          "Add Babylon Finality Provider",
          (_, context) =>
            Object.keys(context.originalValue || {}).includes(BBN_CHAIN_ID),
        ),
    });

    // Valid case: Record with BBN_CHAIN_ID as key
    const validData = {
      finalityProviders: {
        [BBN_CHAIN_ID]: "babylon-provider-123",
        bitcoin: "bitcoin-provider-456",
      },
    };
    await expect(schema.validate(validData)).resolves.toBeDefined();

    // Invalid case: Record without BBN_CHAIN_ID as key
    const invalidData = {
      finalityProviders: {
        bitcoin: "bitcoin-provider-456",
        "other-chain": "other-provider-789",
      },
    };
    await expect(schema.validate(invalidData)).rejects.toThrow(
      "Add Babylon Finality Provider",
    );

    // Invalid case: Empty object
    const emptyData = {
      finalityProviders: {},
    };
    await expect(schema.validate(emptyData)).rejects.toThrow(
      "Add Finality Provider",
    );
  });
});
