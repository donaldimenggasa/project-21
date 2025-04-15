import { type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getPeriodePoskoAngleb } from '~/utils/periode-posko'
import { DateTime } from 'luxon'


export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  
  
  const localTime = DateTime.local();
const convertedToUtc = localTime.toUTC();

// Mendapatkan start dan end of day untuk waktu lokal
const localStartOfDay = localTime.startOf('day');
const localEndOfDay = localTime.endOf('day');

// Mendapatkan start dan end of day untuk UTC
const utcStartOfDay = convertedToUtc.startOf('day');
const utcEndOfDay = convertedToUtc.endOf('day');

console.log({
  localTime: {
    full: localTime.toString(),                              // contoh: "2024-02-20T22:30:00.000+07:00"
    zone: localTime.zoneName,                               // contoh: "Asia/Jakarta"
    offset: localTime.offset,                               // contoh: 420 (7 jam * 60 menit)
    jamLokal: localTime.toFormat('HH:mm:ss'),              // contoh: "22:30:00"
    tanggalJamLokal: localTime.toFormat('dd/MM/yyyy HH:mm:ss'),  // contoh: "20/02/2024 22:30:00"
    jamLengkap: localTime.toFormat('HH:mm:ss ZZZZ'),       // contoh: "22:30:00 GMT+7"
    startOfDay: {
      full: localStartOfDay.toString(),                     // contoh: "2024-02-20T00:00:00.000+07:00"
      jamLokal: localStartOfDay.toFormat('HH:mm:ss'),      // contoh: "00:00:00"
      lengkap: localStartOfDay.toFormat('dd/MM/yyyy HH:mm:ss ZZZZ') // contoh: "20/02/2024 00:00:00 GMT+7"
    },
    endOfDay: {
      full: localEndOfDay.toString(),                       // contoh: "2024-02-20T23:59:59.999+07:00"
      jamLokal: localEndOfDay.toFormat('HH:mm:ss.SSS'),    // contoh: "23:59:59.999"
      lengkap: localEndOfDay.toFormat('dd/MM/yyyy HH:mm:ss.SSS ZZZZ') // contoh: "20/02/2024 23:59:59.999 GMT+7"
    }
  },
  convertedToUtc: {
    full: convertedToUtc.toString(),                        // contoh: "2024-02-20T15:30:00.000Z"
    zone: convertedToUtc.zoneName,                         // "UTC"
    offset: convertedToUtc.offset,                         // 0
    jamUtc: convertedToUtc.toFormat('HH:mm:ss'),          // contoh: "15:30:00"
    tanggalJamUtc: convertedToUtc.toFormat('dd/MM/yyyy HH:mm:ss'),  // contoh: "20/02/2024 15:30:00"
    jamLengkap: convertedToUtc.toFormat('HH:mm:ss ZZZZ'),  // contoh: "15:30:00 GMT+0"
    startOfDay: {
      full: utcStartOfDay.toString(),                      // contoh: "2024-02-20T00:00:00.000Z"
      jamUtc: utcStartOfDay.toFormat('HH:mm:ss'),         // contoh: "00:00:00"
      lengkap: utcStartOfDay.toFormat('dd/MM/yyyy HH:mm:ss ZZZZ') // contoh: "20/02/2024 00:00:00 GMT+0"
    },
    endOfDay: {
      full: utcEndOfDay.toString(),                        // contoh: "2024-02-20T23:59:59.999Z"
      jamUtc: utcEndOfDay.toFormat('HH:mm:ss.SSS'),       // contoh: "23:59:59.999"
      lengkap: utcEndOfDay.toFormat('dd/MM/yyyy HH:mm:ss.SSS ZZZZ') // contoh: "20/02/2024 23:59:59.999 GMT+0"
    }
  }
});


  const year = new Date().getFullYear();
  const listDate = getPeriodePoskoAngleb(year);
  const currentDate = DateTime.local();
  
  console.log('PUKI=================================================================')
  
  console.log(currentDate);
  console.log(listDate);
  
  
  
  const currentDateFormat = currentDate.toFormat("yyyy-MM-dd");
  const isInPeriod = listDate.find((item) => item.date === currentDateFormat );
  if(isInPeriod){
    console.log(year);
    return redirect(`/posko/angleb/${year}/${isInPeriod.name}`);
  }else{
    return redirect(`/`);
  }
}
