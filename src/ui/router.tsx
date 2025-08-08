import { Navigate, Route, Routes } from "react-router";

import BabyLayout from "./baby/layout";
import BabyActivities from "./baby/widgets/Activities";
import BabyRewards from "./baby/widgets/Rewards";
import BabyStakingForm from "./baby/widgets/StakingForm";
import Layout from "./common/layout";
import NotFound from "./common/not-found";
import BTCStaking from "./common/page";
import FF from "./common/utils/FeatureFlagService";

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="btc" replace />} />
        <Route path="btc" element={<BTCStaking />} />
        {FF.IsBabyStakingEnabled && (
          <Route path="baby" element={<BabyLayout />}>
            <Route index element={<Navigate to="staking" replace />} />
            <Route path="staking" element={<BabyStakingForm />} />
            <Route path="rewards" element={<BabyRewards />} />
            <Route path="activities" element={<BabyActivities />} />
          </Route>
        )}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
