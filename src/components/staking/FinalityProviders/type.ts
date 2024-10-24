export type Row = {
  moniker: string;
  btcPk: string;
  stake: number;
  commission: number;
  website: string;
};

export type TableParams = {
  rowState: Record<string, { selected: boolean; disabled: boolean }>;
};

export interface Props {
  selectedRow: string;
  data: Row[];
  onRowSelect: (pk: string) => void;
}
