///////////////////////////////////////////////////////////////////////////////
// *** 6.5 Modeling the contestants ***
//

(function() {

	class  Player
	{
		pdf_price = null;
		cdf_diff  = null;
		pdf_error = null;

		constructor(prices, bids, diffs)
		{
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
	}

	/// ---------------- Test ---------------- ///

	let title = "6.5 Modeling the contestants";
	var plotData = [];

	const showcases = readShowcases();
	let prices1 = showcases.price1;
	let prices2 = showcases.price2;
	let bids1   = showcases.bid1  ;
	let bids2   = showcases.bid2  ;
	let diffs1  = showcases.diff1 ;
	let diffs2  = showcases.diff2 ;

	var player1 = new  Player(prices1, bids1, diffs1);
	var player2 = new  Player(prices2, bids2, diffs2);

	/// diff CDFs ///

	var cdf_diff1 = player1.cdf_diff;
	var cdf_diff2 = player2.cdf_diff;

	cdf_diff1.name = "player 1";
	chargePlot(cdf_diff1, plotData);
	cdf_diff2.name = "player 2";
	chargePlot(cdf_diff2, plotData);

	renderPlot(title, plotData, "cdf_diff_chart_", {x:{title:"diff ($)"},y:{title:"CDF"}} );

	/// price PDFs ///

	var plotData = [];
	var pdf_price1 = player1.pdf_price;
	var pdf_price2 = player2.pdf_price;

	var xs = spreadDots(prices1.concat(prices2), 10001);

	var pmf_price1 = pdf_price1.MakePmf(xs) ;
	var pmf_price2 = pdf_price2.MakePmf(xs) ;

	pmf_price1.name = "pdf_price_player 1";
	logSummary(title, pmf_price1, "pdf_price_summary_", "darkred");
	chargePlot(pmf_price1, plotData);

	pmf_price2.name = "pdf_price_player 2";
	logSummary(title, pmf_price2, "pdf_price_summary_", "darkred");
	chargePlot(pmf_price2, plotData);

	renderPlot(title, plotData, "pdf_price_chart_", {x:{title:"price ($)"},y:{title:"PDF"}} );

	/// errors PDFs ///

	var plotData = [];
	var pdf_error1 = player1.pdf_error;
	var pdf_error2 = player2.pdf_error;

	var xs = spreadDots(diffs1.concat(diffs2), 10001);

	var pmf_error1 = pdf_error1.MakePmf(xs) ;
	var pmf_error2 = pdf_error2.MakePmf(xs) ;

	pmf_error1.name = "pdf_error_player 1";
	logSummary(title, pmf_error1, "pdf_error_summary_", "orange");
	chargePlot(pmf_error1, plotData);

	pmf_error2.name = "pdf_error_player 2";
	logSummary(title, pmf_error2, "pdf_error_summary_", "orange");
	chargePlot(pmf_error2, plotData);

	renderPlot(title, plotData, "pdf_error_chart_", {x:{title:"error ($)"},y:{title:"Gaussean PDF"}} );

})();
