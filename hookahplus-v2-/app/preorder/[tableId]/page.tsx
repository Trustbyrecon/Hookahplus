import PreOrderForm from './PreOrderForm';

// Generate static params for static export
export async function generateStaticParams() {
  // Generate common table IDs that might be accessed
  const tableIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  
  return tableIds.map((tableId) => ({
    tableId: tableId,
  }));
}

export default function PreOrderTable({ params }: { params: { tableId: string } }) {
  return <PreOrderForm tableId={params.tableId} />;
}
