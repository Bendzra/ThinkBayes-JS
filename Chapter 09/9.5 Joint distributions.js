///////////////////////////////////////////////////////////////////////////////
// 9.5 Joint distributions
//

(function() {

	const title = "9.5 Joint distributions";

	const suite = new Paintball(alphas, betas, locations, title);
	suite.UpdateSet([15, 16, 18, 21]);

	var marginal_alpha = suite.Marginal(0, "marginal_alpha");
	var marginal_beta  = suite.Marginal(1, "marginal_beta");

	var plotData = [];

	logSummary(title, marginal_alpha, "probs_summary_", 'red');
	chargePlot(marginal_alpha, plotData, "line" );

	logSummary(title, marginal_beta, "probs_summary_", 'red');
	chargePlot(marginal_beta, plotData, "line" );

	renderPlot(title, plotData, "probs_chart_", {x:{title:"Distance"},y:{title:`Prob`}});

})();
