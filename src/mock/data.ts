export interface APIData {
  tag: string;
  covenant_pks: string[];
  finality_providers: FinalityProvider[];
  covenant_quorum: number;
  unbonding_time: number;
  max_staking_amount: number;
  min_staking_amount: number;
  max_staking_time: number;
  min_staking_time: number;
}

export interface FinalityProvider {
  description: Description;
  commission: string;
  btc_pk: string;
}

export interface Description {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
}

export const mockApiData: APIData = {
  tag: "bbt4",
  covenant_pks: [
    "ffeaec52a9b407b355ef6967a7ffc15fd6c3fe07de2844d61550475e7a5233e5",
    "a5c60c2188e833d39d0fa798ab3f69aa12ed3dd2f3bad659effa252782de3c31",
    "59d3532148a597a2d05c0395bf5f7176044b1cd312f37701a9b4d0aad70bc5a4",
    "57349e985e742d5131e1e2b227b5170f6350ac2e2feb72254fcc25b3cee21a18",
    "c8ccb03c379e452f10c81232b41a1ca8b63d0baf8387e57d302c987e5abb8527",
  ],
  finality_providers: [
    {
      description: {
        moniker: "Babylon Foundation 0",
        identity: "",
        website: "",
        security_contact: "",
        details: "",
      },
      commission: "0.050000000000000000",
      btc_pk:
        "03d5a0bb72d71993e435d6c5a70e2aa4db500a62cfaae33c56050deefee64ec0",
    },
    {
      description: {
        moniker: "Babylon Foundation 1",
        identity: "",
        website: "",
        security_contact: "",
        details: "",
      },
      commission: "0.060000000000000000",
      btc_pk:
        "063deb187a4bf11c114cf825a4726e4c2c35fea5c4c44a20ff08a30a752ec7e0",
    },
    {
      description: {
        moniker: "Babylon Foundation 2",
        identity: "",
        website: "",
        security_contact: "",
        details: "",
      },
      commission: "0.080000000000000000",
      btc_pk:
        "094f5861be4128861d69ea4b66a5f974943f100f55400bf26f5cce124b4c9af7",
    },
    {
      description: {
        moniker: "Babylon Foundation 3",
        identity: "",
        website: "",
        security_contact: "",
        details: "",
      },
      commission: "0.090000000000000000",
      btc_pk:
        "0d2f9728abc45c0cdeefdd73f52a0e0102470e35fb689fc5bc681959a61b021f",
    },
  ],
  covenant_quorum: 3,
  unbonding_time: 1000,
  max_staking_amount: 300000,
  min_staking_amount: 3000,
  max_staking_time: 10000,
  min_staking_time: 100,
};
