## to-do

- [x] add poem initial/reset retrieval from database instead of json
- [x] add user session migration plugin:
    - change chat ID from number to string
- [x] add command registration plugin: developer only commands.
- [ ] add sending message to all user's, admin only command. /sendusers msg
- [ ] add automatic timezone from user location, when shared.
- [ ] change poems db to d1, using json reflect on tables.
- [ ] add more granular delivery time:
	- [ ] restrict kv to only accept strings formated in CRON-HOUR-QUARTER format.
	- [ ] improve menu for hour select.
	- [ ] migrate current users from CRON-HOUR, to CRON-HOUR-0 in kv.
	- [ ] edit the read/write to use the new format.
- [ ] enable / disable certain books.
- [ ] add support for supper long poems with [Telegraph](https://github.com/carafelix/grammy-telegraph)
- [ ] the current dispatch trigger it's only handled by 1 worker, 1 instance of the bot. If at some point it gets to the point where handling the amount of users per certain hour surpass the [free threshold](https://developers.cloudflare.com/workers/platform/limits/). Instead of an iterative single dispatch, [push to a LavinMQ queue](https://jaragua.lmq.cloudamqp.com/docs/#tag/exchanges/operation/PostExchangePublish) or [use valkey or redis)](https://valkey.io/) the users id's that need poem delivery, in chunks, and make cron jobs that consume that queue. This process can be further auto-scale via the following recursive-like method, inside the cronjob handler:
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
	another way would be simply have 2 workers do:
	```pseudocode
	main worker with cron:
		1.- if users in this cron hour > the amount of users that a single worker instance can handle:
			1.1.- split the users in two and send one half to a secondary worker
			1.2.- if users > max send, repeat 1.1
		2.- dispatch remaining.

	secondary worker repeats the same steps above but sends to the main worker.
	```
	This way the load would be automatically distributed between 2 workers bouncing back from one to another and only start sending if it can handle the load. It's a kind of recursive bouncing. Since workers are fetching each other, that generates a new instance of the worker, thus distributing the load across multiple instances.
	This requires adding Hono for setting up the specific endpoint.
