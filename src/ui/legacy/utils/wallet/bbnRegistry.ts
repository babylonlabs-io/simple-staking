import {
  btcstakingtx,
  epochingtx,
  incentivetx,
} from "@babylonlabs-io/babylon-proto-ts";
import { MessageFns } from "@babylonlabs-io/babylon-proto-ts/dist/generated/google/protobuf/any";
import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx";

// Define the structure of each proto to register
type ProtoToRegister<T> = {
  typeUrl: string;
  messageType: MessageFns<T>;
};

export const BBN_REGISTRY_TYPE_URLS = {
  MsgCreateBTCDelegation: "/babylon.btcstaking.v1.MsgCreateBTCDelegation",
  MsgWithdrawReward: "/babylon.incentive.MsgWithdrawReward",
  MsgWrappedDelegate: "/babylon.epoching.v1.MsgWrappedDelegate",
  MsgWrappedUndelegate: "/babylon.epoching.v1.MsgWrappedUndelegate",
  MsgWithdrawDelegatorReward:
    "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
};

// List of protos to register in the registry
const protosToRegister: ProtoToRegister<any>[] = [
  // BTC Staking
  {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgCreateBTCDelegation,
    messageType: btcstakingtx.MsgCreateBTCDelegation,
  },
  // Incentives - Claiming BABY rewards from BTC Staking
  {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWithdrawReward,
    messageType: incentivetx.MsgWithdrawReward,
  },
  // Epoching - Staking / Unstaking BABY
  {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWrappedDelegate,
    messageType: epochingtx.MsgWrappedDelegate,
  },
  {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWrappedUndelegate,
    messageType: epochingtx.MsgWrappedUndelegate,
  },
  // Cosmos Distribution - Claiming rewards from BABY Staking
  {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWithdrawDelegatorReward,
    messageType: MsgWithdrawDelegatorReward as any,
  },
];

// Utility function to create a `GeneratedType` from `MessageFns`
// Temporary workaround until https://github.com/cosmos/cosmjs/issues/1613 is fixed
const createGeneratedType = <T>(messageType: any): GeneratedType => {
  return {
    encode: messageType.encode.bind(messageType),
    decode: messageType.decode.bind(messageType),
    fromPartial: (properties?: Partial<T>): T => {
      return messageType.fromPartial(properties ?? ({} as T));
    },
  };
};

// Create the registry with the protos to register
export const createBbnRegistry = (): Registry => {
  const registry = new Registry();

  protosToRegister.forEach((proto) => {
    const generatedType = createGeneratedType(proto.messageType);
    registry.register(proto.typeUrl, generatedType);
  });

  return registry;
};
