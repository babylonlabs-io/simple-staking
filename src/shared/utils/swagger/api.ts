/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum V2TypesDelegationState {
  StatePending = "PENDING",
  StateVerified = "VERIFIED",
  StateActive = "ACTIVE",
  StateSlashed = "SLASHED",
  StateTimelockUnbonding = "TIMELOCK_UNBONDING",
  StateEarlyUnbonding = "EARLY_UNBONDING",
  StateTimelockWithdrawable = "TIMELOCK_WITHDRAWABLE",
  StateEarlyUnbondingWithdrawable = "EARLY_UNBONDING_WITHDRAWABLE",
  StateTimelockSlashingWithdrawable = "TIMELOCK_SLASHING_WITHDRAWABLE",
  StateEarlyUnbondingSlashingWithdrawable = "EARLY_UNBONDING_SLASHING_WITHDRAWABLE",
  StateTimelockWithdrawn = "TIMELOCK_WITHDRAWN",
  StateEarlyUnbondingWithdrawn = "EARLY_UNBONDING_WITHDRAWN",
  StateTimelockSlashingWithdrawn = "TIMELOCK_SLASHING_WITHDRAWN",
  StateEarlyUnbondingSlashingWithdrawn = "EARLY_UNBONDING_SLASHING_WITHDRAWN",
}

export enum TypesFinalityProviderQueryingState {
  FinalityProviderStateActive = "active",
  FinalityProviderStateStandby = "standby",
}

export enum TypesErrorCode {
  InternalServiceError = "INTERNAL_SERVICE_ERROR",
  ValidationError = "VALIDATION_ERROR",
  NotFound = "NOT_FOUND",
  BadRequest = "BAD_REQUEST",
  Forbidden = "FORBIDDEN",
  UnprocessableEntity = "UNPROCESSABLE_ENTITY",
  RequestTimeout = "REQUEST_TIMEOUT",
}

export interface GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError {
  err?: any;
  errorCode?: TypesErrorCode;
  statusCode?: number;
}

export interface HandlerPublicResponseArrayV1ServiceDelegationPublic {
  data?: V1ServiceDelegationPublic[];
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseArrayV1ServiceFpDetailsPublic {
  data?: V1ServiceFpDetailsPublic[];
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseArrayV1ServiceStakerStatsPublic {
  data?: V1ServiceStakerStatsPublic[];
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseArrayV2ServiceDelegationPublic {
  data?: V2ServiceDelegationPublic[];
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseArrayV2ServiceFinalityProviderStatsPublic {
  data?: V2ServiceFinalityProviderStatsPublic[];
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseMapStringFloat64 {
  data?: MapStringFloat64;
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseMapStringString {
  data?: MapStringString;
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseV1ServiceDelegationPublic {
  data?: V1ServiceDelegationPublic;
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseV1ServiceGlobalParamsPublic {
  data?: V1ServiceGlobalParamsPublic;
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseV1ServiceOverallStatsPublic {
  data?: V1ServiceOverallStatsPublic;
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseV2HandlersAddressScreeningResponse {
  data?: V2HandlersAddressScreeningResponse;
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseV2ServiceDelegationPublic {
  data?: V2ServiceDelegationPublic;
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseV2ServiceOverallStatsPublic {
  data?: V2ServiceOverallStatsPublic;
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPublicResponseV2ServiceStakerStatsPublic {
  data?: V2ServiceStakerStatsPublic;
  pagination?: HandlerPaginationResponse;
}

export interface HandlerPaginationResponse {
  next_key?: string;
}

export interface IndexertypesBbnStakingParams {
  allow_list_expiration_height?: number;
  btc_activation_height?: number;
  covenant_pks?: string[];
  covenant_quorum?: number;
  delegation_creation_base_gas_fee?: number;
  max_active_finality_providers?: number;
  max_staking_time_blocks?: number;
  max_staking_value_sat?: number;
  min_commission_rate?: string;
  min_slashing_tx_fee_sat?: number;
  min_staking_time_blocks?: number;
  min_staking_value_sat?: number;
  slashing_pk_script?: string;
  slashing_rate?: string;
  unbonding_fee_sat?: number;
  unbonding_time_blocks?: number;
  version?: number;
}

export interface IndexertypesBtcCheckpointParams {
  btc_confirmation_depth?: number;
  version?: number;
}

export type MapStringFloat64 = Record<string, number>;

export type MapStringString = Record<string, string>;

export interface TypesFinalityProviderDescription {
  details?: string;
  identity?: string;
  moniker?: string;
  security_contact?: string;
  website?: string;
}

export interface V1HandlersDelegationCheckPublicResponse {
  code?: number;
  data?: boolean;
}

export interface V1HandlersUnbondDelegationRequestPayload {
  staker_signed_signature_hex?: string;
  staking_tx_hash_hex?: string;
  unbonding_tx_hash_hex?: string;
  unbonding_tx_hex?: string;
}

export interface V1ServiceDelegationPublic {
  finality_provider_pk_hex?: string;
  is_eligible_for_transition?: boolean;
  is_overflow?: boolean;
  is_slashed?: boolean;
  staker_pk_hex?: string;
  staking_tx?: V1ServiceTransactionPublic;
  staking_tx_hash_hex?: string;
  staking_value?: number;
  state?: string;
  unbonding_tx?: V1ServiceTransactionPublic;
}

export interface V1ServiceFpDescriptionPublic {
  details?: string;
  identity?: string;
  moniker?: string;
  security_contact?: string;
  website?: string;
}

export interface V1ServiceFpDetailsPublic {
  active_delegations?: number;
  active_tvl?: number;
  btc_pk?: string;
  commission?: string;
  description?: V1ServiceFpDescriptionPublic;
  total_delegations?: number;
  total_tvl?: number;
}

export interface V1ServiceGlobalParamsPublic {
  versions?: V1ServiceVersionedGlobalParamsPublic[];
}

export interface V1ServiceOverallStatsPublic {
  active_delegations?: number;
  active_tvl?: number;
  /** Optional field */
  btc_price_usd?: number;
  pending_tvl?: number;
  total_delegations?: number;
  total_stakers?: number;
  total_tvl?: number;
  unconfirmed_tvl?: number;
}

export interface V1ServiceStakerStatsPublic {
  active_delegations?: number;
  active_tvl?: number;
  staker_pk_hex?: string;
  total_delegations?: number;
  total_tvl?: number;
}

export interface V1ServiceTransactionPublic {
  output_index?: number;
  start_height?: number;
  start_timestamp?: string;
  timelock?: number;
  tx_hex?: string;
}

export interface V1ServiceVersionedGlobalParamsPublic {
  activation_height?: number;
  cap_height?: number;
  confirmation_depth?: number;
  covenant_pks?: string[];
  covenant_quorum?: number;
  max_staking_amount?: number;
  max_staking_time?: number;
  min_staking_amount?: number;
  min_staking_time?: number;
  staking_cap?: number;
  tag?: string;
  unbonding_fee?: number;
  unbonding_time?: number;
  version?: number;
}

export interface V2HandlersAddressScreeningResponse {
  btc_address?: {
    risk?: string;
  };
}

export interface V2ServiceCovenantSignature {
  covenant_btc_pk_hex?: string;
  signature_hex?: string;
}

export interface V2ServiceDelegationPublic {
  delegation_staking?: V2ServiceDelegationStaking;
  delegation_unbonding?: V2ServiceDelegationUnbonding;
  finality_provider_btc_pks_hex?: string[];
  params_version?: number;
  staker_btc_pk_hex?: string;
  state?: V2TypesDelegationState;
}

export interface V2ServiceDelegationStaking {
  bbn_inception_height?: number;
  bbn_inception_time?: string;
  end_height?: number;
  slashing?: V2ServiceStakingSlashing;
  staking_amount?: number;
  staking_timelock?: number;
  staking_tx_hash_hex?: string;
  staking_tx_hex?: string;
  start_height?: number;
}

export interface V2ServiceDelegationUnbonding {
  covenant_unbonding_signatures?: V2ServiceCovenantSignature[];
  slashing?: V2ServiceUnbondingSlashing;
  unbonding_timelock?: number;
  unbonding_tx?: string;
}

export interface V2ServiceFinalityProviderStatsPublic {
  active_delegations?: number;
  active_tvl?: number;
  btc_pk?: string;
  commission?: string;
  description?: TypesFinalityProviderDescription;
  state?: TypesFinalityProviderQueryingState;
}

export interface V2ServiceNetworkInfoPublic {
  params?: V2ServiceParamsPublic;
  staking_status?: V2ServiceStakingStatusPublic;
}

export interface V2ServiceOverallStatsPublic {
  active_delegations?: number;
  active_finality_providers?: number;
  active_tvl?: number;
  /** Represents the APR for BTC staking as a decimal (e.g., 0.035 = 3.5%) */
  btc_staking_apr?: number;
  /**
   * This represents the total active delegations on BTC chain which includes
   * both phase-1 and phase-2 active delegations
   */
  total_active_delegations?: number;
  /**
   * This represents the total active tvl on BTC chain which includes
   * both phase-1 and phase-2 active tvl
   */
  total_active_tvl?: number;
  total_finality_providers?: number;
}

export interface V2ServiceParamsPublic {
  bbn?: IndexertypesBbnStakingParams[];
  btc?: IndexertypesBtcCheckpointParams[];
}

export interface V2ServiceStakerStatsPublic {
  active_delegations?: number;
  active_tvl?: number;
  slashed_delegations?: number;
  slashed_tvl?: number;
  unbonding_delegations?: number;
  unbonding_tvl?: number;
  withdrawable_delegations?: number;
  withdrawable_tvl?: number;
}

export interface V2ServiceStakingSlashing {
  slashing_tx_hex?: string;
  spending_height?: number;
}

export interface V2ServiceStakingStatusPublic {
  is_staking_open?: boolean;
}

export interface V2ServiceUnbondingSlashing {
  spending_height?: number;
  unbonding_slashing_tx_hex?: string;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

class ServerError extends Error {
  constructor(
    public message: string,
    public status: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]().catch((e) => e);

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok)
        throw new ServerError(
          data?.message ?? "Unknown Server Error",
          r.status,
          { cause: data },
        );

      return data;
    });
  };
}

/**
 * @title Babylon Staking API
 * @version 2.0
 * @license API Access License (https://docs.babylonlabs.io/assets/files/api-access-license.pdf)
 * @contact <contact@babylonlabs.io>
 *
 * The Babylon Staking API offers information about the state of the Babylon BTC Staking system.
 * Your access and use is governed by the API Access License linked to below.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  address = {
    /**
     * @description Checks address risk
     *
     * @tags v2
     * @name ScreeningList
     * @summary Checks address risk
     * @request GET:/address/screening
     */
    screeningList: (
      query: {
        /** BTC address to check */
        btc_address: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        HandlerPublicResponseV2HandlersAddressScreeningResponse,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/address/screening`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),
  };
  healthcheck = {
    /**
     * @description Health check the service, including ping database connection
     *
     * @tags shared
     * @name HealthcheckList
     * @summary Health check endpoint
     * @request GET:/healthcheck
     */
    healthcheckList: (params: RequestParams = {}) =>
      this.request<string, any>({
        path: `/healthcheck`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
  v1 = {
    /**
     * @description [DEPRECATED] Retrieves a delegation by a given transaction hash. Please use /v2/delegation instead.
     *
     * @tags v1
     * @name DelegationList
     * @request GET:/v1/delegation
     * @deprecated
     */
    delegationList: (
      query: {
        /** Staking transaction hash in hex format */
        staking_tx_hash_hex: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        HandlerPublicResponseV1ServiceDelegationPublic,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v1/delegation`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description [DEPRECATED] Fetches details of all active finality providers sorted by their active total value locked (ActiveTvl) in descending order. Please use /v2/finality-providers instead.
     *
     * @tags v1
     * @name FinalityProvidersList
     * @summary Get Active Finality Providers (Deprecated)
     * @request GET:/v1/finality-providers
     * @deprecated
     */
    finalityProvidersList: (
      query?: {
        /** Public key of the finality provider to fetch */
        fp_btc_pk?: string;
        /** Pagination key to fetch the next page of finality providers */
        pagination_key?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerPublicResponseArrayV1ServiceFpDetailsPublic, any>({
        path: `/v1/finality-providers`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description [DEPRECATED] Retrieves the global parameters for Babylon, including finality provider details. Please use /v2/network-info instead.
     *
     * @tags v1
     * @name GlobalParamsList
     * @request GET:/v1/global-params
     * @deprecated
     */
    globalParamsList: (params: RequestParams = {}) =>
      this.request<HandlerPublicResponseV1ServiceGlobalParamsPublic, any>({
        path: `/v1/global-params`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Check if a staker has an active delegation by the staker BTC address (Taproot or Native Segwit). Optionally, you can provide a timeframe to check if the delegation is active within the provided timeframe The available timeframe is "today" which checks after UTC 12AM of the current day
     *
     * @tags shared
     * @name StakerDelegationCheckList
     * @request GET:/v1/staker/delegation/check
     */
    stakerDelegationCheckList: (
      query: {
        /** Staker BTC address in Taproot/Native Segwit format */
        address: string;
        /** Check if the delegation is active within the provided timeframe */
        timeframe?: "today";
      },
      params: RequestParams = {},
    ) =>
      this.request<
        V1HandlersDelegationCheckPublicResponse,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v1/staker/delegation/check`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves phase-1 delegations for a given staker. This endpoint will be deprecated once all phase-1 delegations are either withdrawn or registered into phase-2. This endpoint is only used to show legacy phase-1 delegations for the purpose of unbonding or registering into phase-2.
     *
     * @tags v1
     * @name StakerDelegationsList
     * @request GET:/v1/staker/delegations
     */
    stakerDelegationsList: (
      query: {
        /** Staker BTC Public Key */
        staker_btc_pk: string;
        /** Only return delegations with pending actions which include active, unbonding, unbonding_requested, unbonded */
        pending_action?: boolean;
        /** Pagination key to fetch the next page of delegations */
        pagination_key?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        HandlerPublicResponseArrayV1ServiceDelegationPublic,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v1/staker/delegations`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves public keys for the given BTC addresses. This endpoint only returns public keys for addresses that have associated delegations in the system. If an address has no associated delegation, it will not be included in the response. Supports both Taproot and Native Segwit addresses.
     *
     * @tags shared
     * @name StakerPubkeyLookupList
     * @summary Get stakers' public keys
     * @request GET:/v1/staker/pubkey-lookup
     */
    stakerPubkeyLookupList: (
      query: {
        /** List of BTC addresses to look up (up to 10), currently only supports Taproot and Native Segwit addresses */
        address: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        HandlerPublicResponseMapStringString,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v1/staker/pubkey-lookup`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description [DEPRECATED] Fetches overall stats for babylon staking including tvl, total delegations, active tvl, active delegations and total stakers. Please use /v2/stats instead.
     *
     * @tags v1
     * @name StatsList
     * @summary Get Overall Stats (Deprecated)
     * @request GET:/v1/stats
     * @deprecated
     */
    statsList: (params: RequestParams = {}) =>
      this.request<HandlerPublicResponseV1ServiceOverallStatsPublic, any>({
        path: `/v1/stats`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description [DEPRECATED] Fetches staker stats for babylon staking including tvl, total delegations, active tvl and active delegations. Please use /v2/staker/stats instead. If staker_btc_pk query parameter is provided, it will return stats for the specific staker. Otherwise, it will return the top stakers ranked by active tvl.
     *
     * @tags v1
     * @name StatsStakerList
     * @summary Get Staker Stats (Deprecated)
     * @request GET:/v1/stats/staker
     * @deprecated
     */
    statsStakerList: (
      query?: {
        /** Public key of the staker to fetch */
        staker_btc_pk?: string;
        /** Pagination key to fetch the next page of top stakers */
        pagination_key?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        HandlerPublicResponseArrayV1ServiceStakerStatsPublic,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v1/stats/staker`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Unbonds a phase-1 delegation by processing the provided transaction details. This endpoint will be deprecated once all phase-1 delegations are either withdrawn or registered into phase-2. This is an async operation.
     *
     * @tags v1
     * @name UnbondingCreate
     * @summary Unbond phase-1 delegation
     * @request POST:/v1/unbonding
     */
    unbondingCreate: (
      payload: V1HandlersUnbondDelegationRequestPayload,
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v1/unbonding`,
        method: "POST",
        body: payload,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Checks if a delegation identified by its staking transaction hash is eligible for unbonding. This endpoint will be deprecated once all phase-1 delegations are either withdrawn or registered into phase-2.
     *
     * @tags v1
     * @name UnbondingEligibilityList
     * @summary Check unbonding eligibility
     * @request GET:/v1/unbonding/eligibility
     */
    unbondingEligibilityList: (
      query: {
        /** Staking Transaction Hash Hex */
        staking_tx_hash_hex: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        void,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v1/unbonding/eligibility`,
        method: "GET",
        query: query,
        ...params,
      }),
  };
  v2 = {
    /**
     * @description Retrieves a delegation by a given transaction hash
     *
     * @tags v2
     * @name DelegationList
     * @summary Get a delegation
     * @request GET:/v2/delegation
     */
    delegationList: (
      query: {
        /** Staking transaction hash in hex format */
        staking_tx_hash_hex: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        HandlerPublicResponseV2ServiceDelegationPublic,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v2/delegation`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Fetches delegations for babylon staking including tvl, total delegations, active tvl, active delegations and total stakers.
     *
     * @tags v2
     * @name DelegationsList
     * @summary Get Delegations
     * @request GET:/v2/delegations
     */
    delegationsList: (
      query: {
        /** Staker public key in hex format */
        staker_pk_hex: string;
        /** Babylon address */
        babylon_address?: string;
        /** Pagination key to fetch the next page of delegations */
        pagination_key?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        HandlerPublicResponseArrayV2ServiceDelegationPublic,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v2/delegations`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Fetches finality providers with its stats, currently does not support pagination
     *
     * @tags v2
     * @name FinalityProvidersList
     * @summary List Finality Providers
     * @request GET:/v2/finality-providers
     */
    finalityProvidersList: (params: RequestParams = {}) =>
      this.request<
        HandlerPublicResponseArrayV2ServiceFinalityProviderStatsPublic,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v2/finality-providers`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Get network info, including staking status and param
     *
     * @tags v2
     * @name NetworkInfoList
     * @request GET:/v2/network-info
     */
    networkInfoList: (params: RequestParams = {}) =>
      this.request<
        V2ServiceNetworkInfoPublic,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v2/network-info`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Get latest prices for all available symbols
     *
     * @tags v2
     * @name PricesList
     * @request GET:/v2/prices
     */
    pricesList: (params: RequestParams = {}) =>
      this.request<
        HandlerPublicResponseMapStringFloat64,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v2/prices`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Fetches staker stats for babylon staking including active tvl,
     *
     * @tags v2
     * @name StakerStatsList
     * @summary Get Staker Stats
     * @request GET:/v2/staker/stats
     */
    stakerStatsList: (
      query: {
        /** Public key of the staker to fetch */
        staker_pk_hex: string;
        /** Babylon address of the staker to fetch */
        babylon_address?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        HandlerPublicResponseV2ServiceStakerStatsPublic,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v2/staker/stats`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Overall system stats
     *
     * @tags v2
     * @name StatsList
     * @request GET:/v2/stats
     */
    statsList: (params: RequestParams = {}) =>
      this.request<
        HandlerPublicResponseV2ServiceOverallStatsPublic,
        GithubComBabylonlabsIoStakingApiServiceInternalSharedTypesError
      >({
        path: `/v2/stats`,
        method: "GET",
        format: "json",
        ...params,
      }),
  };
}
