"use client";

import React, { use, useState } from "react";
import {
  Search,
  Plane,
  Calendar as CalendarIcon,
  X,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface FlightSearchFormProps {
  onSearch?: (searchParams: any) => void;
}

const FlightSearchForm = ({ onSearch = () => {} }: FlightSearchFormProps) => {
  const [searchType, setSearchType] = useState("flight");
  const [flightNumber, setFlightNumber] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [airline, setAirline] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      searchType,
      flightNumber,
      origin,
      destination,
      airline,
      date,
    });
  };

  const handleClear = () => {
    setFlightNumber("");
    setOrigin("");
    setDestination("");
    setAirline("");
    setDate(new Date());
  };

  const airlines = [
    { value: "aa", label: "American Airlines" },
    { value: "ua", label: "United Airlines" },
    { value: "dl", label: "Delta Air Lines" },
    { value: "ba", label: "British Airways" },
    { value: "lh", label: "Lufthansa" },
  ];

  return (
    <Card className="w-sm max-w-2xl mx-auto bg-white/95 rounded-xl border-0 overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-primary text-primary-foreground p-4">
          <h3 className="text-lg font-medium flex items-center">
            <Plane className="mr-2 h-5 w-5" /> Find Your Flight
          </h3>
        </div>

        <div className="p-4">
          <Tabs
            defaultValue="flight"
            onValueChange={setSearchType}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="flight" className="text-xs sm:text-sm">
                Flight
              </TabsTrigger>
              <TabsTrigger value="route" className="text-xs sm:text-sm">
                Route
              </TabsTrigger>
              <TabsTrigger value="airline" className="text-xs sm:text-sm">
                Airline
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSearch} className="space-y-3">
              <TabsContent value="flight" className="space-y-3 pt-2">
                <div className="relative">
                  <Input
                    id="flightNumber"
                    placeholder="Flight number (e.g. AA1234)"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className="pl-10 h-10"
                  />
                  <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </TabsContent>

              <TabsContent value="route" className="space-y-3 pt-2">
                <div className="relative">
                  <Input
                    id="origin"
                    placeholder="From (e.g. LAX)"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="pl-10 h-10"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                <div className="relative">
                  <Input
                    id="destination"
                    placeholder="To (e.g. JFK)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10 h-10"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </TabsContent>

              <TabsContent value="airline" className="space-y-3 pt-2">
                <Select value={airline} onValueChange={setAirline}>
                  <SelectTrigger id="airline" className="h-10">
                    <SelectValue placeholder="Select an airline" />
                  </SelectTrigger>
                  <SelectContent>
                    {airlines.map((airline) => (
                      <SelectItem key={airline.value} value={airline.value}>
                        {airline.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TabsContent>

              <div className="pt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-10"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                      <div className="text-center mb-2">
                        <h3 className="text-sm font-medium">
                          {format(date || new Date(), "MMMM yyyy")}
                        </h3>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                          <div
                            key={i}
                            className="text-center text-xs text-muted-foreground"
                          >
                            {day}
                          </div>
                        ))}
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <Button
                              key={day}
                              variant="ghost"
                              className="h-7 w-7 p-0 text-xs font-normal aria-selected:bg-primary aria-selected:text-primary-foreground"
                              onClick={() => {
                                const newDate = new Date(date || new Date());
                                newDate.setDate(day);
                                setDate(newDate);
                              }}
                              aria-selected={date?.getDate() === day}
                            >
                              {day}
                            </Button>
                          ),
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  className="flex-1 h-10"
                  size="sm"
                >
                  <X className="mr-1 h-3 w-3" /> Clear
                </Button>
                <Button
                  type="submit"
                  className="flex-[2] h-10 bg-primary hover:bg-primary/90"
                  size="sm"
                >
                  <Search className="mr-1 h-3 w-3" /> Search
                </Button>
              </div>
            </form>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightSearchForm;
