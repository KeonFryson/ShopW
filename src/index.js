import shopHtml from './shop.html';

export default {
	async fetch(request, env, ctx) {
		let url;
		try {
			url = new URL(request.url, "http://localhost");
		} catch {
			return new Response("Invalid request URL", { status: 400 });
		}

		if (url.pathname === "/") {
			return new Response(shopHtml, {
				headers: { "content-type": "text/html; charset=UTF-8" }
			});
		}

		if (url.pathname === "/api/request" && request.method === "POST") {
			const formData = await request.formData();
			const name = formData.get("name");
			const email = formData.get("email");
			const item = formData.get("item");
			const message = formData.get("message");

			const emailMessage = {
				personalizations: [
					{ to: [{ email: "order@tcdining.org" }] }
				],
				from: { email: "noreply@tcdining.org" },
				subject: `New Item Request: ${item}`,
				content: [
					{
						type: "text/plain",
						value: `Name: ${name}\nEmail: ${email}\nItem: ${item}\nMessage: ${message}`
					}
				]
			};

			const emailResponse = await env.SEND_EMAIL.fetch("/send", {
				method: "POST",
				body: JSON.stringify(emailMessage),
				headers: { "Content-Type": "application/json" }
			});

			if (emailResponse.ok) {
				return new Response("Request sent! Thank you.", {
					headers: { "content-type": "text/plain" }
				});
			} else {
				return new Response("Failed to send request.", { status: 500 });
			}
		}

		if (request.method === "POST" && url.pathname === "/send") {
			const emailMessage = await request.json();
			await message.send(emailMessage);
			return new Response("Email sent");
		}

		return new Response("Not found", { status: 404 });
	}
};
