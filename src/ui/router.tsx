import { Navigate, Route, Routes } from "react-router";

import BabyStaking from "./baby";
import NotFound from "./common/not-found";
import BTCStaking from "./common/page";

export const Router = () => (
  <Routes>
    <Route index element={<Navigate to="btc" replace />} />
    <Route path="btc" element={<BTCStaking />} />
    <Route path="baby" element={<BabyStaking />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
