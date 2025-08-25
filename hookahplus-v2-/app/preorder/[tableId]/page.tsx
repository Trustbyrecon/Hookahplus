import PreOrderForm from './PreOrderForm';

export default function PreOrderTable({ params }: { params: { tableId: string } }) {
  return <PreOrderForm tableId={params.tableId} />;
}
