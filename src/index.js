import shopHtml from './shop.html';

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
				const message = formData.get('message');

				if (!name || !email || !item) {
					return new Response('Missing required fields', { status: 400 });
				}

				const emailMessage = {
					personalizations: [{ to: [{ email: 'order@tcdining.org' }] }],
					from: { email: 'noreply@tcdining.org' },
					subject: `New Item Request: ${item}`,
					content: [
						{
							type: 'text/plain',
							value: `Name: ${name}\nEmail: ${email}\nItem: ${item}\nMessage: ${message}`,
						},
					],
				};

				// Send email via Cloudflare Email binding
				const emailResponse = await env.SEND_EMAIL.fetch('/send', {
					method: 'POST',
					body: JSON.stringify(emailMessage),
					headers: { 'Content-Type': 'application/json' },
				});

				if (emailResponse.ok) {
					return new Response('Request sent! Thank you.', {
						headers: { 'Content-Type': 'text/plain' },
					});
				} else {
					const errText = await emailResponse.text();
					return new Response(`Failed to send request: ${errText}`, { status: 500 });
				}
			} catch (err) {
				return new Response(`Error processing request: ${err.message}`, { status: 500 });
			}
		}

		// Not found
		return new Response('Not found', { status: 404 });
	},
};
