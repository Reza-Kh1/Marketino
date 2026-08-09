export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>
        <p className="text-muted-foreground text-sm animate-pulse">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
// export default function LoadingPage() {
//   return (
//     <div className="min-h-[60vh] flex items-center justify-center">
//       <div className="text-center">
//         <div className="w-14 h-14 rounded-2xl border-4 border-primary border-t-transparent animate-spin mx-auto mb-5" />
//         <p className="text-muted-foreground text-sm font-medium">در حال بارگذاری...</p>
//       </div>
//     </div>
//   );
// }
