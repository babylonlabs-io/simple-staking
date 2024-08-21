import { Icon } from "@/app/components/Logo/Icon";
import { getNetworkAppUrl } from "@/config";

export const Terms = () => {
  const url = getNetworkAppUrl();

  return (
    <div className="rounded-2xl border border-neutral-content p-6 dark:border-neutral-content/20 overflow-y-scroll no-scrollbar max-h-[100vh] terms-privacy-container">
      <p className="italic">Last updated 20 August 2024</p>
      <br />
      <p>
        Please read these Terms of Use (<strong>&quot;Terms&quot;</strong>)
        carefully before interacting with or otherwise using the website at{" "}
        <a href="https://babylonlabs.io" className="text-primary">
          babylonlabs.io
        </a>{" "}
        including any content, tools, applications, services, or features (the{" "}
        <strong>&quot;Website&quot;</strong>) or the user interface at{" "}
        <a href={url} className="text-primary">
          {url}
        </a>{" "}
        including any content, tools, applications, services, or features (the{" "}
        <strong>&quot;Interface&quot;</strong>) or the API described{" "}
        <a
          href="https://staking-api.babylonlabs.io/swagger/index.html"
          className="text-primary"
        >
          here
        </a>{" "}
        including any content, tools, applications, services, or features {""}
        (the <strong>&quot;API&quot;</strong>, and together with the Website,
        the <strong>&quot;Services&quot;</strong>).
      </p>
      <br />
      <p>
        These Terms (and any other terms or policies referenced in these Terms)
        govern your use of the Services and apply to you and each individual,
        entity, group, or association (each and collectively,{" "}
        <strong>&quot;you&quot;, &quot;your&quot;</strong>) who views, interacts
        with, links to, or otherwise uses the Services. Any use of the Services
        serves as your acceptance of these Terms. You agree to comply with all
        of these Terms.
      </p>
      <br />
      <p>
        If you do not meet the eligibility requirements set forth in Section 2,
        or are otherwise not in compliance with these Terms, you must not
        interact with, or access, or otherwise use the Services.
      </p>
      <br />
      <p>
        <strong>
          Please read the binding arbitration provision and class action waiver
          in Section 16 below, both of which impact your rights as to how
          disputes are resolved and limit the manner in which you can seek
          relief from us. You will be permitted to pursue claims against us or
          our agents only on an individual basis and not as a plaintiff or class
          member in any class or representative action or proceeding, and you
          will only be permitted to seek relief (including monetary, injunctive,
          and declaratory relief) on an individual basis. Applicable law may
          permit you to opt out of these arbitration provisions within a brief
          amount of time after you accept these terms. In either case, the
          provisions of Section 17, &quot;governing law&quot;, will apply.
        </strong>
      </p>
      <br />
      <p>
        We may change, add, remove, or modify these Terms including any
        provisions in these Terms, at any time in our sole discretion. If we do,
        we will post the changes on this page and will indicate at the top of
        this page the date these Terms were last revised. It is your
        responsibility to check these Terms periodically for changes, and we
        encourage you to do so regularly. Your continued use of the Services
        following the posting of changes indicates your agreement to and
        acceptance of the changes. We may change or discontinue all or any part
        of the Services, at any time and without notice, at our sole discretion.
      </p>
      <br />
      <p>
        <strong>&quot;Babylon Labs&quot;</strong>,{" "}
        <strong>&quot;we&quot;</strong>, <strong>&quot;our&quot;</strong>, or{" "}
        <strong>&quot;us&quot;</strong> means Babylon Labs Ltd.
      </p>
      <br />
      <h3>1. THE INTERFACE AND THE PROTOCOLS</h3>
      <br />
      <p>
        The Interface is a free web application that connects users to one or
        more publicly available protocols and networks (the{" "}
        <strong>”Protocols”</strong>), much like you use a web browser as an
        interface to connect to the internet. You don’t need the Interface to
        interact with the Protocols, but it helps. Anyone with internet access
        and technical sophistication can interact directly with the Protocols
        without using the Interface. The Interface also displays publicly
        available third-party information available from other sources, such as
        blockchain transaction history.
      </p>
      <br />
      <p>
        <strong>Know Your Protocols</strong>. By interacting with the Protocols,
        you can access their functionalities, for example, to self-authorize a
        staking transaction handled by the Protocols. The Interface and API are
        provided by us as supported by a community of contributors
        (collectively,
        <strong>&quot;Provider&quot;</strong>). You should research and
        understand the Protocols before using them. You can review their
        software source codes that are freely licensed to the public and
        available at GitHub. We do not operate or control the Protocols, or
        their validators or finality providers, although we may contribute to
        the code base used by those who do.
      </p>
      <br />
      <p>
        <strong>Bring Your Own Wallet</strong>. The Interface does not have its
        own crypto wallet. You will need to use a third-party wallet provider.
        The Interface is a non-custodial application, and we do not ever have
        custody, possession, or control of your Bitcoin, cryptocurrency, or
        blockchain tokens (<strong>&quot;Digital Assets&quot;</strong>). You are
        solely responsible for your custody of your Digital Assets and the
        cryptographic private keys to the Digital Asset wallets you hold. You
        should never share your private keys, wallet credentials, or seed phrase
        with anyone. Compatibility of the Interface with wallet applications,
        devices, or other third-party applications is not an endorsement or
        recommendation of such applications or devices, or a warranty,
        guarantee, promise, or assurance regarding their fitness or security. We
        are not and will not be responsible or liable for any claims, damages,
        losses or liabilities whatsoever resulting from the compromise of your
        wallet or your Digital Assets, which arise directly or indirectly from
        your failure to comply with these Terms.
      </p>
      <br />
      <p>
        <strong>Your BTC is at Stake</strong>. You may use the Interface to send
        instructions to the Bitcoin protocol to stake your bitcoin. Full native
        Bitcoin staking may not be enabled when you stake your Bitcoin. However,
        full Bitcoin staking may be enabled without any notice to you. Once
        enabled, a portion or the entirety of your staked Bitcoin may be
        forfeited (what is commonly described as slashing) depending on the
        Protocol, the finality provider, and the proof-of-stake network for
        which you staked your Bitcoin.
      </p>
      <br />
      <p>
        <strong>Network Fees</strong>. We do not collect any compensation from
        you for use of the Services in accordance with these Terms. However, you
        will need to pay network fees to have transaction messages delivered
        through the Protocol and results recorded on the appropriate blockchain.
        Examples include staking, unbonding, and withdrawal transactions. The
        Interface may provide estimates of network fees. However, the actual
        network fee may be different and may be a higher amount. Provider does
        not receive such fees and has no ability to reverse or refund any
        amounts paid in error.{" "}
        <strong>
          If you lock your bitcoin in a staking transaction without the
          necessary amount of bitcoin to pay for the unbonding and withdrawal
          transactions, your bitcoin will be forever locked
        </strong>
        . Provider will have no liability for any difference between the amount
        of the estimate and the actual network fee, or for you locking your
        bitcoin with insufficient bitcoin to pay for the unbonding and
        withdrawal.
      </p>
      <br />
      <p>
        <strong>Your Keys, Your Coins</strong>. The Provider and the Interface
        are not agents or intermediaries. Neither the Interface nor Provider
        stores, has access to or control over any of your Digital Assets,
        private keys, passwords, accounts or other property of yours. Neither
        the Interface nor Provider is capable of performing transactions or
        sending transaction messages on your behalf. Neither the Interface nor
        Provider holds or has the ability to purchase, sell or trade any Digital
        Assets. All transactions relating to the Protocol are executed and
        recorded solely through your interactions with the respective
        blockchains. The interactions are not under the control of or affiliated
        with Provider or the Interface.
      </p>
      <br />
      <p>
        You may give staking, unbonding and withdrawal instructions to the
        Protocols, but we cannot initiate those, nor can we prevent slashing.
        All draft transaction messages are sent to a third-party wallet
        application or device you designate by pressing the ‘Connect Wallet’ (or
        similar) button on the Interface. You must personally review and
        authorize all transaction messages you wish to send by signing the
        relevant transaction message with a private cryptographic key that is
        inaccessible to the Interface or Provider.
      </p>
      <br />
      <p>
        <strong>No Bitcoin-Native Assets (Besides Bitcoin)</strong>. Do not
        connect or use a Bitcoin wallet holding BRC-20, ARC-20, Runes, or other
        NFTs or Bitcoin-native assets (other than bitcoin) with the Interface.
        They are still in their infancy and in an experimental phase. Software
        built for the detection of such tokens to avoid their misspending may
        not work, and you may lose all your fungible tokens.
      </p>
      <br />
      <h3>2. ELIGIBILITY</h3>
      <br />
      <p>
        You are not eligible to access or use any Service, and you represent and
        warrant that you will not access or use any of the Services:
      </p>
      <ol>
        <li>
          unless you are at least 18 years old and have the legal capacity to
          consent and agree to be bound by these Terms;
        </li>
        <li>
          unless you have the technical knowledge necessary or advisable to
          understand and evaluate the risks of using the Interface and the
          Protocols;
        </li>
        <li>
          if you are a resident or agent of, or an entity organized,
          incorporated or doing business in, any country to which the United
          States, the United Kingdom, the European Union or any of its member
          states or the United Nations (collectively, the{" "}
          <strong>&quot;Major Jurisdictions&quot;</strong>) embargoes goods or
          imposes sanctions (such embargoed or sanctioned territories,
          collectively, the <strong>&quot;Restricted Territories&quot;</strong>
          );
        </li>
        <li>
          if you are, or if you directly or indirectly own or control, or have
          received any assets from any blockchain address or from any person
          that is listed on any sanctions list or equivalent maintained by any
          of the Major Jurisdictions (collectively,{" "}
          <strong>&quot;Sanctions Lists Persons&quot;</strong>);
        </li>
        <li>
          to transact in or with any Restricted Territories or Sanctions List
          Persons;
        </li>
        <li>
          to engage in any act, practice, or course of business that operates to
          circumvent any sanctions or export controls targeting you or the
          country or territory where you are located;
        </li>
        <li>
          if you are a U.S. Person as defined in 17 CFR § 230.902, or currently
          or ordinarily located or resident in (or incorporated or organized in)
          the United States of America, Canada, or Australia (collectively,{" "}
          <strong>&quot;Excluded Jurisdictions&quot;</strong>), or to transact
          in or with Excluded Jurisdictions;
        </li>
        <li>
          by utilizing a virtual private network (e.g., a VPN), or by otherwise
          preventing us from correctly identifying the IP address of your
          computer;
        </li>
        <li>
          by employing any device, scheme or artifice to defraud, or otherwise
          materially mislead, any person;
        </li>
        <li>
          in connection with any cyberattack including any ’sybil attack‘, ’DoS
          attack‘, ’griefing attack‘, virus deployment, or theft;
        </li>
        <li>
          to commit any violation of applicable laws, rules or regulations in
          your relevant jurisdiction; or
        </li>
        <li>
          for any activity that involves data mining, robots, scraping or
          similar data gathering or extraction methods of content or information
          from any of our Services;
        </li>
        <li>
          to solicit personally identifiable information from anyone under the
          age of 18;
        </li>
        <li>
          to post any information that is harmful, threatening, abusive,
          harassing, tortious, excessively violent, defamatory, vulgar, obscene,
          pornographic, libelous, invasive of another’s privacy, hateful,
          discriminatory;
        </li>
        <li>
          to transact in securities, commodities futures, trading of commodities
          on a leveraged, margined or financed basis, binary options (including
          prediction-market transactions), real estate or real estate leases,
          equipment leases, debt financings, equity financings or other similar
          transactions, in each case, if such transactions do not comply with
          all laws, rules and regulations applicable to the parties and assets
          engaged therein;
        </li>
        <li>
          to engage in any activity that infringes on or violates any copyright,
          trademark, service mark, patent, right of publicity, right of privacy,
          or other proprietary or intellectual property rights; or
        </li>
        <li>
          to engage in any activity that transmits, exchanges, or is otherwise
          supported by the direct or indirect proceeds of criminal or fraudulent
          activity.
        </li>
      </ol>
      <br />
      <p>
        We may modify the list of Restricted Territories and Excluded
        Jurisdictions at any time. We reserve the right, in our sole discretion,
        to determine the eligibility of users for the Protocols and the
        Services. We reserve the right to cease your access or use of the
        Services at any time, change any indication or rating by us of your
        participation, at any time without notice, in our sole discretion and
        for no reason or any reason whatsoever, including for breach of these
        Terms.
      </p>
      <br />
      <p>
        Further, you are not eligible to use and may not use the Interface or
        API for, and our license under Section 6 to the Interface or API does
        not extend to, any Competing Use.{" "}
        <strong>&quot;Competing Use&quot;</strong> means any access or use in or
        for any product, software, protocol, network, application, or service
        that is made available to any party and that (i) substitutes for the use
        of the Babylon Protocol, (ii) offers the same or substantially similar
        functionality as the Babylon Protocol or (iii) is built on or uses a
        protocol with substantially similar functionality as the Babylon
        Protocol or otherwise facilitates the staking of Bitcoin other than by
        utilizing the Babylon Protocol.{" "}
        <strong>&quot;Babylon Protocol&quot;</strong> means the Bitcoin staking
        protocol as further described in the documentation{" "}
        <a
          href="https://docs.babylonlabs.io/docs/introduction/babylon-overview"
          className="text-primary"
        >
          here
        </a>
        , as updated from time to time.
      </p>
      <br />
      <h3>3. CONTENT; PERMITTED USE</h3>
      <br />
      <p>
        Unless otherwise noted, all text, graphics, user interfaces, visual
        interfaces, photographs, trademarks, logos, sounds, music, artwork and
        computer code (collectively, <strong>&quot;Content&quot;</strong>),
        including but not limited to the design, structure, selection,
        coordination, expression, &quot;look and feel&quot; and arrangement of
        such Content, contained in the Services is owned, controlled or licensed
        by or to us and is protected by trade dress, copyright, patent and
        trademark laws, and various other intellectual property rights. Except
        as expressly provided in these Terms, no part of the Services and no
        Content may be copied, reproduced, republished, uploaded, posted,
        publicly displayed, encoded, translated, transmitted or distributed in
        any way to any other computer, server, website or other medium for
        publication or distribution or for any commercial enterprise, without
        our express prior written consent.
      </p>
      <br />
      <p>
        Our trade names and logos are trademarks or registered trademarks of
        ours. All other names and logos on the Services are trademarks or
        registered trademarks of their respective owners, where applicable.
        References to any third party-owned trademarks on or in the Services are
        for informational purposes only and is not intended to indicate or imply
        any affiliation, association, sponsorship or endorsement by any owners
        of such third party-owned trademarks.
      </p>
      <br />
      <p>You agree to each of the following:</p>
      <ol>
        <li>
          The Content is only being provided as an aid to your own independent
          research and evaluation and you should not take, or refrain from
          taking, any action based on any Content.
        </li>
        <li>
          The ability of the Interface or Website to interact with third-party
          wallet applications or devices, or to validator nodes, finality
          providers, or proof of stake networks or protocols is not an
          endorsement or recommendation by or on behalf of Provider, and you
          assume all responsibility for selecting and evaluating, and incurring
          the risks of any bugs, defects, malfunctions or interruptions of any
          such applications, devices, operators, protocols, or networks.
        </li>
        <li>
          You will not hold Provider or any of its or their affiliates,
          officers, directors, shareholders, members, representatives or agents
          (collectively, <strong>&quot;Provider Parties&quot;</strong>) liable
          for any damages that you may suffer in connection with your use of the
          Services or the Protocol.
        </li>
        <li>
          The Content available on the Services is not professional, legal,
          business, investment, or any other advice related to any financial
          product, and is not an offer or recommendation or solicitation to buy
          or sell any particular Digital Asset or to use any particular
          investment strategy.
        </li>
        <li>
          Before you make any financial, legal, or other decision, you should
          seek independent professional advice from an individual who is
          licensed and qualified in the area for which such advice would be
          appropriate.
        </li>
        <li>
          These Terms are not intended to, and do not, create or impose any
          fiduciary duties on any Provider Parties. The only duties and
          obligations that we owe you are those set out expressly in these
          Terms.
        </li>
        <li>
          To the fullest extent permitted by law, Provider Parties owe no
          fiduciary duties to you or any other party. To the extent any such
          duties may exist at law or in equity, those duties and liabilities are
          hereby irrevocably disclaimed, waived, and eliminated.
        </li>
      </ol>
      <br />
      <h3>4. CERTAIN RISKS</h3>
      <br />
      <p>
        You acknowledge, agree to, and assume the following risks and matters:
      </p>
      <ol>
        <li>
          Provider may discontinue all or any part of the Services at any time,
          with or without notice.
        </li>
        <li>
          Provider has no obligation to ensure that the Services provide a
          complete and accurate source of all information relating to the
          Protocols or other blockchain information.
        </li>
        <li>
          You may want or need to rely on block explorers, validator nodes,
          finality providers, or other third-party resources.
        </li>
        <li>
          The Interface and Protocols require that a certain amount of staked
          Bitcoin be locked for a certain period of time, and withdrawal of
          staked Bitcoin may be similarly delayed. We do not guarantee the
          security or functionality of any Protocols, or any third-party
          software or technology intended to be compatible with staked Bitcoin.
          You will not be able to unbond or withdraw Bitcoin from staking except
          as permitted by the Protocols, and we do not guarantee otherwise.
        </li>
        <li>
          In providing information about tokens, the Interface associates or
          presumes the association of a token name, symbol, or logo with one or
          more blockchain systems. In making such associations, the Interface
          relies upon third-party resources which may not be accurate or may not
          conform to a given user’s expectations. Multiple smart contracts and
          blockchain systems can utilize the same token name or token symbol as
          one another, meaning that the name or symbol of a token does not
          guarantee that it is the token generally associated with such name or
          symbol. You must not rely on the name, symbol, or branding of a token
          on the Interface, but instead must examine the specific blockchain
          system and smart contract associated with the name, symbol, or
          branding and confirm that the token meets your expectations.
        </li>
        <li>
          Neither Provider nor the Interface is registered or qualified with or
          licensed by, reports to, or is under the active supervision of any
          government agency or financial regulatory authority or organization.
          No government or regulator has approved or has been consulted by
          Provider regarding the accuracy or completeness of any information
          available on the Services. Similarly, the technology, systems,
          blockchains, tokens, and persons relevant to information published on
          the Interface may not be registered with or under the supervision of
          or be registered or qualified with or licensed by any government
          agency or financial regulatory authority or organization. Neither
          Provider nor any individual Interface contributor is registered as a
          broker, dealer, advisor, transfer agent or other intermediary.
        </li>
      </ol>
      <br />
      <h3>5. NO WARRANTY, NO REPRESENTATIONS</h3>
      <br />
      <p>
        <strong>
          The Services are provided on an{" "}
          <i className="text-primary">&quot;AS IS&quot;</i> and{" "}
          <i className="text-primary">&quot;AS AVAILABLE&quot;</i> basis. Your
          access and use of the Services are at your own risk. There is no
          representation or warranty that access to the Services will be
          continuous, uninterrupted, timely, or secure; that the information
          contained in the Services will be accurate, reliable, complete, or
          current, or that the Services will be free from errors, defects,
          viruses, or other harmful elements. No advice, information, or
          statement made in connection with the Services should be treated as
          creating any warranty concerning the Services. There is no
          endorsement, guarantee, or assumption of responsibility for any
          advertisements, offers, or statements made by third parties concerning
          the Services.
        </strong>
      </p>
      <br />
      <p>
        <strong>
          Further, there is no representations or warranty from anyone as to the
          quality, origin, or ownership of any Content found on or available
          through the Services, and the Provider Parties will have no liability
          for any errors, misrepresentations, or omissions in, of, or about, the
          Content, nor for the availability of the Content, and they will not be
          liable for any losses, injuries, or damages from the use, inability to
          use, or the display of the Content.
        </strong>
      </p>
      <br />
      <h3>6. License</h3>
      <br />
      <p>
        Subject to the terms and conditions of these Terms and your compliance
        with these Terms, we grant you a non-exclusive, non-transferable,
        non-sublicensable, personal, revocable license, limited as set forth in
        these Terms, to use the Interface, API and Website. This is not a
        license to copy, distribute, transmit digitally, publicly perform,
        publicly display, or make derivative works of the underlying software.
      </p>
      <br />
      <h3>7. PRIVACY POLICY</h3>
      <br />
      <p>
        Please refer to our <strong>Privacy Policy</strong> for information on
        how we collect, use and disclose information from users of the Services.
      </p>
      <br />
      <h3>8. THIRD-PARTY OFFERINGS AND CONTENT</h3>
      <br />
      <p>
        References, links, or referrals to or connections with or reliance on
        third-party resources, products, services, or content, including smart
        contracts developed or operated by third parties, may be provided to
        users in connection with the Services. In addition, third parties may
        offer promotions related to the Interface. Provider does not endorse or
        assume any responsibility for any activities, resources, products,
        services, content, or promotions owned, controlled, operated, or
        sponsored by third parties. If users access any such resources,
        products, services, or content or participate in any such promotions,
        users do so solely at their own risk. You hereby expressly waive and
        release Provider Parties from all liability arising from your use of any
        such resources, products, services, or content or participation in any
        such promotions.
      </p>
      <br />
      <p>
        You further acknowledge and agree that Provider Parties will not be
        responsible or liable, directly or indirectly, for any damage or loss
        caused or alleged to be caused by or in connection with the use of or
        reliance on any such resources, products, services, content, or
        promotions from third parties.
      </p>
      <br />
      <p>
        We operate social media pages on third party networks and have social
        media icons on our Services. Social media providers are unaffiliated
        with us, and we are not responsible for the content or privacy practices
        of social media providers. Social media providers have their own terms
        of use and privacy policies, and we encourage you to review those
        policies whenever you visit their websites or interact with their
        platforms.
      </p>
      <br />
      <h4 className="font-bold text-primary">Fork Handling</h4>
      <br />
      <p>
        The Protocol, and all tokens may be subject to{" "}
        <strong>&quot;Forks&quot;</strong> that occur when some or all persons
        running the software clients for a particular blockchain system adopt a
        new client or a new version of an existing client that: (i) changes the
        protocol rules in backward-compatible or backward-incompatible manner
        that affects which transactions can be added into later blocks, how
        later blocks are added to the blockchain, or other matters relating to
        the future operation of the protocol; or (ii) reorganizes or changes
        past blocks to alter the history of the blockchain. Some Forks may
        result in two or more persistent alternative versions of the protocol or
        blockchain, either of which may be viewed as or claimed to be the
        legitimate or genuine continuation of the original.
      </p>
      <br />
      <p>
        Provider cannot anticipate, control or influence the occurrence or
        outcome of Forks, and do not assume any risk, liability or obligation in
        connection therewith. Provider does not assume any responsibility to
        notify you of pending, threatened or completed Forks. Provider will
        respond (or refrain from responding) to any Forks in such manner as
        Provider determines in its sole and absolute discretion. Provider will
        not have any duty or obligation, or liability to any user if such
        response (or lack of such response) acts to your detriment. You assume
        full responsibility to independently remain apprised of and informed
        about possible Forks, and to manage your own interests and risks in
        connection therewith.
      </p>
      <br />
      <h3>9. TAX ISSUES</h3>
      <br />
      <p>
        The tax consequences of purchasing, selling, holding, transferring, or
        locking Digital Assets or otherwise utilizing the Services are uncertain
        and may vary by jurisdiction. Provider has undertaken no due diligence
        or investigation into such tax consequences, and you assume all
        obligation and liability for the tax consequences applicable to you.
      </p>
      <br />
      <h3>10. LIMITATION OF LIABILITY</h3>
      <br />
      <p>
        <strong>
          Except to the extent otherwise required by applicable law, under no
          circumstances will any of the Provider Parties be responsible or
          liable under any theory of liability, whether based in tort, contract,
          negligence, strict liability, warranty, or otherwise, for any damages
          of any kind arising from or relating to these Terms or the Services,
          including but not limited to direct, indirect, economic, exemplary,
          special, punitive, incidental, or consequential losses or damages of
          any kind, including without limitation, loss of profits. The foregoing
          limitations apply even if any of the events or circumstances giving
          rise to such damages were foreseeable and even if the Provider Parties
          were advised of or should have known of the possibility of such losses
          or damages and notwithstanding any failure of essential purpose of any
          limited remedy.
        </strong>
      </p>
      <br />
      <p>
        <strong>
          Except to the extent otherwise required by applicable law, if,
          notwithstanding the other provisions of these Terms, any of the
          Provider Parties is found to be liable to you for any damages or
          losses which arise from or relate to these Terms or the Services, the
          total aggregate liability of the Provider Parties for any and all such
          claims, regardless of the form of action, is limited to one hundred US
          dollars (US$100.00).
        </strong>
      </p>
      <br />
      <p>
        <strong>
          THE FOREGOING LIMITATIONS WILL APPLY EVEN IF THE ABOVE STATED REMEDY
          FAILS OF ITS ESSENTIAL PURPOSE.
        </strong>
      </p>
      <br />
      <p>
        Some jurisdictions do not allow the exclusion of certain warranties, or
        the limitation or exclusion of certain liabilities or damages.
        Accordingly, some disclaimers and limitations set forth in these Terms
        may not apply in full to you. However, the disclaimers and limitations
        of liability set forth in these terms will apply to the fullest extent
        permitted by applicable law.
      </p>
      <br />
      <h3>11. INDEMNIFICATION</h3>
      <br />
      <p>
        You will defend, indemnify, compensate, reimburse and hold harmless the
        Provider Parties from any claim, demand, action, damage, loss, cost or
        expense, including without limitation reasonable attorneys’ fees,
        arising out or relating to (a) Your access, interaction with, or other
        use, or use by anyone else you enable or permit, of or conduct in
        connection with the Services; (b) your violation of these Terms or any
        other applicable policy or contract of Provider; or (c) your violation
        of any rights of any other person or entity; each, a{" "}
        <strong>&quot;Claim&quot;</strong>. We may, in our sole discretion,
        require you to defend one or more Provider Parties in any Claim.
      </p>
      <br />
      <h3>12. POINTS AND INCENTIVES</h3>
      <br />
      <p>
        You may be attributed by us or third parties certain reputation
        indicators, loyalty points, or other intangible rewards related to your
        activities including staking (collectively,{" "}
        <strong>&quot;Points&quot;</strong>). Points are not blockchain tokens.
        Points are not, and may never convert to, accrue to, be used as basis to
        calculate, or become any other tokens or other Digital Asset or
        distribution thereof. Points are virtual items with no monetary value.
        Points do not constitute any currency or property of any type and are
        not redeemable, refundable, or eligible for any fiat or virtual currency
        or anything else of value. Points are not transferable, and you may not
        attempt to sell, trade, or transfer any Points, or obtain any manner of
        credit using any Points. Any attempt to sell, trade, or transfer any
        Points will be null and void.
      </p>
      <br />
      <p>
        We reserve the right to change, modify, discontinue or cancel any Points
        programs (including the frequency, criteria and calculation for earning
        such Points), at any time and without notice to you.
      </p>
      <br />
      <p>
        You agree not to engage in any manipulative, fraudulent, dishonest, or
        abusive activities in connection with Points. This includes, but is not
        limited to, creating multiple accounts to claim additional Points, using
        bots or scripts to automate claiming, or participating in any schemes
        that artificially inflate the perceived value of Points. We or our
        affiliates may terminate any or all of your Points due to such
        activities, or for breaching any license granted by us, and may disclose
        privately and publicly why such action was taken. Points may not be
        available in your jurisdiction.
      </p>
      <br />
      <h3>13. PROMOTIONS</h3>
      <br />
      <p>
        Besides our Points program, we may run various promotions, incentives,
        or giveaways (each, a <strong>&quot;Promotion&quot;</strong>)
        communicated through official Babylon Labs communication mediums,
        including blog posts, email, social media, and the Discord server.
        Applicable details, including any qualification periods, entry
        procedures or requirements, award or selection criteria (to be
        determined at our sole discretion), and notification procedures will be
        referenced there. Promotions are void where prohibited and open only to
        individuals who can lawfully participate in such Promotions in that
        individual&apos;s particular jurisdiction.
      </p>
      <br />
      <h3>14. COPYRIGHT POLICY</h3>
      <br />
      <p>
        If you are a copyright owner and believe that any Content on the Website
        infringes upon your copyrights, you may submit a notification to us via
        email at{" "}
        <a href="mailto:contracts@babylonlabs.io" className="text-primary">
          contracts@babylonlabs.io
        </a>{" "}
        with the following information:
      </p>
      <ul>
        <li>
          An electronic or physical signature of the person authorized to act on
          behalf of the owner of the copyright’s interest.
        </li>
        <li>
          A description of the material that you claim is infringing and where
          it is located on the Services.
        </li>
        <li>Your address, telephone number, and email address.</li>
        <li>
          A statement by you that you have a good faith belief that the disputed
          use is not authorized by the copyright owner, its agent, or the law.
        </li>
        <li>
          A statement by you, made under penalty of perjury, that the above
          information in your notice is accurate and that you are the copyright
          owner or authorized to act on the copyright owner’s behalf.
        </li>
      </ul>
      <br />
      <h3>15. USER SUBMISSIONS, FEEDBACK AND INFORMATION</h3>
      <br />
      <p>
        You acknowledge and agree that any submission, feedback, comments or
        suggestions you may provide regarding the Services either directly or
        indirectly (for example, through the use on a third-party social media
        site of a company-designated hashtag) (collectively,{" "}
        <strong>&quot;Feedback&quot;</strong>) is non-confidential and
        non-proprietary, that we may treat as public information, and may be
        shared with others on other sites and platforms. You hereby grant us an
        unrestricted, irrevocable, universe-wide, royalty-free right to use,
        communicate, reproduce, publish, display, distribute and exploit such
        Feedback in any manner, with the right to sublicense.
      </p>
      <br />
      <h3>16. DISPUTE RESOLUTION; ARBITRATION AGREEMENT</h3>
      <br />
      <p>
        <strong>
          Please read the arbitration provisions in this Section 16 of the Terms
          carefully (the &quot;Arbitration Agreement&quot). It requires you to
          arbitrate disputes with Babylon Labs, its affiliates, successors, and
          assigns, and all of their respective officers, directors, employees,
          agents, and representatives (collectively, the &quot;Babylon
          Parties&quot) and limits the manner in which you can seek relief from
          the Babylon Parties.
        </strong>
      </p>
      <br />
      <h4 className="font-bold text-primary">
        A. Informal Dispute Resolution:
      </h4>
      <br />
      <p>
        There might be instances when a dispute arises between you and the
        Babylon Parties with respect to the Services or these Terms (
        <strong>&quot;Dispute&quot;</strong>). If that occurs, we are committed
        to working with you to reach a reasonable resolution in good faith. Most
        Disputes can be resolved quickly and to your satisfaction by emailing
        user support at{" "}
        <a href="mailto:contracts@babylonlabs.io" className="text-primary">
          contracts@babylonlabs.io
        </a>{" "}
        (<strong>&quot;Our Address&quot;</strong>). However, if such efforts
        prove unsuccessful, you may send a written Notice of Dispute by email to
        Our Address (<strong>&quot;Notice&quot;</strong>). The Notice must
        describe the nature and basis of the Dispute and set forth the specific
        relief sought.
      </p>
      <br />
      <p>
        If Babylon Labs and you do not resolve the Dispute set out in the notice
        within sixty (60) calendar days from the date of receipt, you or Babylon
        Labs may commence an arbitration proceeding. Both you and Babylon Labs
        agree that this dispute resolution procedure is a condition precedent
        which must be satisfied before initiating any arbitration against the
        other party.
      </p>
      <br />
      <h4 className="font-bold text-primary">
        B. Applicability of Arbitration Agreement:
      </h4>
      <br />
      <p>
        All unresolved disputes, claims, or controversies arising out of or
        relating to any of the Services, these Terms, or any other acts or
        omissions for which you may claim that that we are liable, including,
        but not limited to, any dispute, claim, or controversy as to
        arbitrability, will be finally and exclusively settled by arbitration
        administered by the London Court of International Arbitration (
        <strong>&quot;LCIA&quot;</strong>) under the LCIA Arbitration Rules in
        force at the time of the filing for arbitration of such dispute,
      </p>
      <br />
      <p>
        This Arbitration Agreement will survive termination of these Terms, the
        Services, or any connection you may have to the information you obtained
        from the Interface.
      </p>
      <br />
      <h4 className="font-bold text-primary">
        C. Additional Terms of the Arbitration
      </h4>
      <br />
      <p>
        The following terms apply to any Arbitration proceedings commenced under
        this Agreement:
      </p>
      <ul>
        <li>
          The arbitration will be held before a single neutral arbitrator,
          unless either party requests three arbitrators, in which case it will
          be held before three neutral arbitrators.
        </li>
        <li>The arbitration will be conducted in the English language.</li>
        <li>
          The arbitration will be held in the Cayman Islands and the Cayman
          Islands will be deemed the &apos;seat of arbitration&apos;.
        </li>
        <li>
          All issues are for the arbitrator to decide, including issues relating
          to the scope, enforceability, and arbitrability of this Arbitration
          Agreement.
        </li>
        <li>
          Any judgment or award made or rendered by the arbitrator(s) may be
          entered in any court of competent jurisdiction as necessary.
        </li>
        <li>
          The parties will keep the arbitration proceedings confidential and not
          disclose any information regarding the arbitration to any third party
          except as follows. The existence of the arbitration, any nonpublic
          information provided in the arbitration, and any submissions, orders
          or awards made in the arbitration (together, the{" "}
          <strong>&quot;Confidential Information&quot;</strong>) will not be
          disclosed to any non-party except the tribunal, the ICC, the parties,
          their counsel, experts, witnesses, accountants and auditors, insurers
          and reinsurers, and any other person necessary to the conduct of the
          arbitration, or as necessary to enforce or challenge and award in bona
          fide legal proceedings, or as required by law. This confidentiality
          provision will survive termination of these Terms and of any
          arbitration brought pursuant to these Terms.
        </li>
      </ul>
      <br />
      <h4 className="font-bold text-primary">D. Other Terms</h4>
      <br />
      <p>
        If applicable law allows the enforcement of this Arbitration Agreement
        only if you have an opportunity to opt out of these arbitration
        provisions within a certain amount of time after you accept these Terms,
        then you have 30 days from your first use of any of the Services in
        which to opt out of such arbitration terms by sending an email to Our
        Address. This email should notify us that you wish to opt out and
        provide us with your full name, entity name if you have one, and
        jurisdiction.
      </p>
      <br />
      <p>
        We reserve the right to modify or update this Arbitration Agreement at
        any time. Any such changes will take effect immediately upon us posting
        the revised Agreement to the Website. If you do not agree with the
        changes, you may opt out within 30 days of the change by sending written
        notice to Our Address. otherwise, your continued use of the services
        will constitute your acceptance of the updated Arbitration Agreement.
      </p>
      <br />
      <p>
        To the extent you reject any future changes, you are agreeing that you
        will arbitrate any dispute between us in accordance with the language of
        this Arbitration Agreement as of the date you first accepted these Terms
        (or accepted any subsequent changes).
      </p>
      <br />
      <h4 className="font-bold text-primary">
        E. Class Action Waiver; Jury Trial Waiver
      </h4>
      <br />
      <p>
        You agree to bring all disputes or claims connected to the Services in
        your individual capacity and not as a plaintiff in or member of any
        class action, collective action, private attorney general action, or
        other representative proceeding. Further, if any Dispute is resolved
        through arbitration, the arbitrator may not consolidate another person’s
        claims with your claims and may not otherwise preside over any form of a
        representative or class proceeding.
      </p>
      <br />
      <p>
        Further, if for any reason a claim by law or equity must proceed in
        court rather than in arbitration: (a) you and we irrevocably waive the
        right to demand a trial by jury, and (b) you and we agree to submit to
        the exclusive jurisdiction of the courts of the Cayman Islands and any
        courts competent to hear appeals from those courts.
      </p>
      <br />
      <h4 className="font-bold text-primary">F. Exclusions</h4>
      <br />
      <p>
        Notwithstanding the foregoing agreement to arbitrate, you or we may
        bring any disputes, claims, suits, actions, causes of action, demands or
        proceedings in which either party seeks injunctive or other equitable
        relief for the alleged unlawful use of intellectual property, including,
        without limitation, copyrights, trademarks, trade names, logos, trade
        secrets or patents, in any court of competent jurisdiction.
      </p>
      <br />
      <h3>17. GOVERNING LAW</h3>
      <br />
      <p>
        These Terms and any action related thereto will be governed by the laws
        of the Cayman Islands, without regard to the principles of conflict of
        laws. Except as expressly set forth in Section 16,{" "}
        <strong>&quot;Dispute Resolution; Arbitration Agreement&quot;</strong>{" "}
        the exclusive jurisdiction for all Disputes will be the courts located
        in the Cayman Islands, and you waive any objection to jurisdiction and
        venue in such courts.
      </p>
      <br />
      <h3>18. Miscellaneous</h3>
      <br />
      <p>
        The word <strong className="text-primary">&quot;or&quot;</strong> as
        used in this Agreement has an inclusive meaning, equivalent to{" "}
        <strong className="text-primary">&quot;and/or&quot;</strong>. The terms
        ‘include’ and ‘including’ will be deemed to be immediately followed by
        the phrase{" "}
        <strong className="text-primary">&quot;without limitation&quot;</strong>
        . The headings appearing at the beginning of several sections contained
        in this Agreement have been inserted for identification and reference
        purposes only and must not be used to construe or interpret this
        Agreement. The word{" "}
        <strong className="text-primary">&quot;will&quot;</strong> as used in
        this Agreement has its common meaning, as well as the meaning ascribed
        to the word <strong className="text-primary">&quot;shall&quot;</strong>:
        expressing a current obligation or status, or obligation or status that
        will arise in the future. All provisions of these Terms are severable,
        and the unenforceability or invalidity of any of the provisions will not
        affect the enforceability or validity of the remaining provisions. Our
        failure to insist on or enforce strict performance of these Terms shall
        not be deemed a waiver by us of any provision or any right we have to
        enforce these Terms. Any such waiver must be in writing in order to be
        effective. The parties declare that they have required that these Terms
        and all documents related hereto, either present or future, be drawn up
        in the English language only:{" "}
        <i>
          Les parties déclarent par les présentes qu’elles exigent que cette
          entente et tous les documents y afferents, soit pour le present ou le
          future, soient rédigés en langue anglaise seulement
        </i>
        .
      </p>
      <br />
      <p>
        These Terms shall not be interpreted or construed to confer any rights
        or remedies on any third parties. No joint venture, partnership,
        employment, or agency relationship exists between you and Provider as a
        result of these Terms or your use of the Services. The United Nations
        Convention on Contracts for the International Sale of Goods does not
        apply and is expressly excluded.
      </p>
      <br />
      <p>
        If you are entering into these Terms on behalf of a company or other
        legal entity, group, or association, you represent that you have the
        authority to bind such entity to these Terms, in which case the Terms{" "}
        <strong>&quot;you&quot;</strong> or <strong>&quot;your&quot;</strong>{" "}
        refers to you and such entity, group, or association. If you do not have
        such authority, or if you do not agree with these Terms, you must not
        accept these Terms and you may not use the Services.
      </p>
      <br />
      <p>
        These Terms and the Privacy Policy constitute the entire agreement with
        respect to the subject matter of these Terms and the Privacy Policy,
        including the Services. These Terms, including the Privacy Policy,
        supersede all prior terms, written or oral understandings,
        communications, and other agreements relating to the subject matter of
        these Terms and the Privacy Policy; provided, however, that if any
        provision of these Terms conflicts with any provision of any other
        contract you have entered into directly with us, the provision that is
        more protective of and beneficial to us will govern.
      </p>
      <br />
      <p>
        Babylon™ and the logo
        <Icon />
        are the trademarks of Babylon Labs Ltd. Website and Interface © 2024
        Babylon Labs Ltd. and its licensors.
      </p>
    </div>
  );
};
