interface suscribeOpts {
    hour?: Date,
    random? : boolean
}

type Env = {
    BOT_TOKEN: string;
    BOT_INFO: string;
    MONGO_KEY: string;
    MONGO_ENDPOINT: string;
};