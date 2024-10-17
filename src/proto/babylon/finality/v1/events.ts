// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.2.0
//   protoc               unknown
// source: babylon/finality/v1/events.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from "@bufbuild/protobuf/wire";
import { Evidence } from "./finality";

export const protobufPackage = "babylon.finality.v1";

/**
 * EventSlashedFinalityProvider is the event emitted when a finality provider is slashed
 * due to signing two conflicting blocks
 */
export interface EventSlashedFinalityProvider {
  /** evidence is the evidence that the finality provider double signs */
  evidence: Evidence | undefined;
}

/**
 * EventJailedFinalityProvider is the event emitted when a finality provider is
 * jailed due to inactivity
 */
export interface EventJailedFinalityProvider {
  /** public_key is the BTC public key of the finality provider */
  publicKey: string;
}

function createBaseEventSlashedFinalityProvider(): EventSlashedFinalityProvider {
  return { evidence: undefined };
}

export const EventSlashedFinalityProvider: MessageFns<EventSlashedFinalityProvider> =
  {
    encode(
      message: EventSlashedFinalityProvider,
      writer: BinaryWriter = new BinaryWriter(),
    ): BinaryWriter {
      if (message.evidence !== undefined) {
        Evidence.encode(message.evidence, writer.uint32(10).fork()).join();
      }
      return writer;
    },

    decode(
      input: BinaryReader | Uint8Array,
      length?: number,
    ): EventSlashedFinalityProvider {
      const reader =
        input instanceof BinaryReader ? input : new BinaryReader(input);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = createBaseEventSlashedFinalityProvider();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            if (tag !== 10) {
              break;
            }

            message.evidence = Evidence.decode(reader, reader.uint32());
            continue;
        }
        if ((tag & 7) === 4 || tag === 0) {
          break;
        }
        reader.skip(tag & 7);
      }
      return message;
    },

    fromJSON(object: any): EventSlashedFinalityProvider {
      return {
        evidence: isSet(object.evidence)
          ? Evidence.fromJSON(object.evidence)
          : undefined,
      };
    },

    toJSON(message: EventSlashedFinalityProvider): unknown {
      const obj: any = {};
      if (message.evidence !== undefined) {
        obj.evidence = Evidence.toJSON(message.evidence);
      }
      return obj;
    },

    create<I extends Exact<DeepPartial<EventSlashedFinalityProvider>, I>>(
      base?: I,
    ): EventSlashedFinalityProvider {
      return EventSlashedFinalityProvider.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<EventSlashedFinalityProvider>, I>>(
      object: I,
    ): EventSlashedFinalityProvider {
      const message = createBaseEventSlashedFinalityProvider();
      message.evidence =
        object.evidence !== undefined && object.evidence !== null
          ? Evidence.fromPartial(object.evidence)
          : undefined;
      return message;
    },
  };

function createBaseEventJailedFinalityProvider(): EventJailedFinalityProvider {
  return { publicKey: "" };
}

export const EventJailedFinalityProvider: MessageFns<EventJailedFinalityProvider> =
  {
    encode(
      message: EventJailedFinalityProvider,
      writer: BinaryWriter = new BinaryWriter(),
    ): BinaryWriter {
      if (message.publicKey !== "") {
        writer.uint32(10).string(message.publicKey);
      }
      return writer;
    },

    decode(
      input: BinaryReader | Uint8Array,
      length?: number,
    ): EventJailedFinalityProvider {
      const reader =
        input instanceof BinaryReader ? input : new BinaryReader(input);
      let end = length === undefined ? reader.len : reader.pos + length;
      const message = createBaseEventJailedFinalityProvider();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            if (tag !== 10) {
              break;
            }

            message.publicKey = reader.string();
            continue;
        }
        if ((tag & 7) === 4 || tag === 0) {
          break;
        }
        reader.skip(tag & 7);
      }
      return message;
    },

    fromJSON(object: any): EventJailedFinalityProvider {
      return {
        publicKey: isSet(object.publicKey)
          ? globalThis.String(object.publicKey)
          : "",
      };
    },

    toJSON(message: EventJailedFinalityProvider): unknown {
      const obj: any = {};
      if (message.publicKey !== "") {
        obj.publicKey = message.publicKey;
      }
      return obj;
    },

    create<I extends Exact<DeepPartial<EventJailedFinalityProvider>, I>>(
      base?: I,
    ): EventJailedFinalityProvider {
      return EventJailedFinalityProvider.fromPartial(base ?? ({} as any));
    },
    fromPartial<I extends Exact<DeepPartial<EventJailedFinalityProvider>, I>>(
      object: I,
    ): EventJailedFinalityProvider {
      const message = createBaseEventJailedFinalityProvider();
      message.publicKey = object.publicKey ?? "";
      return message;
    },
  };

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
