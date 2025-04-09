import { createCookieSessionStorage } from '@remix-run/node';
import { getRequiredServerEnvVar } from '~/utils/misc';

const themeStorage = createCookieSessionStorage({
  cookie: {
    name: 'temp_otp_deo',
    secure: process.env.NODE_ENV === "production",
    secrets: [getRequiredServerEnvVar('APLIKASI_SESSION_SECRET')],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
  },
});

async function getOtpSession(request: Request) {
  const session = await themeStorage.getSession(request.headers.get('Cookie'));
  return {
    getToken: () => {
      const token = session.get('otpToken');
      const timer = session.get('otpTimer');
      return {token, timer };
    },
    setToken: ({ token , timer }: any) => {
      session.set('otpToken', token);
      session.set('otpTimer', timer)
    },
    commit: () => themeStorage.commitSession(session),
    destroySession : () => themeStorage.destroySession(session)
  };
}

export { getOtpSession };