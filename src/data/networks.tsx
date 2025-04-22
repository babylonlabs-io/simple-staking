import ArchwayLogo from "assets/networks/archway-logo.svg";
import BabylonGenesisLogo from "assets/networks/babylon-genesis-logo.svg";
import BabylonLogo from "assets/networks/babylon-logo.svg";
import CardanoLogo from "assets/networks/cardano-logo.svg";
import CasperLogo from "assets/networks/casperlabs-logo.svg";
import CentrifugeLogo from "assets/networks/centrifuge-logo.svg";
import ChainlinkLogo from "assets/networks/chainlink-logo.svg";
import ConfluxLogo from "assets/networks/conflux-logo.svg";
import CosmosEcosystemLogo from "assets/networks/cosmos-logo.svg";
import CosmosLogo from "assets/networks/cosmos-network-logo.svg";
import EigenLayerLogo from "assets/networks/eigenLayer-logo.svg";
import EthereumLogo from "assets/networks/ethereum-logo.svg";
import FlowLogo from "assets/networks/flow-logo.svg";
import JunoLogo from "assets/networks/juno-logo.svg";
import KavaLogo from "assets/networks/kava-logo.svg";
import LidoLogo from "assets/networks/lido-logo.svg";
import NearLogo from "assets/networks/near-logo.svg";
import NeutronLogo from "assets/networks/neutron-logo.svg";
import OasisLogo from "assets/networks/oasis-logo.svg";
import OsmosisLogo from "assets/networks/osmosis-logo.svg";
import PolygonLogo from "assets/networks/polygon-logo.svg";
import SolanaLogo from "assets/networks/solana-logo.svg";
import StrideLogo from "assets/networks/stride-logo.svg";
import SuiLogo from "assets/networks/sui-logo.svg";
import TezosLogo from "assets/networks/tezos-logo.svg";
import VanarLogo from "assets/networks/vanar-logo.svg";
import type { ReactNode } from "react";

export const networksList = [
  "ethereum",
  "solana",
  "sui",
  "tezos",
  "cardano",
  "polygon",
  "near",
  "oasis",
  "cosmos",
  "kava",
  "osmosis",
  "archway",
  "stride",
  "neutron",
  "babylon",
  "conflux",
  "vanar",
  "babylon-genesis",
] as const;

export const mainNetworkKeys: NetworkVariant[] = [
  "ethereum",
  "solana",
  "cardano",
  "tezos",
];
export const homepageNetworkKeys: NetworkVariant[] = [
  "solana",
  "cosmos",
  "tezos",
  "polygon",
  "near",
  "oasis",
];

export const cosmosNetworkKeys: NetworkVariant[] = [
  "cosmos",
  "kava",
  "osmosis",
  "archway",
  "neutron",
  "stride",
];
export const restakingNetworkKeys = ["babylon"];
export const oraclesNetworkKeys = ["chainlink"];
export const customPagesNetworkKeys = ["eigenLayer", "centrifuge", "lido"];
export const allNetworks = [
  ...networksList,
  ...oraclesNetworkKeys,
  ...customPagesNetworkKeys,
];

export type NetworkVariant = (typeof networksList)[number];
export type NetworkLogoKeyVariant =
  | (typeof networksList)[number]
  | (typeof oraclesNetworkKeys)[number]
  | (typeof restakingNetworkKeys)[number]
  | (typeof customPagesNetworkKeys)[number]
  | "cosmosEcosystem";

export const networksLogoList: Record<NetworkLogoKeyVariant, ReactNode> = {
  ethereum: <EthereumLogo />,
  cosmos: <CosmosLogo />,
  cosmosEcosystem: <CosmosEcosystemLogo />,
  tezos: <TezosLogo />,
  cardano: <CardanoLogo />,
  solana: <SolanaLogo />,
  polygon: <PolygonLogo />,
  near: <NearLogo />,
  flow: <FlowLogo />,
  kava: <KavaLogo />,
  oasis: <OasisLogo />,
  casper: <CasperLogo />,
  osmosis: <OsmosisLogo />,
  juno: <JunoLogo />,
  chainlink: <ChainlinkLogo />,
  centrifuge: <CentrifugeLogo />,
  sui: <SuiLogo />,
  archway: <ArchwayLogo />,
  stride: <StrideLogo />,
  neutron: <NeutronLogo />,
  lido: <LidoLogo />,
  babylon: <BabylonLogo />,
  eigenLayer: <EigenLayerLogo />,
  conflux: <ConfluxLogo />,
  vanar: <VanarLogo />,
  babylonGenesis: <BabylonGenesisLogo />,
};
