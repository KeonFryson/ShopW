import shopHtml from './shop.html';
import ordersDashboardHtml from './orders-dashboard.html';
import { EmailMessage } from "cloudflare:email";

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Serve HTML page for shop
		if (url.pathname === '/') {
			return new Response(shopHtml, {
				headers: { 'Content-Type': 'text/html; charset=UTF-8' },
			});
		}

		// Serve orders dashboard at /order
		if (url.pathname === '/order') {
			return new Response(ordersDashboardHtml, {
				headers: { 'Content-Type': 'text/html; charset=UTF-8' },
			});
		}
	},
};
