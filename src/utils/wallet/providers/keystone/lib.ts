import * as bitcoin from 'bitcoinjs-lib';
import { encode } from 'varuint-bitcoin';

enum AddressType {
    P2PKH,
    P2WPKH,
    P2TR,
    P2SH_P2WPKH,
    M44_P2WPKH, // deprecated
    M44_P2TR, // deprecated
    P2WSH,
    P2SH,
    UNKNOWN,
}

export enum NetworkType {
    MAINNET,
    TESTNET,
    REGTEST,
}

function bip0322_hash(message: string) {
    const { sha256 } = bitcoin.crypto
    const tag = 'BIP0322-signed-message'
    const tagHash = sha256(Buffer.from(tag))
    const result = sha256(
        Buffer.concat([tagHash, tagHash, Buffer.from(message)])
    )
    return result.toString('hex')
}

function toPsbtNetwork(networkType: NetworkType) {
    if (networkType === NetworkType.MAINNET) {
        return bitcoin.networks.bitcoin;
    } else if (networkType === NetworkType.TESTNET) {
        return bitcoin.networks.testnet;
    } else {
        return bitcoin.networks.regtest;
    }
}

function addressToScriptPk(address: string, networkType: NetworkType) {
    const network = toPsbtNetwork(networkType);
    return bitcoin.address.toOutputScript(address, network);
}

export function getAddressType(
    address: string,
    networkType: NetworkType = NetworkType.MAINNET
): AddressType {
    return decodeAddress(address).addressType;
}

function getAddressTypeDust(addressType: AddressType) {
    if (
        addressType === AddressType.P2WPKH ||
        addressType === AddressType.M44_P2WPKH
    ) {
        return 294;
    } else if (
        addressType === AddressType.P2TR ||
        addressType === AddressType.M44_P2TR
    ) {
        return 330;
    } else {
        return 546;
    }
}

function decodeAddress(address: string) {
    const mainnet = bitcoin.networks.bitcoin;
    const testnet = bitcoin.networks.testnet;
    const regtest = bitcoin.networks.regtest;
    let decodeBase58: bitcoin.address.Base58CheckResult;
    let decodeBech32: bitcoin.address.Bech32Result;
    let networkType: NetworkType = NetworkType.MAINNET;
    let addressType: AddressType = AddressType.UNKNOWN;
    if (
        address.startsWith("bc1") ||
        address.startsWith("tb1") ||
        address.startsWith("bcrt1")
    ) {
        try {
            decodeBech32 = bitcoin.address.fromBech32(address);
            if (decodeBech32.prefix === mainnet.bech32) {
                networkType = NetworkType.MAINNET;
            } else if (decodeBech32.prefix === testnet.bech32) {
                networkType = NetworkType.TESTNET;
            } else if (decodeBech32.prefix === regtest.bech32) {
                networkType = NetworkType.REGTEST;
            }
            if (decodeBech32.version === 0) {
                if (decodeBech32.data.length === 20) {
                    addressType = AddressType.P2WPKH;
                } else if (decodeBech32.data.length === 32) {
                    addressType = AddressType.P2WSH;
                }
            } else if (decodeBech32.version === 1) {
                if (decodeBech32.data.length === 32) {
                    addressType = AddressType.P2TR;
                }
            }
            return {
                networkType,
                addressType,
                dust: getAddressTypeDust(addressType),
            };
        } catch (e) { }
    } else {
        try {
            decodeBase58 = bitcoin.address.fromBase58Check(address);
            if (decodeBase58.version === mainnet.pubKeyHash) {
                networkType = NetworkType.MAINNET;
                addressType = AddressType.P2PKH;
            } else if (decodeBase58.version === testnet.pubKeyHash) {
                networkType = NetworkType.TESTNET;
                addressType = AddressType.P2PKH;
            } else if (decodeBase58.version === regtest.pubKeyHash) {
                // do not work
                networkType = NetworkType.REGTEST;
                addressType = AddressType.P2PKH;
            } else if (decodeBase58.version === mainnet.scriptHash) {
                networkType = NetworkType.MAINNET;
                addressType = AddressType.P2SH_P2WPKH;
            } else if (decodeBase58.version === testnet.scriptHash) {
                networkType = NetworkType.TESTNET;
                addressType = AddressType.P2SH_P2WPKH;
            } else if (decodeBase58.version === regtest.scriptHash) {
                // do not work
                networkType = NetworkType.REGTEST;
                addressType = AddressType.P2SH_P2WPKH;
            }

            return {
                networkType,
                addressType,
                dust: getAddressTypeDust(addressType),
            };
        } catch (e) { }
    }

    return {
        networkType: NetworkType.MAINNET,
        addressType: AddressType.UNKNOWN,
        dust: 546,
    };
}

export function generatePsbtOfBIP322Simple({
    message,
    address,
    networkType,
}: {
    message: string
    address: string
    networkType: NetworkType
}) {
    const outputScript = addressToScriptPk(address, networkType)
    const addressType = getAddressType(address, networkType)
    const supportedTypes = [
        AddressType.P2WPKH,
        AddressType.P2TR,
        AddressType.M44_P2WPKH,
        AddressType.M44_P2TR,
    ]
    if (supportedTypes.includes(addressType) == false) {
        throw new Error('Not support address type to sign')
    }

    const prevoutHash = Buffer.from(
        '0000000000000000000000000000000000000000000000000000000000000000',
        'hex'
    )
    const prevoutIndex = 0xffffffff
    const sequence = 0
    const scriptSig = Buffer.concat([
        Buffer.from('0020', 'hex'),
        Buffer.from(bip0322_hash(message), 'hex'),
    ])

    const txToSpend = new bitcoin.Transaction()
    txToSpend.version = 0
    txToSpend.addInput(prevoutHash, prevoutIndex, sequence, scriptSig)
    txToSpend.addOutput(outputScript, 0)

    const psbtToSign = new bitcoin.Psbt()
    psbtToSign.setVersion(0)
    psbtToSign.addInput({
        hash: txToSpend.getHash(),
        index: 0,
        sequence: 0,
        witnessUtxo: {
            script: outputScript,
            value: 0,
        },
    })
    psbtToSign.addOutput({ script: Buffer.from('6a', 'hex'), value: 0 })

    return psbtToSign
}

export function extractSignatureFromPsbtOfBIP322Simple(psbt: bitcoin.Psbt) {
    const txToSign = psbt.extractTransaction()

    function encodeVarString(b:any) {
        return Buffer.concat([encode(b.byteLength), b])
    }

    const len = encode(txToSign.ins[0].witness.length)
    const result = Buffer.concat([
        len,
        ...txToSign.ins[0].witness.map((w) => encodeVarString(w)),
    ])
    const signature = result.toString('base64')

    return signature
}