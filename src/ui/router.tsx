import { Route, Routes } from "react-router";

import BabyStaking from "./baby";
import NotFound from "./common/not-found";
import BTCStaking from "./common/page";
import FeatureFlagService from "./common/utils/FeatureFlagService";

export const Router = () => (
  <Routes>
    <Route index path="/" element={<BTCStaking />} />
    {FeatureFlagService.IsBabyStakingEnabled && (
      <Route path="baby" element={<BabyStaking />} />
    )}
    <Route path="*" element={<NotFound />} />
  </Routes>
);
