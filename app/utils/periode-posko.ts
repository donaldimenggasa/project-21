import { DateTime } from "luxon";

const periode_angleb: { [key: string]: { start: DateTime; end: DateTime; event: DateTime } } = {
    2025: {
        start: DateTime.fromISO('2025-03-21'),
        end: DateTime.fromISO('2025-04-11'),
        event: DateTime.fromISO('2025-03-31')
    },
    2024: {
        start: DateTime.fromISO('2025-03-21'),
        end: DateTime.fromISO('2025-04-11'),
        event: DateTime.fromISO('2025-03-31')
    },
};

export function getPeriodePoskoAngleb(year: string | number) {
    if (!periode_angleb[year]) {
        return [];
    }
    
    const target = periode_angleb[year];
    const array_periode_posko = [];
    let currentDate = target.start.startOf("day");
    const eventDay = target.event.startOf("day");
    const endDate = target.end.startOf("day");
    
    while (currentDate < endDate) {
        const start = currentDate.startOf("day").toFormat("yyyy-MM-dd"); 
        // Menghitung selisih hari
        const diff = currentDate.diff(eventDay, "days").days;
        const name = diff < 0 ? `H${diff}` : `H+${diff}`;
        
        array_periode_posko.push({ 
            date : start, 
            name: Math.floor(diff) === 0 ? "H+0" : name // Jika tepat di hari H
        });
        
        // Pindah ke hari berikutnya
        currentDate = currentDate.plus({ days: 1 });
    }
    
    return array_periode_posko;
}


