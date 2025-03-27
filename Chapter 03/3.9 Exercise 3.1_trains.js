/*
	Exercise 3.1
	Suppose that there are many companies with different numbers of
	trains. And suppose that you are equally likely to see any train operated by
	any company. In that case, the likelihood function is diferent because you are
	more likely to see a train operated by a large company.
	As an exercise, implement the likelihood function for this variation of the
	locomotive problem, and compare the results.
*/

(function () {

	class Train extends Suite
	{
		trainsCount = 0;
		constructor(hypoes, title, name="", alpha=1)
		{
			super(hypoes, title, name);
			this.trainsCount = 0;

			for(var i = 0; i < hypoes.length; i++)
			{
				// this.Set( hypoes[i], Math.pow( hypoes[i], -alpha ) );
				this.Set( hypoes[i], 1 );
				this.trainsCount += hypoes[i];
			}
			this.Normalize();
		};

		Likelihood(data, hypo)
		{
			if (hypo < data) return 0;
			else return hypo / this.trainsCount  // the probability of seeing any train of any company is equal
		};

		Mean()
		{
			var total = 0;
			for ( var [hypo, prob] of this.GetDict() ) total += hypo * prob;
			return total;
		};
	}

	// -------------------- test -------------------- //

	var title = "Exercise 3.1. Train Companies";

	var trains = [50, 60, 70, 80, 90, 100, 500, 1000]; // companies ( train number )
	var hypoes = trains.slice(0);
	var dataset = [60];

	var suite = new Train(hypoes, title, "Train Companies");
	suite.Print( title + " (<i>prior</i>)", "" );
	suite.msgDiv.innerHTML += "<dd>" + "mean of prior = " + suite.Mean() + "</dd>" ;

	for(var i = 0; i < dataset.length; i++)
	{
		suite.Update( dataset[i] );
	}
	suite.Print( title + " (<i>posterior</i>)", dataset );
	suite.msgDiv.innerHTML += "<dd>" + "mean of posterior = " + suite.Mean() + "</dd>" ;

	var plotData=[];
	chargePlot(suite, plotData, "column");
	renderPlot(title, plotData, "chart_trains_");

})();
