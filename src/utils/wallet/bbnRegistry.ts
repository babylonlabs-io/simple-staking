import { btcstakingtx } from "@babylonlabs-io/babylon-proto-ts";
import { MessageFns } from "@babylonlabs-io/babylon-proto-ts/dist/generated/google/protobuf/any";
import { GeneratedType, Registry } from "@cosmjs/proto-signing";

// Define the structure of each proto to register
type ProtoToRegister<T> = {
  typeUrl: string;
  messageType: MessageFns<T>;
};

// List of protos to register in the registry
const protosToRegister: ProtoToRegister<any>[] = [
  {
    typeUrl: "/babylon.btcstaking.v1.MsgCreateBTCDelegation",
    messageType: btcstakingtx.MsgCreateBTCDelegation,
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
