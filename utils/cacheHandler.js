import { createClient } from "redis";

const client = createClient({
  url: process.env.NODE_ENV === "production"
  ? `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOSTNAME}:${process.env.REDIS_PORT}`
  : "redis://redis:6379",
}); 
client.on("error", (err) => console.log("Redis Client Error", err));

async function connectRedis() { 
  await client.connect();
}

const handleCache = (cb) => cb();
connectRedis();

export const setCache = (key, data, expTime) => {
  if (typeof expTime === "undefined") expTime = 60 * 10; // defaultExpirationTime (10 minutes)
  return new Promise((resolve, reject) => {
    try {
      handleCache(async () => {
        const isOk = await client.set(key, JSON.stringify(data), { EX: expTime });
        if (isOk) console.log('Cached');
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteCache = (key) => new Promise((resolve, reject) => {
  try {
    handleCache(async () => {
      const response = await client.del(key);
      if (response === 1) console.log('Cache deleted');
      resolve(JSON.parse(response));
    });
  } catch (error) {
    reject(error);
  }
});

export const getCache = (key) => new Promise((resolve, reject) => {
  try {
    handleCache(async () => {
      const data = await client.get(key);
      if (data) console.log("Data found");
      resolve(JSON.parse(data));
    });
  } catch (error) {
    reject(error);
  }
});