export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);

		if (url.pathname === "/") {
			return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Shop</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f9f9f9;
        }

        h1 {
            text-align: center;
        }

        .items {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            text-align: center;
        }

            .item img {
                max-width: 100%;
                border-radius: 5px;
            }

            .item button {
                margin-top: 10px;
                background: #28a745;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 5px;
                cursor: pointer;
            }

                .item button:hover {
                    background: #1e7e34;
                }

        form {
            max-width: 400px;
            margin: 40px auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            display: none;
        }

        input, textarea {
            width: 100%;
            padding: 10px;
            margin: 8px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
        }

        button[type="submit"] {
            background: #007BFF;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
        }

            button[type="submit"]:hover {
                background: #0056b3;
            }
    </style>
</head>
<body>
    <h1>My Shop</h1>

    <div class="items">
        <div class="item">
            <img src="item1.jpg" alt="Item 1">
            <h3>Item 1</h3>
            <p>$10 - Cool product description</p>
            <button onclick="requestItem('Item 1')">Request</button>
        </div>
        <div class="item">
            <img src="item2.jpg" alt="Item 2">
            <h3>Item 2</h3>
            <p>$20 - Another product description</p>
            <button onclick="requestItem('Item 2')">Request</button>
        </div>
    </div>

    <form id="requestForm" action="/api/request" method="POST">
        <h2>Request an Item</h2>
        <label>Your Name</label>
        <input type="text" name="name" required>

        <label>Your Email</label>
        <input type="email" name="email" required>

        <label>Requested Item</label>
        <input type="text" id="itemField" name="item" readonly>

        <label>Message</label>
        <textarea name="message" rows="5"></textarea>

        <button type="submit">Send Request</button>
    </form>

    <script>
    function requestItem(itemName) {
      document.getElementById('requestForm').style.display = 'block';
      document.getElementById('itemField').value = itemName;
      window.scrollTo({ top: document.getElementById('requestForm').offsetTop, behavior: 'smooth' });
    }
    </script>
</body>
</html>`, {
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
				from: { email: "noreply@tcdining.org" }, // Use a domain you control
				subject: `New Item Request: ${item}`,
				content: [
					{
						type: "text/plain",
						value: `Name: ${name}\nEmail: ${email}\nItem: ${item}\nMessage: ${message}`
					}
				]
			};

			// Send the email using the EmailMessage API
			const emailResponse = await env.SEND_EMAIL.fetch("mailto:order@tcdining.org", {
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

		return new Response("Not found", { status: 404 });
	}
};
