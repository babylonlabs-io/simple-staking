import { ReactNode } from "react";

export interface Question {
  title: string;
  content: ReactNode;
}

export const questions = (coinName: string): Question[] => {
  const questionList = [
    {
      title: "What is Babylon?",
      content: (
        <p>
          Babylon is a suite of security-sharing protocols that bring
          Bitcoin&apos;s unparalleled security to the decentralized world. The
          latest protocol, Bitcoin Staking, enables Bitcoin holders to stake
          their Bitcoin to provide crypto-economic security to PoS
          (proof-of-stake) systems in a trustless and self-custodial way.
        </p>
      ),
    },
    {
      title: "How does Bitcoin Staking work?",
      content: (
        <>
          <p>
            {coinName} holders lock their {coinName} using the trustless and
            self-custodial Bitcoin Staking script for a predetermined time
            (timelock) in exchange for voting power in an underlying PoS
            protocol. In return, Bitcoin holders will earn PoS staking rewards.
          </p>
          <br />
          <p>
            Finality Providers perform the voting. A Finality Provider is an
            entity responsible for casting votes on behalf of {coinName}{" "}
            stakers, helping secure the PoS protocol.
          </p>
          <br />
          <p>
            If a Finality Provider attacks the PoS system, the {coinName}s
            behind the voting powers delegated to it will be subject to protocol
            slashing. This deters {coinName} stakers and Finality Providers from
            attacking the PoS system.
          </p>
        </>
      ),
    },
    {
      title: "What does this staking dApp allow me to do?",
      content: (
        <p>
          The staking dApp is an interface to the Babylon Bitcoin Staking
          protocol. It interacts with both the Bitcoin and Babylon Genesis
          blockchains to create Bitcoin staking transactions, and to register
          the stake and delegation of voting power to a selected Finality
          Provider on the Babylon Genesis chain. The staked Bitcoin provides
          slashable proof-of-stake security to Babylon Genesis and earns BABY as
          staking reward.
        </p>
      ),
    },
    {
      title: `Does my ${coinName} leave my wallet once staked?`,
      content: (
        <p>
          Your {coinName} does not leave your custody. It is important to note
          that once your {coinName} is staked, your wallet will not display your
          locked {coinName} balance. This is because the current wallet software
          has not been updated to display staked {coinName} balances. When
          staking, you do not send the {coinName} to a third party. It is locked
          in a self-custodial Bitcoin Staking script that you control. This
          means that any subsequent movement of the {coinName} will need your
          approval. You are the only one who can unbond the stake and withdraw.
        </p>
      ),
    },
    {
      title: "Are there any other ways to stake?",
      content: (
        <p>
          Users with a technical background can use the{" "}
          <a
            href="https://github.com/babylonlabs-io/btc-staker/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            <u>btc-staker CLI program</u>
          </a>{" "}
          to create {coinName} staking transactions from the CLI.
        </p>
      ),
    },
    {
      title:
        "Is it ok to use a wallet holding fungible tokens built on Bitcoin (e.g. BRC-20/ARC-20/Runes)?",
      content: (
        <p>
          No, this should be avoided. Please do not connect or use a Bitcoin
          wallet holding BRC-20, ARC-20, Runes, or other NFTs or Bitcoin-native
          assets (other than {coinName}). They are still in their infancy and in
          an experimental phase. Software built for the detection of such tokens
          to avoid their misspending may not work, and you could lose all such
          tokens.
        </p>
      ),
    },
    {
      title:
        "If I have multiple stakes funded by the same BTC address but using different BABY addresses, is there a way for me to view all?",
      content: (
        <p>
          Yes. Click the dropdown next to the &apos;Connect Wallets&apos; button
          or the &apos;Wallets Connected&apos; area, and toggle on &quot;Linked
          Wallet Stakes&quot;. This will display all delegations associated with
          the connected {coinName} key, regardless of which Babylon account the
          stakes are associated with.
        </p>
      ),
    },
    {
      title: "Is there a staking cap?",
      content: (
        <p>
          The Babylon Genesis launch included a two-week period (April 10 – 24,
          2025) during which registration was capped at Phase-1 Cap-1 stakes
          (1,000 bitcoins). The system is now permissionless, with no cap.
        </p>
      ),
    },
    {
      title: "Why do I need to connect two wallets?",
      content: (
        <p>
          Because Bitcoin and Babylon Genesis are different networks with
          different address formats, you&apos;ll need to connect two wallets.
          However, If your wallet supports both networks, you can use it for
          both connections.
        </p>
      ),
    },
    {
      title: "Are there any geo-restrictions for accessing Babylon Genesis?",
      content: (
        <p>
          Due to applicable laws and regulations, Babylon Genesis may not be
          available in all jurisdictions. Users are advised to consult the{" "}
          <a
            href="https://babylonlabs.io/terms-of-use"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            <u>Terms of Use</u>
          </a>{" "}
          to determine access eligibility based on their location.
        </p>
      ),
    },
    {
      title: "How should I choose my finality provider?",
      content: (
        <p>
          If you&apos;d like to learn more about a specific Finality Provider,
          we recommend doing your own due diligence by starting with their
          website or social channels.
        </p>
      ),
    },
    {
      title: "How long will it take for my stake to become active?",
      content: (
        <p>
          Your stake becomes active after it receives at least 10 Bitcoin block
          confirmations and is registered and verified by the Babylon Genesis
          chain. This process typically takes around 100 minutes, depending on
          Bitcoin network conditions.
        </p>
      ),
    },
    {
      title: "What is slashing and can it happen to me?",
      content: (
        <p>
          When you stake {coinName} in Babylon Genesis, your {coinName} remains
          locked in a self-custodial Bitcoin script — you do not transfer
          custody to Babylon or any third party. However, staking carries
          slashing risk. When you stake, you pre-authorize a slashing condition
          within the Bitcoin script. If a cryptographic offense occurs — such as
          a Finality Provider (FP) you staked against double-signing — a
          predefined percentage of your staked {coinName} can be slashed
          (burned) without needing further authorization from you.
        </p>
      ),
    },
    {
      title: "Will I pay any fees for staking?",
      content: (
        <>
          <p>Yes. There are two types of fees:</p>
          <br />
          <b>Babylon Genesis Network Fees</b>
          <p>
            You&apos;ll pay a gas fee when registering your stake and when
            claiming rewards.
          </p>
          <br />
          <b>Bitcoin Network Fees</b>
          <p>
            {coinName} is required to cover fees for staking, unbonding, and
            withdrawing.
          </p>
          <br />
          <p>Fees vary depending on network conditions.</p>
        </>
      ),
    },
  ];
  return questionList;
};
