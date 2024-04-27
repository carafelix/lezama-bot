import { KVNamespace } from "@cloudflare/workers-types"
import { D1Adapter, KvAdapter } from "@grammyjs/storage-cloudflare"
interface Env {
  BOT_TOKEN: string
  BOT_INFO: string
  MONGO_CONNECT: string
  MONGO_API_KEY: string
  MONGO_API_ENDPOINT: string
  MONGO_APP_ID: string
  FREE_STORAGE_TOKEN: string
  ADMIN_DATA_KEY: string
  D1_LEZAMA: D1Database
  KV_LEZAMA: KVNamespace
  DEVELOPER_ID: string
}

interface Mixin{
  env: Env
  kv: KvAdapter<any>
}

interface MongoResponse {
  document: PoemDocument
}

interface PoemDocument {
  _id: number;
  book: BookDocument
  title: string;
  text: string;
  length: number;
  multiline?: boolean;
};

interface BookDocument {
  title: string;
  publishYear: number;
  author: string;
}

interface SessionData {
  chatID: number,
  allPoems: PoemDocument["_id"][]
  queue: PoemDocument["_id"][],
  visited: PoemDocument["_id"][],
  cronHour: Date.getUTCHours,
  subscribed: boolean
  timezone: number,
  includeMiddies: boolean,
}

type ExportedMenu = {
  menu: Menu<Lezama>
  text: string;
}

interface AdminData {
  users: any // this is the currently subscribed users
}

type papi = Map<string>