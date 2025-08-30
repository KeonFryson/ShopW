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

				// Validate required fields
				if (!name || !email || !item) {
					return new Response('Missing required fields', { status: 400 });
				}

				// Construct the email
				const emailMessage = {
					personalizations: [{ to: [{ email: 'order@tcdining.org' }] }],
					from: { email: 'noreply@tcdining.org' },
					subject: `New Item Request: ${item}`,
					content: [
						{
							type: 'text/plain',
							value: `Name: ${name}\nEmail: ${email}\nItem: ${item}\nMessage: ${message || ''}`,
						},
					],
				};

				// Send email via Cloudflare Email binding (FIXED: no '/send')
				const emailResponse = await env.SEND_EMAIL.fetch(JSON.stringify(emailMessage), {
					method: 'POST',
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

		// Fallback for unmatched routes
		return new Response('Not found', { status: 404 });
	},
};
