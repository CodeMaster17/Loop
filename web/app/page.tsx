'use client';
// Everything runs in the browser (data is stored on the device), so the app is client-only.
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../client/App'), { ssr: false, loading: () => <div className="boot" /> });

export default function Page() {
  return <App />;
}
