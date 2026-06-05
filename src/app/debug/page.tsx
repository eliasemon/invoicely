import { getClientSummary } from '@/app/actions/clientActions';

export default async function DebugPage() {
  let res: any;
  try {
    res = await getClientSummary('be10f4f8-1797-4911-a3ac-cfc67b8122a2');
  } catch (err: any) {
    res = err.message;
  }
  return <div><pre>{JSON.stringify(res, null, 2)}</pre></div>;
}
