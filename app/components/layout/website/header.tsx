import { Link } from "@remix-run/react";
import ThemeToggle from "./theme-toggle";
import MobileMenu from "./mobile-menu";
import LogoDeo from "@/assets/icon-baru.png";
import Logo from "@/assets/blu.png";
import LogoPerhubungan from "@/assets/favicon.ico";

export default function HeaderWebsite() {
  const headerMenu = [
    {
      label: "HOME",
      url: "/",
    },
    {
      label: "PERATURAN",
      url: "/peraturan",
    },
    {
      label: "PENGADUAN",
      url: "/pengaduan",
    },
    {
      label: "PPID",
      url: "/ppid",
    },
    {
      label: "TENTANG KAMI",
      url: "/tentang-kami",
    },
  ];

  return (
    <header className="absolute w-full z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Site branding */}
          <div className="shrink-0 mr-12">
            <Link to="/" className="block" aria-label="Deo Airport">
              <div className="flex flex-row items-start justifty-start cursor-pointer">
                <div className=" h-full">
                  <img
                    src={LogoDeo}
                    alt="logo"
                    width={100}
                    height={100}
                  />
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex md:grow">
            {/* Desktop menu links */}
            <ul className="flex grow flex-wrap items-center font-medium">
              {headerMenu.map((menu, index) => (
                <li key={index}>
                  <Link
                    to={menu.url}
                    className="cursor-pointer hover:text-gray-900 dark:text-gray-100 dark:hover:text-gray-50 px-5 py-2 flex items-center transition duration-150 ease-in-out"
                  >
                    {menu.label}
                  </Link>
                </li>
              ))}
            </ul>

          
            
            <ul className="flex justify-end flex-wrap items-center space-x-2">
              <img src={LogoPerhubungan} alt="logo" width={45} height={45} />

              <img src={Logo} alt="logo" width={45} height={45} />
            </ul>
            <ThemeToggle className="ml-3" />
          </nav>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
