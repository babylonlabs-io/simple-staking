import { Wallet } from "xrpl";

import { deriveHDKeyFromEthereumSignature } from "./hd-key-utils"; // 위에서 만든 함수
/**
 * @description Ethereum 서명(signature)에서 Cosmos, Sui Private Key 생성
 *
 * @param signature - Ethereum 서명 (65바이트 Hex 문자열)
 *
 * @returns Cosmos 및 Sui Private Key
 */
export const generatePrivateKeysFromEthereumSignature = (
  signature: string,
): {
  mnemonic: string;
  xrpAddress: string;
  xrpPrivateKey: string;
} => {
  // 1️⃣ Ethereum 서명에서 니모닉 생성
  // console.time("derive HDKeyFromEthereumSignature")
  const { mnemonic } = deriveHDKeyFromEthereumSignature(signature);

  // 6️⃣ xrp 주소 생성
  const wallet = Wallet.fromMnemonic(mnemonic);
  const xrpAddress = wallet.address;
  const xrpPrivateKey = wallet.privateKey;

  return {
    mnemonic,
    xrpAddress,
    xrpPrivateKey,
  };
};
