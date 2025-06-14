import { openDB } from "idb";

export default await openDB<Infra.Schema>("staking");
