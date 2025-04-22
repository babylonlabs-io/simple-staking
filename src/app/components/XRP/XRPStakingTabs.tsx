import { Form, NumberField, Text, useFormState } from "@babylonlabs-io/core-ui";
import React from "react";
import { Tooltip } from "react-tooltip";
import { twMerge } from "tailwind-merge";
import * as yup from "yup";

import { useLanguage } from "@/app/contexts/LanguageContext";
import { useXrp } from "@/app/contexts/XrpProvider";
import { translations } from "@/app/translations";
import { InfoAlert } from "@/components/staking/StakingForm/components/InfoAlert";
import { executeXrplStaking } from "@/utils/xrplUtils";

export const XRPStakingTabs: React.FC = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const { xrpBalance, xrpPublicClient, getMnemonic } = useXrp();

  const schema = yup.object().shape({
    amount: yup
      .number()
      .transform((value: number) => (!Number.isNaN(value) ? value : undefined))
      .typeError("Staking term must be a valid number.")
      .required("Staking amount is the required field.")
      .max(xrpBalance, "Insufficient xrp Balance in Wallet"),
  });

  const displayPreview = async ({ amount }: { amount: number }) => {
    console.log("displayPreview", amount);
    const mnemonic = await getMnemonic();
    if (!mnemonic) {
      console.error("Mnemonic not found");
      return;
    }
    await executeXrplStaking(amount.toString(), xrpPublicClient, mnemonic);
  };

  return (
    <Form
      schema={schema}
      mode="onChange"
      reValidateMode="onChange"
      onSubmit={displayPreview}
    >
      <div className="flex-1 min-w-0">
        <div
          className="flex gap-4"
          style={{
            paddingBottom: "0.5rem",
            borderBottom: "1px solid",
            borderImage:
              "linear-gradient(90deg, #4F4633 -16.24%, #887957 34%, #060504 97.34%) 1",
          }}
        >
          <span
            className={`font-medium text-3xl text-accent-primary border-b-2 border-primary-main`}
          >
            {`XRP Staking`}
          </span>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row mt-4">
          <div className="flex-1 min-w-0">
            <DsrvDescription />
          </div>

          <div
            className="flex lg:w-2/5 xl:w-1/3"
            style={{
              borderLeft: "1px solid",
              borderImage:
                "linear-gradient(180deg, #040403 0%, #887957 44.23%, #060504 100%) 1",
            }}
          >
            <div className="relative flex flex-1 flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
              {/* <Heading variant="h5" className="text-accent-primary">
          Step 2
        </Heading>

        <Text variant="body1" className="text-accent-secondary">
          Set Staking Amount
        </Text> */}

              <InfoAlert />

              <div className="flex flex-1 flex-col">
                <div className={twMerge("relative flex flex-1 flex-col")}>
                  {/* <TermField defaultValue={2} min={1} max={2} /> */}

                  <AmountField min={0} max={1} />

                  {/* <HiddenField name="feeRate" defaultValue="0" /> */}

                  {/* <HiddenField name="feeAmount" defaultValue="0" /> */}

                  <div className="flex flex-col gap-4 mt-4">
                    {/* <BTCFeeRate defaultRate={0.1} /> */}
                    {/* <BTCFeeAmount /> */}
                    {/* {BBN_FEE_AMOUNT && <BBNFeeAmount amount={BBN_FEE_AMOUNT} />} */}
                  </div>

                  <div className="divider my-4" />

                  {/* <Total /> */}

                  <SubmitButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Form>
  );
};

const DsrvDescription = () => {
  return (
    <div className="space-y-4">
      <div>
        <div className="space-y-3">
          <div className="flex items-center gap-[8px]">
            <h3 className="text-[28px] font-semibold">DSRV</h3>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-500">active</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Vault</p>
              <p className="font-medium break-words">
                rEPQxsSVER2r4HeVR4APrVCB45K68rqgp2
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div>
                <p className="text-sm text-gray-500">Staked Balance</p>
                <p className="font-medium">1,000 xrp</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div>
                <p className="text-sm text-gray-500">apr</p>
                <p className="font-medium">10% %</p>
              </div>
            </div>
            {/* <div>
                <p className="text-sm text-gray-500">{t.totalDelegations}</p>
                <p className="font-medium">{fp.totalDelegations}</p>
              </div> */}
          </div>

          <div className="pt-2">
            <p className="text-sm text-gray-500">description</p>
            <p className="font-medium">
              DSRV is an integrated blockchain solutions company with the
              mission of enriching the crypto ecosystem via stronger
              connectivity. We strive to be your gateway to a suite of
              all-comprehensive blockchain services. Everything distributed,
              served complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubmitButton = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const { isValid, errors } = useFormState();
  const { xrpBalance } = useXrp();

  const [errorMessage] = Object.keys(errors).map(
    (fieldName) => (errors[fieldName]?.message as string) ?? "",
  );

  // const isValid = true;
  // const errorMessage = "";

  const XRP_FEE_AMOUNT = null;

  const invalid = !isValid || xrpBalance === 0;
  const tooltip =
    errorMessage ??
    (xrpBalance === 0
      ? `Insufficient xrp Balance in Wallet${XRP_FEE_AMOUNT ? `.\n${XRP_FEE_AMOUNT} xrp required for network fees.` : ""}`
      : "");

  return (
    <span
      className="cursor-pointer text-xs mt-8"
      data-tooltip-id="tooltip-staking-preview"
      data-tooltip-content={invalid ? tooltip : ""}
      data-tooltip-place="top"
    >
      <button
        //@ts-ignore - fix type issue in core-ui
        type="submit"
        disabled={invalid}
        // size="large"
        // fluid
        className="text-lg bg-transparent border-2 border-[#887957] text-white hover:bg-[#887957] hover:text-white disabled:bg-[#111111] disabled:text-[#AAAAAA] disabled:border-[#887957] rounded-[4px] font-semiBold"
        style={{
          display: "flex",
          width: "355px",
          height: "42px",
          padding: "0px 12px",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          flexShrink: 0,
        }}
      >
        {t.stake}
      </button>

      <Tooltip id="tooltip-staking-preview" className="tooltip-wrap z-50" />
    </span>
  );
};

interface AmountFieldProps {
  min?: number;
  max?: number;
}

function AmountField({ min = 0, max = 0 }: AmountFieldProps) {
  const label = (
    <div className="flex flex-1 justify-between items-center">
      <Text as="span" variant="body1">
        Amount
      </Text>
      <Text as="span" variant="body2">
        min/max: {min}/{max} xrp
      </Text>
    </div>
  );

  return (
    <NumberField
      name="amount"
      // className="bg-transparent border-0 border-b border-solid border-accent-secondary"
      controlClassName="mb-6 [&_.bbn-input]:py-2.5 [&_.bbn-form-control-title]:mb-1 [&_.bbn-input-field]:text-base"
      // label={label}
      placeholder={"xrp"}
    />
  );
}
