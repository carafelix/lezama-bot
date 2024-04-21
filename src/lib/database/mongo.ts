export async function composedFetch(collection : string, action : string, opts? : object){
    try{
    let data = {
        "collection": collection,
        "database": "lezama",
        "dataSource": "Lezama"
    };

    data = {...data, ...opts}

    // @ts-ignore
    const res = await fetch( MONGO_API_ENDPOINT + 'action/' + action, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Request-Headers': '*',
    // @ts-ignore
            'api-key': MONGO_API_KEY,
            },
        body: JSON.stringify(data)
        })
        return await res.json() 
    }
    catch(e){
        console.log(e);
    }
}