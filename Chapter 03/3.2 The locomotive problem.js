///////////////////////////////////////////////////////////////////////////////
// 3.2 The locomotive problem
//
// A railroad numbers its locomotives in order 1..N.
// One day you see a locomotive with the number 60.
// Estimate how many locomotives the railroad has?

(function () {

	class Train extends Suite
	{
		constructor(hypoes, title)
		{
			super(hypoes, title);
		};

		Likelihood(data, hypo)
		{
			if (hypo < data) return 0;
			else return 1 / hypo;
		};
	}

	// -------------------- test -------------------- //

	var title = "3.2 The locomotive problem";
	var N = 1000;
	var hypoes = new Array(N); for (var i = 0; i < N; i++) hypoes[i] = i + 1;
	var suite = new Train(hypoes, title);

	suite.Update( 60 );

	/// -------------------- chart ----------------- ///

	var xy = [];
	for(var i = 0; i < hypoes.length; i++)
	{
		xy[i] = { "x": hypoes[i], "y": suite.Prob(hypoes[i])*100 };
	}

	suite.msgDiv.style.cssText = "height: 370px; max-width: 920px; margin: 0px;";

	var chart = new CanvasJS.Chart(suite.msgDiv.id, {
		animationEnabled: false,
		zoomEnabled: true,
		title: {
			text: title
		},
		axisX: {
			title: "Number of trains"
		},
		axisY: {
			title: "Probability",
			suffix: "%"
		},
		data: [{
			type: "line",
			dataPoints: xy
		}]
	});
	chart.render();


	function Mean(suite) {
		var mu = 0;
		for(var i = 0; i < hypoes.length; i++)
		{
			mu += suite.Prob(hypoes[i]) * hypoes[i];
		}
		return mu
	}

	var mean = Mean(suite);

	/// -------------------- draft ------------------ ///

	function MSE(suite, mean)
	{
		var mse = 0, n = 0;
		for(var i = 0; i < hypoes.length; i++)
		{
			if( suite.Prob( hypoes[i] ) != 0 )
			{
				mse += Math.pow( hypoes[i] - mean, 2) ;
				n++;
			}
		}
		mse = mse / n;
		return mse;
	}

	var mse = MSE(suite, mean);
	console.log( title, "; mean = ", mean, "; mse = ", mse );

	suite.name = "mean";
	logSummary(title, suite, "summary_", 'black');

})();
