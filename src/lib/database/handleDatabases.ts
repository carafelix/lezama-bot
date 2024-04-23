import { freeStorage } from "@grammyjs/storage-free";
import { Bot } from "grammy";
import { Lezama } from "../../telegram/bot";

export async function composedFetch(env : Env ,collection : string, action : string, opts? : object){
    try{
    let data = {
        "collection": collection,
        "database": "lezama",
        "dataSource": "Lezama"
    };

    data = {...data, ...opts}

    const res = await fetch( env.MONGO_API_ENDPOINT + 'action/' + action, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
            'api-key': env.MONGO_API_KEY,
            },
        body: JSON.stringify(data)
        })
        return await res.json() 
    }
    catch(e){
        console.log(e);
    }
}

export async function readAdminData(bot : Bot<Lezama>, env: Env){
    const adminData = (await freeStorage<AdminData>(bot.token, { jwt: env.FREE_STORAGE_TOKEN }).read((env.FREE_STORAGE_SECRET_KEY)))
    return adminData
}
export async function writeAdminData(bot : Bot<Lezama>, env: Env, data : AdminData){
    await freeStorage<AdminData>(bot.token, { jwt: env.FREE_STORAGE_TOKEN }).write(env.FREE_STORAGE_SECRET_KEY, data);
}