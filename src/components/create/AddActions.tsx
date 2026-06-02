import { MaterialIcon } from '@/components/shared/MaterialIcon';

interface AddActionsProps {
  onAddGroup: () => void;
  onAddItem: () => void;
}

export function AddActions({ onAddGroup, onAddItem }: Readonly<AddActionsProps>) {
  return (
    <div className="flex gap-sm mt-sm">
      <button 
        onClick={onAddItem}
        className="flex-1 h-[48px] rounded-lg border border-primary text-primary font-body-md text-body-md font-medium flex items-center justify-center gap-xs hover:bg-surface-container transition-colors"
      >
        <MaterialIcon icon="add" /> Item
      </button>
      <button 
        onClick={onAddGroup}
        className="flex-1 h-[48px] rounded-lg border border-outline-variant text-on-surface font-body-md text-body-md font-medium flex items-center justify-center gap-xs bg-surface-container-lowest hover:bg-surface-container transition-colors"
      >
        <MaterialIcon icon="folder_open" /> Group
      </button>
    </div>
  );
}
