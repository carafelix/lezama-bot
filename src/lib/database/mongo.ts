import { Lezama } from "../../telegram/bot";
import { Env, AdminData } from "../../main";

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