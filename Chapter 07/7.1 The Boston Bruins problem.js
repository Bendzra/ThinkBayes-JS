///////////////////////////////////////////////////////////////////////////////
// *** 7.1 The Boston Bruins problem ***
//

// --------------- Gaussian Prior --------------- //


(function() {

	class Hockey extends Suite
	{
		constructor(title, mu=2.7, sigma=0.3, num_sigmas=4, n=201, name="")
		{
			super(null, title, name);

			var pmf = MakeGaussianPmf(mu, sigma, num_sigmas, n);
			this.SetDict( pmf.GetDict() );
		}
	}

	var title = "7.1 The Boston Bruins problem";

	var plotData = [];

	var hockey = new Hockey(title);

	hockey.name = "gaussian hypoes = average goals per game (λ)";
	logSummary(title, hockey, "gaussian_lambda_hypoes_summary_", 'cyan');
	chargePlot(hockey, plotData, "line" );

	renderPlot(title, plotData, "gaussian_lambda_hypoes_chart_", {x:{title:"average goals per game (λ)"},y:{title:"Prob"}});

})();

