import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

interface ConfirmVoidModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  billId: string;
  tableName: string;
}

export function ConfirmVoidModal({
  open,
  onClose,
  onConfirm,
  billId,
  tableName,
}: ConfirmVoidModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận hủy bill</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn hủy bill <strong>{billId}</strong> của <strong>{tableName}</strong> không?
            <br />
            <br />
            Hành động này sẽ đánh dấu bill là đã hủy và không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Không</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Có, hủy bill
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
