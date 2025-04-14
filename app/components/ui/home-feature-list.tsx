import { PlaneTakeoff, Speech, BookOpenCheck, Wifi, Accessibility, Newspaper } from "lucide-react";


export default function FeatureLists() {
  return (
    <section className="mt-8 mb-8">
        {/* Items */}
        <div className="max-w-sm mx-auto grid grid-cols-2 gap-4 gap-y-8 sm:gap-8 md:grid-cols-8 items-start md:max-w-6xl" data-aos-id-feature-yori>
       
          <div className="relative flex flex-col items-center cursor-pointer" data-aos="fade-up" data-aos-anchor="[data-aos-id-feature-yori]" data-aos-delay="100">
            <div className="relative w-24 h-24 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full opacity-30 bg-linear-to-tr from-teal-500 -z-1"
                aria-hidden="true"
              ></div>
              <PlaneTakeoff className="w-16 h-16  text-teal-500 ml-4 mt-4" />
            </div>
            <div className="text-sm font-medium dark:text-teal-300 mt-2">
              PENERBANGAN
            </div>
          </div>

          <div className="relative flex flex-col items-center cursor-pointer" data-aos="fade-down" data-aos-anchor="[data-aos-id-feature-yori]" data-aos-delay="100">
            <div className="relative w-24 h-24 items-center justify-center">
            <div
                className="absolute inset-0 rounded-full opacity-30 bg-linear-to-tr from-purple-500 -z-1"
                aria-hidden="true"
              ></div>
              <Wifi className="w-16 h-16  text-purple-500 ml-4 mt-4" />
            </div>
            <div className="text-sm font-medium dark:text-purple-300 mt-2">
              FASILITAS
            </div>
          </div>

          <div className="relative flex flex-col items-center cursor-pointer" data-aos="fade-up" data-aos-anchor="[data-aos-id-feature-yori]" data-aos-delay="100">
            <div className="relative w-24 h-24 items-center justify-center">
            <div
                className="absolute inset-0 rounded-full opacity-30 bg-linear-to-tr from-indigo-500 -z-1"
                aria-hidden="true"
              ></div>
              <BookOpenCheck className="w-16 h-16 text-indigo-500 ml-4 mt-4" />
            </div>
            <div className="text-sm font-medium dark:text-indigo-300 mt-2">
              INFORMASI
            </div>
          </div>

          <div className="relative flex flex-col items-center cursor-pointer" data-aos="fade-up" data-aos-anchor="[data-aos-id-feature-yori]" data-aos-delay="100">
            <div className="relative w-24 h-24 items-center justify-center">
            <div
                className="absolute inset-0 rounded-full opacity-30 bg-linear-to-tr from-lime-500 -z-1"
                aria-hidden="true"
              ></div>
              <Newspaper className="w-16 h-16 text-lime-500 ml-4 mt-4" />
            </div>
            <div className="text-sm font-medium dark:text-lime-300 mt-2">
              BERITA
            </div>
          </div>

          <div className="relative flex flex-col items-center cursor-pointer" data-aos="fade-down" data-aos-anchor="[data-aos-id-feature-yori]" data-aos-delay="100">
            <div className="relative w-24 h-24 items-center justify-center">
            <div
                className="absolute inset-0 rounded-full opacity-30 bg-linear-to-tr from-pink-500 -z-1"
                aria-hidden="true"
              ></div>
              <Accessibility className="w-16 h-16 text-pink-500 ml-4 mt-4" />
            </div>
            <div className="text-sm font-medium dark:text-pink-300 mt-2">
            LAYANAN
            </div>
          </div>

          <div className="relative flex flex-col items-center cursor-pointer" data-aos="fade-down" data-aos-anchor="[data-aos-id-feature-yori]" data-aos-delay="100">
            <div className="relative w-24 h-24 items-center justify-center">
            <div
                className="absolute inset-0 rounded-full opacity-30 bg-linear-to-tr from-amber-500 -z-1"
                aria-hidden="true"
              ></div>
              <PlaneTakeoff className="w-16 h-16 fill-current text-amber-500 ml-4 mt-2" />
            </div>
            <div className="text-sm font-medium dark:text-amber-300 mt-2">
            PETA BANDARA
            </div>
          </div>

          <div className="relative flex flex-col items-center cursor-pointer" data-aos="fade-up" data-aos-anchor="[data-aos-id-feature-yori]" data-aos-delay="100">
            <div className="relative w-24 h-24 items-center justify-center">
            <div
                className="absolute inset-0 rounded-full opacity-30 bg-linear-to-tr from-lime-500 -z-1"
                aria-hidden="true"
              ></div>
              <Speech className="w-16 h-16 text-lime-500 ml-4 mt-4" />
            </div>
            <div className="text-sm font-medium dark:text-gray-300 mt-2">
            PARIWISATA
            </div>
          </div>

          <div className="relative flex flex-col items-center cursor-pointer" data-aos="fade-down" data-aos-anchor="[data-aos-id-feature-yori]" data-aos-delay="100">
            <div className="relative w-24 h-24 items-center justify-center">
            <div
                className="absolute inset-0 rounded-full opacity-30 bg-linear-to-tr from-amber-500 -z-1"
                aria-hidden="true"
              ></div>
              <PlaneTakeoff className="w-16 h-16 fill-current text-amber-500 ml-4 mt-2" />
            </div>
            <div className="text-sm font-medium dark:text-amber-300 mt-2">
              TRANSPORTASI
            </div>
          </div>

        </div>
      </section>
  )
}