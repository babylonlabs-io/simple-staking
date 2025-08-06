import { btcstakingtx, incentivetx } from "@babylonlabs-io/babylon-proto-ts";
import { MessageFns } from "@babylonlabs-io/babylon-proto-ts/dist/generated/google/protobuf/any";
import { GeneratedType, Registry } from "@cosmjs/proto-signing";

// Define the structure of each proto to register
type ProtoToRegister<T> = {
  typeUrl: string;
  messageType: MessageFns<T>;
};

export const BBN_REGISTRY_TYPE_URLS = {
  MsgCreateBTCDelegation: "/babylon.btcstaking.v1.MsgCreateBTCDelegation",
  MsgBtcStakeExpand: "/babylon.btcstaking.v1.MsgBtcStakeExpand",
  MsgWithdrawReward: "/babylon.incentive.MsgWithdrawReward",
};

// List of protos to register in the registry
const protosToRegister: ProtoToRegister<any>[] = [
  // BTC Staking - Create Delegation
  {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgCreateBTCDelegation,
    messageType: btcstakingtx.MsgCreateBTCDelegation,
  },
  // BTC Staking - Expand Delegation
  {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgBtcStakeExpand,
    messageType: btcstakingtx.MsgBtcStakeExpand,
  },
  // BTC Staking - Withdraw Reward
  {
    typeUrl: BBN_REGISTRY_TYPE_URLS.MsgWithdrawReward,
    messageType: incentivetx.MsgWithdrawReward,
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
