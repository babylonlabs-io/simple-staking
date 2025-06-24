import { DialogBody, DialogHeader } from "@babylonlabs-io/core-ui";

import { Bsn } from "@/ui/types/bsn";
import { FinalityProvider } from "@/ui/types/finalityProviders";

interface SelectedBsnPreviewModalProps {
  onClose: () => void;
  bsnList: Bsn[];
  finalityProviders: FinalityProvider[];
}

export const SelectedBsnPreviewModal = ({
  onClose,
  bsnList,
  finalityProviders,
}: SelectedBsnPreviewModalProps) => {
  return (
    <>
      <DialogHeader
        title="BSNs & Finality Providers"
        onClose={onClose}
        className="text-accent-primary"
      />

      <DialogBody className="flex flex-col mb-4 mt-4 text-accent-primary">
        <div className="border border-secondary-strokeLight rounded-lg p-6 pt-0">
          <div className="grid grid-cols-2 gap-8 p-4 text-center">
            <h3 className="text-xs text-accent-secondary">BSNs</h3>
            <h3 className="text-xs text-accent-secondary">Finality Provider</h3>
          </div>

          <div className="bg-secondary-highlight rounded-lg">
            <div>
              {Array.from({
                length: Math.max(bsnList.length, finalityProviders.length),
              }).map((_, index) => {
                const bsn = bsnList[index];
                const fp = finalityProviders[index];

                return (
                  <div
                    key={index}
                    className="grid grid-cols-2 items-center py-4"
                  >
                    {/* BSN Column */}
                    <div className="flex items-center gap-3 justify-center">
                      {bsn ? (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            <div className="w-6 h-6 bg-accent-secondary rounded flex items-center justify-center">
                              <span className="text-xs text-white">
                                {bsn.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <span className="text-accent-primary text-sm">
                            {bsn.name}
                          </span>
                        </>
                      ) : (
                        <div className="h-8" />
                      )}
                    </div>

                    {/* Finality Provider Column */}
                    <div className="flex items-center gap-3 justify-center">
                      {fp ? (
                        <>
                          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                            {fp.logo_url ? (
                              <img
                                src={fp.logo_url}
                                alt={
                                  fp.description?.moniker || "Finality Provider"
                                }
                                className="w-6 h-6 rounded"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-accent-secondary rounded flex items-center justify-center">
                                <span className="text-xs text-white">
                                  {(fp.description?.moniker || "FP")
                                    .charAt(0)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-accent-primary text-sm">
                            {fp.description?.moniker ||
                              "Unknown Finality Provider"}
                          </span>
                        </>
                      ) : (
                        <div className="h-8" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogBody>
    </>
  );
};
