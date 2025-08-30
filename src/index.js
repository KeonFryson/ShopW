import shopHtml from './shop.html';
import { EmailMessage } from "cloudflare:email";

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === '/') {
			return new Response(shopHtml, { headers: { 'Content-Type': 'text/html' } });
		}

		if (url.pathname === '/api/request' && request.method === 'POST') {
			const formData = await request.formData();
			const name = formData.get('name');
			const email = formData.get('email');
			const item = formData.get('item');
			const messageText = formData.get('message') || '';

			if (!name || !email || !item) {
				return new Response('Missing required fields', { status: 400 });
			}

			// Construct a simple plain-text email
			const emailMessage = new EmailMessage(
				"noreply@yourdomain.com",           // sender
				"order@tcdining.org",              // recipient (must match binding)
				`Name: ${name}\nEmail: ${email}\nItem: ${item}\nMessage: ${messageText}`
			);

			try {
				await env.SEND_EMAIL.send(emailMessage);
				return new Response('Request sent! Thank you.');
			} catch (err) {
				return new Response(`Failed to send email: ${err.message}`, { status: 500 });
			}
		}

		return new Response('Not found', { status: 404 });
	},
};
