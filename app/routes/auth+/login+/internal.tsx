import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node";
import { getOtpSession } from "~/server/otp-session-server";
import { getAuthSession } from "~/server/aplikasi-session.server";
import { Form, useActionData, useNavigation, useLoaderData, useFetcher } from "@remix-run/react";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import axios from "axios";
import { z } from "zod";
import InputOtp from "~/components/form/input-otp";
import { Fragment, useCallback, useEffect, useState, useRef } from "react";

const countries = [
  { name: "Indonesia", code: "ID", dialCode: "62", flag: "🇮🇩" },
  { name: "Malaysia", code: "MY", dialCode: "60", flag: "🇲🇾" },
  { name: "Singapore", code: "SG", dialCode: "65", flag: "🇸🇬" },
  { name: "United States", code: "US", dialCode: "1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dialCode: "44", flag: "🇬🇧" },
  { name: "Australia", code: "AU", dialCode: "61", flag: "🇦🇺" }
];

function phone(schema: z.ZodString) {
  return schema
    .refine(isValidPhoneNumber, "Please specify a valid phone number (include the international prefix).")
    .transform((value) => parsePhoneNumber(value).number.toString());
}

const LoginSchema = z.object({
  phoneNumber: phone(z.string()),
});

type ActionData = {
  showOtp: boolean;
  errors?: {
    phoneNumber?: string;
    general?: string;
  };
};

function generate6DigitCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const generateTextToken = (targetUsers: any, code: any) => {
  const message = `
Yth. *${targetUsers.name}*,

kode *OTP* login (internal) anda adalah
*${code}*

kode berlaku selama 5 menit,
Terima kasih.
_deoairport - sideo v.1.5.3_`;
  return message;
};

export const action = async ({ request, context }: ActionFunctionArgs & {
  context: { whatsappSocket: { sendMessage: (jid: string, message: { text: string }) => Promise<void>;};};
}) => {

  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  const { whatsappSocket } = context;
  const formData = await request.formData();
  const phoneNumber = formData.get("phoneNumber");
  const __action = formData.get("__action");

  if (__action === 'requestOtp') {
    try {
      const validatedData = LoginSchema.parse({ phoneNumber });
      if (typeof phoneNumber !== "string") {
        throw new Error("Invalid phone number format");
      }
      const _phoneNumber = parsePhoneNumber(phoneNumber);

      if (!whatsappSocket) {
        return new Response(
          JSON.stringify({
            message: "WhatsApp API Gateway Offline",
          }),
          { headers: headers_res, status: 400 }
        );
      }

      const model = "hr.employee";
      const postRequest = {
        params: {
          __domain: [
            "&",
            ["mobile_phone", "=", `0${_phoneNumber.nationalNumber}`],
            ["user_id.active", "=", true],
          ],
          __limit: 1,
          __specification: {
            name: {},
            department_id: {
              fields: {
                name: {},
              },
            },
            user_id: {
              fields: {
                login: {},
                lang: {},
                tz: {},
                active: {},
              },
            },
          },
        },
        queries: [
          `env['${model}'].sudo().web_search_read(
            domain=${"__domain"},
            limit=${"__limit"},
            specification=${"__specification"}
          )`,
        ],
      };
      const { data: { result } } = await axios({
        url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/internal-action`,
        method: "POST",
        data: postRequest,
      });


      if (result[0].error) {
        throw new Error(result.error?.message || "Terjadi kesalahan");
      }


      if (result[0].length === 0 || result[0] === null) {
        throw new Error("Nomor telepon tidak terdaftar");
      }


      const currentUser = result[0].records[0];
      const code = generate6DigitCode();
      let nomorTanpaPlus = phoneNumber.replace(/^\+/, "");
      const jid = `${nomorTanpaPlus}@s.whatsapp.net`;
      const message = generateTextToken(currentUser, code);
      await whatsappSocket.sendMessage(jid, { text: message });

      const otpSession = await getOtpSession(request);
      const token = code;
      let timer = new Date();
      otpSession.setToken({ token, timer });
      headers_res.append("Set-Cookie", await otpSession.commit());

      return new Response(JSON.stringify({ success: true }), {
        headers: headers_res,
        status: 200,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.reduce((acc: any, issue) => {
          const path = issue.path[0] as keyof ActionData["errors"];
          acc[path] = issue.message;
          return acc;
        }, {} as ActionData["errors"]);

        return new Response(JSON.stringify({ errors }), {
          status: 400,
          headers: headers_res,
        });
      }

      return new Response(
        JSON.stringify({
          errors: {
            general: error instanceof Error ? error.message : "Terjadi kesalahan saat login",
          },
        }),
        {
          status: 400,
          headers: headers_res,
        }
      );
    }
  }

  if (__action === 'verifikasiOtp') {
    const otpClient = formData.get("otp");
    const otpSession = await getOtpSession(request);
    const { token, timer } = otpSession.getToken();

    if (otpClient !== token) {
      return new Response(
        JSON.stringify({
          errors: {
            general: "Kode OTP tidak valid"
          }
        }),
        {
          status: 400,
          headers: headers_res,
        }
      );
    }

    const headers_redirect = new Headers();
    const authSession = await getAuthSession(request);
    authSession.setUserId('1');
    headers_redirect.append("Set-Cookie", await authSession.commit());
    headers_redirect.append("Set-Cookie", await otpSession.destroySession());
    return redirect("/aplikasi/internal", {
      status: 301,
      headers: headers_redirect,
    });
  }

  return new Response(
    JSON.stringify({
      errors: {
        general: "No Action Handler found",
      },
    }),
    {
      status: 400,
      headers: headers_res,
    }
  );
};






export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");

  const otpSession = await getOtpSession(request);
  const { token, timer } = otpSession.getToken();
  if (!token || !timer) {
    return new Response(
      JSON.stringify({
        showOtp: false,
      }),
      {
        headers: headers_res,
        status: 200,
      }
    );
  }

  const waktuSekarang = new Date();
  const waktuMulai = new Date(timer);
  let selisihWaktu = waktuSekarang.getTime() - waktuMulai.getTime();

  if (selisihWaktu >= 300000) {
    headers_res.append("Set-Cookie", await otpSession.destroySession());
    return redirect("/auth/login/internal", {
      status: 301,
      headers: { "Set-Cookie": await otpSession.destroySession() },
    });
  } else {
    return new Response(
      JSON.stringify({
        showOtp: true,
        waktuMulai: waktuMulai,
      }),
      {
        headers: headers_res,
        status: 200,
      }
    );
  }
};

export default function LoginInternal() {
  const actionData = useActionData<ActionData>();
  const { showOtp, waktuMulai } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [timeLeft, setTimeLeft] = useState(300);
  const isSubmitting = navigation.state === "submitting";
  const [otp, setOtp] = useState("");
  const fetcher = useFetcher<{ errors?: ActionData["errors"] }>();
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);



  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };



  useEffect(() => {
    if (waktuMulai) {
      const waktuSekarang = new Date();
      const waktuMulaiDate = new Date(waktuMulai);
      const selisihWaktu = waktuSekarang.getTime() - waktuMulaiDate.getTime();
      const sisaWaktu = Math.max(300 - Math.floor(selisihWaktu / 1000), 0);
      setTimeLeft(sisaWaktu);
    }
  }, [waktuMulai]);






  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtp && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      fetcher.load("");
    }
    return () => clearInterval(timer);
  }, [showOtp, timeLeft]);




  const submitVerifikasiOtp = useCallback((otp: string) => {
    const data = new FormData();
    data.append('otp', otp);
    data.append('__action', 'verifikasiOtp');
    fetcher.submit(data, {
      method: 'POST'
    });
    setOtp(() => '');
  }, []);




  useEffect(() => {
    if (otp.length >= 6) {
      submitVerifikasiOtp(otp);
    }
  }, [otp, submitVerifikasiOtp]);





  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);




  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country);
    setShowDropdown(false);
  };



  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhoneNumber(value);
  };



  const getFullPhoneNumber = () => {
    return `+${selectedCountry.dialCode}${phoneNumber}`;
  };




  return (
    <div className="flex flex-col justify-center">
      <div className="w-lg">
        <h2 className="-mt-32 text-center text-3xl font-bold text-white">
          DEO AIRPORT
        </h2>
        <h2 className="text-center text-3xl font-bold text-white">
          LOGIN INTERNAL
        </h2>
        {!showOtp && (
          <p className="mt-2 text-center text-sm text-white dark:text-white">
            Masukkan nomor WhatsApp Anda untuk melanjutkan
          </p>
        )}
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {actionData?.errors?.general && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    {actionData.errors.general}
                  </h3>
                </div>
              </div>
            </div>
          )}

          {showOtp ? (
            <div className="space-y-6">
              <div>
                <div className="mt-1">
                  <InputOtp
                    response={fetcher.data}
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    Waktu tersisa: {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <Form method="post" className="space-y-6">
              <div className="flex items-center">
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    className="country-selector"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <span className="mr-2">{selectedCountry.flag}</span>
                    +{selectedCountry.dialCode}
                    <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                    </svg>
                  </button>

                  {showDropdown && (
                    <div className="country-dropdown">
                      <ul className="country-list">
                        {countries.map((country) => (
                          <li key={country.code}>
                            <button
                              type="button"
                              className="country-option"
                              onClick={() => handleCountrySelect(country)}
                            >
                              <span className="inline-flex items-center">
                                <span className="mr-2">{country.flag}</span>
                                {country.name} (+{country.dialCode})
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="relative w-full">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="phone-input-field"
                    placeholder="812 345 6789"
                    required
                  />
                  <input
                    type="hidden"
                    name="phoneNumber"
                    value={getFullPhoneNumber()}
                  />
                </div>
              </div>

              {actionData?.errors?.phoneNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {actionData.errors.phoneNumber}
                </p>
              )}

              {actionData?.errors?.general && (
                <p className="text-sm text-red-500 mt-1">
                  {actionData.errors.general}
                </p>
              )}

              <button
                type="submit"
                name="__action"
                value="requestOtp"
                disabled={isSubmitting || phoneNumber.length < 9}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Request OPT"}
              </button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}