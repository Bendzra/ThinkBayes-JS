///////////////////////////////////////////////////////////////////////////////
// 8.6 Incorporating uncertainty
// 
// • Run the analysis for each value of the parameter, and generate a set of
//   predictive distributions.
//
// • Compute a mixture of the predictive distributions, using the weights
//   from the distribution of the parameter.

class WaitMixtureEstimator
{
	mixture = null;
	metapmf = null;

	constructor(wtc, are, num_passengers=15)
	{
		this.metapmf = new Pmf();
		for ( let [lambda, prob] of are.post_lambda.Items() )
		{
			if(lambda == 0) lambda = 0.0000000001;
			const ete = new ElapsedTimeEstimator(wtc, lambda, num_passengers);
			this.metapmf.Set(ete.pmf_y, prob);
		}
		this.mixture = MakeMixture(this.metapmf);
	}
}

(function() {

	const title = "8.6 Incorporating uncertainty";

	const passenger_data = [
		//  [k1,   y, k2],
			[17, 4.6,  9],
			[22, 1.0,  0],
			[23, 1.4,  4],
			[18, 5.4, 12],
			[ 4, 5.8, 11]
		];

	const wtc = new WaitTimeCalculator(pmf_z);
	const are = new ArrivalRateEstimator(passenger_data);
	const wme = new WaitMixtureEstimator(wtc, are);

	var plotData = [];
	wme.mixture.name = "pmf mix";
	logSummary(title, wme.mixture, "summary_", 'brown');
	for(const [pmf, p] of wme.metapmf.Items())
	{
		chargePlot(pmf, plotData, "line", {lineThickness:0.4, lineColor: "grey"} );
	}
	chargePlot(wme.mixture, plotData, "line", {lineThickness:3});
	renderPlot(title, plotData, "pmf_chart_", {x:{title:"Wait Time (min)"},y:{title:"Probability (PMF)"}});

	var plotData = [];

	for(const [pmf, p] of wme.metapmf.Items())
	{
		chargePlot(pmf.MakeCdf(), plotData, "line", {lineThickness:0.4, lineColor: "grey"} );
	}
	chargePlot(wme.mixture.MakeCdf("cdf mix"), plotData, "line", {lineThickness:3});

	renderPlot(title, plotData, "cdf_chart_", {x:{title:"Wait Time (min)"},y:{title:"Probability (CDF)"}});

})();
