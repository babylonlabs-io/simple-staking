import { rest } from "msw";

const mockStatsV2 = {
  active_tvl: 3238664649941,
  active_delegations: 21906,
  active_finality_providers: 60,
  total_finality_providers: 114,
  total_active_tvl: 4956159209022,
  total_active_delegations: 43478,
  btc_staking_apy: 0.011705617401439945,
  btc_staking_apr: 0.011705617401439945,
};

const mockPrices = {
  BABY: 0.09868765127511409,
  BTC: 104126.79433684294,
};

const mockFinalityProviders = [
  {
    btc_pk: "e8a3ef3ca40ade56bd986663f24d5ab3bcc3cd18a88a10a8cd25d8af42314f62",
    state: "FINALITY_PROVIDER_STATUS_INACTIVE",
    description: {
      moniker: "PRO Delegators",
      identity: "44771D06A00DD695",
      website: "https://pro-delegators.com",
      security_contact: "contact@pro-delegators.com",
      details: "Advanced Node Services for Professional Delegators",
    },
    commission: "0.030000000000000000",
    active_tvl: 2500000,
    total_tvl: 2500000,
    active_delegations: 4,
    total_delegations: 4,
    bsn_id: "test-bsn-1",
  },
  {
    btc_pk: "e8197e71fdcc9987f95440415fcd852455da871d7c38a436465a3a9a78c682fc",
    state: "FINALITY_PROVIDER_STATUS_ACTIVE",
    description: {
      moniker: "Next Finance Tech",
      identity: "",
      website: "https://nxt-fintech.com/",
      security_contact: "ssupport@nxt-fintech.com",
      details:
        "Next Finance Tech: Japan's No. 1 Staking Service Provider, Founded by Goldman Sachs Alumni and Trusted by Institutions. We offer secure, audited staking solutions tailored to meet the needs of professional investors.",
    },
    commission: "0.050000000000000000",
    active_tvl: 233440000,
    total_tvl: 233440000,
    active_delegations: 6,
    total_delegations: 6,
    bsn_id: "test-bsn-2",
  },
  {
    btc_pk: "e02859d59bad2c011453a295e1f26410a74f4eacda513b2a88f53da7ad230c8f",
    state: "FINALITY_PROVIDER_STATUS_INACTIVE",
    description: {
      moniker: "Injective Labs",
      identity: "2008DAB643ECF438",
      website: "injectivelabs.org",
      security_contact: "",
      details:
        "Injective is a lightning fast interoperable layer one optimized for building unmatched Web3 finance applications. Injective is incubated by Binance and is backed by prominent investors such as Jump Crypto, Pantera and Mark Cuban.",
    },
    commission: "0.050000000000000000",
    active_tvl: 5700000,
    total_tvl: 5700000,
    active_delegations: 2,
    total_delegations: 2,
  },
  {
    btc_pk: "8c8a20dc13c124ac1f7aa7af69a13a4e121abf5934e6b384c6d13c5663fdc633",
    state: "FINALITY_PROVIDER_STATUS_ACTIVE",
    description: {
      moniker: "CertiK",
      identity: "",
      website: "https://www.certik.com/",
      security_contact: "node@certik.com",
      details:
        "CertiK is the world's leading smart contract auditor. We provide full-cycle security solutions for enterprises, including auditing, security rating,Compliance&AML,investment and other security-related services, elevating the entire Web3 journey of our clients.",
    },
    commission: "0.030000000000000000",
    active_tvl: 4472000000,
    total_tvl: 4472000000,
    active_delegations: 4,
    total_delegations: 4,
    bsn_id: "test-bsn-1",
  },
  {
    btc_pk: "289719ef19e455816e474588007f1824df7f6b1bace7decf8bb1c435e4cb849e",
    state: "FINALITY_PROVIDER_STATUS_ACTIVE",
    description: {
      moniker: "Hex Trust",
      identity: "DEA21069031BB3F4",
      website: "https://hextrust.com",
      security_contact: "security@hextrust.com",
      details:
        "Hex Trust is a fully licensed digital asset custodian dedicated to providing solutions for protocols, foundations, financial institutions, and the Web3 ecosystem.",
    },
    commission: "0.050000000000000000",
    active_tvl: 235030000,
    total_tvl: 235030000,
    active_delegations: 3,
    total_delegations: 3,
  },
];

export const statsHandlers = [
  rest.get("/v2/stats*", (req, res, ctx) => {
    return res(ctx.json({ data: mockStatsV2 }));
  }),

  rest.get("/v2/prices*", (req, res, ctx) => {
    return res(ctx.json({ data: mockPrices }));
  }),

  rest.get("/v1/finality-providers*", (req, res, ctx) => {
    return res(
      ctx.json({
        data: mockFinalityProviders,
        pagination: { next_key: "", total: `${mockFinalityProviders.length}` },
      }),
    );
  }),

  rest.get("/v2/finality-providers*", (req, res, ctx) => {
    return res(
      ctx.json({
        data: mockFinalityProviders,
        pagination: { next_key: "", total: `${mockFinalityProviders.length}` },
      }),
    );
  }),
];
