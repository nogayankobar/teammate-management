import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import WorkItemDetail from "@/components/WorkItemDetail";
import { tasks } from "@/data/mockData";

export function generateStaticParams() {
  return tasks.map((t) => ({ id: t.id }));
}

export default function WorkItemPage({ params }: { params: { id: string } }) {
  const task = tasks.find((t) => t.id === params.id);
  if (!task) notFound();

  return (
    <div className="flex h-screen overflow-hidden bg-tipalti-bg-light">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top bar */}
        <div className="h-12 bg-white border-b border-tipalti-border flex items-center px-6 justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-[13px] text-tipalti-text-muted">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="9" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M0.5 12c0-2 2-3.5 4.5-3.5s4.5 1.5 4.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M8.5 9c.5-.2 1-.3 1.5-.3C12 8.7 14 10 14 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="font-medium">AI Workforce</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1.5 text-tipalti-text-muted hover:text-tipalti-text-primary transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 0C6.8 3.2 6.8 3.2 10 4C6.8 4.8 6.8 4.8 6 8C5.2 4.8 5.2 4.8 2 4C5.2 3.2 5.2 3.2 6 0Z" />
                <path d="M12 6C12.5 8 12.5 8 14.5 8.5C12.5 9 12.5 9 12 11C11.5 9 11.5 9 9.5 8.5C11.5 8 11.5 8 12 6Z" />
              </svg>
              <span className="text-[13px] font-medium">AI Assistant</span>
            </button>
            <div className="h-5 w-px bg-tipalti-border" />
            <button className="text-[13px] text-tipalti-text-primary font-medium flex items-center gap-1 hover:text-tipalti-blue transition-colors">
              Payer name
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3 4l2 2 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="w-7 h-7 rounded-full bg-tipalti-navy flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold">M</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <WorkItemDetail task={task} />
        </div>
      </main>
    </div>
  );
}
