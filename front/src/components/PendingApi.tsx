export default function PendingApi() {
  return (
    <div className='fixed top-10 transform flex items-center gap-3 rounded-md z-50 bg-[#060606b0] px-2 shadow-md py-3 -translate-x-1/2 left-1/2'>
      {/* <span className="text-gray-50 text-sm">در حال انجام عملیات</span> */}
      <div className="spinner"></div>
    </div>
  )
}
