const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const enfore = require('express-sslify');

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECKRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(enfore.HTTPS({ trustProtoHeader: true }));
app.use(cors());

if (process.env.NODE_ENV === 'production') {
	app.use(express.static(path.join(__dirname, 'client/build')));

	app.get('*', function (req, res) {
		res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
	});
}

app.listen(port, error => {
	if (error) throw error;
	console.log('Server running on port ' + port);
});

app.post('/payment', (req, res) => {
	const body = {
		token: req.body.token.id,
		amount: req.body.amount,
		currency: 'usd',
	};
	console.log(body);
	stripe.charges.create(body, (stripeErr, stripeRes) => {
		console.log(stripeErr);
		console.log(stripeRes);

		if (stripeErr) {
			res.status(500).send({ error: stripeErr });
		} else {
			res.status(200).send({ success: stripeRes });
		}
	});
});
