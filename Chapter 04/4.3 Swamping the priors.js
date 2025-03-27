///////////////////////////////////////////////////////////////////////////////
// 4.3 Swamping the priors
//
// It might be more reasonable to choose a prior that gives higher probability to
// values of x near 50% and lower probability to extreme values.

(function () {

	class Euro extends Suite
	{
		constructor(hypoes, title)
		{
			super(hypoes, title);
		};

		Likelihood(data, hypo)
		{
			var x = parseInt( hypo, 10 ) ;
			if (data == 'H') return x / 100;
			else return 1 - x / 100;
		}
	}

	// -------------------- test -------------------- //

	var title = "4.3 Swamping the priors";
	var hypoes = new Array(101); for(var i = 0; i < 101; i++) hypoes[i] = i;
	
	var suite = new Euro(hypoes, title);
	
	// As an example, I constructed a triangular prior
	function TrianglePrior(suite)
	{
		for (var x = 0; x < 51; x++) suite.Set(x, x);
		for (var x = 51; x < 101; x++) suite.Set(x, 100-x)
		suite.Normalize()
	};
	
	// reInit suite
	TrianglePrior(suite);

	var xyPrior = []; // [{"x": hypo, "y": Prob}, ....]
	for(var i = 0; i < hypoes.length; i++)
	{
		xyPrior[i] = { "x": hypoes[i], "y": suite.Prob(hypoes[i]) };
	}
	
	var dataset = [];
	for(var i = 0; i < 140; i++) dataset[i]= 'H';
	for(var i = 0; i < 110; i++) dataset.push('T');
	
	for(var i = 0; i < dataset.length; i ++)
	{
		var data = dataset[i];
		suite.Update(data);
	}

	var xyPosterior = []; // [{"x": hypo, "y": Prob}, ....]
	for(var i = 0; i < hypoes.length; i++)
	{
		xyPosterior[i] = { "x": hypoes[i], "y": suite.Prob(hypoes[i]) };
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
			horizontalAlign: "right", // left, center ,right 
			verticalAlign: "top",  // top, center, bottom
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
		data: [{
			name: "Prior Triangle",
			type: "line",
			showInLegend: true,
			legendText: "prior triangle",
			dataPoints: xyPrior
		},
		{
			name: "Posterior of Triangle",
			type: "line",
			showInLegend: true,
			legendText: "posterior",
			dataPoints: xyPosterior
		}]
	});
	chart.render();

	/// --- summary print out --- ///
	
	console.log( " ---- " + title + " ---- ");
	var maximumLikelihood = suite.MaximumLikelihood();
	var mean = suite.Mean();
	var cdf = suite.MakeCdf();
	var median = cdf.Percentile(50);
	var credibleInterval = JSON.stringify( cdf.CredibleInterval(90) );
	
	console.log( "Maximum Likelihood = ", maximumLikelihood );
	console.log( "Mean = ", mean );
	console.log( "Median = ", median );
	console.log( "Credible Interval = ", credibleInterval );
	
	suite.msgDiv.innerHTML += "<dt>" + title + ":</dt>"
							+ "<dd>" + "Maximum Likelihood = " + maximumLikelihood + ";</dd>"
							+ "<dd>" + "Mean = " + mean + ";</dd>"
							+ "<dd>" + "Median = " + median + ";</dd>"
							+ "<dd>" + "Credible Interval = " + credibleInterval + ";</dd>";
	

})();
