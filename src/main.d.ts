import { KVNamespace } from "@cloudflare/workers-types";
import { D1Adapter, KvAdapter } from "@grammyjs/storage-cloudflare";
interface Env {
  BOT_TOKEN: string;
  BOT_INFO: string;
  MONGO_CONNECT: string;
  MONGO_API_KEY: string;
  MONGO_API_ENDPOINT: string;
  MONGO_APP_ID: string;
  FREE_STORAGE_TOKEN: string;
  ADMIN_DATA_KEY: string;
  D1_LEZAMA: D1Database;
  KV_LEZAMA: KVNamespace;
  DEVELOPER_ID: string;
}

interface Mixin {
  env: Env;
  kv: KvAdapter<any>;
}

interface MongoResponse {
  document: PoemDocument;
}

interface PoemDocument {
  _id: number;
  book: BookDocument;
  title: string;
  text: string;
  length: number;
  multiline?: boolean;
}

interface BookDocument {
  title: string;
  publishYear: number;
  author: string;
}

interface SessionData_v0 {
  chatID: number;
  allPoems: PoemDocument["_id"][];
  queue: PoemDocument["_id"][];
  visited: PoemDocument["_id"][];
  cronHour: Date.getUTCHours;
  subscribed: boolean;
  timezone: number;
  includeMiddies: boolean;
}

interface SessionData_v1 {
  chatID: number;
  poems: PoemsData;
  cron: cronData;
  subscribed: boolean;
}

interface cronData {
  hour: Date.getUTCHours;
  minute: Date.getUTCMinutes;
  timezoneOffset: number;
}
interface PoemsData {
  all: PoemDocument["_id"][];
  queue: PoemDocument["_id"][];
  visited: PoemDocument["_id"][];
  includeMiddies: boolean;
}

type ExportedMenu = {
  menu: Menu<Lezama>;
  text: string | (() => string);
};

interface AdminData {
  users: Record<string, object>; // this is the currently subscribed users
}
type Hour =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23;
type Minute = 0 | 15 | 30 | 45;

export type CronHours = `cron-${Hour}:${Minute}`;
