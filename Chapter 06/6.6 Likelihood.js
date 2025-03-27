///////////////////////////////////////////////////////////////////////////////
// *** 6.6 Likelihood ***
//
// The actual bidding goes through two stages:
//   1. A guess is to make beliefs about prices, and then,
//   2. based on them, the player would bid.
//
// Here is the first stage:
//   we calculate beliefs based on available showcases dataset
//   given a new guess:
//
// Historical showcases dataset frames our prior hypotheses (of prices).
// Then we have a new data - the contestant's next guess.
// So, the prior (= hypo) is the past price of the showcase.
//
// Ultimate Purpose: to compute the posterior or beliefs (given the new data = a guess).
//
// Intermediary Purpose: to compute the likelihood of that new data under each hypothesis,
// which means: the less the guess deviates from the hypo(=price) the more probabale it is,
// hence GaussPDF(error).
//

class Price extends Suite
{
	player = null;

	constructor(hypos=null, title="", player=null, name="")
	{
		super(hypos, title, name);
		this.player = player;
	}

	Likelihood(data, hypo)
	{
		var price = hypo;
		var guess = data;
		var error = price - guess;
		var like = this.player.ErrorDensity(error);

		return like;
	}

}

(function() {

	class Player
	{
		pdf_price = null;
		cdf_diff  = null;
		pdf_error = null;

		n = 101;
		price_xs = null;

		prior = null;
		posterior = null;

		constructor(prices, bids, diffs, name="")
		{
			// this.price_xs = spreadDots(prices, this.n);	// = linspace
			this.price_xs = spreadDots(prices, this.n, 0, 75000);	// = linspace

			this.pdf_price = new EstimatedPdf(prices);
			this.cdf_diff = MakeCdfFromList(diffs);

			const mu = 0;
			const sigma = this.estimateSigma(diffs, mu);
			this.pdf_error = new GaussianPdf(mu, sigma);
		}

		estimateSigma(dataset, mu)
		{
			let sum = dataset.reduce((partialSum, a) => partialSum + Math.pow(a - mu, 2), 0);
			let variance = sum / dataset.length;
			return Math.sqrt(variance);
		}

		ErrorDensity(error)
		{
			return this.pdf_error.Density(error);
		}

		MakeBeliefs(guess)
		{
			this.prior = this.pdf_price.MakePmf(this.price_xs);
			this.posterior = new Price(null, "", this);
			this.prior.GetDict().forEach( (p, x) => this.posterior.Set(x, p) );

			this.posterior.Update(guess);
		}
	}

	/// ---------------- Guessing ---------------- ///

	var title = "6.6 Likelihood";

	var plotData = [];

	const showcases = readShowcases();
	let prices1 = showcases.price1;
	let prices2 = showcases.price2;
	let bids1   = showcases.bid1  ;
	let bids2   = showcases.bid2  ;
	let diffs1  = showcases.diff1 ;
	let diffs2  = showcases.diff2 ;

	var player1 = new Player(prices1, bids1, diffs1);
	var guess = 20000;
	player1.MakeBeliefs(guess);

	player1.prior.name = `prior 1`;
	logSummary(title, player1.prior, "summary_player1_prices_", "olive");
	chargePlot(player1.prior, plotData, "line");

	player1.posterior.name = `posterior 1 (guess=${guess})`;
	logSummary(title, player1.posterior, "summary_player1_prices_", "olive");
	chargePlot(player1.posterior, plotData, "line");

	renderPlot(title, plotData, "player1_prices_chart_", {x:{title:"price ($)"},y:{title:"PMF"}} );

})();

