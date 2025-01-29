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
            Finality providers perform the voting. A {coinName} staker can
            create a finality provider by itself and self-delegate or delegate
            its voting power to a third-party finality provider.
          </p>
          <br />
          <p>
            If a finality provider attacks the PoS system, the {coinName}s
            behind the voting powers delegated to it will be subject to protocol
            slashing. This deters {coinName} stakers and finality providers from
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
          protocol. The Babylon Bitcoin Staking protocol allows {coinName}{" "}
          holders to stake their {coinName} and delegate their voting power to a
          finality provider they select. Stakers can view their past staking
          history and send a request to unlock their stake for early withdrawal.
        </p>
      ),
    },
    {
      title: `Does my ${coinName} leave my wallet once staked?`,
      content: (
        <p>
          Technically, your {coinName} has not left your custody. However, your
          wallet will not show the {coinName} you staked in your available
          balance once that {coinName} is locked. Current wallet implementations
          do not yet know how to display staked {coinName} that is still in your
          custody. When staking, you do not send the {coinName} to a third
          party. It is locked in a self-custodial Bitcoin Staking script that
          you control. This means that any subsequent movement of the {coinName}{" "}
          will need your approval. You are the only one who can unbond the stake
          and withdraw.
        </p>
      ),
    },
    {
      title: "Are there any other ways to stake?",
      content: (
        <p>
          Hands-on stakers can operate the{" "}
          <a
            href="https://github.com/babylonlabs-io/btc-staker/blob/main/README.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            <u>btc-staker CLI program</u>
          </a>{" "}
          that allows for the creation of {coinName} staking transactions from
          the CLI.
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
          to avoid their misspending may not work, and you may lose all such
          tokens.
        </p>
      ),
    },
  ];
  return questionList;
};
