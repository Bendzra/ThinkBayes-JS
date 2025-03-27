///////////////////////////////////////////////////////////////////////////////
// 4.7 Exercise 4.1
//
// Exercise 4.1 Suppose that instead of observing coin tosses directly, you mea-
// sure the outcome using an instrument that is not always correct. Specifically,
// suppose there is a probability y that an actual heads is reported as tails, or
// actual tails reported as heads.
//
// Write a class that estimates the bias of a coin given a series of outcomes and
// the value of y.
//
// How does the spread of the posterior distribution depend on y?

(function () {

	class Euro extends Suite
	{
		y = 0;

		constructor(hypoes, title, y)
		{
			super(hypoes, title);
			this.y = y;
		};

		Likelihood(data, hypo)
		{
			var x = parseInt( hypo, 10 ) / 100 ;
			if (data == 'H') return x * (1 - this.y) + (1 - x) * this.y ;
			else return (1 - x) * (1 - this.y) + x * this.y;
		}
	}

	// -------------------- test -------------------- //

	var title = "4.7 Exercise 4.1_instrument";
	
	var heads = 140;
	var tails = 110;

	function initDataset(hypoes)
	{
		for(var i = 0; i < 101; i++) hypoes[i] = i;
		var dataset = [];
		for(var i = 0; i < heads; i++) dataset[i]= 'H';
		for(var i = 0; i < tails; i++) dataset.push('T');
		return dataset;
	};

	function printOut(suite)
	{
		/// print out:

		const bold = "font-weight: bold";
		const normal = "font-weight: normal";
		console.log( "< %c%s%c >", bold, title, normal);

		var maximumLikelihood = suite.MaximumLikelihood();
		var mean = suite.Mean().toFixed(2);
		var cdf = suite.MakeCdf();
		var median = cdf.Percentile(50);
		var credibleInterval = JSON.stringify( cdf.CredibleInterval(90) );

		console.log( "y = ", suite.y );
		console.log( "Maximum Likelihood = ", maximumLikelihood );
		console.log( "Mean = ", mean );
		console.log( "Median = ", median );
		console.log( "Credible Interval = ", credibleInterval );

		suite.msgDiv.innerHTML += "<dt>" + title + ":</dt>"
								+ "<dd>" + "y = " + suite.y + ";</dd>"
								+ "<dd>" + "Maximum Likelihood = " + maximumLikelihood + ";</dd>"
								+ "<dd>" + "Mean = " + mean + ";</dd>"
								+ "<dd>" + "Median = " + median + ";</dd>"
								+ "<dd>" + "Credible Interval = " + credibleInterval + ";</dd>";
	};
	
	/// ------------- Euro (y) ------------- ///
	
	(function () {
		var ys = [0.0, 0.1, 0.2, 0.3];
		var chartData = [];
		
		for(var k = 0; k < ys.length; k++)
		{
			var y = ys[k];
			var hypoes  = new Array(101);
			var dataset = initDataset(hypoes);
			var suite   = new Euro(hypoes, title, y);
			
			for(var i = 0; i < dataset.length; i ++)
			{
				var data = dataset[i];
				suite.Update(data);
			}
			printOut(suite);
			
			var d = {
				type: "line",
				showInLegend: true,
				legendText: "y = " + y,
				dataPoints: []
			};
			for(var i = 0; i < hypoes.length; i++)
			{
				d.dataPoints[i] = { "x": hypoes[i], "y": suite.Prob(hypoes[i]) };
			}
			chartData.push(d);
			
			simulate(y);

		}
		
		/// --- chart --- ///

		var chartDiv = createDiv("chart_", suite.titleSlug);
		chartDiv.style.cssText = "height: 370px; max-width: 920px; margin: 0px;";

		var chart = new CanvasJS.Chart(chartDiv.id, {
			animationEnabled: false,
			zoomEnabled: true,
			title: {
				text: title
			},
			legend: {
				horizontalAlign: "right",
				verticalAlign: "top",
				dockInsidePlotArea: true 
			},
			axisX: {
				title: "x",
				suffix: "%"
			},
			axisY: {
				title: "Probability",
				suffix: ""
			},
			data: chartData
		});
		chart.render();

	})();

	/// ------------- simulation ------------- ///

	function simulate(y)
	{
		var P = heads / (heads + tails);
		var N = 2 * 1000 * 1000;
		var hs = 0;
		
		function reportEvent()
		{
			var head = (Math.random() < P) ;
			var err = (Math.random() < y);
			head = (head) ? !err : err;
			return head;
		};
		
		for(var i = 0; i < N; i++)
		{
			hs += reportEvent();
		}
		
		console.log('P(H) = ', (hs / N).toFixed(2), (P * (1 - y) + (1 - P) * y).toFixed(2) );
	}
	
})();
