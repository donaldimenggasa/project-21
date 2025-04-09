import Redis from "ioredis";
let redis;


if (process.env.NODE_ENV === "production") {
  redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
  });

} else {
  if (!global.__redis) {
    global.__redis = new Redis({
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    });
  }
  redis = global.__redis;
}

redis.on("connect", () => {
  console.log("Connected to Redis ");
});
redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export { redis };

