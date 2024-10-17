// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.2.0
//   protoc               unknown
// source: babylon/btcstaking/v1/pop.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";

export const protobufPackage = "babylon.btcstaking.v1";

/** BTCSigType indicates the type of btc_sig in a pop */
export enum BTCSigType {
  /** BIP340 - BIP340 means the btc_sig will follow the BIP-340 encoding */
  BIP340 = 0,
  /** BIP322 - BIP322 means the btc_sig will follow the BIP-322 encoding */
  BIP322 = 1,
  /**
   * ECDSA - ECDSA means the btc_sig will follow the ECDSA encoding
   * ref: https://github.com/okx/js-wallet-sdk/blob/a57c2acbe6ce917c0aa4e951d96c4e562ad58444/packages/coin-bitcoin/src/BtcWallet.ts#L331
   */
  ECDSA = 2,
  UNRECOGNIZED = -1,
}

export function bTCSigTypeFromJSON(object: any): BTCSigType {
  switch (object) {
    case 0:
    case "BIP340":
      return BTCSigType.BIP340;
    case 1:
    case "BIP322":
      return BTCSigType.BIP322;
    case 2:
    case "ECDSA":
      return BTCSigType.ECDSA;
    case -1:
    case "UNRECOGNIZED":
    default:
      return BTCSigType.UNRECOGNIZED;
  }
}

export function bTCSigTypeToJSON(object: BTCSigType): string {
  switch (object) {
    case BTCSigType.BIP340:
      return "BIP340";
    case BTCSigType.BIP322:
      return "BIP322";
    case BTCSigType.ECDSA:
      return "ECDSA";
    case BTCSigType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}

/**
 * ProofOfPossessionBTC is the proof of possession that a Babylon
 * address and a Bitcoin secp256k1 secret key are held by the same
 * person
 */
export interface ProofOfPossessionBTC {
  /** btc_sig_type indicates the type of btc_sig in the pop */
  btcSigType: BTCSigType;
  /**
   * btc_sig is the signature generated via sign(sk_btc, babylon_staker_address)
   * the signature follows encoding in either BIP-340 spec or BIP-322 spec
   */
  btcSig: Uint8Array;
}

/**
 * BIP322Sig is a BIP-322 signature together with the address corresponding to
 * the signer
 */
export interface BIP322Sig {
  /** address is the signer's address */
  address: string;
  /** sig is the actual signature in BIP-322 format */
  sig: Uint8Array;
}

function createBaseProofOfPossessionBTC(): ProofOfPossessionBTC {
  return { btcSigType: 0, btcSig: new Uint8Array(0) };
}

export const ProofOfPossessionBTC: MessageFns<ProofOfPossessionBTC> = {
  encode(
    message: ProofOfPossessionBTC,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.btcSigType !== 0) {
      writer.uint32(8).int32(message.btcSigType);
    }
    if (message.btcSig.length !== 0) {
      writer.uint32(18).bytes(message.btcSig);
    }
    return writer;
  },

  decode(
    input: BinaryReader | Uint8Array,
    length?: number,
  ): ProofOfPossessionBTC {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProofOfPossessionBTC();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 8) {
            break;
          }

          message.btcSigType = reader.int32() as any;
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.btcSig = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): ProofOfPossessionBTC {
    return {
      btcSigType: isSet(object.btcSigType)
        ? bTCSigTypeFromJSON(object.btcSigType)
        : 0,
      btcSig: isSet(object.btcSig)
        ? bytesFromBase64(object.btcSig)
        : new Uint8Array(0),
    };
  },

  toJSON(message: ProofOfPossessionBTC): unknown {
    const obj: any = {};
    if (message.btcSigType !== 0) {
      obj.btcSigType = bTCSigTypeToJSON(message.btcSigType);
    }
    if (message.btcSig.length !== 0) {
      obj.btcSig = base64FromBytes(message.btcSig);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<ProofOfPossessionBTC>, I>>(
    base?: I,
  ): ProofOfPossessionBTC {
    return ProofOfPossessionBTC.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<ProofOfPossessionBTC>, I>>(
    object: I,
  ): ProofOfPossessionBTC {
    const message = createBaseProofOfPossessionBTC();
    message.btcSigType = object.btcSigType ?? 0;
    message.btcSig = object.btcSig ?? new Uint8Array(0);
    return message;
  },
};

function createBaseBIP322Sig(): BIP322Sig {
  return { address: "", sig: new Uint8Array(0) };
}

export const BIP322Sig: MessageFns<BIP322Sig> = {
  encode(
    message: BIP322Sig,
    writer: BinaryWriter = new BinaryWriter(),
  ): BinaryWriter {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.sig.length !== 0) {
      writer.uint32(18).bytes(message.sig);
    }
    return writer;
  },

  decode(input: BinaryReader | Uint8Array, length?: number): BIP322Sig {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBIP322Sig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.address = reader.string();
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.sig = reader.bytes();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skip(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): BIP322Sig {
    return {
      address: isSet(object.address) ? globalThis.String(object.address) : "",
      sig: isSet(object.sig) ? bytesFromBase64(object.sig) : new Uint8Array(0),
    };
  },

  toJSON(message: BIP322Sig): unknown {
    const obj: any = {};
    if (message.address !== "") {
      obj.address = message.address;
    }
    if (message.sig.length !== 0) {
      obj.sig = base64FromBytes(message.sig);
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<BIP322Sig>, I>>(base?: I): BIP322Sig {
    return BIP322Sig.fromPartial(base ?? ({} as any));
  },
  fromPartial<I extends Exact<DeepPartial<BIP322Sig>, I>>(
    object: I,
  ): BIP322Sig {
    const message = createBaseBIP322Sig();
    message.address = object.address ?? "";
    message.sig = object.sig ?? new Uint8Array(0);
    return message;
  },
};

function bytesFromBase64(b64: string): Uint8Array {
  if ((globalThis as any).Buffer) {
    return Uint8Array.from(globalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = globalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if ((globalThis as any).Buffer) {
    return globalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(globalThis.String.fromCharCode(byte));
    });
    return globalThis.btoa(bin.join(""));
  }
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends globalThis.Array<infer U>
    ? globalThis.Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T extends {}
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & {
      [K in Exclude<keyof I, KeysOfUnion<P>>]: never;
    };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}

export interface MessageFns<T> {
  encode(message: T, writer?: BinaryWriter): BinaryWriter;
  decode(input: BinaryReader | Uint8Array, length?: number): T;
  fromJSON(object: any): T;
  toJSON(message: T): unknown;
  create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
  fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
