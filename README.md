# Lezama - Telegram poetry bot 

## to-do

- add poem initial/reset retrieval from database instead of json 
- add user session migration plugin: 
    - change chat ID from number to string
- add command registration plugin: developer only commands.
- add conversation plugin: 
    - sending message to all user's of the bot with /sendusers
    - add automatic timezone from user location
- the current dispatch trigger it's only handled by 1 worker, 1 instance of the bot. If at some point it gets to the point where handling the amount of users per certain hour surpass the [free threshold](https://developers.cloudflare.com/workers/platform/limits/). Instead of an iterative single dispatch, (push to a queue)[https://jaragua.lmq.cloudamqp.com/docs/#tag/exchanges/operation/PostExchangePublish] the users id's that need poem delivery, in chunks, and make cron jobs that consume that queue. This process can be further auto-scale via the following recursive-like method, inside the cronjob handler:
    ```pseudocode
    1.- if users in this cron hour > the amount of users that a single worker instance can handle:
        1.1.- split the users in two
        1.2.- send each chunk to a fetch worker pre-queue handler that repeat this steps
    2.- else push message containing all users id's to queue.
    ```
    Note: step 1.2 loop (and step 2 aftewards) can be done inside that very same worker if the loads are not big. Which for this case would do. 

    And inside a subsequent cronjob, that can be repeated on a per minute basis
    ```pseudocode
        - get a chunk from the queue
        - read user'ids from the chunk
        - delivery msg's to each user
    ```

