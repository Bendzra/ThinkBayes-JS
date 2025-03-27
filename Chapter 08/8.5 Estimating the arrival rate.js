///////////////////////////////////////////////////////////////////////////////
// 8.5 Estimating the arrival rate
// 
// In this case the hypothesis is a value of λ. The data is a pair, (y, k),
// where y is a wait time and k is the number of passengers that arrived
// during that time (while you are waiting for the train)

class ArrivalRate extends Suite
{

	constructor(hypoes=null, title=null, name="")
	{
		super(hypoes, title, name);
	};

	Likelihood(data, hypo)
	{
		const lambda = hypo;
		const [y, k] = data;
		const like = EvalPoissonPmf(k, lambda * y);
		return like;
	};

}


class ArrivalRateEstimator
{
	prior_lambda = null;
	post_lambda  = null;

	constructor(passenger_data)
	{
		const low = 0, high = 5, n = 51;
		const hypos = spreadDots(null, n, low, high);

		this.prior_lambda = new ArrivalRate(hypos);
		this.post_lambda  = this.prior_lambda.Copy();

		passenger_data.forEach( ([k1, y, k2]) => this.post_lambda.Update([y, k2]), this);
	}
}

(function() {

	const title = "8.5 Estimating the arrival rate";

	const passenger_data = [
		//  [k1,   y, k2],
			[17, 4.6,  9],
			[22, 1.0,  0],
			[23, 1.4,  4],
			[18, 5.4, 12],
			[ 4, 5.8, 11]
		];

	const are = new ArrivalRateEstimator(passenger_data);

	/// --- plotting --- ///

	var plotData = [];

	are.prior_lambda.name = "prior λ";
	logSummary(title, are.prior_lambda, "summary_", 'darkmagenta');
	chargePlot(are.prior_lambda, plotData, "line" );

	are.post_lambda.name = "posterior λ";
	logSummary(title, are.post_lambda, "summary_", 'darkmagenta');
	chargePlot(are.post_lambda, plotData, "line" );

	renderPlot(title, plotData, "PMF_chart_", {x:{title:"λ (people/min)"},y:{title:"Probability (PMF)"}});

	var plotData = [];

	chargePlot(are.prior_lambda.MakeCdf("prior λ"), plotData, "line" );
	chargePlot(are.post_lambda.MakeCdf("posterior λ"), plotData, "line" );

	renderPlot(title, plotData, "CDF_chart_", {x:{title:"λ (people/min)"},y:{title:"Probability (CDF)"}});

})();
