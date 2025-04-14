import { Link } from "@remix-run/react";
import LogoBangga from "@/assets/bangga.png";
import LogoBerakhlak from "@/assets/berakhlak.png";
import LogoDigi from "@/assets/digiportasi.png";

export default function Footer() {
  return (
    <footer className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-16 border-t border-gray-200 dark:border-gray-800 -mt-px">
          {/* Footer illustration */}
          <div className="pointer-events-none -z-1" aria-hidden="true">
            <svg
              className="absolute bottom-0 left-0 transform -translate-x-1/2 ml-24 dark:opacity-40"
              width="800"
              height="264"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="400"
                cy="400"
                r="400"
                fill="url(#footerglow_paint0_radial)"
                fillOpacity=".4"
              />
              <defs>
                <radialGradient
                  id="footerglow_paint0_radial"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="rotate(90 0 400) scale(315.089)"
                >
                  <stop stopColor="#3ABAB4" />
                  <stop offset="1" stopColor="#3ABAB4" stopOpacity=".01" />
                </radialGradient>
              </defs>
            </svg>
            <svg
              className="absolute bottom-0 right-0 transform translate-x-1/2 mr-24 dark:opacity-40"
              width="800"
              height="264"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="400"
                cy="400"
                r="400"
                fill="url(#footerglow_paint0_radial)"
                fillOpacity=".4"
              />
              <defs>
                <radialGradient
                  id="footerglow_paint0_radial"
                  cx="0"
                  cy="0"
                  r="1"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="rotate(90 0 400) scale(315.089)"
                >
                  <stop stopColor="#3ABAB4" />
                  <stop offset="1" stopColor="#3ABAB4" stopOpacity=".01" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* Top area: Blocks */}
          <div className="grid md:grid-cols-12 gap-8 lg:gap-20 mb-8 md:mb-12">
            {/* 1st block */}
            <div className="md:col-span-2 lg:col-span-3">
              {/* Logo */}
              <div className=" flex flex-row space-x-3">
                <img src={LogoBerakhlak} alt="logo" width={180} height={70} />
              </div>
              <div className=" flex flex-row space-x-2 mt-4">
                <img src={LogoBangga} alt="logo" width={150} height={50} />
                <img src={LogoDigi} alt="logo" width={120} height={50} />
              </div>
            </div>

            {/* 2nd, 3rd, 4th and 5th blocks */}
            <div className="md:col-span-10 lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* 2nd block */}
              <div className="text-sm">
                <h6 className="font-medium uppercase mb-2">UNGGULAN</h6>
                <ul>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Keterbukaan Informasi
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Notifikasi Penerbangan
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Aplikasi Mobile
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Aplikasi UMKM
                    </a>
                  </li>
                </ul>
              </div>

              {/* 3rd block */}
              <div className="text-sm">
                <h6 className="font-medium uppercase mb-2">Resources</h6>
                <ul>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Industries and tools
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Use cases
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Blog
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Online events
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Nostrud exercitation
                    </a>
                  </li>
                </ul>
              </div>

              {/* 4th block */}
              <div className="text-sm">
                <h6 className="font-medium uppercase mb-2">BLU DEO Sorong</h6>
                <ul>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Keberagaman & inklusi
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Tentang Kami
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Siaran Pers
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Cerita Pelanggan
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Komunitas Online
                    </a>
                  </li>
                </ul>
              </div>

              {/* 5th block */}
              <div className="text-sm">
                <h6 className="font-medium uppercase mb-2">
                  Public Monitoring
                </h6>
                <ul>
                  <li className="mb-1">
                    <Link
                      className="text-gray-600 dark:text-gray-400 transition duration-150 ease-in-out"
                      to="/posko/angleb"
                    >
                      Posko Angleb 2025
                    </Link>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Posko Nataru 2025
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Statistik Angkutan Udara
                    </a>
                  </li>
                  <li className="mb-1">
                    <a
                      className="text-gray-600 dark:text-gray-400 transition duration-150 ease-in-out"
                      href="#0"
                    >
                      Laporan Keuangan
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom area */}
          <div className="md:flex md:items-center md:justify-between">
            {/* Social links */}
            <ul className="flex mb-4 md:order-2 md:ml-4 md:mb-0">
              <li className="ml-4">
                <a
                  className="flex justify-center items-center text-white bg-teal-500 dark:text-teal-500 dark:bg-gray-800 hover:underline hover:bg-teal-600 rounded-full transition duration-150 ease-in-out"
                  href="#0"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-8 h-8 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14.023 24L14 17h-3v-3h3v-2c0-2.7 1.672-4 4.08-4 1.153 0 2.144.086 2.433.124v2.821h-1.67c-1.31 0-1.563.623-1.563 1.536V14H21l-1 3h-2.72v7h-3.257z" />
                  </svg>
                </a>
              </li>
              <li className="ml-4">
                <a
                  className="flex justify-center items-center text-white bg-teal-500 dark:text-teal-500 dark:bg-gray-800 hover:underline hover:bg-teal-600 rounded-full transition duration-150 ease-in-out"
                  href="#0"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-8 h-8 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="20.145" cy="11.892" r="1" />
                    <path d="M16 20c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4zm0-6c-1.103 0-2 .897-2 2s.897 2 2 2 2-.897 2-2-.897-2-2-2z" />
                    <path d="M20 24h-8c-2.056 0-4-1.944-4-4v-8c0-2.056 1.944-4 4-4h8c2.056 0 4 1.944 4 4v8c0 2.056-1.944 4-4 4zm-8-14c-.935 0-2 1.065-2 2v8c0 .953 1.047 2 2 2h8c.935 0 2-1.065 2-2v-8c0-.935-1.065-2-2-2h-8z" />
                  </svg>
                </a>
              </li>
              <li className="ml-4">
                <a
                  className="flex justify-center items-center text-white bg-teal-500 dark:text-teal-500 dark:bg-gray-800 hover:underline hover:bg-teal-600 rounded-full transition duration-150 ease-in-out"
                  href="#0"
                  aria-label="Linkedin"
                >
                  <svg
                    className="w-8 h-8 fill-current"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M23.3 8H8.7c-.4 0-.7.3-.7.7v14.7c0 .3.3.6.7.6h14.7c.4 0 .7-.3.7-.7V8.7c-.1-.4-.4-.7-.8-.7zM12.7 21.6h-2.3V14h2.4v7.6h-.1zM11.6 13c-.8 0-1.4-.7-1.4-1.4 0-.8.6-1.4 1.4-1.4.8 0 1.4.6 1.4 1.4-.1.7-.7 1.4-1.4 1.4zm10 8.6h-2.4v-3.7c0-.9 0-2-1.2-2s-1.4 1-1.4 2v3.8h-2.4V14h2.3v1c.3-.6 1.1-1.2 2.2-1.2 2.4 0 2.8 1.6 2.8 3.6v4.2h.1z" />
                  </svg>
                </a>
              </li>
            </ul>

            {/* Middle links */}
            <div className="text-sm md:order-1 text-gray-700 mb-2 md:mb-0">
              <a
                className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                href="#0"
              >
                Ketentuan
              </a>{" "}
              ·{" "}
              <a
                className="text-gray-600 dark:text-gray-400 hover:underline transition duration-150 ease-in-out"
                href="#0"
              >
                Kebijakan Privasi
              </a>
            </div>

            {/* Copyrights note */}
            <div className="text-gray-600 dark:text-gray-400 text-sm mr-4">
              &copy; {new Date().getFullYear()} - kantor BLU UPBU Kelas I DEO - Sorong. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
