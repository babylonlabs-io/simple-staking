import React, { Dispatch, SetStateAction, useState } from "react";
import { BsSortDown, BsSortUp } from "react-icons/bs";
import { FaCheck } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

import {
  SortDirection,
  SortField,
} from "../Staking/FinalityProviders/FinalityProviders";

import { GeneralModal } from "./GeneralModal";

interface FinalityProviderMobileSortModalProps {
  open: boolean;
  onClose: (value: boolean) => void;
  handleMobileSort: (order: SortDirection, criteria: SortField) => void;
  activeOrder: number;
  setActiveOrder: Dispatch<SetStateAction<number>>;
  selectedCriterion: SortField;
  setSelectedCriterion: Dispatch<SetStateAction<SortField>>;
}

interface Criteria {
  id: SortField;
  label: string;
}

export const FinalityProviderMobileSortModal: React.FC<
  FinalityProviderMobileSortModalProps
> = ({
  open,
  onClose,
  handleMobileSort,
  activeOrder,
  setActiveOrder,
  selectedCriterion,
  setSelectedCriterion,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  const orders = [
    { label: "Ascending", icon: <BsSortUp /> },
    { label: "Descending", icon: <BsSortDown /> },
  ];
  const criteria: Criteria[] = [
    { id: "moniker", label: "Finality Provider" },
    { id: "btcPk", label: "BTC PK" },
    { id: "stakeSat", label: "Total Delegation" },
    { id: "commission", label: "Commission" },
  ];

  return (
    <GeneralModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Sort By</h3>
        <button
          className="btn btn-circle btn-ghost btn-sm"
          onClick={() => onClose(false)}
        >
          <IoMdClose size={24} />
        </button>
      </div>

      <div className="relative flex w-full border border-gray-400 rounded-full p-2 mb-4">
        <div className="absolute left-0 top-0 w-full h-full p-1">
          <div
            className={`
    w-1/2 h-full bg-gray-400 rounded-full
    transition-transform duration-300 ease-in-out
    ${activeOrder === 0 ? "translate-x-0" : "translate-x-full"}
  `}
          />
        </div>
        {orders.map((order, index) => (
          <button
            key={index}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-full relative z-10 ${
              activeOrder === index ? "text-black" : "text-gray-400"
            } transition duration-300 ease-in-out`}
            onClick={() => setActiveOrder(index)}
          >
            <span
              className={`${
                activeOrder === index ? "text-black" : "text-gray-400"
              } transition duration-150 ease-in-out`}
            >
              {order.icon}
            </span>{" "}
            {order.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col w-full rounded p-2 mb-8">
        {criteria.map((criterion, index) => (
          <button
            key={index}
            className={`flex justify-between items-center p-2 border-b border-gray-400`}
            onClick={() => setSelectedCriterion(criterion.id)}
          >
            <span className="my-2">{criterion.label}</span>
            {selectedCriterion === criterion.id && (
              <FaCheck className="text-primary" />
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="btn btn-primary w-full"
          onClick={() => {
            const order = activeOrder ? "desc" : "asc";
            handleMobileSort(order, selectedCriterion);
            onClose(false);
          }}
        >
          Apply
        </button>
      </div>
    </GeneralModal>
  );
};
