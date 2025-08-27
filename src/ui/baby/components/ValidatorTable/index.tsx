import {
  DialogBody,
  DialogHeader,
  Input,
  Select,
  Table,
  Text,
  Toggle,
} from "@babylonlabs-io/core-ui";
import type { PropsWithChildren } from "react";
import { MdCancel } from "react-icons/md";
import { RiSearchLine } from "react-icons/ri";

import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";

import { columns } from "./columns";

const MAX_WINDOW_HEIGHT = 500;

export interface Validator {
  id: string;
  address: string;
  name: string;
  votingPower: number;
  commission: number;
  tokens: number;
  status: "active" | "inactive" | "jailed" | "slashed";
  // apr: number;
  // logoUrl: string;
}

interface ValidatorTableProps {
  open: boolean;
  searchTerm: string;
  status?: "active" | "inactive" | "jailed" | "slashed" | "";
  showSlashed?: boolean;
  validators: Validator[];
  onClose?: () => void;
  onSelect?: (validator: Validator) => void;
  onSearch?: (value: string) => void;
  onStatusChange?: (
    value: "active" | "inactive" | "jailed" | "slashed" | "",
  ) => void;
  onShowSlashedChange?: (value: boolean) => void;
}

export const ValidatorTable = ({
  open,
  validators,
  searchTerm,
  status = "",
  showSlashed = false,
  onClose,
  onSelect,
  onSearch,
  onStatusChange,
  onShowSlashedChange,
}: PropsWithChildren<ValidatorTableProps>) => {
  const onClearSearch = () => {
    onSearch?.("");
  };

  const searchPrefix = searchTerm ? (
    <button
      onClick={onClearSearch}
      className="opacity-60 hover:opacity-100 transition-opacity"
    >
      <MdCancel size={18} className="text-secondary-strokeDark" />
    </button>
  ) : (
    <span className="text-secondary-strokeDark">
      <RiSearchLine size={20} />
    </span>
  );

  const searchSuffix = (
    <div className="flex items-center gap-2 mr-2">
      <Toggle value={showSlashed} onChange={(v) => onShowSlashedChange?.(v)} />
      <Text variant="body2" className="text-accent-primary whitespace-nowrap">
        Show Slashed
      </Text>
    </div>
  );

  return (
    <ResponsiveDialog open={open} onClose={onClose}>
      <DialogHeader
        title="Select Validator"
        onClose={onClose}
        className="text-accent-primary"
      />
      <DialogBody
        style={{ maxHeight: MAX_WINDOW_HEIGHT }}
        className="no-scrollbar mt-4 flex flex-col gap-6 overflow-y-auto text-accent-primary"
      >
        <Text variant="body2" className="text-accent-secondary">
          Validators are responsible for verifying transactions, proposing and
          confirming new blocks, and helping maintain the security and consensus
          of Babylon Genesis.
        </Text>

        <div className="flex gap-3 items-center">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => onSearch?.(e.target.value)}
              prefix={searchPrefix}
              suffix={searchSuffix}
              className="w-full"
            />
          </div>
          <Select
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "jailed", label: "Jailed" },
              { value: "slashed", label: "Slashed" },
            ]}
            placeholder="Active"
            value={status || "active"}
            disabled={Boolean(searchTerm)}
            onSelect={(v) => onStatusChange?.(v as any)}
            renderSelectedOption={(option) => option.label}
            className="w-[120px] flex-shrink-0"
          />
        </div>

        <Table
          data={validators}
          columns={columns}
          className="min-w-0 w-full table-fixed"
          wrapperClassName="w-full overflow-x-hidden"
          onRowSelect={(row) => {
            if (row) {
              onSelect?.(row);
              onClose?.();
            }
          }}
        />
      </DialogBody>
    </ResponsiveDialog>
  );
};
