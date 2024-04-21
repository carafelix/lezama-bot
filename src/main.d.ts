interface Env {
  BOT_TOKEN: string
  BOT_INFO: string
  MONGO_CONNECT: string
  MONGO_API_KEY: string
  MONGO_API_ENDPOINT: string
  MONGO_APP_ID: string
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
  queue: PoemDocument["_id"][],
  visited: PoemDocument["_id"][],
}

