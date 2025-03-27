///////////////////////////////////////////////////////////////////////////////
// 4.1 The Euro problem
//
// When spun on edge 250 times,
// a Belgian one-euro coin came up heads 140 times and tails 110.
// If a coin is perfectly balanced, we expect Prob. to be close to 50%,
// but for a lopsided coin, Prob. might be substantially different.
// We can use Bayes's theorem and the observed data to estimate Prob.

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

	var title = "4.1 The Euro problem";
	var hypoes = new Array(101); for(var i = 0; i < 101; i++) hypoes[i] = i;
	
	var suite = new Euro(hypoes, title);
	
	var dataset = [];
	for(var i = 0; i < 140; i++) dataset[i]= 'H';
	for(var i = 0; i < 110; i++) dataset.push('T');
	
	for(var i = 0; i < dataset.length; i ++)
	{
		var data = dataset[i];
		suite.Update(data);
	}

	var xy = []; // [{"x": hypo, "y": Prob}, ....]
	for(var i = 0; i < hypoes.length; i++)
	{
		xy[i] = { "x": hypoes[i], "y": suite.Prob(hypoes[i]) };
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
			type: "line",
			showInLegend: true,
			legendText: "uniform",
			dataPoints: xy
		}]
	});
	chart.render();

	/// print out:
	console.log( " ---- " + title + " ---- ");
	suite.msgDiv.innerHTML += "<dt>" + title + ":</dt>"

})();
