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

		// Handle form submission
		if (url.pathname === '/api/request' && request.method === 'POST') {
			try {
				const formData = await request.formData();
				const name = formData.get('name');
				const email = formData.get('email');
				const item = formData.get('item');
				const messageText = formData.get('message') || '';

				if (!name || !email || !item) {
					return new Response('Missing required fields', { status: 400 });
				}

				// Construct the email directly as plain text
				const emailBody = `
Name: ${name}
Email: ${email}
Item: ${item}
Message: ${messageText}
        `.trim();

				// Send email via Cloudflare Email Routing binding
				const emailMessage = new EmailMessage(
					"noreply@yourdomain.com", // sender (must be verified)
					"order@tcdining.org",     // recipient (must match binding)
					emailBody
				);

				// ✅ Send directly; do NOT serialize
				await env.SEND_EMAIL.send(emailMessage);

				return new Response('Request sent! Thank you.', {
					headers: { 'Content-Type': 'text/plain' },
				});
			} catch (err) {
				return new Response(`Failed to send email: ${err.message}`, { status: 500 });
			}
		}

		return new Response('Not found', { status: 404 });
	},
};
