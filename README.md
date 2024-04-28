# Lezama - Telegram poetry bot 

## to-do

- add poem initial/reset retrieval from database instead of json 
- add user session migration plugin: 
    - change chat ID from number to string
    - refactor data structure into categories. eg: poems.queue, poems.all, poems.visited, poems.includesMiddies
- add command registration plugin: developer only commands.
- add conversation plugin: 
    - sending message to all user's of the bot with /sendusers
    - add automatic timezone from user location
- migrate kv cron hour objects collections to Map, so it can store type and improve readability 
- the current dispatch trigger it's only handled by 1 worker, 1 instance of the bot. If at some point it gets to the point where handling the amount of users per certain hour surpass the [free threshold](https://developers.cloudflare.com/workers/platform/limits/). Instead of single dispatch, route the request to other workers, only passing userids, and inside that worker retrieve the userSession data. 
