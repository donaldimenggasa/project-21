import { Link } from "@remix-run/react";
import ThemeToggle from "~/components/layout/website/theme-toggle";
import LogoKetupat from "~/assets/images/angleb-ketupat2.gif";
import LogoBedug from "~/assets/images/angleb-bedug.gif";

export default function HeaderPoskoAngleb() {
  return (
    <header className="absolute w-full z-30 p-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Site branding */}
          <div className="shrink-0 mr-12">
            <Link to="/" className="block" aria-label="Deo Airport">
              <div className="flex flex-row items-start justifty-start cursor-pointer">
                <div className=" h-full">
                <img src={LogoKetupat} alt="logo" width={80} height={80}/>
                </div>
                <div className=" flex-col mt-3 hidden md:flex">
                <span className=" text-xl font-bold">
                    POSKO ANGKUTAN UDARA LEBARAN - 2025
                  </span>
                  <span className=" text-lg font-bold">
                    KANTOR BLU UPBU KELAS I DEO - SORONG
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">
            {/* Desktop menu links */}
            <ul className="flex grow flex-wrap items-center font-medium">
             
            </ul>

          
            
            <ul className="flex justify-end flex-wrap items-center space-x-2 mt-3">
              <img src={LogoBedug} alt="logo" width={90} height={80} />
            </ul>
            <ThemeToggle />
          </nav>
          <div className={` flex flex-row justify-center md:hidden`}>
          <img src={LogoBedug} alt="logo" width={90} height={90} />
          <ThemeToggle />
          </div>
          {/**<MobileMenu /> */}
        </div>
      </div>

      <div className=" flex flex-col justify-center items-center mt-4 md:hidden">
        <span className=" font-bold">POSKO ANGLEB - 2025</span>
        <span className=" font-bold">BLU UPBU KELAS I DEO - SORONG</span>
       
      </div>
    </header>
  );
}
