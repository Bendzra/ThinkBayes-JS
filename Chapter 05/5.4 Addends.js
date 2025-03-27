///////////////////////////////////////////////////////////////////////////////
// *** 5.4 Addends ***
//
// rolling three 6-sided dice and adding them up.
//
// There are two ways you might compute it:
//
// Simulation: Given a Pmf that represents the distribution for a single die, you
// can draw random samples, add them up, and accumulate the distribution
// of simulated sums.
//
// Enumeration: Given two Pmfs, you can enumerate all possible pairs of values
// and compute the distribution of the sums.

(function () {

	var title = "5.4 Addends";

	function Die(sides=6, title="", name="")
	{
		Pmf.call(this, null, name);

		function init(self, sides)
		{
			for(var x = 1; x < sides+1; x++) self.Set(x, 1);
			self.Normalize();
		}
		init(this, sides);
	}

	// -------------------- test -------------------- //

	// --- simulation --- //

	var N = 7*1000;
	var plotData = [];

	var d6 = new Die();
	var dice = [d6, d6, d6];

	var three = SampleSum(dice, N);

	three.name = N + " simulations";
	logSummary(title, three, "summary_");
	chargePlot(three, plotData);


	// --- exact --- //

	var three_exact = d6;
	three_exact = three_exact.AddPmf(d6);
	three_exact = three_exact.AddPmf(d6);

	three_exact.name = "exact";
	logSummary(title, three_exact, "summary_");
	chargePlot(three_exact, plotData);

	// --- ----- --- //

	renderPlot(title, plotData, divPrefix="sim_exact_chart_");

})();