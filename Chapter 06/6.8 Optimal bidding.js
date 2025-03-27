///////////////////////////////////////////////////////////////////////////////
// *** 6.8 Optimal bidding ***
//
// The actual bidding goes through two stages:
//   1. A guess is to make beliefs (= posterior prices), and then,
//   2. based on them, the player would bid.
//
//   The second stage is analyzed here
//

class GainCalculator
{
	player = null;
	opponent = null;

	dconstructor(player, opponent)
	{
		this.player = player;
		this.opponent = opponent;
	}

	ExpectedGains(low=0, high=75000, n=101)
	{
		var bids = spreadDots(null, n, low, high);
		var gains = [];
		bids.forEach( (bid) => gains.push(this.ExpectedGain(bid)) );

		return bids, gains;
	}

	ExpectedGain(bid)
	{
		var suite = this.player.posterior;
		var total = 0;
		var sorted = [...suite.Items()].toSorted( (a, b) => a[0] - b[0] );
		sorted.forEach( ([price, prob]) => {
			var gain = this.Gain(bid, price);
			total += prob * gain;
		}, this );

		return total;
	}

	Gain(bid, price)
	{
		if (bid > price) return 0;
		var diff = price - bid;
		var prob = this.ProbWin(diff);
		if (diff <= 250) return 2 * price * prob;

		return price * prob;
	}

	ProbWin(diff)
	{
		var prob = (this.opponent.ProbOverbid() + this.opponent.ProbWorseThan(diff));
		return prob;
	}
}

(function() {

	class Player
	{
		pdf_price = null;
		cdf_diff  = null;
		pdf_error = null;

		n = 1001;
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

		ProbOverbid()
		{
			return this.cdf_diff.Prob(-1);
		}

		ProbWorseThan(diff)
		{
			return 1 - this.cdf_diff.Prob(diff);
		}

		OptimalBid(guess, opponent)
		{
			/// TODO:

			this.MakeBeliefs(guess);
			var calc = GainCalculator(this, opponent);
			[bids, gains] = calc.ExpectedGains();
			[gain, bid] = max(zip(gains, bids));
			return [bid, gain];
		}

	}

	/// ---------------- Test ---------------- ///

	var title = "6.8 Optimal bidding";

	console.log(`\n***** ${title} *****`)

	const showcases = readShowcases();
	const prices1 = showcases.price1;
	const prices2 = showcases.price2;
	const bids1   = showcases.bid1  ;
	const bids2   = showcases.bid2  ;
	const diffs1  = showcases.diff1 ;
	const diffs2  = showcases.diff2 ;


	//////// --- Probability of Winning --- ////////

	function compute_prob_win(opponent, diff)
	{
		// Probability of winning for a given diff
		// diff = your price - your bid

		// 1. if you overbid you lose:
		if (diff < 0) return 0;

		// 2. if the opponent overbids, you win:
		var p1 = opponent.ProbOverbid();

		// 3. or if their bid is worse than yours, you win:
		var p2 = opponent.ProbWorseThan(diff);

		// p1 and p2 are mutually exclusive, so we can add them:
		return p1 + p2;
	}

	(function() {

		var title = "6.8 Optimal bidding: Probability of Winning";

		var player   = new Player(prices1, bids1, diffs1);
		var opponent = new Player(prices2, bids2, diffs2);

		// Here’s an estimate for the probabilities that Players overbid:
		var player_prob_overbid   =   player.ProbOverbid();
		var opponent_prob_overbid = opponent.ProbOverbid();
		console.log(  `player_prob_overbid: ${player_prob_overbid.toFixed(3)}`  );
		console.log(`opponent_prob_overbid: ${opponent_prob_overbid.toFixed(3)}`);

		// Here’s the probability that the Players underbids by more than $5,000:
		var diff = 10000;
		var player_prob_worse_than   =   player.ProbWorseThan(diff);
		var opponent_prob_worse_than = opponent.ProbWorseThan(diff);
		console.log(  `player prob_worse_than ${diff}: ${player_prob_worse_than.toFixed(3)}`  );
		console.log(`opponent prob_worse_than ${diff}: ${opponent_prob_worse_than.toFixed(3)}`);


		/// --- plotting --- ///

		var plotData = [];

		var graph = new Hist();
		var xs = spreadDots(diffs1, 121, -5000, 30000);
		xs.forEach( (x) => graph.Set(x, compute_prob_win( opponent, x )) );

		graph.name = "Player";
		chargePlot(graph, plotData, "line");

		var graph = new Hist();
		var xs = spreadDots(diffs2, 121, -5000, 30000);
		xs.forEach( (x) => graph.Set(x, compute_prob_win( player, x )) );

		graph.name = "Opponent";
		chargePlot(graph, plotData, "line");

		renderPlot(title, plotData, "players_diffs_winning_chart_", {x:{title:"Diff = Price - Bid ($)"},y:{title:"Winning Prob"}} );

	})();


	//////// --- Decision Analysis --- ////////

	// 1. Computes the difference between the bid and the hypothetical price,
	// 2. Computes the probability that the player wins, given that difference, and
	// 3. Adds up the weighted sum of the probabilities, where the weights are
	//    the probabilities in the posterior distribution.

	//    This loop implements the law of total probability: P(win) = ∑ P(price) P(win|price)

	function total_prob_win(bid, player_posterior, opponent)
	{
		// Computes the total probability of winning with a given bid.
		//     bid: your bid
		//     player_posterior: Pmf of showcase value
		//     opponent: for the sequence of differences for the opponent
		//     returns: probability of winning

		var total = 0;

		for ( const [price, prob] of player_posterior.Items() )
		{
			var diff = price - bid;
			total += prob * compute_prob_win(opponent, diff);
		}
		return total;
	}

	(function() {

		var title = "6.8 Optimal bidding: Decision Analysis";

		var player   = new Player(prices1, bids1, diffs1);
		var opponent = new Player(prices2, bids2, diffs2);

		const guess = 23000;
		player.MakeBeliefs(guess);
		opponent.MakeBeliefs(guess);

		const bid = 23000;
		let player_total = total_prob_win(bid, player.posterior, opponent);
		console.log(`*** Player: bid = ${bid}, total_prob_win = ${player_total} ***`);

		let opponent_total = total_prob_win(bid, opponent.posterior, player);
		console.log(`*** Opponent: bid = ${bid}, total_prob_win = ${opponent_total} ***`);


		/// --- plotting --- ///

		var plotData = [];
		var bids = spreadDots(null, 101, 0, 75000);

		var graphWin = new Suite(null, title);
		bids.forEach( (bid) => {
			let player_total = total_prob_win(bid, player.posterior, opponent);
			graphWin.Set(bid, player_total);
		});

		graphWin.name = `Player (guess=${guess})`;
		logSummary(title, graphWin, "summary_max_bids_", "crimson");
		chargePlot(graphWin, plotData, "line");

		var graphWin = new Suite(null, title);
		bids.forEach( (bid) => {
			let opponent_total = total_prob_win(bid, opponent.posterior, player);
			graphWin.Set(bid, opponent_total);
		});

		graphWin.name = `Opponent (guess=${guess})`;
		logSummary(title, graphWin, "summary_max_bids_", "crimson");
		chargePlot(graphWin, plotData, "line");

		renderPlot(title, plotData, "players_prob_winning_chart_", {x:{title:"Bid ($)"},y:{title:"Winning Prob"}} );

	})();


	//////// --- Maximizing Expected Gain --- ////////

	function compute_gain(bid, price, opponent)
	{
		// Compute expected gain given a bid and actual price.

		var diff = price - bid;
		var prob = compute_prob_win(opponent, diff);

		// if you are within 250 dollars, you win both showcases
		if (diff >= 0 && diff <= 250) return 2 * price * prob;

		return price * prob;
	}

	function expected_gain(bid, posterior, opponent)
	{
		// Compute the expected gain of a given bid

		var total = 0;
		for ( const [price, prob] of posterior.Items() )
		{
			total += prob * compute_gain(bid, price, opponent);
		}
		return total;
	}

	(function() {

		var title = "6.8 Optimal bidding: Maximizing Expected Gain";

		var player   = new Player(prices1, bids1, diffs1);
		var opponent = new Player(prices2, bids2, diffs2);

		/// --- Gain  --- ///

		var bid = 30000;
		const price = 35000;

		let player_gain = compute_gain(bid, price, opponent);
		console.log(`*** Player: bid = ${bid}, price = ${price}, gain = ${player_gain} ***`);

		let opponent_gain = compute_gain(bid, price, player);
		console.log(`*** Opponent: bid = ${bid}, price = ${price}, gain = ${opponent_gain} ***`);


		/// --- Expected Gain  --- ///

		var bid = 21000;
		const guess = 23000;
		player.MakeBeliefs(guess);
		opponent.MakeBeliefs(guess);

		let player_expectedGain = expected_gain(bid, player.posterior, opponent);
		console.log(`*** Player: bid = ${bid}, guess = ${guess}, expected_gain = ${player_expectedGain} ***`);

		let opponent_expectedGain = expected_gain(bid, opponent.posterior, player);
		console.log(`*** Opponent: bid = ${bid}, guess = ${guess}, expected_gain = ${opponent_expectedGain} ***`);


		/// --- plotting --- ///

		var plotData = [];
		var bids = spreadDots(null, 101, 0, 75000);

		var graphWin = new Suite(null, title);
		bids.forEach( (bid) => {
			let player_expectedGain = expected_gain(bid, player.posterior, opponent);
			graphWin.Set(bid, player_expectedGain);
		});

		graphWin.name = `Player (guess=${guess})`;
		logSummary(title, graphWin, "summary_expected_gain_", "magenta");
		chargePlot(graphWin, plotData, "line");

		var graphWin = new Suite(null, title);
		bids.forEach( (bid) => {
			let opponent_expectedGain = expected_gain(bid, opponent.posterior, player);
			graphWin.Set(bid, opponent_expectedGain);
		});

		graphWin.name = `Opponent (guess=${guess})`;
		logSummary(title, graphWin, "summary_expected_gain_", "magenta");
		chargePlot(graphWin, plotData, "line");

		renderPlot(title, plotData, "expected_gain_chart_", {x:{title:"Bid ($)"},y:{title:"Expected Gain"}} );

	})();

})();

