import { Route, Routes } from "react-router";

import BabyStaking from "./baby";
import NotFound from "./legacy/not-found";
import BTCStaking from "./legacy/page";
import FeatureFlagService from "./legacy/utils/FeatureFlagService";

export const Router = () => (
  <Routes>
    <Route index path="/" element={<BTCStaking />} />
    {FeatureFlagService.IsBabyStakingEnabled && (
      <Route path="baby" element={<BabyStaking />} />
    )}
    <Route path="*" element={<NotFound />} />
  </Routes>
);
