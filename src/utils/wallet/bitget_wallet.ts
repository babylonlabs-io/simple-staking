import { WalletProvider, Network, Fees, UTXO } from "./wallet_provider";
import {
  getAddressBalance,
  getTipHeight,
  getFundingUTXOs,
  getNetworkFees,
  pushTx,
} from "../mempool_api";
import { Psbt } from 'bitcoinjs-lib'

export class BitgetWallet extends WalletProvider {
  constructor() {
    super();
  }

  connectWallet = async (): Promise<any> => {
    // check whether there is an Bitget Wallet extension
    if (!window?.bitkeep?.unisat) {
      throw new Error("Bitget Wallet extension not found");
    }

    try {
      const wallet = await window?.bitkeep?.unisat?.requestAccounts() // Connect to Bitget Wallet extension
      await window?.bitkeep?.unisat?.switchNetwork('signet')
      return wallet
    } catch (error) {
      if ((error as Error)?.message?.includes('rejected')) {
        throw new Error('Connection to Bitget Wallet was rejected')
      } else {
        throw new Error((error as Error)?.message)
      }
    }
  };

  getWalletProviderName = async (): Promise<string> => {
    return 'Bitget Wallet';
  };

  getAddress = async (): Promise<string> => {
    let accounts = (await window?.bitkeep?.unisat?.getAccounts()) || []
    return accounts[0]
  };

  getPublicKeyHex = async (): Promise<string> => {
    let publicKey = await window?.bitkeep?.unisat?.getPublicKey()
    if (!publicKey) {
      console.log('bitget Wallet not connected')
      return ''
    }
    return publicKey
  };

  signPsbt = async (psbtHex: string): Promise<string> => {
    const data = {
      method: 'signPsbt',
      params: {
        from: window?.bitkeep?.unisat?.selectedAddress,
        __internalFunc: '__signPsbt_babylon',
        psbtHex,
        options: {
          autoFinalized: true
        }
      }
    }

    let signedPsbt = await window?.bitkeep?.unisat?.request('dappsSign', data)
    let psbt = Psbt.fromHex(signedPsbt)
    try {
      psbt.finalizeAllInputs()
    } catch (error) {
      console.log('babylon-signPsbt failed', error)
    }

    let transaction = psbt.extractTransaction()
    return transaction.toHex()
  };

  signPsbts = async (psbtsHexes: string[]): Promise<string[]> => {
    if (!psbtsHexes && !Array.isArray(psbtsHexes)) {
      throw 'parmas error'
    }
    const options = psbtsHexes.map(_ => {
      return {
        autoFinalized: true
      }
    })
    const data = {
      method: 'signPsbt',
      params: {
        from: window?.bitkeep?.unisat?.selectedAddress,
        __internalFunc: '__signPsbts_babylon',
        psbtHex: '_',
        psbtsHexes,
        options
      }
    }

    try {
      let signedPsbts = await window?.bitkeep?.unisat?.request('dappsSign', data)
      signedPsbts = signedPsbts.split(',')
      return signedPsbts.map((tx:string) => {
        let psbt = Psbt.fromHex(tx)
        try {
          psbt.finalizeAllInputs()
        } catch (error) {
          console.log('babylon-signPsbts failed', error)
        }

        let transaction = psbt.extractTransaction()
        return transaction.toHex()
      })
    } catch (error) {
      throw new Error((error as Error)?.message)
    }
  };

  signMessageBIP322 = async (message: string): Promise<string> => {
    return await window?.bitkeep?.unisat?.signMessage(message, 'bip322-simple')
  };

  getNetwork = async (): Promise<Network> => {
    let network = await window?.bitkeep?.unisat?.getNetwork()

    if (network === 'signet') {
      return 'testnet'
    }
    return network
  };

  on = (eventName: string, callBack: () => void) => {
    return window?.bitkeep?.unisat?.on(eventName, callBack);
  };

  // Mempool calls
  getBalance = async (): Promise<number> => {
    return await getAddressBalance(await this.getAddress());
  };

  getNetworkFees = async (): Promise<Fees> => {
    return await getNetworkFees();
  };

  pushTx = async (txHex: string): Promise<string> => {
    return await pushTx(txHex);
  };

  getUtxos = async (address: string, amount: number): Promise<UTXO[]> => {
    // mempool call
    return await getFundingUTXOs(address, amount);
  };

  getBTCTipHeight = async (): Promise<number> => {
    return await getTipHeight();
  };
}
