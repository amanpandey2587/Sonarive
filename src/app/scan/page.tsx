import { PageContainer } from "@/components/ui/common/pageContainer";
import { PageHeader } from "@/components/ui/common/pageHeader";
import ScanForm from "./scanForm";

export default function ScanPage() {
  return (
    <div className="w-[100vw] bg-gradient-to-br from-indigo-900 via-blue-800 to-teal-700">
    <PageContainer className="min-h-screen  py-12 px-4">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto space-y-8">
        <PageHeader
          title="Medical Scan Analysis"
          description="Upload your MRI, CT scan, or X-ray image for AI-powered insights."
        />



        
        <div className="max-w-2xl mx-auto">
          <ScanForm />
        </div>
      </div>
    </PageContainer>
    </div>
  );
}
