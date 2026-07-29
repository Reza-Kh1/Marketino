export default function LoadingPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl border-4 border-primary border-t-transparent animate-spin mx-auto mb-5" />
        <p className="text-muted-foreground text-sm font-medium">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
