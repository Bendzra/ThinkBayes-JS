///////////////////////////////////////////////////////////////////////////////
// *** 7.3 The posteriors ***
//

class Hockey extends Suite
{
	constructor(title, mu=2.8, sigma=0.3, num_sigmas=4, n=201, name="")
	{
		super(null, title, name);

		var pmf = MakeGaussianPmf(mu, sigma, num_sigmas, n);
		this.SetDict( pmf.GetDict() );
	}

	Likelihood(data, hypo)
	{
		var lambda = hypo;
		var k = data;
		var like = EvalPoissonPmf(k, lambda);
		return like;
	}
}

(function() {

	var title = "7.3 The posteriors";


	var bruins = new Hockey(title);
	bruins.UpdateSet([0, 2, 8, 4]);

	var canucks = new Hockey(title);
	canucks.UpdateSet([1, 3, 1, 0]);


	/// --- plotting --- ///

	var plotData = [];

	bruins.name = "bruins";
	logSummary(title, bruins, "posterior_summary_", 'magenta');
	chargePlot(bruins, plotData, "line" );

	canucks.name = "canucks";
	logSummary(title, canucks, "posterior_summary_", 'magenta');
	chargePlot(canucks, plotData, "line" );

	renderPlot(title, plotData, "posterior_chart_", {x:{title:"goals per game"},y:{title:"Probability"}});

})();

