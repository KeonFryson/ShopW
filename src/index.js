import shopHtml from './shop.html';
import { EmailMessage } from "cloudflare:email";
import { createMimeMessage } from "mimetext";

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Serve the HTML page
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
				const messageText = formData.get('message') || "";

				if (!name || !email || !item) {
					return new Response('Missing required fields', { status: 400 });
				}

				// Create MIME email
				const msg = createMimeMessage();
				msg.setSender({ name: "Shop Request", addr: "noreply@yourdomain.com" });
				msg.setRecipient("order@tcdining.org"); // or use destination_address from your binding
				msg.setSubject(`New Item Request: ${item}`);
				msg.addMessage({
					contentType: "text/plain",
					data: `Name: ${name}\nEmail: ${email}\nItem: ${item}\nMessage: ${messageText}`,
				});

				// Wrap into EmailMessage and send via binding
				const emailMessage = new EmailMessage(
					"noreply@yourdomain.com",
					"order@tcdining.org",
					msg.asRaw()
				);

				await env.SEND_EMAIL.send(emailMessage);

				return new Response('Request sent! Thank you.', {
					headers: { 'Content-Type': 'text/plain' },
				});
			} catch (err) {
				return new Response(`Error processing request: ${err.message}`, { status: 500 });
			}
		}

		return new Response('Not found', { status: 404 });
	},
};
