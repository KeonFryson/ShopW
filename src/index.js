import shopHtml from './shop.html';
import { EmailMessage } from "cloudflare:email";

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Serve HTML page
		if (url.pathname === '/') {
			return new Response(shopHtml, {
				headers: { 'Content-Type': 'text/html; charset=UTF-8' },
			});
		}

		
	},
};
