import apiRouter from './router';

export default {

  // The fetch handler is invoked when this worker receives a HTTP(S) request
  // and should return a Response (optionally wrapped in a Promise)
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    env.BOT_TOKEN

		return new Response(
			JSON.stringify({what:'are you doing'}),
			{ headers: { "Content-Type": "application/json" } }
		);
  },
};