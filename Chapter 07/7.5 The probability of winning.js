///////////////////////////////////////////////////////////////////////////////
// *** 7.5 The probability of winning ***
//

(function() {

	var title = "7.5 The probability of winning: for Bruins";

	var bruins = new Hockey(title);
	bruins.UpdateSet([0, 2, 8, 4]);

	var canucks = new Hockey(title);
	canucks.UpdateSet([1, 3, 1, 0]);

	var mixBruins  = MakeGoalPmf(bruins);
	var mixCanucks = MakeGoalPmf(canucks);

	var diff = mixBruins.SubtractPmf(mixCanucks);
	diff.SortMasses();

	var p_win  = diff.ProbGreater(0);
	var p_loss = diff.ProbLess(0);
	var p_tie  = diff.Prob(0);

	/// --- plotting --- ///

	var plotData = [];

	diff.name = `p_win = ${p_win}; p_loss = ${p_loss}; p_tie = ${p_tie}`;
	logSummary(title, diff, "diff_mixes_summary_", 'black');

	diff.name = "diff = mixBruins - mixCanucks";
	chargePlot(diff, plotData, "line" );

	renderPlot(title, plotData, "diff_mixes_chart_", {x:{title:"goal diffs"},y:{title:"Probability"}});

})();
