///////////////////////////////////////////////////////////////////////////////
// *** 5.6 Mixtures ***
//
// Suppose I have a box of dice with the following inventory:
// 		5	 4-sided dice
// 		4	 6-sided dice
// 		3	 8-sided dice
// 		2	12-sided dice
// 		1	20-sided die
// I choose a die from the box and roll it. ... the resulting distribution is
// a mixture of uniform distributions with different bounds

(function () {

	var title = "5.6 Mixtures";

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

	// --------------------------- Tests ------------------------- //


	(function () {

		// --------------------- only two dice --------------------- //

		var plotData = [];

		var d6 = new Die(6);
		var d8 = new Die(8);

		var mix = new Pmf();
		[d6, d8].forEach( (die) => {
			for( const [outcome, prob] of die.Items() ) mix.Incr(outcome, prob);
		});
		mix.Normalize()


		mix.name = "only two dice";
		logSummary(title, mix, "summary1_", "magenta");
		chargePlot(mix, plotData, "column");
		renderPlot(title, plotData, divPrefix="chart1_");

	})();

	(function () {

		// ------------------- all dice -------------------- //

		var plotData = [];

		var pmfDice = new Pmf();
		pmfDice.Set(new Die(4),  5);
		pmfDice.Set(new Die(6),  4);
		pmfDice.Set(new Die(8),  3);
		pmfDice.Set(new Die(12), 2);
		pmfDice.Set(new Die(20), 1);
		pmfDice.Normalize();

		var mix = new Pmf();

		for ( const [die, weight] of pmfDice.Items() )
		{
			for( const [outcome, prob] of die.Items() )
			{
				mix.Incr(outcome, weight*prob);
			}
		}

		mix.name = 'all "weighted" dice';
		logSummary(title, mix, "summary2_", "magenta");
		chargePlot(mix, plotData, "column");
		renderPlot(title, plotData, divPrefix="chart2_");


		// ------------------- same dice -------------------- //

		var plotData = [];

		var mix = MakeMixture( pmfDice );

		mix.name = 'same "weighted" dice';
		logSummary(title, mix, "summary3_", "magenta");
		chargePlot(mix, plotData, "column");
		renderPlot(title, plotData, divPrefix="chart3_");

	})();

})();