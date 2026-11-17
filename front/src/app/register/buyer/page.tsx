import { User } from 'lucide-react';
import RegisterFormBuyer from './RegisterFormBuyer';

export default function BuyerRegisterPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <User className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black">ثبت‌ نام</h1>
        <p className="text-muted-foreground mt-2">به خانواده بازارچه بپیوندید و خرید کنید</p>
      </div>
      <RegisterFormBuyer />
    </div>
  );
}