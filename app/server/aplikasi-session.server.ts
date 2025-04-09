/* eslint-disable no-unreachable */
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { getRequiredServerEnvVar } from '~/utils/misc';



export const authStorage = createCookieSessionStorage({
  cookie: {
    name: 'aplikasi',
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [getRequiredServerEnvVar('APLIKASI_SESSION_SECRET')],
    secure: process.env.NODE_ENV === "production",
  },
});



async function getAuthSession(request: Request) {
  const session = await authStorage.getSession(request.headers.get('Cookie'));
  return {
    getUserId: () => {
      const tokenValue = session.get('userIdInternal');
      return tokenValue;
    },
    requiredLogin: () => {
     // const redirectTo = _redirectTo ? new URL(request.url).pathname
     // const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
      const authTokenId = session.get('userIdInternal');
      if(!authTokenId){
        throw redirect(`/auth/login/internal`);
      }
      return authTokenId;
    },
    requireUser : ()=>{},
    setUserId: (userId: any) => session.set('userIdInternal', userId),
    commit: () => authStorage.commitSession(session),
  };
}
export { getAuthSession };

