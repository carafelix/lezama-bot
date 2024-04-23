interface Env {
  BOT_TOKEN: string
  BOT_INFO: string
  MONGO_CONNECT: string
  MONGO_API_KEY: string
  MONGO_API_ENDPOINT: string
  MONGO_APP_ID: string
  FREE_STORAGE_TOKEN: string
  FREE_STORAGE_SECRET_KEY: string
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
  subscribed: boolean,
  allPoems: PoemDocument["_id"][]
  queue: PoemDocument["_id"][],
  cronHour: Date.getUTCHours
}

type ExportedMenu = {
  menu: Menu<Lezama>
  text: string;
}

interface AdminData {
  users: any // this is the currently subscribed users
}