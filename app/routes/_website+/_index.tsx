import { Fragment } from "react";
import BgHome from "@/assets/images/bg.jpg";
import HomeFeatureList from "@/components/ui/home-feature-list";
import HeroAplikasiCard from "~/components/ui/home-aplikasi-list";

export default function Index() {
  return (
    <Fragment>
      <section className="relative">
        <div className="absolute inset-0 h-128 pt-16 box-content -z-1">
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            src={BgHome}
            width={1440}
            height={577}
            alt={"Deo Airport"}
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-white to-[transparent] -500 dark:from-gray-900"
            aria-hidden="true"
          ></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="pt-32 md:pt-40 flex flex-row">
            {/* Featured article */}
            <div className="max-w-2xl" data-aos="fade-down">
              <article>
                <header>
                  {/* Title and excerpt */}
                  <div className="text-center md:text-left">
                    <div>
                      <h1 className="h2 font-red-hat-display mb-4  text-gray-600 dark:text-white ">
                        DEO AIRPORT - 3S+1C
                      </h1>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-white">
                      berpartisipasi dalam setiap Program Keamanan dan
                      Keselamatan untuk mempromosikan pengembangan kapasitas
                      setiap Negara Anggota ICAO sebagai dukungan inisiatif “No
                      Country Left Behind”
                    </p>
                    {/**<FlightAnimation/> */}
                  </div>
                  {/* Article meta */}
                  <div className="md:flex md:items-center md:justify-between mt-5"></div>
                </header>
              </article>
            </div>
            <div data-aos="fade-up">{/**<FlightSearchForm /> */}</div>
          </div>
        </div>
      </section>
      <HomeFeatureList/>
      <HeroAplikasiCard/>






      
    </Fragment>
  );
}
