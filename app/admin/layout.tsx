import OfflineBanner from "@/components/admin/OfflineBanner";
import SWRegister from "@/components/admin/SWRegister"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SWRegister />     
      <OfflineBanner />
      {children}
    </>
  );
}