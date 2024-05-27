export const questions = [
  {
    title: "What is Babylon?",
    content: `<p>Babylon is a suite of security-sharing protocols that bring Bitcoin\’s unparalleled security to the decentralized world. The latest protocol, Bitcoin Staking, enables Bitcoin holders to stake their Bitcoin to provide crypto-economic security to PoS (proof-of-stake) systems in a trustless and self-custodial way.</p>`,
  },
  {
    title: "How does Bitcoin Staking Work?",
    content: `<p>Signet Bitcoin holders lock their Signet Bitcoin using the trustless and self-custodial Bitcoin Staking script for a predetermined time (timelock) in exchange for voting power in an underlying PoS protocol. In return, Bitcoin holders will earn PoS staking rewards.</p><br />
      <p>Finality providers perform the voting. A Signet Bitcoin staker can create a finality provider by itself and self-delegate or delegate its voting power to a third-party finality provider.</p><br />
      <p>If a finality provider attacks the PoS system, the Signet Bitcoins behind the voting powers delegated to it will be subject to protocol slashing. This deters Signet Bitcoin stakers and finality providers from attacking the PoS system.</p>
      `,
  },
  {
    title: "What is the goal of this testnet?",
    content: `<p>The goal of this testnet is to ensure the security of the staked Bitcoins by testing the user's interaction with the Signet BTC network. This will be a lock-only network without any PoS chain operating, meaning that the only participants of this testnet will be finality providers and Signet Bitcoin stakers.</p>`,
  },
  {
    title: "What does this staking dApp allow me to do?",
    content: `<p>The staking dApp allows Signet Bitcoin holders to stake their Signet Bitcoin and delegate their voting power to a finality provider they select. Stakers can view their past staking history and on-demand unlock their stake for early withdrawal.</p>`,
  },
  {
    title: "Does my Signet Bitcoin leave my wallet once staked?",
    content: `<p>Yes, it leaves your wallet. Your wallet will not show it as your available balance because it is locked. However, it is not sent to any third party. It is locked in a self-custodial contract you control. This means that any subsequent movement of the Signet Bitcoin will need your approval, and you are the only one who can unbond the stake and withdraw.</p>`,
  },
  {
    title: "Is my Signet Bitcoin Safe? Could I get slashed?",
    content: `<p>In this testnet, you are not required to sign any PoS slashing-related authorizations. Thus, in theory, the Signet Bitcoin in your self-custodial contract cannot be slashed due to the absence of your authorization.</p><br />

    <p>However, there are still risks associated with your Signet Bitcoin:</p><br />
    
    <ol>
      <li>
        1. Code security<br />
        There is an inherent risk that the code developed for Bitcoin staking has vulnerabilities or bugs. The Babylon team has open-sourced the code, and it is under security audits.
      </li>
      <br />
      <li>
        2. System reliability<br />
        The Bitcoin staking system may be slow, unavailable, or compromised, which may cause the staking service to be unavailable or compromised, potentially leading to Signet Bitcoin not being unbindable or not withdrawable.
      </li>
    </ol>
    `,
  },
  {
    title: "How long will it take for my stake to become active?",
    content: `<p>A stake’s status demonstrates the current stage of the staking process. All stake starts in a Pending state which denotes that the Signet Bitcoin Staking transaction does not yet have sufficient Signet BTC block confirmations. As soon as it receives 10 Signet Bitcoin block confirmations, the status transitions to <i>Overflow</i> or <i>Active</i>. A stake is <i>Overflow</i> if the system has already accumulated the maximum amount of Signet Bitcoin it can accept. Otherwise, the stake is <i>Active</i>. <i>Overflow</i> stake should be on-demand unbonded and withdrawn.</p>`,
  },
  {
    title: "Do I get rewards for staking?",
    content: `<p>No. This is a locking-only testnet without a PoS chain. There is no PoS staking reward nor incentives for participation.</p>`,
  },
  {
    title: "Are there any other ways to stake?",
    content: `<p>Hands-on stakers can operate the <a href="https://github.com/babylonchain/btc-staker/blob/dev/docs/create-phase1-staking.md" target="_blank" rel="noopener noreferrer" class="text-primary"><u>btc-staker CLI program</u></a> that allows for the creation of Signet Bitcoin staking transactions from the CLI.</p>
    `,
  },
];
