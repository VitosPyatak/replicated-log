export const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const randomTimeoutUpTo = (ms: number) => timeout(Math.random() * ms);
