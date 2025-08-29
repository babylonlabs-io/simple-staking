import {
  DialogBody,
  DialogHeader,
  Input,
  Table,
  Text,
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
  // apr: number;
  // logoUrl: string;
}

interface ValidatorTableProps {
  open: boolean;
  searchTerm: string;
  validators: Validator[];
  onClose?: () => void;
  onSelect?: (validator: Validator) => void;
  onSearch?: (value: string) => void;
}

export const ValidatorTable = ({
  open,
  validators,
  searchTerm,
  onClose,
  onSelect,
  onSearch,
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

  return (
    <ResponsiveDialog open={open} onClose={onClose} className="w-[52rem]">
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

        <Input
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => onSearch?.(e.target.value)}
          prefix={searchPrefix}
          className="w-full"
        />

        <Table
          data={validators}
          columns={columns}
          className="w-full"
          wrapperClassName="w-full"
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
