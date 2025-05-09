// Note: These should be replaced by data-testid selectors

export const SPINNER_SELECTOR =
  '[data-testid="staked-balance"] .bbn-loader, [data-testid="stakable-balance"] .bbn-loader, [data-testid="baby-balance"] .bbn-loader, [data-testid="baby-rewards"] .bbn-loader';
export const STAKED_BALANCE_ITEM_SELECTOR =
  '.bbn-list-item:has-text("Staked Balance")';
export const STAKED_BALANCE_VALUE_SELECTOR =
  '.bbn-list-item:has-text("Staked Balance") .bbn-list-value';
export const STAKABLE_BALANCE_VALUE_SELECTOR =
  '.bbn-list-item:has-text("Stakable Balance") .bbn-list-value';
export const BABY_BALANCE_VALUE_SELECTOR =
  '.bbn-list-item:has-text("BABY Balance") .bbn-list-value';
export const BABY_REWARDS_VALUE_SELECTOR =
  '.bbn-list-item:has-text("BABY Rewards") .bbn-list-value';
