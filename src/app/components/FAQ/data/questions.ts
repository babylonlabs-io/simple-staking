import { shouldDisplayTestingMsg } from "@/config";

export interface Question {
  title: string;
  content: string;
}

export const questions = (coinName: string): Question[] => {
  const questionList = [
    {
      title: "What is Babylon?",
      content: `<p>Babylon is a suite of security-sharing protocols that bring Bitcoin\’s unparalleled security to the decentralized world. The latest protocol, Bitcoin Staking, enables Bitcoin holders to stake their Bitcoin to provide crypto-economic security to PoS (proof-of-stake) systems in a trustless and self-custodial way.</p>`,
    },
    {
      title: "How does Bitcoin Staking Work?",
      content: `<p>${coinName} holders lock their ${coinName} using the trustless and self-custodial Bitcoin Staking script for a predetermined time (timelock) in exchange for voting power in an underlying PoS protocol. In return, Bitcoin holders will earn PoS staking rewards.</p><br />
        <p>Finality providers perform the voting. A ${coinName} staker can create a finality provider by itself and self-delegate or delegate its voting power to a third-party finality provider.</p><br />
        <p>If a finality provider attacks the PoS system, the ${coinName}s behind the voting powers delegated to it will be subject to protocol slashing. This deters ${coinName} stakers and finality providers from attacking the PoS system.</p>
        `,
    },
    {
      title: "What does this staking dApp allow me to do?",
      content: `<p>The staking dApp allows ${coinName} holders to stake their ${coinName} and delegate their voting power to a finality provider they select. Stakers can view their past staking history and on-demand unlock their stake for early withdrawal.</p>`,
    },
    {
      title: `Does my ${coinName} leave my wallet once staked?`,
      content: `<p>Yes, it leaves your wallet. Your wallet will not show it as your available balance because it is locked. However, it is not sent to any third party. It is locked in a self-custodial contract you control. This means that any subsequent movement of the ${coinName} will need your approval, and you are the only one who can unbond the stake and withdraw.</p>`,
    },
    {
      title: `Is my ${coinName} Safe? Could I get slashed?`,
      content: `<p>You are not required to sign any PoS slashing-related authorizations. Thus, in theory, the ${coinName} in your self-custodial contract cannot be slashed due to the absence of your authorization.</p><br />

      <p>However, there are still risks associated with your ${coinName}:</p><br />
      
      <ol>
        <li>
          1. Code security<br />
          There is an inherent risk that the code developed for Bitcoin staking has vulnerabilities or bugs. The Babylon team has open-sourced the code, and it is under security audits.
        </li>
        <br />
        <li>
          2. System reliability<br />
          The Bitcoin staking system may be slow, unavailable, or compromised, which may cause the staking service to be unavailable or compromised, potentially leading to ${coinName} not being unbindable or not withdrawable.
        </li>
      </ol>
      `,
    },
    {
      title: "How long will it take for my stake to become active?",
      content: `<p>A stake’s status demonstrates the current stage of the staking process. All stake starts in a Pending state which denotes that the ${coinName} Staking transaction does not yet have sufficient ${coinName} block confirmations. As soon as it receives 10 ${coinName} block confirmations, the status transitions to <i>Overflow</i> or <i>Active</i>. </p><br />
      
      <p>In an amount-based cap, A stake is <i>Overflow</i> if the system has already accumulated the maximum amount of ${coinName} it can accept.</p><br />
      <p>In a time-based cap, where there is a starting block height and ending block height, a stake is <i>overflow</i> if it is included in a ${coinName} block that is newer than the ending block.</p><br /> 
      <p>Otherwise, the stake is <i>Active</i>.</p><br /> 
      <p><i>Overflow</i> stake should be on-demand unbonded and withdrawn.</p>`,
    },
    {
      title: "Do I get rewards for staking?",
      content: `<p>No. This is a locking-only phase without a PoS chain. There is no PoS staking reward nor incentives for participation.</p>`,
    },
    {
      title: "Are there any other ways to stake?",
      content: `<p>Hands-on stakers can operate the <a href="https://github.com/babylonchain/btc-staker/blob/dev/docs/create-phase1-staking.md" target="_blank" rel="noopener noreferrer" class="text-primary"><u>btc-staker CLI program</u></a> that allows for the creation of ${coinName} staking transactions from the CLI.</p>
      `,
    },
    {
      title: "Will I pay any fees for staking?",
      content: `<p>Yes, there are three transaction fees associated with staking, all charged by the Bitcoin network:</p><br />
      <ol>
        <li>
          1. <b>Staking Transaction Fee (Fs)</b>: This fee is for the staking transaction. To stake amount S, you need at least S + Fs in your wallet. It is calculated in real-time based on current network conditions.
        </li><br />
        <li>
          2. <b>Unbonding Transaction Fee (Fu)</b>: If you unbond your stake before it expires, this fee is deducted from your stake S, resulting in a withdrawable amount of S - Fu. Fu is a calculated static value to ensure inclusion in busy network conditions.
        </li><br />
        <li>
          3. <b>Withdraw Transaction Fee (Fw)</b>: This fee is for the withdrawal transaction that transfers the stake back to your wallet. It is deducted from your withdrawable stake, which is either S (if you wait until expiration) or S - Fu (if unbonded early). This fee ensures fast inclusion based on current network conditions.
        </li>
      </ol><br />
      <p>In summary, to stake S, you need S + Fs, and upon completion, you get S - Fw or S - Fu - Fw back, depending on whether you wait for expiration or unbond early.</p>`,
    },
  ];
  if (shouldDisplayTestingMsg()) {
    questionList.push({
      title: "What is the goal of this testnet?",
      content: `<p>The goal of this testnet is to ensure the security of the staked Bitcoins by testing the user's interaction with the ${coinName} network. This will be a lock-only network without any PoS chain operating, meaning that the only participants of this testnet will be finality providers and ${coinName} stakers.</p>`,
    });
  }
  return questionList;
};
