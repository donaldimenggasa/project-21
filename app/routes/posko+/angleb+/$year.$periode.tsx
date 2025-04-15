import { type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams, useFetcher } from "@remix-run/react";
import { getPeriodePoskoAngleb } from "~/utils/periode-posko";
import axios from "axios";
import { DateTime } from "luxon";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  useQuery,
} from '@tanstack/react-query'

import { Fragment, useEffect } from "react";
import BgHome from "@/assets/images/angleb-bg1.png";
import { StatCard } from "@/components/dashboard-angleb/stat-card";
import { TrafficChart } from "@/components/dashboard-angleb/traffic-chart";
import { GaugeChart } from "@/components/dashboard-angleb/gauge-chart";
import {
  PlaneLanding,
  PlaneTakeoff,
  SmilePlus,
  HeartHandshake,
  GalleryHorizontalEnd,
  GalleryVerticalEnd,
  ArrowLeft,
  BriefcaseConveyorBelt,
  Luggage,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";

interface PeriodePosko {
  date: string;
  name: string;
}

interface QueryChartResult {
  query_string: string[];
  params: Record<string, any>;
}

const query_chart_passenger_movement = (
  model: string,
  array_periode_posko: PeriodePosko[],
  isInPeriod: PeriodePosko
): QueryChartResult => {
  const query_string: string[] = [];
  const params: Record<string, any> = {};
  array_periode_posko.forEach((item: PeriodePosko, index: number) => {
    const tanggalAwalLocal = DateTime.fromISO(item.date).startOf("day");
    const tanggalAkhirLocal = DateTime.fromISO(item.date).endOf("day");
    const startofDate = tanggalAwalLocal
      .toUTC()
      .toFormat("yyyy-MM-dd HH:mm:ss");
    const endOfDay = tanggalAkhirLocal.toUTC().toFormat("yyyy-MM-dd HH:mm:ss");
    params[`dinamic_domain_${index}_datang`] = [
      "&",
      "&",
      ["x_studio_ata", ">=", startofDate],
      ["x_studio_ata", "<=", endOfDay],
      ["x_studio_status", "!=", "CANCEL"],
    ];
    params[`dinamic_domain_${index}_berangkat`] = [
      "&",
      "&",
      ["x_studio_atd", ">=", startofDate],
      ["x_studio_atd", "<=", endOfDay],
      ["x_studio_status", "!=", "CANCEL"],
    ];
    query_string.push(`sum(env['${model}'].sudo().search(dinamic_domain_${index}_datang).mapped(
            lambda x: (x.x_studio_extra_arrivals_flight_number.x_studio_infant or 0.0) + 
                      (x.x_studio_extra_arrivals_flight_number.x_studio_adult or 0.0) +
                      (x.x_studio_extra_arrivals_flight_number.x_studio_transit or 0.0) + 
                      (x.x_studio_extra_arrivals_flight_number.x_studio_transfer or 0.0)
            )
        )`);
    query_string.push(`sum(env['${model}'].sudo().search(dinamic_domain_${index}_berangkat).mapped(
          lambda x: (x.x_studio_extra_departures_flight_number.x_studio_infant or 0.0) + 
                    (x.x_studio_extra_departures_flight_number.x_studio_adult or 0.0) +
                    (x.x_studio_extra_departures_flight_number.x_studio_transit or 0.0) + 
                    (x.x_studio_extra_departures_flight_number.x_studio_transfer or 0.0)
          )
      )`);
  });
  return { query_string, params };
};





const getDataPosko = async(array_periode_posko : any[], isInPeriod :PeriodePosko ) =>{
  try{
    const tanggalAwalLocal = DateTime.fromISO(isInPeriod.date).startOf("day");
    const tanggalAkhirLocal = DateTime.fromISO(isInPeriod.date).endOf("day");
    const startofDate = tanggalAwalLocal.toUTC().toFormat("yyyy-MM-dd HH:mm:ss");
    const endOfDay = tanggalAkhirLocal.toUTC().toFormat("yyyy-MM-dd HH:mm:ss");
  
    const tanggalPertama = array_periode_posko[0].date;
    const tanggalTerakhir =
      array_periode_posko[array_periode_posko.length - 1].date;
    const tanggalHariPertama = DateTime.fromISO(tanggalPertama).startOf("day");
    const tanggalHariTerakhir = DateTime.fromISO(tanggalTerakhir).endOf("day");
    const dateRangeStart = tanggalHariPertama
      .toUTC()
      .toFormat("yyyy-MM-dd HH:mm:ss");
    const dateRangeEnd = tanggalHariTerakhir
      .toUTC()
      .toFormat("yyyy-MM-dd HH:mm:ss");

      const model = "x_data_amc";
      const dinamic_execute_calculate = query_chart_passenger_movement(
        model,
        array_periode_posko,
        isInPeriod
      );
      const params = {
        ...dinamic_execute_calculate.params,
        selected_fields_amc: {
          x_studio_reg_number: {},
          x_studio_operator: {
            fields: {
              x_name: {},
            },
          },
          x_studio_type_pesawat: {
            fields: {
              x_name: {},
            },
          },
        },
        domain_all_landed_today: [
          "&",
          "&",
          ["x_studio_ata", ">=", startofDate],
          ["x_studio_ata", "<=", endOfDay],
          ["x_studio_status", "!=", "CANCEL"],
        ],
        domain_all_takeoff_today: [
          "&",
          "&",
          ["x_studio_atd", ">=", startofDate],
          ["x_studio_atd", "<=", endOfDay],
          ["x_studio_status", "!=", "CANCEL"],
        ],
        domain_all_yori_today: [
          "&",
          "&",
          ["create_date", ">=", dateRangeStart],
          ["create_date", "<=", dateRangeEnd],
          ["x_studio_status", "!=", "CANCEL"],
        ],
  
        domain_seluruh_kedatangan: [
          "&",
          "&",
          ["x_studio_ata", ">=", dateRangeStart],
          ["x_studio_ata", "<=", dateRangeEnd],
          ["x_studio_status", "!=", "CANCEL"],
        ],
        domain_seluruh_keberangkatan: [
          "&",
          "&",
          ["x_studio_atd", ">=", dateRangeStart],
          ["x_studio_atd", "<=", dateRangeEnd],
          ["x_studio_status", "!=", "CANCEL"],
        ],
      };
  
      const {
        data: { result },
      } = await axios({
        url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/internal-action`,
        method: "POST",
        data: {
          params: params,
          queries: [
            // PESAWAT DATANG
            `env['${model}'].sudo().search_count(${"domain_all_landed_today"})`,
            // PESAWAT BERANGKAT
            `env['${model}'].sudo().search_count(${"domain_all_takeoff_today"})`,
            // PESAWAT ALL
            `env['${model}'].sudo().web_search_read(
                               domain=${"domain_all_yori_today"}, 
                               order='write_date desc',
                               specification=${"selected_fields_amc"}
                              )`,
            // `env['${model}'].sudo().web_search_read(${'domain_all_cancel_today'})`,
            // PENUMPANG DATANG
            `sum(env['${model}'].sudo().search(${"domain_all_landed_today"}).mapped(
                        lambda x: (x.x_studio_extra_arrivals_flight_number.x_studio_infant or 0.0) + 
                                  (x.x_studio_extra_arrivals_flight_number.x_studio_adult or 0.0) +
                                  (x.x_studio_extra_arrivals_flight_number.x_studio_transit or 0.0) + 
                                  (x.x_studio_extra_arrivals_flight_number.x_studio_transfer or 0.0)
                        )
                    )`,
            // PENUMPANG BERANGKAT
            `sum(env['${model}'].sudo().search(${"domain_all_takeoff_today"}).mapped(
                        lambda x: (x.x_studio_extra_departures_flight_number.x_studio_infant or 0.0) + 
                                  (x.x_studio_extra_departures_flight_number.x_studio_adult or 0.0) +
                                  (x.x_studio_extra_departures_flight_number.x_studio_transit or 0.0) + 
                                  (x.x_studio_extra_departures_flight_number.x_studio_transfer or 0.0)
                        )
                    )`,
            // CARGO DATANG
            `sum(env['${model}'].sudo().search(${"domain_all_landed_today"}).mapped('x_studio_extra_arrivals_flight_number.x_studio_cargo'))`,
            // CARGO BERANGKAT
            `sum(env['${model}'].sudo().search(${"domain_all_takeoff_today"}).mapped('x_studio_extra_departures_flight_number.x_studio_cargo'))`,
            // BAGASI DATANG
            `sum(env['${model}'].sudo().search(${"domain_all_landed_today"}).mapped('x_studio_extra_arrivals_flight_number.x_studio_baggage'))`,
            // BAGASI BERANGKAT
            `sum(env['${model}'].sudo().search(${"domain_all_takeoff_today"}).mapped('x_studio_extra_departures_flight_number.x_studio_baggage'))`,
  
            // SELURUH PENUMPANG DATANG (9)
            `sum(env['${model}'].sudo().search(${"domain_seluruh_kedatangan"}).mapped(
                      lambda x: (x.x_studio_extra_arrivals_flight_number.x_studio_infant or 0.0) + 
                                (x.x_studio_extra_arrivals_flight_number.x_studio_adult or 0.0) +
                                (x.x_studio_extra_arrivals_flight_number.x_studio_transit or 0.0) + 
                                (x.x_studio_extra_arrivals_flight_number.x_studio_transfer or 0.0)
                      )
                  )`,
  
            // SELURUH PENUMPANG BERANGKAT (10)
            `sum(env['${model}'].sudo().search(${"domain_seluruh_keberangkatan"}).mapped(
                      lambda x: (x.x_studio_extra_departures_flight_number.x_studio_infant or 0.0) + 
                                (x.x_studio_extra_departures_flight_number.x_studio_adult or 0.0) +
                                (x.x_studio_extra_departures_flight_number.x_studio_transit or 0.0) + 
                                (x.x_studio_extra_departures_flight_number.x_studio_transfer or 0.0)
                      )
                  )`,
            // SELURUH PESAWAT DATANG (11)
            `env['${model}'].sudo().search_count(${"domain_seluruh_kedatangan"})`,
            // SELURUH PESAWAT BERANGKAT (12)
            `env['${model}'].sudo().search_count(${"domain_seluruh_keberangkatan"})`,
            // SELURUH CARGO DATANG ( 13)
            `sum(env['${model}'].sudo().search(${"domain_seluruh_kedatangan"}).mapped('x_studio_extra_arrivals_flight_number.x_studio_cargo'))`,
            // SELURUH CARGO BERANGKAT (14)
            `sum(env['${model}'].sudo().search(${"domain_seluruh_keberangkatan"}).mapped('x_studio_extra_departures_flight_number.x_studio_cargo'))`,
            // SELURUH BAGASI DATANG ( 15)
            `sum(env['${model}'].sudo().search(${"domain_seluruh_kedatangan"}).mapped('x_studio_extra_arrivals_flight_number.x_studio_baggage'))`,
            // SELRUH BAGASI BERANGKAT (16)
            `sum(env['${model}'].sudo().search(${"domain_seluruh_keberangkatan"}).mapped('x_studio_extra_departures_flight_number.x_studio_baggage'))`,
            ...dinamic_execute_calculate.query_string,
          ],
        },
      });
  
      if (result.error) {
        return {
          periode_posko: array_periode_posko,
          currentPeriode: isInPeriod,
          statistic: {
            today_landed: 0,
            today_takeoff: 0,
            today_seat_available: [],
            total_penumpang_datang: 0,
            total_penumpang_berangkat: 0,
            total_kargo_datang: 0,
            total_kargo_berangkat: 0,
            total_bagasi_datang: 0,
            total_bagasi_berangkat:0,
            seluruh_penumpang_datang: 0,
            seluruh_penumpang_berangkat: 0,
            seluruh_pesawat_datang: 0,
            seluruh_pesawat_berangkat: 0,
            seluruh_cargo_datang: 0,
            seluruh_cargo_berangkat: 0,
            seluruh_bagasi_datang: 0,
            seluruh_bagasi_berangkat: 0,
            chart_pesawat_datang_berangkat: [],
          },
        }
      }
  
      const build_chart = () => {
        let start_index_data = 17;
        const chart: any = [];
  
        array_periode_posko.forEach((item) => {
          chart.push({
            month: item.name,
            website: result[start_index_data],
            blog: result[start_index_data + 1],
            socialMedia: result[start_index_data + 2] || 0, // Default or calculated value
            conversion: result[start_index_data + 3] || 0, // Default or calculated value
          });
          start_index_data = start_index_data + 2;
        });
        return chart;
      };

      return {
        periode_posko: array_periode_posko,
        currentPeriode: isInPeriod,
        statistic: {
          today_landed: result[0],
          today_takeoff: result[1],
          today_seat_available: result[2]?.records ? result[2].records : [],
          total_penumpang_datang: result[3],
          total_penumpang_berangkat: result[4],
          total_kargo_datang: result[5],
          total_kargo_berangkat: result[6],
          total_bagasi_datang: result[7],
          total_bagasi_berangkat: result[8],

          seluruh_penumpang_datang: result[9],
          seluruh_penumpang_berangkat: result[10],
          seluruh_pesawat_datang: result[11],
          seluruh_pesawat_berangkat: result[12],
          seluruh_cargo_datang: result[13],
          seluruh_cargo_berangkat: result[14],
          seluruh_bagasi_datang: result[15],
          seluruh_bagasi_berangkat: result[16],
          chart_pesawat_datang_berangkat: build_chart(),
        },
      }
  }catch(e){
    return {
      periode_posko: array_periode_posko,
      currentPeriode: isInPeriod,
      statistic: {
        today_landed: 0,
        today_takeoff: 0,
        today_seat_available: [],
        total_penumpang_datang: 0,
        total_penumpang_berangkat: 0,
        total_kargo_datang: 0,
        total_kargo_berangkat: 0,
        total_bagasi_datang: 0,
        total_bagasi_berangkat:0,
        seluruh_penumpang_datang: 0,
        seluruh_penumpang_berangkat: 0,
        seluruh_pesawat_datang: 0,
        seluruh_pesawat_berangkat: 0,
        seluruh_cargo_datang: 0,
        seluruh_cargo_berangkat: 0,
        seluruh_bagasi_datang: 0,
        seluruh_bagasi_berangkat: 0,
        chart_pesawat_datang_berangkat: [],
      },
    }
  }

}



export const action = async ({ request, params }: ActionFunctionArgs) => {
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  return new Response(
    JSON.stringify({

    }),
    { status: 200, headers: headers_res }
  );

}





export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { year, periode } = params;
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");

  const array_periode_posko: PeriodePosko[] = getPeriodePoskoAngleb(year ?? new Date().getFullYear());
  const isInPeriod = array_periode_posko.find((item) => item.name === periode);
  if (!isInPeriod) {
    return new Response(
      JSON.stringify({
        errors: {
          general: "periode posko telah berakhir.",
        },
      }),
      { status: 404, headers: headers_res }
    );
  }

  /*
  try {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
      queryKey: ['data-posko-angleb', year, periode],
      queryFn: () => getDataPosko(array_periode_posko, isInPeriod),
    })
    return new Response(
      JSON.stringify({ dehydratedState: dehydrate(queryClient) }),
      { status: 200, headers: headers_res }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        errors: {
          general: "Gagal login. Silakan cek email dan password Anda.",
        },
      }),
      {status: 400, headers: headers_res}
    );
  }
    */

  try {
    const data = await getDataPosko(array_periode_posko, isInPeriod)
    return new Response(
      JSON.stringify(data),
      { status: 200, headers: headers_res }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({
        errors: {
          general: "Gagal login. Silakan cek email dan password Anda.",
        },
      }),
      {status: 400, headers: headers_res}
    );
  }
};




/*
export default function Angleb(){
  const { dehydratedState } = useLoaderData<typeof loader>()
  return (
    <HydrationBoundary state={dehydratedState}>
      <ComponentAngleb/>
    </HydrationBoundary>
  )
}
  */





export default function ComponentAngleb() {
  const data = useLoaderData<typeof loader>()
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const { year, periode } = useParams();


  /*const { data } = useQuery<any>({ 
    queryKey: ['data-posko-angleb', year, periode], 
    queryFn: ()=>{} 
  })*/



  function getPreviousItem(
    data: Array<{ date: string; name: string }>,
    targetDate: string
  ) {
    const targetIndex = data.findIndex((item) => item.date === targetDate);
    if (targetIndex > 0) {
      // pastikan bukan index pertama
      return data[targetIndex - 1];
    }
    return null;
  }

  function getNextItem(
    data: Array<{ date: string; name: string }>,
    targetDate: string
  ) {
    const targetIndex = data.findIndex((item) => item.date === targetDate);
    if (targetIndex !== -1 && targetIndex < data.length - 1) {
      return data[targetIndex + 1];
    }
    return null;
  }

  const renderPrevPage = (
    array_periode: any[],
    currentPeriode: PeriodePosko
  ) => {
    const target = getPreviousItem(array_periode, currentPeriode.date);
    if (!target) {
      return <div className="w-12"></div>;
    }
    const year = new Date(target.date).getFullYear();
    return (
      <button
        className="cursor-pointer flex flex-col"
        onClick={() => navigate(`/posko/angleb/${year}/${target.name}`)}
      >
        <div className=" flex flex-row ">
          <ArrowLeft className="w-6 h-6 mr-4" />
          <span> sebelumnnya</span>
        </div>
        <span>{target.name}</span>
      </button>
    );
  };

  const renderNextPage = (
    array_periode: any[],
    currentPeriode: PeriodePosko
  ) => {
    const target = getNextItem(array_periode, currentPeriode.date);
    if (!target) {
      return <div className="w-12"></div>;
    }
    const year = new Date(target.date).getFullYear();
    return (
      <button
        className="cursor-pointer flex flex-col"
        onClick={() => navigate(`/posko/angleb/${year}/${target.name}`)}
      >
        <div className=" flex flex-row ">
          <span> berikutnya</span>
          <ArrowRight className="w-6 h-6 ml-4" />
        </div>
        <span>{target.name}</span>
      </button>
    );
  };



  useEffect(() => {
    const interval = setInterval(() => {
      fetcher.load('');
    }, 30000);
    return () => clearInterval(interval);
  }, [fetcher]);



  return (
    <Fragment>
      <section className="relative">
        {/* Background image */}
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
          <div className=" pt-40 md:pt-24 flex flex-row">
            <div
              className="max-w-6xl pt-12 pb-6 flex justify-between items-center w-full"
              data-aos="fade-down"
            >
              <div className="text-left">
                {renderPrevPage(data?.periode_posko, data?.currentPeriode)}
              </div>
              <div className="text-center flex-col hidden lg:flex">
                <div
                  className={clsx(
                    "text-lg font-bold",
                    periode == data?.currentPeriode?.name
                      ? "text-yellow-400"
                      : ""
                  )}
                >
                  PERIODE POSKO {data?.currentPeriode?.name}{" "}
                </div>
                <div className=" text-lg font-bold">
                  {data?.currentPeriode?.date}{" "}
                </div>
              </div>
              <div className="text-center flex-col flex lg:hidden">
                <div
                  className={clsx(
                    "text-lg font-bold",
                    periode == data?.currentPeriode?.name
                      ? "text-yellow-400"
                      : ""
                  )}
                >
                  {data?.currentPeriode?.name}{" "}
                </div>
              </div>
              <div className="text-right">
                {renderNextPage(data?.periode_posko, data?.currentPeriode)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className=" max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            className=" dark:border-gray-600"
            title="PASSENGER - ARRIVALS"
            value={
              data?.statistic?.total_penumpang_datang?.toLocaleString(
                "id-ID"
              ) || 0
            }
            trend={
              data?.statistic?.seluruh_penumpang_datang?.toLocaleString(
                "id-ID"
              ) || 0
            }
            trendValue={"TODAY"}
            scoreValue={256}
            icon={() => (
              <SmilePlus className="w-8 h-8  text-yellow-500 ml-4 mt-4" />
            )}
          />
          <StatCard
            title="PASSENGER - DEPARTURES"
            value={
              data?.statistic?.total_penumpang_berangkat?.toLocaleString(
                "id-ID"
              ) || 0
            }
            trend={
              data?.statistic?.seluruh_penumpang_berangkat?.toLocaleString(
                "id-ID"
              ) || 0
            }
            trendValue={"TODAY"}
            scoreValue={343}
            className=" dark:border-gray-600"
            icon={() => (
              <HeartHandshake className="w-8 h-8   text-pink-500 ml-4 mt-4" />
            )}
          />

          <StatCard
            className=" dark:border-gray-600"
            title="AIRCRAFT - ARRIVALS"
            value={data?.statistic?.today_landed?.toLocaleString("id-ID") || 0}
            trend={
              data?.statistic?.seluruh_pesawat_datang?.toLocaleString(
                "id-ID"
              ) || 0
            }
            trendValue={"TODAY"}
            scoreValue={256}
            icon={() => (
              <PlaneLanding className="w-8 h-8   text-teal-500 ml-4 mt-4" />
            )}
          />
          <StatCard
            title="AIRCRAFT - DEPARTURES"
            value={data?.statistic?.today_takeoff?.toLocaleString("id-ID") || 0}
            trend={
              data?.statistic?.seluruh_pesawat_berangkat?.toLocaleString(
                "id-ID"
              ) || 0
            }
            trendValue={"TODAY"}
            scoreValue={343}
            className=" dark:border-gray-600"
            icon={() => (
              <PlaneTakeoff className="w-8 h-8   text-indigo-500 ml-4 mt-4" />
            )}
          />
        </div>
      </section>

      <section className=" max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="CARGO - ARRIVALS"
            value={
              data?.statistic?.total_kargo_datang?.toLocaleString("id-ID") || 0
            }
            trend={
              data?.statistic?.seluruh_cargo_datang?.toLocaleString("id-ID") ||
              0
            }
            trendValue={"TODAY"}
            scoreValue={343}
            className=" dark:border-gray-600"
            icon={() => (
              <GalleryVerticalEnd className="w-8 h-8   text-emerald-500 ml-4 mt-4" />
            )}
          />

          <StatCard
            title="CARGO - DEPARTURES"
            value={
              data?.statistic?.total_kargo_berangkat?.toLocaleString("id-ID") ||
              0
            }
            trend={
              data?.statistic?.seluruh_cargo_berangkat?.toLocaleString(
                "id-ID"
              ) || 0
            }
            trendValue={"TODAY"}
            scoreValue={343}
            className=" dark:border-gray-600"
            icon={() => (
              <GalleryHorizontalEnd className="w-8 h-8   text-lime-500 ml-4 mt-4" />
            )}
          />

          <StatCard
            title="BAGGAGE - ARRIVALS"
            value={
              data?.statistic?.total_bagasi_datang?.toLocaleString("id-ID") || 0
            }
            trend={
              data?.statistic?.seluruh_bagasi_datang?.toLocaleString("id-ID") ||
              0
            }
            trendValue={"TODAY"}
            scoreValue={343}
            className=" dark:border-gray-600"
            icon={() => (
              <Luggage className=" w-8 h-8   text-cyan-500 ml-4 mt-4" />
            )}
          />
          <StatCard
            title="BAGGAGE - DEPARTURES"
            value={
              data?.statistic?.total_bagasi_berangkat?.toLocaleString(
                "id-ID"
              ) || 0
            }
            trend={
              data?.statistic?.seluruh_bagasi_berangkat?.toLocaleString(
                "id-ID"
              ) || 0
            }
            trendValue={"TODAY"}
            scoreValue={343}
            className=" dark:border-gray-600"
            icon={() => (
              <BriefcaseConveyorBelt className="w-8 h-8   text-sky-500 ml-4 mt-4" />
            )}
          />
        </div>
      </section>

      <section className=" max-w-6xl mx-auto px-2 sm:px-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-3 bg-card rounded-lg border  dark:border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold p-4">PASSENGER MOVEMENT</h2>
              <div className="bg-amber-500 text-white px-3 py-1 rounded-md text-sm font-medium m-4">
                Actions
              </div>
            </div>
            <TrafficChart
              data={(data?.statistic?.chart_pesawat_datang_berangkat || []).map(
                (item : any) => ({
                  ...item,
                  socialMedia: 0, // Add missing properties with default values
                  conversion: 0,
                })
              )}
            />
          </div>
          {/**<div className="bg-card rounded-lg border p-4 dark:border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">SEAT AVAILABLE</h2>
              <button className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <GaugeChart value={75} color="var(--color-amber-500)" />
              <div className="w-full mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium">32%</span>
                  <span className="text-sm text-muted-foreground">
                    Spendings Target
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: "32%" }}
                  />
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      <section className=" max-w-6xl mx-auto  px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg border p-4 dark:border-gray-600">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              SCHEDULED
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold">0</p>
              <span className="text-green-500 text-sm">+0%</span>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 dark:border-gray-600">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              LANDING
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold">0</p>
              <span className="text-green-500 text-sm">+0%</span>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 dark:border-gray-600">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              CANCEL
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold">0</p>
              <span className="text-green-500 text-sm">+0%</span>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 dark:border-gray-600">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              TAKEOFF
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-2xl font-bold">0</p>
              <span className="text-green-500 text-sm">+0%</span>
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}
