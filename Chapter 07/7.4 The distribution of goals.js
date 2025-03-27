///////////////////////////////////////////////////////////////////////////////
// *** 7.4 The distribution of goals ***
//

function MakeGoalPmf(suite)
{
	var metapmf = new Pmf();
	for ( const[lambda, prob] of suite.Items())
	{
		var pmf = MakePoissonPmf(lambda, 10);
		metapmf.Set(pmf, prob);
	}
	var mix = MakeMixture(metapmf);
	return mix;
}

(function() {

	var title = "7.4 The distribution of goals: PoissonPmf";

	var lambda = 3.4;
	var goal_dist =MakePoissonPmf(lambda, 10);

	/// --- plotting --- ///

	var plotData = [];

	goal_dist.name = `PoissonPmf(λ = ${lambda})`;
	logSummary(title, goal_dist, "PoissonPmf_summary_", 'green');
	chargePlot(goal_dist, plotData, "line" );


	renderPlot(title, plotData, "PoissonPmf_chart_", {x:{title:"goals"},y:{title:"Probability"}});

})();

(function() {

	var title = "7.4 The distribution of goals: PoissonPmfs mixture";

	var bruins = new Hockey(title);
	bruins.UpdateSet([0, 2, 8, 4]);

	var canucks = new Hockey(title);
	canucks.UpdateSet([1, 3, 1, 0]);

	var mixBruins  = MakeGoalPmf(bruins);
	var mixCanucks = MakeGoalPmf(canucks);

	/// --- plotting --- ///

	var plotData = [];

	mixBruins.name = `mixBruins`;
	logSummary(title, mixBruins, "mix_PoissonPmfs_summary_", 'black');
	chargePlot(mixBruins, plotData, "line" );

	mixCanucks.name = `mixCanucks`;
	logSummary(title, mixCanucks, "mix_PoissonPmfs_summary_", 'black');
	chargePlot(mixCanucks, plotData, "line" );

	renderPlot(title, plotData, "mix_PoissonPmfs_chart_", {x:{title:"goals"},y:{title:"Probability"}});

})();
