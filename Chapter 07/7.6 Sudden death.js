///////////////////////////////////////////////////////////////////////////////
// *** 7.6 Sudden death ***
//

function MakeGoalTimePmf(suite)
{
	var metapmf = new Pmf();
	for ( const [lambda, prob] of suite.Items() )
	{
		var pmf = MakeExponentialPmf(lambda, high=2, n=2001)
		metapmf.Set(pmf, prob);
	}
	var mix = MakeMixture(metapmf);
	return mix;
}


(function() {

	var title = "7.6 Sudden death: λ";

	var lambda = 3.4;
	var time_dist = MakeExponentialPmf(lambda, high=2, n=101);

	var plotData = [];

	time_dist.name = `Games until goal (λ = ${lambda})`;
	logSummary(title, time_dist, "ExponentialPmf_summary_", 'cyan');
	chargePlot(time_dist, plotData, "line" );

	renderPlot(title, plotData, "ExponentialPmf_chart_", {x:{title:"Games until goal"},y:{title:"Probability"}});

})();

(function() {

	var title = "7.6 Sudden death: Distribution of time between goals";

	var bruins  = new Hockey(title); bruins.UpdateSet([0, 2, 8, 4]);
	var canucks = new Hockey(title); canucks.UpdateSet([1, 3, 1, 0]);

	var time_distBruins  = MakeGoalTimePmf(bruins);
	var time_distCanucks = MakeGoalTimePmf(canucks);

	var p_overtime = PmfProbLess(time_distBruins, time_distCanucks);

	var mixBruins  = MakeGoalPmf(bruins);
	var mixCanucks = MakeGoalPmf(canucks);

	var diffGoals = mixBruins.SubtractPmf(mixCanucks);

	var p_tie = diffGoals.Prob(0);
	var p_win = diffGoals.ProbGreater(0) + p_tie * p_overtime;

	// To win the series:

	let p_series = p_win * p_win;
	p_series += 2 * p_win * (1 - p_win) * p_win;

	/// --- plotting --- ///

	var plotData = [];

	time_distBruins.name = `Bruins winning game: overtime = ${p_overtime}; overall = ${p_win}; series = ${p_series}`;
	logSummary(title, time_distBruins, "MakeGoalTimePmf_summary_", 'blue');

	time_distBruins.name = "bruins";
	chargePlot(time_distBruins, plotData, "line" );

	time_distCanucks.name = "canucks";
	logSummary(title, time_distCanucks, "MakeGoalTimePmf_summary_", 'blue');
	chargePlot(time_distCanucks, plotData, "line" );

	renderPlot(title, plotData, "MakeGoalTimePmf_chart_", {x:{title:"Games until goal"},y:{title:"Probability"}});

})();
