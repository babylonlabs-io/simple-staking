export interface FinalityProvider {
  description: Description;
  commission: string;
  bbn_pk: BbnPk;
  btc_pk_hex: string;
  active_staked_sat: number;
  total_staked_sat: number;
}

export interface BbnPk {
  hex: string;
  acc_addr: string;
}

export interface Description {
  moniker: string;
  website: string;
}

export const data: FinalityProvider[] = [
  {
    description: {
      moniker: "Babylon Foundation 9",
      website: "https://babylonchain.io",
    },
    commission: "0.050000000000000000",
    bbn_pk: {
      hex: "033903516c0f5f5ad74aa96f0c8ecb4684eae7e4bbfc1ddd3bec82861c8615f312",
      acc_addr: "bbn1azu6pvmt6xs45uqjprjdef0th0jram4lenaaun",
    },
    btc_pk_hex:
      "0033f0321bbf728701334f583174548b314e529e2e13cb8ef715871b154d49dc",
    active_staked_sat: 57900,
    total_staked_sat: 90450,
  },
  {
    description: {
      moniker: "Babylon Foundation 12",
      website: "https://babylonchain.io",
    },
    commission: "0.060000000000000000",
    bbn_pk: {
      hex: "036bf123eb6e0076102ff14cdc347597eade53c0ca5b71c4300208c1cf6ce88950",
      acc_addr: "bbn1207df2m8y7fkw5vvr73fvj37v2xxutwkjd2wam",
    },
    btc_pk_hex:
      "00740c2e3e3e5d5a13672796d1d5c002816bc2ed4f74d538eb6f817f8fb42eed",
    active_staked_sat: 20000,
    total_staked_sat: 52400,
  },
  {
    description: {
      moniker: "Babylon Foundation 1",
      website: "https://babylonchain.io",
    },
    commission: "0.100000000000000000",
    bbn_pk: {
      hex: "031723cdd90ea54b746aec4ca56de2adcb633f48f0b76b07ecfe5dbb09c410fdea",
      acc_addr: "bbn1a7yzrd3r7wzm50flgr8p36semsvlndf03wfk3f",
    },
    btc_pk_hex:
      "10c30c8cdede3f74121980a1c54ac915ec90bc15bb7a3c3c6eda8282979fed0b",
    active_staked_sat: 31800,
    total_staked_sat: 83100,
  },
  {
    description: {
      moniker: "Babylon Foundation 24",
      website: "https://babylonchain.io",
    },
    commission: "0.050000000000000000",
    bbn_pk: {
      hex: "03b6e5befaedef4441ec5d6c6dca4ceec0911c95bb6d25ebe7a930300fccdab622",
      acc_addr: "bbn1e2gevup72ud2daa5vewyjcc26c3vtp2n0acfjr",
    },
    btc_pk_hex:
      "129334a57531974a28e0cc2be212209cfd9762f255c757f74ca5a3d379f4ea7c",
    active_staked_sat: 46950,
    total_staked_sat: 360600,
  },
  {
    description: {
      moniker: "Babylon Foundation 15",
      website: "https://babylonchain.io",
    },
    commission: "0.130000000000000000",
    bbn_pk: {
      hex: "0266be3c6836aa61a9819dfa9805246d66b3ce008fed9785faf6fa890fbc7c7c61",
      acc_addr: "bbn1kdp09f46c0t6cedsh2tsr6x763t6pfa59j7qr7",
    },
    btc_pk_hex:
      "40a728e3c58af5c06b20f003a2c9e815a2865d14aaf83c5a675555efde1d31c1",
    active_staked_sat: 38850,
    total_staked_sat: 51000,
  },
  {
    description: {
      moniker: "Babylon Foundation 22",
      website: "https://babylonchain.io",
    },
    commission: "0.090000000000000000",
    bbn_pk: {
      hex: "03c9b56e0aaa3579528a7f4527afe3f0a15fee4225f3f678c8bf0d4c2ceed38b5f",
      acc_addr: "bbn1j03z6lu93c0zd0tfhswc9dgql2yg9flup4ks2p",
    },
    btc_pk_hex:
      "51c86543686696477546ca094ac5ef33da2ad5689b95704d0c9c08ec0fab6afd",
    active_staked_sat: 50550,
    total_staked_sat: 67500,
  },
  {
    description: {
      moniker: "Babylon Foundation 25",
      website: "https://babylonchain.io",
    },
    commission: "0.100000000000000000",
    bbn_pk: {
      hex: "02b0c736e20b6cf407f1636c1580d747a2989cf06154f1c1026421dd63cf68cd87",
      acc_addr: "bbn1v25xsq0xs7s9tyfs2qm6xzfx0n4nn5ycgnk77p",
    },
    btc_pk_hex:
      "597843ec808d98d85ead821fa477a31cc228430542955f9e490eb9219cbd9835",
    active_staked_sat: 20000,
    total_staked_sat: 353950,
  },
  {
    description: {
      moniker: "Babylon Foundation 8",
      website: "https://babylonchain.io",
    },
    commission: "0.080000000000000000",
    bbn_pk: {
      hex: "03f6e31a2c86893dbef016cae9caadc2be9a81c9ec265b50c425236765e9ce8cf5",
      acc_addr: "bbn1ttqkwczkrg37uxddpg69m7065kkzhx0gnf422z",
    },
    btc_pk_hex:
      "6492e1e2622049be260cceb2c2c28616ac35f8474c8e1696b87daf2496af3a77",
    active_staked_sat: 46350,
    total_staked_sat: 46350,
  },
  {
    description: {
      moniker: "Babylon Foundation 11",
      website: "https://babylonchain.io",
    },
    commission: "0.120000000000000000",
    bbn_pk: {
      hex: "03cd55e3b5b9473f84c41b0dd6f329031cb58f7c7cd7291dce39108fb6ea0b9fc2",
      acc_addr: "bbn1etp3m4d0v0nkzz7apw37j8wux88d55e9v9hpfm",
    },
    btc_pk_hex:
      "6a23c9acaa282f4b92322d556cf68b0ba9c9f684be26398c1530483403d73728",
    active_staked_sat: 45150,
    total_staked_sat: 45150,
  },
  {
    description: {
      moniker: "Babylon Foundation 6",
      website: "https://babylonchain.io",
    },
    commission: "0.070000000000000000",
    bbn_pk: {
      hex: "029f573903025580a3c2146d3382751747a0d82a0852d7e8659037b56dd97ecbed",
      acc_addr: "bbn1zwg6whdz4dlgrae2hg47kt6fc03efltx0r5qf4",
    },
    btc_pk_hex:
      "6adfd1178a6a2bfdc49643f5c934428f3bf14a125c896fa73f8721bac5981485",
    active_staked_sat: 43050,
    total_staked_sat: 43050,
  },
  {
    description: {
      moniker: "Babylon Foundation 16",
      website: "https://babylonchain.io",
    },
    commission: "0.050000000000000000",
    bbn_pk: {
      hex: "02504c36ea09b4ea415e6786fcfc03f7ccb7bfd86c71531873ab71030b11cd4290",
      acc_addr: "bbn1ksl9g7e7mhzfka64ew4xlg8g9hxx8s70gldzxq",
    },
    btc_pk_hex:
      "6b946c74abcf17425b6e62e2ef5789e3759a516749c06c56e3260d372d7c45bb",
    active_staked_sat: 44400,
    total_staked_sat: 44400,
  },
  {
    description: {
      moniker: "Babylon Foundation 2",
      website: "https://babylonchain.io",
    },
    commission: "0.090000000000000000",
    bbn_pk: {
      hex: "029e20300e19260dcc09aa59beb85ccab30237b3932a7eadc515a79566a14f160c",
      acc_addr: "bbn1cxe7urmyccnd4pd3rtt9aq7cf6tnx9xcjjsxs0",
    },
    btc_pk_hex:
      "6fe06cf6c660c80dde108f42783b568ecde4268799e548767139c27f02d36695",
    active_staked_sat: 48600,
    total_staked_sat: 48600,
  },
  {
    description: {
      moniker: "Babylon Foundation 14",
      website: "https://babylonchain.io",
    },
    commission: "0.110000000000000000",
    bbn_pk: {
      hex: "02db66d0bbe9b7484144a13486755b6d24152cbed7da3d35f56877378d1a0d3a96",
      acc_addr: "bbn1yy9m2whka5hugrkcydkklg6mxe90mqjaqt8439",
    },
    btc_pk_hex:
      "7352b46fd9a5f8dfa162ec4dd273788a8d51e5117e571766f96d25d65fccbb2d",
    active_staked_sat: 17550,
    total_staked_sat: 34200,
  },
  {
    description: {
      moniker: "Babylon Foundation 28",
      website: "https://babylonchain.io",
    },
    commission: "0.130000000000000000",
    bbn_pk: {
      hex: "02ce5941d6af081fb552c1c43370e972871d3883cfeb669ce7caaa021f3999e874",
      acc_addr: "bbn1cwjap3h2nrkczjcdf5ctrtdqcrzfdx8njxcfx7",
    },
    btc_pk_hex:
      "918639dd437aaad6154aeaf8ab3373e15b400ea290453e9902403d5069c3de44",
    active_staked_sat: 34500,
    total_staked_sat: 34500,
  },
  {
    description: {
      moniker: "Babylon Foundation 10",
      website: "https://babylonchain.io",
    },
    commission: "0.070000000000000000",
    bbn_pk: {
      hex: "0318822815c7d094eac957329ad62e85479431049357b82e2f5d1940f2e5820b9a",
      acc_addr: "bbn1u7s8eeaqy9p7p6mfkg2jrrl5gkllnyja4pkds9",
    },
    btc_pk_hex:
      "9ae492726745e3e953b1b5ef88cc2383aa59479977ecf26da4c31d36dae3b815",
    active_staked_sat: 34800,
    total_staked_sat: 34800,
  },
  {
    description: {
      moniker: "Babylon Foundation 0",
      website: "https://babylonchain.io",
    },
    commission: "0.050000000000000000",
    bbn_pk: {
      hex: "0291dff043c62af073aa15db2be12c26d7f3e75d3643282b17684267a5234e9c44",
      acc_addr: "bbn13utyj83rnc4xvakmrnlm3v3dn652gxmvea927f",
    },
    btc_pk_hex:
      "a7cbf3de70feb043c7dd7ae867b5193f2a580e3bf119f9e4b37ba37679756dcf",
    active_staked_sat: 33150,
    total_staked_sat: 33150,
  },
  {
    description: {
      moniker: "Babylon Foundation 20",
      website: "https://babylonchain.io",
    },
    commission: "0.110000000000000000",
    bbn_pk: {
      hex: "025c4812d4ce57fb74ca2b440771264b9c5cb604dc8dc65ae5fe680a4e0a9fb2d6",
      acc_addr: "bbn1qay6r3004z8e6fkwaq4mpj5jgy2lurnadm099e",
    },
    btc_pk_hex:
      "ae6297599820015635405d32588dead4df6e245b361aa7ebe468a45239f5ba14",
    active_staked_sat: 32100,
    total_staked_sat: 32100,
  },
  {
    description: {
      moniker: "Babylon Foundation 5",
      website: "https://babylonchain.io",
    },
    commission: "0.090000000000000000",
    bbn_pk: {
      hex: "03e45daba8f9068f4106851052a9d6097608c20db5d379ee18f8b57cebd7186441",
      acc_addr: "bbn1p52nm38t6y65tc5dedsjn28qjsee2h05etmuu9",
    },
    btc_pk_hex:
      "b64e09dbc241ddcb892e7918bb6fa60bf4c214e222d3fd03fb7b6247037400ae",
    active_staked_sat: 31050,
    total_staked_sat: 31050,
  },
  {
    description: {
      moniker: "Babylon Foundation 27",
      website: "https://babylonchain.io",
    },
    commission: "0.090000000000000000",
    bbn_pk: {
      hex: "0226147b346f4e561db38cab85ef67a5dc049c683c2130ab58d0c19e4c851289a0",
      acc_addr: "bbn1ehdk6g8v0hcyua5nyktfdlme8n0a7jtsvqv6ph",
    },
    btc_pk_hex:
      "bb9a7f84c89c4a77b38e5a4e703c25f9043395369f0bd763f9ef2213182367e8",
    active_staked_sat: 31950,
    total_staked_sat: 31950,
  },
  {
    description: {
      moniker: "Babylon Foundation 7",
      website: "https://babylonchain.io",
    },
    commission: "0.090000000000000000",
    bbn_pk: {
      hex: "0380f63e33700f7fc2c6c33f2fab438108df1fce352ee545c609c46d8c186e8fb7",
      acc_addr: "bbn102sg4cnzllc8he85xlektghhmrt35rd3460n38",
    },
    btc_pk_hex:
      "bf7b76e9334eb93208b2e7f8c2ce2cd248f568822701b9ed9ba7ada369abd704",
    active_staked_sat: 16950,
    total_staked_sat: 32550,
  },
  {
    description: {
      moniker: "Babylon Foundation 19",
      website: "https://babylonchain.io",
    },
    commission: "0.050000000000000000",
    bbn_pk: {
      hex: "02dbcdfd9b3ac1c060a06358837dc74dd4b291456c63e779db70c529de3a08d068",
      acc_addr: "bbn1r37w3258gxadwe26xqvhqurun3e9az484n87mf",
    },
    btc_pk_hex:
      "c4cf71385e3dc2f27ddf7d5b3ff41de297c0304fcd945629bd6751368f93bb07",
    active_staked_sat: 30150,
    total_staked_sat: 30150,
  },
  {
    description: {
      moniker: "Babylon Foundation 3",
      website: "https://babylonchain.io",
    },
    commission: "0.120000000000000000",
    bbn_pk: {
      hex: "0288319b8d868710ada38a62671e679829785f08d2f227956e7e50c3ffb84afa1b",
      acc_addr: "bbn18fwzserqt48p7vrh6zxmscskggsnz6aeznlzva",
    },
    btc_pk_hex:
      "c71877f0e220d8929d22bee5a1107b641e10c5564580ca4ae852ee7663454e8d",
    active_staked_sat: 30300,
    total_staked_sat: 30300,
  },
  {
    description: {
      moniker: "Babylon Foundation 23",
      website: "https://babylonchain.io",
    },
    commission: "0.140000000000000000",
    bbn_pk: {
      hex: "02257b5b00c0dee856c7cd9b62f9d9c9c95a7705622e9710a2b06af99503ed89d1",
      acc_addr: "bbn14xtk5xhwxjj2chnt05qneu3dl4a3x9n7scmw9k",
    },
    btc_pk_hex:
      "db072f6c3c3a8ed14239c37007770b313698f4df3ffb8ae46a4af9c5b7d23ea9",
    active_staked_sat: 29850,
    total_staked_sat: 29850,
  },
  {
    description: {
      moniker: "Babylon Foundation 26",
      website: "https://babylonchain.io",
    },
    commission: "0.050000000000000000",
    bbn_pk: {
      hex: "02046238abab5dcbca530cb8bc7f3f1a02cec8de8b9550b6f27a73396bc0998271",
      acc_addr: "bbn16dqn5pky45nql67acgnpp03r23j2adk0vdxp2m",
    },
    btc_pk_hex:
      "dfe157d73ff0bd85163baf43a6c97a1e0335d7ba34d0788f4adff41cd0857f98",
    active_staked_sat: 33600,
    total_staked_sat: 33600,
  },
  {
    description: {
      moniker: "Babylon Foundation 4",
      website: "https://babylonchain.io",
    },
    commission: "0.120000000000000000",
    bbn_pk: {
      hex: "02a906bf192f9189e3b4241bd30591d4846d7ae25b88ee55681016d3130f185b53",
      acc_addr: "bbn1sy50wqgw0patm366jy72rrttlwccnw6h0hwrmc",
    },
    btc_pk_hex:
      "e005c5e7e2e079e7a2668f57f6a111d63412688246b90be2a6cabc4c630da043",
    active_staked_sat: 26400,
    total_staked_sat: 26400,
  },
  {
    description: {
      moniker: "Babylon Foundation 21",
      website: "https://babylonchain.io",
    },
    commission: "0.150000000000000000",
    bbn_pk: {
      hex: "033be0e4180429456595963991c23b27c1e403e66f7d0076f4cc8fd612a1526e00",
      acc_addr: "bbn1wec8ms4trafgguy6n5gqlf34gqxgdt3lhjuv47",
    },
    btc_pk_hex:
      "e5a6cf992e08509e5a17ab8eb8364adca881b5e78fcc4c7535b97c04bf2f7dd3",
    active_staked_sat: 33450,
    total_staked_sat: 33450,
  },
  {
    description: {
      moniker: "Babylon Foundation 29",
      website: "https://babylonchain.io",
    },
    commission: "0.140000000000000000",
    bbn_pk: {
      hex: "02e213c256797437a94f0f540ddbcc68cac82c321b0d996c5b2cc9c84c7541a233",
      acc_addr: "bbn1zq5ph06252ulur56jgdk3kfzdae6c7mwle759x",
    },
    btc_pk_hex:
      "eba8ac73710b998789a4e64b0c2289562f9f782beab558b96b8cddc0cd326269",
    active_staked_sat: 30900,
    total_staked_sat: 30900,
  },
  {
    description: {
      moniker: "Babylon Foundation 18",
      website: "https://babylonchain.io",
    },
    commission: "0.060000000000000000",
    bbn_pk: {
      hex: "0348949b7f1bd611d46f32b790387929cc21e85d337b7ca87cd3b8e4dc091bdfec",
      acc_addr: "bbn1sp4u6gecynav9mejg5p68z2cm5pk7qcjzg3f5y",
    },
    btc_pk_hex:
      "f04edc8fd046b3b35ff632472b4c465349919bdda8978f432341e024a9f48c5e",
    active_staked_sat: 27150,
    total_staked_sat: 27150,
  },
  {
    description: {
      moniker: "Babylon Foundation 17",
      website: "https://babylonchain.io",
    },
    commission: "0.060000000000000000",
    bbn_pk: {
      hex: "029fc92304435afd96c75be62a538a9710fd1bbf40de3d66939f7421ad6760a744",
      acc_addr: "bbn1jt6psv9p439wejmkurlhmdh00avjc8ewfh3gz0",
    },
    btc_pk_hex:
      "f2650ded2b98a71e52597dd4c938e5ad7b5fc98a1e5f2acf42df2e9f5f892d61",
    active_staked_sat: 30300,
    total_staked_sat: 30300,
  },
  {
    description: {
      moniker: "Babylon Foundation 13",
      website: "https://babylonchain.io",
    },
    commission: "0.060000000000000000",
    bbn_pk: {
      hex: "0385a6eef3f1651678ebf36907f1882465920991852de707722f2168a01ddfe47f",
      acc_addr: "bbn1clqx548nhcrkdew20mluh4d4ju329g7eua657n",
    },
    btc_pk_hex:
      "f769a683d6b0291a18087f6873a1073c268da3448ba7ddf78a333cfd2dbf0c04",
    active_staked_sat: 34350,
    total_staked_sat: 34350,
  },
];
