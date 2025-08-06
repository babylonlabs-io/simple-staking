# BABY Staking Module

A simplified staking interface for BABY tokens, designed as a streamlined alternative to BTC staking.

## Overview

The BABY staking module provides:
- **Token staking**: Stake BABY tokens to validators
- **Rewards management**: Claim rewards from multiple validators
- **Real-time data**: Live balance, delegation, and reward queries
- **Transaction lifecycle**: Complete stake/unstake/claim flows with progress tracking
- **Health & geo protection**: Automatic geo-blocking and API health checks

## Architecture

### Data Flow
```
Component → State Provider → Service Hook → Domain Service → Infrastructure → LCD/RPC
```

**Example Flow:**
```
StakingForm → StakingState.submitForm → useDelegationService.stake → domain/delegationService.stake → babylon.txs.baby.createStakeMsg → LCD/RPC → State refetch → UI updates
```

### Directory Structure

```
src/ui/baby/
├── components/           # Reusable UI components
│   ├── AmountField/     # Amount input with Max button
│   ├── FeeField/        # Auto-calculating fee display
│   ├── ValidatorItem/   # Validator display components
│   ├── RewardCard/      # Per-validator reward card
│   └── PreviewModal/    # Transaction preview
├── hooks/
│   ├── api/            # React Query hooks
│   │   ├── useBabyBalance.ts
│   │   ├── useDelegations.ts
│   │   ├── useRewards.ts
│   │   └── useValidators.ts
│   └── services/       # Business logic hooks
│       ├── useDelegationService.ts
│       ├── useRewardService.ts
│       ├── useValidatorService.ts
│       └── useWalletService.ts
├── state/              # React Context providers
│   ├── StakingState.tsx    # Form wizard state
│   ├── DelegationState.tsx # Delegation management
│   ├── ValidatorState.tsx  # Validator selection
│   └── RewardState.tsx     # Reward tracking
├── widgets/            # Page-level components
│   ├── StakingForm/    # Main staking interface
│   ├── Activities/     # Transaction history
│   └── Rewards/        # Rewards management
└── layout.tsx          # Route layout with guards
```

## Key Components

### State Providers

**StakingState**
- Manages form wizard (initial → preview → loading → success)
- Yup validation schema with balance + fee checks
- Fee calculation integration
- Form data persistence

**DelegationState**
- Groups delegations by validator
- Enriches with validator metadata
- Handles unbonding flow

**ValidatorState**
- Validator selection modal
- Search/filter functionality
- Voting power calculations

### Service Hooks

**useDelegationService**
- `stake(params)` - Create delegation
- `unstake(params)` - Remove delegation  
- `estimateStakingFee(params)` - Get transaction cost
- `groupedDelegations` - Validator-grouped delegations

**useRewardService**
- `claimReward(validatorAddr)` - Claim from single validator
- `claimAllRewards()` - Claim from all validators
- `totalReward` - Sum of all pending rewards

**useValidatorService**
- `validators` - List with voting power/commission
- `validatorMap` - Address-indexed lookup

### Domain Layer

**src/domain/services/delegationService.ts**
- Pure functions for message creation
- Handles amount unit conversion (BABY ↔ ubbn)
- Abstracts transaction signing/broadcasting

## Network Integration

### Babylon LCD Queries
- `/cosmos/bank/v1beta1/balances/{address}` - BABY balance
- `/cosmos/staking/v1beta1/delegations/{delegator}` - User delegations
- `/cosmos/distribution/v1beta1/delegators/{delegator}/rewards` - Pending rewards
- `/cosmos/staking/v1beta1/validators` - Active validators
- `/cosmos/staking/v1beta1/pool` - Bonded token pool

### Transaction Messages
- `MsgWrappedDelegate` - Stake BABY tokens
- `MsgUndelegate` - Unstake tokens
- `MsgWithdrawDelegatorReward` - Claim rewards

## Configuration

### Network Settings
Located in `src/ui/common/config/network/bbn.ts`:

```typescript
{
  chainId: "bbn-test-3",
  networkName: "Babylon Genesis",
  coinSymbol: "BABY", // or "tBABY" for testnets
  displayUSD: true,    // Show USD values
  logo: babyLogo,      // Token icon
}
```

### Feature Flags
```typescript
// Enable BABY staking routes
FEATURE_FLAG_BABY_STAKING=true
```

## Error Handling

### Common Error Scenarios
1. **Wallet not connected** - Shows connect wallet UI
2. **Insufficient balance** - Form validation prevents submit
3. **Geo-blocked** - HealthGuard blocks entire module
4. **API unhealthy** - HealthGuard shows maintenance message
5. **Transaction failure** - Error provider handles with retry options

### Error Mapping
Currently uses generic error messages. Future enhancement: create a mapping from Babylon LCD error codes to user-friendly messages.

## Validation Rules

### Staking Form
- **Amount**: > 0, ≤ balance, ≤ 6 decimal places
- **Amount + Fee**: ≤ total balance
- **Validator**: Must select exactly 1 validator

### Business Rules
- **Minimum stake**: 1 BABY (to be fetched from chain params)
- **Maximum stake**: Available balance minus transaction fee
- **Fee calculation**: Real-time estimation from LCD

## Testing

### Test Coverage
- `tests/app/hooks/services/useDelegationService.baby.test.tsx`
- `tests/app/hooks/services/useRewardService.baby.test.tsx`
- `tests/app/state/StakingState.baby.test.tsx`
- `tests/domain/services/delegationService.test.ts`

### Running BABY Tests
```bash
npm test -- --testPathPattern=baby
```

## Development Guide

### Adding New Validators
1. Validators are fetched automatically from LCD
2. To add metadata (logos, descriptions), extend `useValidatorService`
3. Consider caching validator info in local storage

### Adding Activity Types
1. Extend `EVENTS` constants in `src/ui/common/utils/eventBus.ts`
2. Create `useBabyActivities` hook to parse transaction history
3. Add `ActivityState` provider to track pagination/filtering
4. Update Activities widget to render new transaction types

### Extending Reward Claims
The current implementation supports:
- Claim all rewards from all validators
- Claim rewards from a specific validator

To add batch selection:
1. Extend RewardState to track selected validators
2. Add checkbox UI to RewardCard components
3. Create `claimSelectedRewards(validatorAddresses[])` method

### Custom Error Messages
1. Create error code mapping in `src/ui/common/utils/errorMapping.ts`
2. Map Babylon LCD error responses to user messages
3. Integrate with existing error provider

### Health Checks
The HealthGuard component automatically handles:
- Geo-blocking via IP detection
- API health status monitoring
- Wallet disable flags

To extend health checks, modify `useHealthCheck` hook.

## Known Limitations

1. **Chain Parameters**: Min/max staking amounts are hardcoded (1 BABY min, balance max). Should fetch from `/babylon/baby/v1/params`.

2. **Activity History**: No on-chain activity parsing yet. Requires `useBabyActivities` hook.

3. **Error Messages**: Generic error handling. Needs Babylon-specific error code mapping.

4. **Type Safety**: Some `any` types remain in older parts of the codebase.

## Future Enhancements

1. **Chain params integration** - Fetch min/max/term from LCD
2. **Activity feed** - Parse on-chain transaction history  
3. **Enhanced validation** - Real-time balance checks with WebSocket
4. **Reward compounding** - Auto-restake rewards option
5. **Multi-validator UX** - Batch operations for power users
6. **Performance** - Virtual scrolling for large validator lists
7. **Mobile optimization** - Touch-friendly validator selection

## Troubleshooting

### Common Issues

**"Babylon Wallet is not connected"**
- Ensure BBN wallet is connected via wallet selector
- Check `useCosmosWallet` returns valid `bech32Address`

**Form validation errors**
- Check balance is sufficient for amount + fee
- Verify validator selection is made
- Ensure amount has ≤ 6 decimal places

**Transaction failures**
- Check network connectivity
- Verify wallet has enough tokens for fees
- Check Babylon LCD/RPC endpoints are responsive

**Module not loading**
- Verify `FEATURE_FLAG_BABY_STAKING` is enabled
- Check route guards allow access to `/baby` routes
- Ensure all required providers are wrapped in layout