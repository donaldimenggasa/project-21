import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { getOtpSession } from "~/server/otp-session-server";
import { getAuthSession } from "~/server/aplikasi-session.server"
import { v4 as uuidv4 } from "uuid";

import {
  Form,
  useActionData,
  useNavigation,
  Link,
  useLoaderData,
  useFetcher,
} from "@remix-run/react";
import {
  isValidPhoneNumber,
  parsePhoneNumber,
  PhoneNumber,
} from "libphonenumber-js";
import axios from "axios";
import { z } from "zod";
import InputOtp from "~/components/form/input-otp";
import { useCallback, useEffect, useState } from "react";






function phone(schema: z.ZodString) {
  return schema
    .refine(
      isValidPhoneNumber,
      "Please specify a valid phone number (include the international prefix)."
    )
    .transform((value) => parsePhoneNumber(value).number.toString());
}

// Schema validasi
const LoginSchema = z.object({
  phoneNumber: phone(z.string()),
  // password: z.string().min(6, "Password minimal 6 karakter"),
});

// Type untuk error
type ActionData = {
  showOtp: boolean;
  errors?: {
    phoneNumber?: string;
    password?: string;
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



export const action = async ({request, context }: ActionFunctionArgs & {
  context: {
    whatsappSocket: {
      sendMessage: (jid: string, message: { text: string }) => Promise<void>;
    };
  };
}) => {


  const headers_res = new Headers();
  headers_res.set("Content-Type", "application/json");
  const { whatsappSocket } = context;
  const formData = await request.formData();
  const phoneNumber = formData.get("phoneNumber");
  const __action = formData.get("__action");

  if(__action === 'requestOtp'){
    try {
      const validatedData = LoginSchema.parse({ phoneNumber });
      if (typeof phoneNumber !== "string") {
        throw new Error("Invalid phone number format");
      }
      const _phoneNumber = parsePhoneNumber(phoneNumber);
      console.log(_phoneNumber.nationalNumber);

      if (!whatsappSocket) {
        return new Response(
          JSON.stringify({
            message: "whatsApp Api Gateway Offline",
          }),
          { headers: headers_res, status: 400 }
        );
      }

      // Contoh penggunaan axios untuk custom login odoo
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
  
      const {
        data: { result },
      } = await axios({
        url: `${process.env.ODOO_PROTOCOL}//${process.env.ODOO_HOST}:${process.env.ODOO_PORT}/internal-action`,
        method: "POST",
        data: postRequest,
      });

      if (result.error) {
        console.log(result.error);
        throw new Error(result.error?.message || "terjadi kesalahan");
      } else {
        if (result.length === 0) {
          console.log("response nol");
          throw new Error("salah format");
        } else {
          console.log(result[0]);
          if (result[0] === null) throw new Error("SALAH FORMAT Dua");
        }
      }

      let respons = result[0];
      // sekarang respons adalah { length: 0, records: [] }
      if (respons.length === 0) {
        throw new Error("user tidak ditemukan");
      }

      const currentUser = respons.records[0];
      console.log(currentUser);

      const code = generate6DigitCode();
      let nomorTanpaPlus = phoneNumber.replace(/^\+/, "");
      const jid = `${nomorTanpaPlus}@s.whatsapp.net`;
      const message = generateTextToken(currentUser, code);

      //await whatsappSocket.sendMessage(jid, { text: message });

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
          headers : headers_res,
        });
      }

      // Error dari API
      return new Response(
        JSON.stringify({
          errors: {
            general: "Gagal login. Silakan cek email dan password Anda.",
          },
        }),
        {
          status: 400,
          headers : headers_res,
        }
      );
    }
  }


  console.log(__action)
  if(__action == 'verifikasiOtp'){
    const otpClient = formData.get("otp");
    const otpSession = await getOtpSession(request);
    const { token, timer } = otpSession.getToken();

    console.log('*******************')
    console.log(otpClient)
    console.log(token);

    console.log('ANJING CUKIEEE')

    if(otpClient !== token ){
      return new Response(
        JSON.stringify({ token, timer }),
        {
          status: 400,
          headers : headers_res,
        }
      );
    }

    console.log('*******************')
    console.log(token);



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
        general: "no Action Handler found .",
      },
    }),
    {
      status: 400,
      headers : headers_res,
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

  console.log("sdasdasd ======================");
  console.log(token);

  const waktuSekarang = new Date();
  const waktuMulai = new Date(timer);
  let selisihWaktu = waktuSekarang.getTime() - waktuMulai.getTime();
  //let selisihWaktu = waktuSekarang - waktuMulai; // Selisih dalam milidetik

  console.log(selisihWaktu);

  if (selisihWaktu >= 300000) {
    console.log("Timer sudah kadaluarsa.");
    headers_res.append("Set-Cookie", await otpSession.destroySession());
    return redirect("/auth/login/internal", {
      status: 301,
      headers: { "Set-Cookie": await otpSession.destroySession() },
    });
  } else {
    console.log("Timer masih berjalan.");
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
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const isSubmitting = navigation.state === "submitting";
  const [otp, setOtp] = useState("");
  const fetcher = useFetcher();

  console.log(fetcher)



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
      const sisaWaktu = Math.max(300 - Math.floor(selisihWaktu / 1000), 0); // Hitung sisa waktu dalam detik
      setTimeLeft(sisaWaktu); // Set timeLeft sesuai sisa waktu
    }
  }, [waktuMulai]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOtp && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Handle ketika timer kadaluarsa
      //console.log("OTP sudah kadaluarsa.");
      fetcher.load("");
    }
    return () => clearInterval(timer);
  }, [showOtp, timeLeft]);




  const submitVerifikasiOtp = useCallback((otp : string)=>{
    console.log('DETECK LOP 1');
    const data = new FormData();
    data.append('otp',otp);
    data.append('__action', 'verifikasiOtp');
    fetcher.submit(data, {
      method : 'POST'
    });
    setOtp(()=> '');
  },[])


  useEffect(()=>{
    console.log('DETECK LOP 2')
    if(otp.length >= 6 ){
      submitVerifikasiOtp(otp)
    }
  },[otp,submitVerifikasiOtp])













  return (
    <>
      <div className="max-w-sm mx-auto w-full px-4 py-8">
        <h1 className="text-3xl text-gray-800 dark:text-gray-100 font-bold mb-6">
          Welcome back!
        </h1>

        {actionData?.errors?.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {actionData.errors.general}
          </div>
        )}

        {showOtp ? (
          <>
            <InputOtp value={otp} onChange={setOtp} maxLength={6}/>
            <p className="text-lg font-semibold text-indigo-600">
              {formatTime(timeLeft)}
            </p>

          </>
        ) : (
          <Form method="post">
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  className={`form-input w-full ${
                    actionData?.errors?.phoneNumber ? "border-red-500" : ""
                  }`}
                  required
                />
                {actionData?.errors?.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {actionData.errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  className={`form-input w-full ${
                    actionData?.errors?.password ? "border-red-500" : ""
                  }`}
                  type="password"
                  autoComplete="current-password"
                  required
                />
                {actionData?.errors?.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {actionData.errors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="mr-1">
                <Link
                  className="text-sm underline hover:no-underline"
                  to="/reset-password"
                >
                  Forgot Password?
                </Link>
              </div>
              <button
                type="submit"
                name={"__action"}
                value="requestOtp"
                disabled={isSubmitting}
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white ml-3"
              >
                {isSubmitting ? "Logging in..." : "Sign In"}
              </button>
            </div>
          </Form>
        )}

        {/* Footer section tetap sama */}
      </div>
    </>
  );
}

