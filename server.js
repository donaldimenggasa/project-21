/* eslint-disable no-undef */
import { createCookieSessionStorage } from "@remix-run/node";
import { v7 as uuidv7 } from 'uuid';
import { createRequestHandler } from "@remix-run/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import net from "net";
import { Job } from 'node-schedule';
import lodash from 'lodash';
import { listScheduledTask } from "./app/server/app.cron-job.server/index.js";
import { redis } from "./app/server/redis-db.server.js";
import jwt from 'jsonwebtoken';
import path from 'path';
import  { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import cors from 'cors';


const corsMiddlewareExternalAPI = cors({
  origin: "*", // Bisa diganti dengan origin tertentu, contoh: "https://example.com"
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-timestamp"],
  credentials: true
});



let whatsappSocket;
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'aplikasi',
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.APLIKASI_SESSION_SECRET],
    secure: process.env.NODE_ENV === "production" && process.env.MODE_YORI !== "LOCAL_PRODUCTION",
  },
});



const getSession = async(request) => {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}



//const dmmf = Prisma.dmmf;
const port = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
const ioServer = new Server(httpServer, {
  transports: ['websocket'],
});



function connectSocket() {
  const client_barrier = new net.Socket();


  function attemptConnectionBarrierGate() {
    client_barrier.connect(5000, '192.168.1.102', function () {
      console.log('Terhubung ke server socket');
    });
  }

  process.env.NODE_ENV === "production" ? attemptConnectionBarrierGate() : void 0;


  client_barrier.on('data', function (data) {
    console.log('Data diterima dari server socket: ' + data);
  });

  client_barrier.on('error', function (err) {
    console.error('Terjadi error pada socket: ' + err.message);
    if (err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH' || err.code === 'ECONNRESET') {
      process.env.NODE_ENV === "production" ? setTimeout(attemptConnectionBarrierGate, 5000) : void 0;
    }
  });


  client_barrier.on('close', function () {
    console.log('Koneksi socket tertutup');
    process.env.NODE_ENV === "production" ? setTimeout(attemptConnectionBarrierGate, 5000) : void 0;
  });

  process.on('SIGINT', function () {
    console.log('Aplikasi dihentikan, menutup koneksi socket...');
    client_barrier.destroy();
    process.exit();
  });


  process.on('SIGTERM', function () {
    console.log('Aplikasi menerima SIGTERM, menutup koneksi socket...');
    client_barrier.destroy();
    process.exit();
  });
  return client_barrier;
}

//FIX PORT BENTROK DI BARIER GATE KARENA TELAH JALAN MELALUI PRODUCTION YANG MENGGUNAKAN PORT 4001 BARRIER GATE - LOCAL_PRODUCTION JALAN DI PORT 4002
// LIHAT FILE PACKAGE JSON 
const client_barrier = process.env.NODE_ENV === "production" && process.env.MODE_YORI !== "LOCAL_PRODUCTION" && process.env.MODE_YORI !== "DOMAINESIA_PRODUCTION" ? connectSocket() : void 0;



/*
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("No token provided"));
  }
  jwt.verify(token, "SECRET_KEY", (err, decoded) => {
    if (err) {
      return next(new Error("Invalid token"));
    }
    socket.user = decoded;
    next();
  });
});
*/

ioServer.on("connection", (socket) => {
  console.log(socket.id, "connected");

  socket.on("something", (data) => {
    // log the data together with the socket.id who send it
    console.log(socket.id, data);
    // and emeit the event again with the message pong
    socket.emit("fids_arrivals_update", {
      audioUrl: '/file_example_MP3_5MG.mp3'
    });
  });

  //GENERATE KEY UNTUK APLIKASI INTERNAL & EXTERNAL
  socket.on("init-applikasi-internal", async (token) => {
    try {
      console.log('GENERATE VERIFIKASI TOKEN');
      if(!token){
        socket.emit("error", { message: "Invalid token" });
        return;
      }
      const decode_jwt = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
      const raw_session = await redis.get(decode_jwt.token);
      if (!raw_session) {
        socket.emit("error", { message: "Invalid token" });
        return;
      }
      const key = uuidv7();
      const update_session = JSON.parse(raw_session);
      update_session['hash_id'] = key;
      const new_update = JSON.stringify(update_session);
      await redis.set(decode_jwt.token, new_update, "EX", 25200);
      socket.emit("init-applikasi-internal-key", key);
    } catch (err) {
      console.error('Authentication error:', err);
      socket.emit("error", { message: "Authentication failed" });
    }
  });

  socket.emit("event", "connected!");
});




const createCronService = () => {
  let jobsSpecs = [];
  let running = false;

  return {
    add(tasks) {
      for (const taskExpression of Object.keys(tasks)) {
        const taskValue = tasks[taskExpression];
        let fn;
        let options;
        let taskName;
        if (lodash.isFunction(taskValue)) {
          // don't use task name if key is the rule
          taskName = null;
          fn = taskValue.bind(tasks);
          options = taskExpression;
        } else if (lodash.isFunction(taskValue.task)) {
          // set task name if key is not the rule
          taskName = taskExpression;
          fn = taskValue.task.bind(taskValue);
          options = taskValue.options;
        } else {
          throw new Error(
            `Could not schedule a cron job for "${taskExpression}": no function found.`
          );
        }
        console.log(`ADD NEW CRON JOBS - ${taskName}`);
        const paramsDefault = { ioServer: ioServer };
        const scheduledTriggerYori = (...args) => fn({ paramsDefault }, ...args);
        //const job = new Job(null, scheduledTriggerYori);
        const job = new Job(scheduledTriggerYori);
        jobsSpecs.push({ job, options, name: taskName });
        if (running) {
          job.schedule(options);
        }
      }
      return this;
    },

    remove(name) {
      if (!name) {
        throw new Error('You must provide a name to remove a cron job.');
      }
      jobsSpecs
        .filter(({ name: jobSpecName }) => jobSpecName === name)
        .forEach(({ job }) => job.cancel());

      jobsSpecs = jobsSpecs.filter(({ name: jobSpecName }) => jobSpecName !== name);
      return this;
    },
    start() {
      jobsSpecs.forEach(({ job, options }) => job.schedule(options));
      running = true;
      return this;
    },
    stop() {
      jobsSpecs.forEach(({ job }) => job.cancel());
      running = false;
      return this;
    },
    destroy() {
      this.stop();
      jobsSpecs = [];
      return this;
    },
    jobs: jobsSpecs,
  };
};




app.use(compression());
app.disable("x-powered-by");
app.use(express.static("build/client", { maxAge: "1h" }));
app.use(morgan("tiny"));




app.use('/external-integration-api', corsMiddlewareExternalAPI);
app.options('/external-integration-api/*', corsMiddlewareExternalAPI);



app.use(async(req, res, next) => {
  // 1. Jika path diawali dengan /assets, /javascript, atau /asset-build:
  if (req.path.startsWith('/assets_vjs') || req.path.startsWith('/javascript')) {
    return next();
  }
  // 2. Jika request adalah file statis (.js, .css, .png, .jpg, .jpeg, dll.)
  //    Gunakan path.extname untuk mengecek ekstensi file
  const ext = path.extname(req.path).toLowerCase();
  // Definisikan daftar ekstensi yang ingin Anda kecualikan
  const staticExt = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', 
    '.svg', '.ico', '.webp', '.woff', '.woff2', '.ttf'
  ];

  if (staticExt.includes(ext)) {
    return next();
  }

  const session_request = await sessionStorage.getSession(req.headers.cookie);
  const user_login = await session_request.get('user_login');
  if(user_login){
    try{
      const raw_session = await redis.get(user_login);
      if (raw_session) {
        res.current_user = JSON.parse(raw_session);
      }
    }catch(e){
      //silent
    } 
  }
  res.locals.nonce = Math.random().toString(36).substring(2);
  res.locals.whatsappSocket = whatsappSocket;
  next();
});




// HTTP FORCE LOGOUT -  MIDDLEWARE
app.use(async (req, res, next) => {
  if (req.path === '/force-logout') {
    try {
      const session_request = await sessionStorage.getSession(req.headers.cookie);
      const user_login = await session_request.get('user_login');
      if (!user_login) {
        return res.json({ status: 'OK', message: 'No active session found' });
      }
      const raw_session = await redis.get(user_login);
      if (!raw_session) {
        return res.json({ status: 'OK', message: 'Session already invalidated' });
      }
      await redis.del(user_login);
      return res.json({ status: 'OK', message: 'Session successfully invalidated' });
    } catch (error) {
      console.error("Error saat memeriksa session:", error);
      return res.status(500).json({ status: 'ERROR', message: 'Internal server error - force logout' });
    }
  }
  next();
});


// PORTAL API MOBILE -- REQUEST API - MIDDLEWARE
app.use(async (req, res, next) => {
  const pathRegex = /^\/mobile\/api.*\/portal(\/|$)/;

  if (pathRegex.test(req.path)) {
    try {
      if (req.method !== 'GET') {
        const jwt_token = req.headers['authorization'];
      if (!jwt_token || !jwt_token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Token tidak ditemukan' });
      }
      const token = jwt_token.replace('Bearer ', '');
      const decode_jwt = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
      const raw_session = await redis.get(`mob_public_${decode_jwt.token}`);

      if (!raw_session) {
        console.log("MOBILE Session tidak valid di Redis");
        return res.status(401).json({ error: 'Unauthorized: Session tidak valid' });
      }

        const timestamp = req.headers['x-timestamp'];
        if (!timestamp) {
          return res.status(400).json({ error: 'Missing x-timestamp or x-device-id header' });
        }
        // =============== Anti-Replay Bagian A: Validasi Timestamp ============
        const clientTimestampMicro = parseInt(timestamp, 10);
        const clientTimestampSec = clientTimestampMicro / 1_000_000.0;
        const nowSec = Math.floor(Date.now() / 1000);
        if (Math.abs(clientTimestampSec - nowSec) > 300) {
          return res.status(403).json({ error: 'Invalid or expired timestamp' });
        }
        // =============== Anti-Replay Bagian B: Cek Apakah Timestamp + DeviceId Sudah Dipakai ======
        const replayKey = `replay-${decode_jwt.deviceId}-${timestamp}`;
        const isUsed = await redis.get(replayKey);
        if (isUsed) {
          return res.status(403).json({ error: 'Replay attack detected' });
        }
        // Tandai kombinasi deviceId dan timestamp sudah dipakai, TTL = 300 detik
        await redis.set(replayKey, 'used', 'EX', 300);

        res.current_user = JSON.parse(raw_session);
      }
    } catch (error) {
      res.current_user = null;
      console.error("Error saat memeriksa session:", error);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'internal service offline'
      });
    }
  }
  next();
});



// INTERNAL API MOBILE -- REQUEST API - MIDDLEWARE
app.use(async (req, res, next) => {
  const pathRegex = /^\/mobile\/api.*\/internal(\/|$)/;

  if (pathRegex.test(req.path)) {
    console.log(`Middleware dijalankan untuk MOBILE path: ${req.path}`);
    try {
      const jwt_token = req.headers['authorization'];
      if (!jwt_token || !jwt_token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Token tidak ditemukan' });
      }

      const token = jwt_token.replace('Bearer ', '');
      const decode_jwt = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
      //console.log('CHECK POITN 0')
      //console.log(`mobile-${decode_jwt.token}`)
      const raw_session = await redis.get(`mobile-${decode_jwt.token}`);

      if (!raw_session) {
        console.log("MOBILE Session tidak valid di Redis");
        return res.status(401).json({ error: 'Unauthorized: Session tidak valid' });
      }

      //console.log('CHECK POITN 1')
      const curent_employed = JSON.parse(raw_session);
      //console.log(curent_employed)

      if (curent_employed.scopeApp !== 'internal') {
        await redis.del(decode_jwt.token);
        return res.status(401).json({ error: 'Unauthorized: only for internal user' });
      }

      // Jika request bukan GET, terapkan validasi timestamp dan device-id
      if (req.method !== 'GET') {
        const timestamp = req.headers['x-timestamp'];
        const deviceId = req.headers['x-device-id'];
        
        if (!timestamp || !deviceId) {
          return res.status(400).json({ error: 'Missing x-timestamp or x-device-id header' });
        }

        // =============== Anti-Replay Bagian A: Validasi Timestamp ============
        const clientTimestampMicro = parseInt(timestamp, 10);
        const clientTimestampSec = clientTimestampMicro / 1_000_000.0;
        const nowSec = Math.floor(Date.now() / 1000);
        if (Math.abs(clientTimestampSec - nowSec) > 300) {
          return res.status(403).json({ error: 'Invalid or expired timestamp' });
        }
        // =============== Anti-Replay Bagian B: Cek Apakah Timestamp + DeviceId Sudah Dipakai ======
        const replayKey = `replay-${deviceId}-${timestamp}`;
        const isUsed = await redis.get(replayKey);
        if (isUsed) {
          return res.status(403).json({ error: 'Replay attack detected' });
        }
        // Tandai kombinasi deviceId dan timestamp sudah dipakai, TTL = 300 detik
        await redis.set(replayKey, 'used', 'EX', 300);
      }

      res.current_user = curent_employed;
    } catch (error) {
      res.current_user = null;
      console.error("Error saat memeriksa session:", error);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'internal service offline'
      });
    }
  }
  next();
});




// EXTERNAL API MOBILE -- REQUEST API - MIDDLEWARE
app.use(async (req, res, next) => {
  
  const pathRegex = /^\/mobile\/api.*\/external(\/|$)/;

  if (pathRegex.test(req.path)) {
    console.log(`Middleware dijalankan untuk MOBILE path: ${req.path}`);
    try {
      const jwt_token = req.headers['authorization'];
      if (!jwt_token || !jwt_token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: Token tidak ditemukan' });
      }

      const token = jwt_token.replace('Bearer ', '');
      const decode_jwt = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
      const raw_session = await redis.get(`mobile-${decode_jwt.token}`);

      if (!raw_session) {
        console.log("MOBILE Session tidak valid di Redis");
        return res.status(401).json({ error: 'Unauthorized: Session tidak valid' });
      }
      const current_user = JSON.parse(raw_session);

      if(current_user.scopeApp !== 'external'){
        await redis.del(decode_jwt.token);
        return res.status(401).json({ error: 'Unauthorized: only for external user' });
      }
      res.current_user = current_user;
      //console.log('DARI MOBILE');
      //console.log(res.current_user);
    } catch (error) {
      res.current_user = null;
      console.error("Error saat memeriksa session:", error);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'internal service offline'
      });
    }
  }
  next();
});




// INTERNAL API -- REQUEST API - MIDDLEWARE
app.use(async (req, res, next) => {
  
  const pathRegex = /^\/aplikasi\/internal.*\/api(\/|$)/;
  const excludedPaths = [
    "/aplikasi/internal/api/login",
    "/aplikasi/internal/api/register",
    "/aplikasi/internal/api/reset-password"
  ];


  if (excludedPaths.includes(req.path)) {
    return next();
  }
  

  if (pathRegex.test(req.path)) {
    console.log(`Middleware dijalankan untuk path: ${req.path}`);
    try {
      const jwt_token = req.headers['authorization'];
      const appRetoolId = req.headers['application-id'];
      if (!jwt_token || !jwt_token.startsWith('Bearer ')) {
        res.clearCookie('aplikasi'); 
        return res.status(401).json({ error: 'Unauthorized: Token tidak ditemukan' });
      }

      const token = jwt_token.replace('Bearer ', '');
      const decode_jwt = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
      const raw_session = await redis.get(decode_jwt.token);

      if (!raw_session) {
        console.log("Session tidak valid di Redis");
        res.clearCookie('aplikasi'); 
        return res.status(401).json({ error: 'Unauthorized: Session tidak valid' });
      }
      
      
      const aplikasi_internal = await redis.get("aplikasi_internal");
      const aplikasi_internal_array = JSON.parse(aplikasi_internal);
      const aplikasi_target = aplikasi_internal_array.find((item)=>item.x_studio_retool_uuid === appRetoolId);
      
      if(!aplikasi_target){
        await redis.del(decode_jwt.token);
        res.clearCookie('aplikasi'); 
        return res.status(401).json({ error: 'Unauthorized: By pas Session Detection' });
      }

      const curent_employed = JSON.parse(raw_session);

      if(curent_employed.scopeApp !== 'internal'){
        await redis.del(decode_jwt.token);
        res.clearCookie('aplikasi');
        return res.status(401).json({ error: 'Unauthorized: only for internal user' });
      }


      const is_allow_access_langsung = aplikasi_target.x_studio_akses_langsung_internal.some(item => item.x_studio_personil.id === curent_employed.id);
      if(!is_allow_access_langsung){
        if(aplikasi_target.x_studio_departement?.id !== curent_employed.department?.id){
          await redis.del(decode_jwt.token);
          res.clearCookie('aplikasi'); 
          return res.status(401).json({ error: 'Unauthorized: only Authorized unit' });
        }
      }

      res.current_user = curent_employed;
    } catch (error) {
      res.current_user = null;
      console.error("Error saat memeriksa session:", error);
      res.clearCookie('aplikasi'); 
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'internal service offline'
      });
    }
  }
  next();
});









function externalCheckAccess(user, arrInstansi) {
  const found = arrInstansi.find(
    (item) => item.instansi?.id === user.instansi.id
  );
  if (!found) {
    return false;
  }

  const isPicMatch = user.id_user === found.pic?.id;
  const matchedAdmin = found.admin.find((adm) => adm?.user?.id === user.id_user);

  if (!isPicMatch && !matchedAdmin) {
    return false;
  }
  if (isPicMatch) {
    user.is_pic = true;
  }

  if (matchedAdmin) {
    if (matchedAdmin.hak_akses === 'OPERATOR') {
      user.is_operator = true;
    }
    if (matchedAdmin.hak_akses === 'VERIFIKATOR') {
      user.is_verifikator = true;
    }
  }
  return user;
}



// EXTERNAL API -- REQUEST API - MIDDLEWARE
app.use(async (req, res, next) => {
  
  const pathRegex = /^\/aplikasi\/external.*\/api(\/|$)/;
  const excludedPaths = [
    "/aplikasi/external/api/login",
    "/aplikasi/external/api/register",
    "/aplikasi/external/api/reset-password"
  ];


  if (excludedPaths.includes(req.path)) {
    return next();
  }
  

  if (pathRegex.test(req.path)) {
    console.log(`Middleware dijalankan untuk path: ${req.path}`);
    try {
      const jwt_token = req.headers['authorization'];
      const appRetoolId = req.headers['application-id'];
      if (!jwt_token || !jwt_token.startsWith('Bearer ')) {
        res.clearCookie('aplikasi'); 
        return res.status(401).json({ error: 'Unauthorized: Token tidak ditemukan' });
      }

      const token = jwt_token.replace('Bearer ', '');
      const decode_jwt = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
      const raw_session = await redis.get(decode_jwt.token);

      if (!raw_session) {
        console.log("Session tidak valid di Redis");
        res.clearCookie('aplikasi'); 
        return res.status(401).json({ error: 'Unauthorized: Session tidak valid' });
      }
      
      
      const aplikasi_external = await redis.get("aplikasi_external");
      const aplikasi_external_array = JSON.parse(aplikasi_external);
      const aplikasi_target = aplikasi_external_array.find((item)=>item.x_studio_retool_uuid === appRetoolId);
      
      if(!aplikasi_target){
        await redis.del(decode_jwt.token);
        res.clearCookie('aplikasi'); 
        return res.status(401).json({ error: 'Unauthorized: By pas Session Detection' });
      }

      const currentSession = JSON.parse(raw_session);

      if(currentSession.scopeApp !== 'external'){
        await redis.del(decode_jwt.token);
        res.clearCookie('aplikasi');
        return res.status(401).json({ error: 'Unauthorized: only for external user' });
      }

      const calculate_user = externalCheckAccess(currentSession.user, aplikasi_target.mitra);
      if (!calculate_user) {
        await redis.del(decode_jwt.token);
        res.clearCookie('aplikasi');
        return res.status(401).json({ error: 'Unauthorized: only for authorized user' });
      }

      res.current_user = currentSession;
    } catch (error) {
      res.current_user = null;
      console.error("Error saat memeriksa session:", error);
      res.clearCookie('aplikasi'); 
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'internal service offline'
      });
    }
  }
  next();
});














// HTTP INTERNAL APLIKASI -- REQUEST BIASA -  MIDDLEWARE
 // Regex untuk path yang diawali dengan /aplikasi/internal tetapi tidak mengandung /api
app.use(async (req, res, next) => {
  const pathRegex = /^\/aplikasi\/internal(?!.*\/api)(\/|$)/;
  
  if (pathRegex.test(req.path)) {
    try {
      const session_request = await sessionStorage.getSession(req.headers.cookie);
      const user_login = await session_request.get('userIdInternal');

      if(!user_login){
        res.clearCookie('aplikasi'); 
        return res.redirect(`/auth/login/internal`);
      }

      //const curent_employed = JSON.parse(raw_session);
      //if(curent_employed.scopeApp !== 'internal'){
       //   res.clearCookie('aplikasi'); 
       //   return res.redirect(`/auth/login/internal`);
      //}
     // console.log(curent_employed);
      res.current_user = user_login;
    } catch (error) {
      console.error("Error saat memeriksa session:", error);
      res.clearCookie('aplikasi'); 
      return res.redirect(`/auth/login/internal`);
    }
  }
  next();
});








// HTTP EXTERNAL APLIKASI -- REQUEST BIASA -  MIDDLEWARE
 // Regex untuk path yang diawali dengan /aplikasi/external tetapi tidak mengandung /api
 app.use(async (req, res, next) => {
  const pathRegex = /^\/aplikasi\/external(?!.*\/api)(\/|$)/;
  
  if(req.path == '/aplkasi/external'){
    return res.redirect(`/portal/aplikasi`);
  }

  const excludedPaths = [];
  try{
    const aplikasi_external = await redis.get("aplikasi_external");
    const aplikasi_external_array = JSON.parse(aplikasi_external);
    aplikasi_external_array.map((item)=>{
      excludedPaths.push(`/aplikasi/external/auth/login/${item.x_studio_path}`)
    });
  }catch(e){
    console.log(e)
  }

 // console.log(excludedPaths)
  if (excludedPaths.includes(req.path)) {
    return next();
  }

  if (pathRegex.test(req.path)) {
    const pathParts = req.path.split('/');
    const secondPart = pathParts[3];
    try {
      const aplikasi_internal = await redis.get("aplikasi_external");
      const aplikasi_external_array = JSON.parse(aplikasi_internal);

      const aplikasi_target = aplikasi_external_array.find((item)=>item.x_studio_path === secondPart);
      if(!aplikasi_target){
        return res.redirect(`/portal/aplikasi/not-found`);
      }

      const session_request = await sessionStorage.getSession(req.headers.cookie);
      const user_login = await session_request.get('user_login');

      if(!user_login){
        res.clearCookie('aplikasi'); 
        return res.redirect(`/aplikasi/external/auth/login/${secondPart}`);
      }

      const raw_session = await redis.get(user_login);
      if (!raw_session) {
        res.clearCookie('aplikasi'); 
        return res.redirect(`/aplikasi/external/auth/login/${secondPart}`);
      }

      const currentSession = JSON.parse(raw_session);
      if(currentSession.scopeApp !== 'external'){
          await redis.del(user_login);
          res.clearCookie('aplikasi'); 
          return res.redirect(`/aplikasi/external/auth/login/${secondPart}`);
      }

      const calculate_user = externalCheckAccess(currentSession.user, aplikasi_target.mitra);
      if (!calculate_user) {
        await redis.del(user_login);
        res.clearCookie('aplikasi');
        return res.redirect(`/aplikasi/external/auth/login/${secondPart}`);
      }


      res.current_user = currentSession;
    } catch (error) {
      console.error("Error saat memeriksa session:", error);
      res.clearCookie('aplikasi'); 
      return res.redirect(`/aplikasi/external/auth/login/${secondPart}`);
    }
  }
  next();
});






// RETOOL API -- REQUEST API - MIDDLEWARE
app.use(async (req, res, next) => {
 // const pathRegex = /^\/api(\/|$)/;

  const pathRegexApiEmbed = /^\/api(?!.*\/embedded)(\/|$)/;
  const pathRegexApiPublic = /^\/api(?!.*\/public)(\/|$)/;
  //console.log(req.path)
  //console.log('====================================================================')

  if ( pathRegexApiEmbed.test(req.path) && pathRegexApiPublic.test(req.path)) {
    try {
      const session_request = await sessionStorage.getSession(req.headers.cookie);
      const user_login = await session_request.get('user_login');
      
      if(!user_login){
        return next();
        return res.status(401).json({ error: 'Unauthorized: Token tidak ditemukan' });
      }

      const raw_session = await redis.get(user_login);
      if (!raw_session) {
        return next();
        return res.status(401).json({ error: 'Unauthorized: Token tidak ditemukan' });
      }
      res.current_user = JSON.parse(raw_session);
    } catch (error) {
      return next();
      console.error("Error saat memeriksa session:", error);
      return res.status(401).json({ error: 'Unauthorized: Token tidak ditemukan' });
    }
  }
  next();
});



/*
async function sendWhatsAppMessage(number, message) {
  try {
    if (!whatsappSocket) {
      console.error("WhatsApp socket not initialized.");
      return;
    }
    const jid = `${number}@s.whatsapp.net`;
    await whatsappSocket.sendMessage(jid, { text: message });
    console.log(`Message sent to ${number}: ${message}`);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}
*/





// INITIALIZE WHATSAPP
async function initializeWhatsApp() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("./whatsapp-auth");
    whatsappSocket = makeWASocket({
      auth: state,
      printQRInTerminal: true, 
    });

    whatsappSocket.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "open") {
        console.log("WhatsApp connected successfully!");
      } else if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error?.output?.statusCode || 0) !== DisconnectReason.loggedOut;
        console.log("Connection closed. Reconnecting:", shouldReconnect);
        if (shouldReconnect) initializeWhatsApp();
      }
    });
    whatsappSocket.ev.on("creds.update", saveCreds);
    app.use((req, res, next) => {
      res.locals.whatsappSocket = whatsappSocket;
      next();
    });
  } catch (error) {
    console.error("Error initializing WhatsApp socket:", error);
  }
}






const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      })
    );







const remixHandler = createRequestHandler({
  build: viteDevServer ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build") : await import("./build/server/index.js"),
  getLoadContext(req, res) {
    return {
      ioServer,
      client_barrier,
      cspNonce: res.locals.nonce,
      whatsappSocket : res.locals.whatsappSocket,
      current_user: res.current_user,
      sessionStorage : sessionStorage,
      getSession:getSession
    };
  },
});





// handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever.
  app.use("/assets", express.static("build/client/assets", { immutable: true, maxAge: "1y" }));
}
app.all("*", remixHandler);









const cronJob = createCronService();
cronJob.start();
cronJob.add(listScheduledTask);


process.on('SIGINT', function () {
  console.log('Aplikasi Barrier Gate Distop, menutup koneksi socket...');
  client_barrier?.destroy();
  cronJob?.destroy();
  process.exit();
});


process.on('SIGTERM', function () {
  console.log('Aplikasi Barrer Gate menerima SIGTERM, menutup koneksi socket...');
  client_barrier?.destroy();
  cronJob?.destroy();
  process.exit();
});





Promise.all([
  initializeWhatsApp(),
]).then((res) => {
  httpServer.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });


})


