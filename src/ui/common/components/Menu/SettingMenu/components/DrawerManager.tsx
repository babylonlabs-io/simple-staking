import { ThemeSelectionDrawer } from "./ThemeSelectionDrawer";

interface DrawerManagerProps {
  activeDrawer: string | null;
  onClose: () => void;
}

export const DrawerManager = ({
  activeDrawer,
  onClose,
}: DrawerManagerProps) => {
  return (
    <>
      {/* Theme Drawer */}
      <ThemeSelectionDrawer
        isOpen={activeDrawer === "theme"}
        onClose={onClose}
      />

      {/* Currency Drawer */}
      {/* Network Drawer */}
    </>
  );
};
