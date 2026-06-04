import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import { APP_CONFIG } from "@/configs/appConfig";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="h-screen flex">
        {/* LEFT */}
        <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] px-1 overflow-y-auto">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 sticky top-0 bg-white py-4"
          >
            <div className="relative w-8 h-8">
              <Image
                src="/student_management_logo.png"
                alt="logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="hidden lg:block font-bold">
              {APP_CONFIG.APP_NAME}
            </span>
          </Link>
          <Menu />
        </div>

        {/* RIGHT */}
        <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-[#F7F8FA] overflow-y-auto flex flex-col justify-between items-stretch">
          <Navbar />
          {children}
        </div>
      </div>
    </>
  );
}
