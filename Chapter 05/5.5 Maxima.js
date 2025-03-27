///////////////////////////////////////////////////////////////////////////////
// *** 5.5 Maxima ***
//
// maximum of several rolls of three dice
// There are three ways to compute the distribution of a maximum:
//
// Simulation: Given a Pmf that represents the distribution for a single selec-
// tion, you can generate random samples, find the maximum, and accu-
// mulate the distribution of simulated maxima.
//
// Enumeration: Given two Pmfs, you can enumerate all possible pairs of values
// and compute the distribution of the maximum.
//
// Exponentiation: If we convert a Pmf to a Cdf, there is a simple and eficient
// algorithm for finding the Cdf of the maximum.

(function () {

	var title = "5.5 Maxima";

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

	// -------------------- Maxes -------------------- //

	function RandomMax(dists)
	{
		var m = -Infinity;
		for(var i = 0; i < dists.length; i++)
		{
			var r = dists[i].Random();
			if(m < r) m = r;
		}
		return m;
	}

	function SampleMax(dists, n)
	{
		var arr = [];
	    for(var i = 0; i < n; i++)
		{
			arr.push( RandomMax(dists) );
		}
		var pmf = MakePmfFromList(  arr  );
		return pmf;
	}

	function PmfMax(pmf1, pmf2)
	{
		var res = new Pmf();

        for(const [x1, p1] of pmf1.Items())
        {
        	for (const [x2, p2] of pmf2.Items())
        	{
				res.Incr( Math.max(x1, x2), p1 * p2 );
			}
		}
		return res;
	}

	(function () {

		// ---------------------- simulation ---------------------- //

		var N = 7*1000;
		var d6 = new Die();
		var nDice = 3;
		var plotData = [];

		var dice = []; for(var i = 0; i < nDice; i++) dice.push(d6);

		var maxThree = SampleMax(dice, N);

		maxThree.name = N + " simulations";
		logSummary(title, maxThree, "summary_", "red");
		chargePlot(maxThree, plotData);

		// ------------------------ exact ------------------------ //

		var maxThreeExact = d6;
		for(var i = 1; i < nDice; i++)
		{
			maxThreeExact = PmfMax(maxThreeExact, d6);
		}
		maxThreeExact.name = "exact";
		logSummary(title, maxThreeExact, "summary_", "red");
		chargePlot(maxThreeExact, plotData);

		// --- ----- --- //

		renderPlot(title, plotData, divPrefix="sim_exact_chart_");

	})();

	(function () {

		var d6 = new Die();
		var nDice = 3;
		var nRolls = 6;
		var plotData = [];

		var dice = []; for(var i = 0; i < nDice; i++) dice.push(d6);

		// "3" dice sum distribution :
		var three_exact = d6; for (var i = 1; i < nDice; i++) three_exact = three_exact.AddPmf(d6);

		// "6" sums max distribution :
		var best_attr_cdf = three_exact.Max(nRolls);
		var best_attr_pmf = best_attr_cdf.MakePmf();

		best_attr_pmf.name = nRolls + " rolls " + nDice + " dice (cdf: exact)";
		logSummary(title, best_attr_pmf, "summary2_", "green");
		chargePlot(best_attr_pmf, plotData);

		// --- ----- --- //

		renderPlot(title, plotData, divPrefix="exact_chart2_");

	})();

	(function () {

		// "Три" кости бросаем "шесть" раз, подсчитываем суммы для каждого раза,
		// и выбираем макисмальную сумму. Строим распределение для этого максимума

		var N = 7*1000;
		var d6 = new Die();
		var nDice = 3;
		var nRolls = 6;
		var plotData = [];

		var dice = []; for(var i = 0; i < nDice; i++) dice.push(d6);

		// ---------------------- simulation ---------------------- //

		function RandomSumMax(dists, nRolls)
		{
			var m = -Infinity;
			for(var i = 0; i < nRolls; i++)
			{
				var r = RandomSum(dists);
				if(m < r) m = r;
			}
			return m;
		}

		function SampleSumMax(dists, nRolls, n)
		{
			var arr = [];
		    for(var i = 0; i < n; i++)
			{
				arr.push( RandomSumMax(dists, nRolls) );
			}
			var pmf = MakePmfFromList(  arr  );
			return pmf;
		}

		var simRolls = SampleSumMax(dice, nRolls, N);

		simRolls.name = nRolls + " rolls " + nDice + " dice (" + N + " simulations)";
		logSummary(title, simRolls, "summary3_", "blue");
		chargePlot(simRolls, plotData);

		// ------------------------ exact ------------------------ //

		var diceSum = d6;
		for(var i = 1; i < nDice; i++) diceSum = diceSum.AddPmf(d6);

		var exactRolls = diceSum;
		for(var i = 0; i < nRolls; i++) exactRolls = PmfMax(exactRolls, diceSum);

		exactRolls.name = nRolls + " rolls " + nDice + " dice (exact)";
		logSummary(title, exactRolls, "summary3_", "blue");
		chargePlot(exactRolls, plotData);

		// --- ----- --- //

		renderPlot(title, plotData, divPrefix="sim_exact_chart3_");

	})();
})();