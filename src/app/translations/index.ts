export const translations = {
  en: {
    // Header
    connect: "Connect",
    disconnect: "Disconnect",

    // Stats
    totalBtcTvl: "Total BTC TVL",
    registeredBtcTvl: "Registered BTC TVL",
    finalityProviders: "Finality Providers",
    active: "Active",
    total: "Total",
    totalDelegations: "Total Delegations",
    description: "Description",

    // Personal Balance
    stakedBalance: "Staked Balance",
    stakableBalance: "Stakable Balance",
    bbnBalance: "BBN Balance",
    bbnRewards: "BBN Rewards",
    claim: "Claim",
    walletBalance: "Wallet Balance",
    stakedWalletBalance: "Staked Balance",

    // Staking
    stakingStats: "Babylon Bitcoin Staking Stats",
    stakingUnavailable: "Staking Currently Unavailable",
    stakingUnavailableMessage:
      "Staking is temporarily disabled due to network downtime. New stakes are paused until the network resumes.",
    newStakesUnavailable: "New Stakes Registration Temporarily Unavailable",
    newStakesUnavailableMessage:
      "Creation of new stakes will be enabled on April 24, 10am UTC. Phase-1 Cap-1 stakers can register their stakes to Babylon using the modal below.",
    unavailableInRegion: "Unavailable in Your Region",

    // Activity
    activity: "Activity",

    // FAQ
    faqTitle: "FAQ's",
    whatIsBabylon: "What is Babylon?",
    whatIsBabylonContent:
      "Babylon is a suite of security-sharing protocols that bring Bitcoin's unparalleled security to the decentralized world. The latest protocol, Bitcoin Staking, enables Bitcoin holders to stake their Bitcoin to provide crypto-economic security to PoS (proof-of-stake) systems in a trustless and self-custodial way.",
    howDoesStakingWork: "How does Bitcoin Staking work?",
    howDoesStakingWorkContent:
      "Bitcoin holders lock their Bitcoin using the trustless and self-custodial Bitcoin Staking script for a predetermined time (timelock) in exchange for voting power in an underlying PoS protocol. In return, Bitcoin holders will earn PoS staking rewards.",
    whatCanStakingAppDo: "What does this staking dApp allow me to do?",
    whatCanStakingAppDoContent:
      "The staking dApp is an interface to the Babylon Bitcoin Staking protocol. The Babylon Bitcoin Staking protocol allows Bitcoin holders to stake their Bitcoin and delegate their voting power to a finality provider they select. Stakers can view their past staking history and send a request to unlock their stake for early withdrawal.",
    doesBtcLeaveWallet: "Does my Bitcoin leave my wallet once staked?",
    doesBtcLeaveWalletContent:
      "Technically, your Bitcoin has not left your custody. However, your wallet will not show the Bitcoin you staked in your available balance once that Bitcoin is locked. Current wallet implementations do not yet know how to display staked Bitcoin that is still in your custody. When staking, you do not send the Bitcoin to a third party. It is locked in a self-custodial Bitcoin Staking script that you control. This means that any subsequent movement of the Bitcoin will need your approval. You are the only one who can unbond the stake and withdraw.",
    otherWaysToStake: "Are there any other ways to stake?",
    otherWaysToStakeContent:
      "Hands-on stakers can operate the btc-staker CLI program that allows for the creation of Bitcoin staking transactions from the CLI.",

    // Common
    loading: "Loading...",
    pleaseWait: "Please wait...",
    proceed: "Proceed",
    processingConfirmation: "Processing Confirmation",
    pendingVerification: "Pending Verification",
    stake: "Stake",
    termsOfUse: "Terms of Use",
    privacyPolicy: "Privacy Policy",
    allRightsReserved: "All rights reserved",

    // Google Login
    googleLoginRequired: "Google Login Required",
    googleLoginRequiredDescription:
      "Please sign in with your Google account to access this service.",
    signInWithGoogle: "Sign in with Google",
    logout: "Logout",

    // Error Messages
    errorOccurred: "An error occurred",
    networkError: "Network error occurred",
    insufficientBalance: "Insufficient balance",
    transactionFailed: "Transaction failed",
    invalidInput: "Invalid input",
    walletConnectionFailed: "Wallet connection failed",
    stakeRegistrationFailed: "Stake registration failed",
    claimFailed: "Claim failed",

    // Notification Messages
    transactionSuccess: "Transaction successful",
    stakeRegistered: "Stake registered successfully",
    rewardsClaimed: "Rewards claimed successfully",
    walletConnected: "Wallet connected successfully",
    walletDisconnected: "Wallet disconnected successfully",

    // Status Messages
    connecting: "Connecting...",
    disconnecting: "Disconnecting...",
    registering: "Registering...",
    claiming: "Claiming...",
    confirming: "Confirming...",

    // Button Texts
    retry: "Retry",
    cancel: "Cancel",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    close: "Close",
    viewDetails: "View Details",
    refresh: "Refresh",

    // Preview Modal
    preview: "Preview",
    finalityProvider: "Finality Provider",
    stakeAmount: "Stake Amount",
    feeRate: "Fee rate",
    transactionFee: "Transaction fee",
    term: "Term",
    onDemandUnbonding: "On Demand Unbonding",
    unbondingFee: "Unbonding fee",
    attention: "Attention!",
    previewAttention1:
      "No third party possesses your staked {coinSymbol}. You are the only one who can unbond and withdraw your stake.",
    previewAttention2:
      'Your stake will first be sent to {bbnNetworkFullName} for verification (~20 seconds), then you will be prompted to submit it to the {networkName} ledger. It will be marked as "Pending" until it receives {confirmationDepth} Bitcoin confirmations.',
    proceedToSigning: "Proceed to Signing",

    // Sign Modal
    signMessages: "Please sign the following messages",
    consentToSlashing: "Consent to slashing",
    consentToSlashingDuringUnbonding: "Consent to slashing during unbonding",
    addressBinding:
      "{coinSymbol}-{bbnCoinSymbol} address binding for receiving staking rewards",
    stakingTransactionRegistration: "Staking transaction registration",
    sign: "Sign",

    // Navigation
    staking: "Staking",
    custody: "Custody",

    // Crypto Selection
    selectCrypto: "Select Crypto",
    bitcoin: "Bitcoin",
    sui: "Sui",
    ethereum: "Ethereum",
    xrp: "XRP",
    comingSoon: "Coming Soon",

    // Info Alert
    info: "Info",
    unbondingInfo:
      "You can unbond and withdraw your stake anytime with an unbonding time of {time}.",
    learnMore: "Learn More",

    // Info Modal
    stakeTimelockAndUnbonding: "Stake Timelock and On-Demand Unbonding",
    stakeTimelockInfo:
      "Stakes made through this dashboard are locked for up to {maxStakingPeriod}. You can on-demand unbond at any time, with withdrawal available after a {unbondingTime} unbonding period. If the maximum staking period expires, your stake becomes withdrawable automatically, with no need for prior unbonding.",
    stakeTimelockNote:
      "Note: Timeframes are approximate, based on an average {coinName} block time of 10 minutes.",
    done: "Done",
  },
  ko: {
    // Header
    connect: "연결",
    disconnect: "연결 해제",

    // Stats
    totalBtcTvl: "총 BTC TVL",
    registeredBtcTvl: "등록된 BTC TVL",
    finalityProviders: "파이널리티 프로바이더",
    active: "활성",
    total: "전체",
    totalDelegations: "총 위임 수",
    description: "설명",

    // Personal Balance
    stakedBalance: "스테이킹된 잔액",
    stakableBalance: "스테이킹 가능한 잔액",
    bbnBalance: "BBN 잔액",
    bbnRewards: "BBN 보상",
    claim: "수령",
    walletBalance: "지갑 잔액",
    stakedWalletBalance: "스테이킹된 잔액",

    // Staking
    stakingStats: "바빌론 비트코인 스테이킹 통계",
    stakingUnavailable: "스테이킹 일시 중단",
    stakingUnavailableMessage:
      "네트워크 다운타임으로 인해 스테이킹이 일시적으로 중단되었습니다. 네트워크가 재개될 때까지 새로운 스테이킹이 일시 중지됩니다.",
    newStakesUnavailable: "새로운 스테이킹 등록 일시 중단",
    newStakesUnavailableMessage:
      "새로운 스테이킹 생성은 4월 24일 UTC 10시에 활성화됩니다. Phase-1 Cap-1 스테이커는 아래 모달을 사용하여 바빌론에 스테이킹을 등록할 수 있습니다.",
    unavailableInRegion: "해당 지역에서 사용할 수 없음",

    // Activity
    activity: "활동 내역",

    // FAQ
    faqTitle: "자주 묻는 질문",
    whatIsBabylon: "바빌론이란 무엇인가요?",
    whatIsBabylonContent:
      "바빌론은 비트코인의 뛰어난 보안을 탈중앙화 세계에 가져오는 보안 공유 프로토콜 모음입니다. 최신 프로토콜인 비트코인 스테이킹은 비트코인 보유자가 신뢰할 필요 없이 자신의 비트코인을 스테이킹하여 PoS(지분증명) 시스템에 암호화폐 경제적 보안을 제공할 수 있게 합니다.",
    howDoesStakingWork: "비트코인 스테이킹은 어떻게 작동하나요?",
    howDoesStakingWorkContent:
      "비트코인 보유자는 신뢰할 필요 없이 자신의 비트코인을 일정 기간(타임락) 동안 잠그고, 그 대가로 기저 PoS 프로토콜에서 투표권을 얻습니다. 그 대가로 비트코인 보유자는 PoS 스테이킹 보상을 받게 됩니다.",
    whatCanStakingAppDo: "이 스테이킹 dApp으로 무엇을 할 수 있나요?",
    whatCanStakingAppDoContent:
      "스테이킹 dApp은 바빌론 비트코인 스테이킹 프로토콜의 인터페이스입니다. 바빌론 비트코인 스테이킹 프로토콜은 비트코인 보유자가 자신의 비트코인을 스테이킹하고 선택한 파이널리티 프로바이더에 투표권을 위임할 수 있게 합니다. 스테이커는 과거 스테이킹 내역을 확인하고 조기 인출을 위해 스테이킹 잠금 해제 요청을 보낼 수 있습니다.",
    doesBtcLeaveWallet: "스테이킹하면 내 비트코인이 지갑을 떠나나요?",
    doesBtcLeaveWalletContent:
      "기술적으로, 당신의 비트코인은 당신의 관리 하에 있습니다. 그러나 스테이킹된 비트코인은 잠긴 후에는 지갑에서 사용 가능한 잔액으로 표시되지 않습니다. 현재 지갑 구현에서는 여전히 당신의 관리 하에 있는 스테이킹된 비트코인을 표시하는 방법을 알지 못합니다. 스테이킹할 때, 당신은 비트코인을 제3자에게 보내지 않습니다. 그것은 당신이 제어하는 자체 관리 비트코인 스테이킹 스크립트에 잠겨 있습니다. 이는 비트코인의 후속 이동에 당신의 승인이 필요하다는 것을 의미합니다. 당신만이 스테이킹을 해제하고 인출할 수 있습니다.",
    otherWaysToStake: "스테이킹하는 다른 방법이 있나요?",
    otherWaysToStakeContent:
      "직접 조작하고 싶은 스테이커는 CLI에서 비트코인 스테이킹 트랜잭션을 생성할 수 있는 btc-staker CLI 프로그램을 운영할 수 있습니다.",

    // Common
    loading: "로딩 중...",
    pleaseWait: "잠시만 기다려주세요...",
    proceed: "진행",
    processingConfirmation: "처리 확인 중",
    pendingVerification: "검증 대기 중",
    stake: "스테이킹",
    termsOfUse: "이용약관",
    privacyPolicy: "개인정보처리방침",
    allRightsReserved: "모든 권리 보유",

    // Google Login
    googleLoginRequired: "구글 로그인 필요",
    googleLoginRequiredDescription:
      "이 서비스에 접근하려면 구글 계정으로 로그인해야 합니다.",
    signInWithGoogle: "구글로 로그인",
    logout: "로그아웃",

    // Error Messages
    errorOccurred: "오류가 발생했습니다",
    networkError: "네트워크 오류가 발생했습니다",
    insufficientBalance: "잔액이 부족합니다",
    transactionFailed: "트랜잭션이 실패했습니다",
    invalidInput: "잘못된 입력입니다",
    walletConnectionFailed: "지갑 연결에 실패했습니다",
    stakeRegistrationFailed: "스테이킹 등록에 실패했습니다",
    claimFailed: "보상 수령에 실패했습니다",

    // Notification Messages
    transactionSuccess: "트랜잭션이 성공적으로 완료되었습니다",
    stakeRegistered: "스테이킹이 성공적으로 등록되었습니다",
    rewardsClaimed: "보상이 성공적으로 수령되었습니다",
    walletConnected: "지갑이 성공적으로 연결되었습니다",
    walletDisconnected: "지갑 연결이 해제되었습니다",

    // Status Messages
    connecting: "연결 중...",
    disconnecting: "연결 해제 중...",
    registering: "등록 중...",
    claiming: "수령 중...",
    confirming: "확인 중...",

    // Button Texts
    retry: "다시 시도",
    cancel: "취소",
    confirm: "확인",
    back: "뒤로",
    next: "다음",
    close: "닫기",
    viewDetails: "상세 보기",
    refresh: "새로고침",

    // Preview Modal
    preview: "미리보기",
    finalityProvider: "파이널리티 프로바이더",
    stakeAmount: "스테이킹 금액",
    feeRate: "수수료율",
    transactionFee: "트랜잭션 수수료",
    term: "기간",
    onDemandUnbonding: "온디맨드 언본딩",
    unbondingFee: "언본딩 수수료",
    attention: "주의사항!",
    previewAttention1:
      "제3자는 당신의 스테이킹된 {coinSymbol}을 소유하지 않습니다. 당신만이 스테이킹을 해제하고 인출할 수 있습니다.",
    previewAttention2:
      '스테이킹은 먼저 {bbnNetworkFullName}으로 전송되어 검증됩니다(~20초). 그 후 {networkName} 원장에 제출하라는 메시지가 표시됩니다. {confirmationDepth}개의 비트코인 확인을 받을 때까지 "대기 중"으로 표시됩니다.',
    proceedToSigning: "서명 진행",

    // Sign Modal
    signMessages: "다음 메시지에 서명해주세요",
    consentToSlashing: "슬래싱 동의",
    consentToSlashingDuringUnbonding: "언본딩 중 슬래싱 동의",
    addressBinding:
      "스테이킹 보상 수령을 위한 {coinSymbol}-{bbnCoinSymbol} 주소 바인딩",
    stakingTransactionRegistration: "스테이킹 트랜잭션 등록",
    sign: "서명",

    // Navigation
    staking: "스테이킹",
    custody: "커스터디",

    // Crypto Selection
    selectCrypto: "암호화폐 선택",
    bitcoin: "비트코인",
    sui: "수이",
    ethereum: "이더리움",
    xrp: "리플",
    comingSoon: "출시 예정",

    // Info Alert
    info: "정보",
    unbondingInfo:
      "언본딩 시간 {time} 동안 언제든지 스테이킹을 해제하고 인출할 수 있습니다.",
    learnMore: "더 알아보기",

    // Info Modal
    stakeTimelockAndUnbonding: "스테이킹 타임락 및 온디맨드 언본딩",
    stakeTimelockInfo:
      "이 대시보드를 통해 생성된 스테이킹은 최대 {maxStakingPeriod} 동안 잠깁니다. 언제든지 온디맨드 언본딩이 가능하며, {unbondingTime}의 언본딩 기간 후에 인출할 수 있습니다. 최대 스테이킹 기간이 만료되면, 사전 언본딩 없이 자동으로 인출 가능한 상태가 됩니다.",
    stakeTimelockNote:
      "참고: 시간은 평균 {coinName} 블록 시간 10분을 기준으로 한 대략적인 수치입니다.",
    done: "완료",
  },
};
