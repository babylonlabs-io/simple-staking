import { WalletProvider, Network, Fees, UTXO } from "./wallet_provider";
import {
  getAddressBalance,
  getTipHeight,
  getFundingUTXOs,
  getNetworkFees,
  pushTx,
} from "../mempool_api";
import { Psbt } from 'bitcoinjs-lib'

type BitgetWalletInfo = {
  publicKeyHex: string;
  address: string;
};

export class BitgetWallet extends WalletProvider {
  private bitgetWalletInfo: BitgetWalletInfo | undefined;
  private provider = window?.bitkeep?.unisat
  constructor() {
    super();
  }

  connectWallet = async (): Promise<any> => {
    // check whether there is an Bitget Wallet extension
    if (!this.provider) {
      throw new Error("Bitget Wallet extension not found");
    }

    try {
      await this.provider?.requestAccounts() // Connect to Bitget Wallet extension
      await this.provider?.switchNetwork('signet')
    } catch (error) {
      if ((error as Error)?.message?.includes('rejected')) {
        throw new Error('Connection to Bitget Wallet was rejected')
      } else {
        throw new Error((error as Error)?.message)
      }
    }

    const address = await this.getAddress()
    const publicKeyHex = await this.getPublicKeyHex()

    if (address && publicKeyHex) {
      this.bitgetWalletInfo = {
        publicKeyHex,
        address,
      };
      return this;
    } else {
      throw new Error("Could not connect to Bitget Wallet");
    }
  };

  getWalletProviderName = async (): Promise<string> => {
    return 'Bitget Wallet';
  };

  getAddress = async (): Promise<string> => {
    let accounts = (await this.provider?.getAccounts()) || []
    return accounts[0]
  };

  getPublicKeyHex = async (): Promise<string> => {
    let publicKey = await this.provider?.getPublicKey()
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
        from: this.provider?.selectedAddress,
        __internalFunc: '__signPsbt_babylon',
        psbtHex,
        options: {
          autoFinalized: true
        }
      }
    }

    let signedPsbt = await this.provider?.request('dappsSign', data)
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
        from: this.provider?.selectedAddress,
        __internalFunc: '__signPsbts_babylon',
        psbtHex: '_',
        psbtsHexes,
        options
      }
    }

    try {
      let signedPsbts = await this.provider?.request('dappsSign', data)
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
    return await this.provider?.signMessage(message, 'bip322-simple')
  };

  getNetwork = async (): Promise<Network> => {
    let network = await this.provider?.getNetwork()

    if (network === 'signet') {
      return 'testnet'
    }
    return network
  };

  on = (eventName: string, callBack: () => void) => {
    return this.provider?.on(eventName, callBack);
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
