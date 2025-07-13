import { Navigate, Route, Routes } from "react-router";

import BabyStaking from "./baby";
import Layout from "./common/layout";
import NotFound from "./common/not-found";
import BTCStaking from "./common/page";
import FF from "./common/utils/FeatureFlagService";
import LegacyPage from "./legacy/page";

export const Router = () => (
  <Routes>
    {FF.IsPhase3Enabled ? (
      <Route path="/" element={<Layout />}>
        <Route path="btc" element={<BTCStaking />} />
        <Route index element={<Navigate to="btc" replace />} />
        {FF.IsBabyStakingEnabled && (
          <Route path="baby" element={<BabyStaking />} />
        )}
      </Route>
    ) : (
      <Route path="/" element={<LegacyPage />} />
    )}
    <Route path="*" element={<NotFound />} />
  </Routes>
);
