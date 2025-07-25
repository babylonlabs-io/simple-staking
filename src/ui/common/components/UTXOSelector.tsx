import { UTXO } from "@babylonlabs-io/btc-staking-ts";
import { useMemo } from "react";

import { satoshiToBtc } from "@/ui/common/utils/btc";

interface UTXOSelectorProps {
  utxos: UTXO[];
  selectedUtxo: UTXO | null;
  onUtxoSelect: (utxo: UTXO | null) => void;
  requiredAmount?: number;
  className?: string;
}

export function UTXOSelector({
  utxos,
  selectedUtxo,
  onUtxoSelect,
  requiredAmount,
  className = "",
}: UTXOSelectorProps) {
  const sortedUtxos = useMemo(() => {
    return [...utxos].sort((a, b) => b.value - a.value);
  }, [utxos]);

  const isUtxoSufficient = (utxo: UTXO) => {
    // Minimum dust threshold (1000 sats) + required amount
    const minAmount = requiredAmount ? requiredAmount + 1000 : 1000;
    return utxo.value >= minAmount;
  };

  if (utxos.length === 0) {
    return (
      <div className={`p-4 bg-gray-50 rounded-md ${className}`}>
        <p className="text-sm text-gray-600">
          No UTXOs available for funding the expansion.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
        {sortedUtxos.map((utxo) => {
          const utxoKey = `${utxo.txid}:${utxo.vout}`;
          const isSelected =
            selectedUtxo?.txid === utxo.txid &&
            selectedUtxo?.vout === utxo.vout;
          const isSufficient = isUtxoSufficient(utxo);

          return (
            <label
              key={utxoKey}
              className={`flex items-center p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                !isSufficient ? "opacity-50" : ""
              } ${isSelected ? "bg-blue-50 border-blue-200" : ""}`}
            >
              <input
                type="radio"
                name="utxo-selection"
                value={utxoKey}
                checked={isSelected}
                onChange={() => onUtxoSelect(isSelected ? null : utxo)}
                disabled={!isSufficient}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">
                      {satoshiToBtc(utxo.value)} sBTC
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {utxo.txid.slice(0, 8)}...{utxo.txid.slice(-8)}:
                      {utxo.vout}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {utxo.value.toLocaleString()} sats
                    </div>
                    {!isSufficient && requiredAmount && (
                      <div className="text-xs text-red-500 mt-1">
                        Insufficient (need {satoshiToBtc(requiredAmount)} sBTC)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      {selectedUtxo && (
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Selected UTXO:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <div>Amount: {satoshiToBtc(selectedUtxo.value)} sBTC</div>
            <div className="font-mono">
              Transaction: {selectedUtxo.txid.slice(0, 16)}...
              {selectedUtxo.txid.slice(-16)}
            </div>
            <div>Output Index: {selectedUtxo.vout}</div>
          </div>
        </div>
      )}

      {requiredAmount && (
        <div className="text-xs text-gray-600">
          <strong>Required amount:</strong> {satoshiToBtc(requiredAmount)} sBTC
          {selectedUtxo && selectedUtxo.value > requiredAmount && (
            <span className="ml-2 text-green-600">
              (Change: {satoshiToBtc(selectedUtxo.value - requiredAmount)} sBTC)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
