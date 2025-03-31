///////////////////////////////////////////////////////////////////////////////
// 9.6 Conditional distributions
//

(function() {

	const title = "9.6 Conditional distributions";

	const suite = new Paintball(alphas, betas, locations, title);
	suite.UpdateSet([15, 16, 18, 21]);

	const [ALPHA, BETA] = [0, 1];

	// the conditional distributions of alpha for a range of values of beta
	const [conditioned, conditioning] = [ALPHA, BETA];

	const cond_betas = [10, 20, 40];

	var plotData = [];

	cond_betas.forEach( (beta) => {
		var cond = suite.Conditional(conditioned, conditioning, beta, `beta = ${beta}`)
		logSummary(title, cond, "cond_summary_", 'red');
		chargePlot(cond, plotData, "line" );
	});
	renderPlot(title, plotData, "cond_chart_", {x:{title:"Distance"},y:{title:`Prob`}});

})();
