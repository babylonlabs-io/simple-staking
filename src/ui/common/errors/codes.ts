export const ERROR_CODES = {
  // --- Connection & Availability Errors ---
  CONNECTION_ERROR: "CONNECTION_ERROR", // General network problems
  EXTERNAL_SERVICE_UNAVAILABLE: "EXTERNAL_SERVICE_UNAVAILABLE", // External service (RPC, Ordinals) is unavailable
  GEO_BLOCK: "GEO_BLOCK", // Geolocation restriction

  // --- Configuration & Initialization Errors ---
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR", // Problems with genesis params, BBN params, network fees config
  INITIALIZATION_ERROR: "INITIALIZATION_ERROR", // Staking manager, staker info, params not loaded/initialized

  // --- Data & Validation Errors ---
  VALIDATION_ERROR: "VALIDATION_ERROR", // Generic invalid data (address, block height, amounts, timelocks, proofs, delegation state)
  MISSING_DATA_ERROR: "MISSING_DATA_ERROR", // Required data not provided (e.g., PoP, signatures)

  // --- Transaction Lifecycle Errors ---
  TRANSACTION_PREPARATION_ERROR: "TRANSACTION_PREPARATION_ERROR", // Errors building the transaction (e.g., fee estimation issues)
  TRANSACTION_SUBMISSION_ERROR: "TRANSACTION_SUBMISSION_ERROR", // Errors sending/broadcasting the transaction via wallet or directly
  TRANSACTION_VERIFICATION_ERROR: "TRANSACTION_VERIFICATION_ERROR", // Errors confirming transaction status (not found, hash mismatch, not eligible)
  STAKING_EXPANSION_FEE_ERROR: "STAKING_EXPANSION_FEE_ERROR", // Errors calculating fees for staking expansion transactions

  // --- Staking Logic Errors ---
  DELEGATION_LOGIC_ERROR: "DELEGATION_LOGIC_ERROR", // Errors in delegation selection, missing covenant signatures, finality provider issues

  // --- Wallet Interaction Errors ---
  WALLET_NOT_CONNECTED: "WALLET_NOT_CONNECTED", // Wallet connection is required but not established
  WALLET_CONFIGURATION_ERROR: "WALLET_CONFIGURATION_ERROR", // Wallet is connected to an unsupported network or using an unsupported address type
  WALLET_AUTHENTICATION_ERROR: "WALLET_AUTHENTICATION_ERROR", // Authentication or permission issue with the wallet
  WALLET_ACTION_REJECTED: "WALLET_ACTION_REJECTED", // User explicitly rejected the action (e.g., signing, sending) in the wallet interface
  WALLET_ACTION_FAILED: "WALLET_ACTION_FAILED", // An unspecified error occurred within the wallet during an action (sign, send, etc.)
};
