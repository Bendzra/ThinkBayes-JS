///////////////////////////////////////////////////////////////////////////////
// 9.7 Credible intervals
//

function MakeCrediblePlot(suite, percentages)
{
	var d = new Map();
	for(var pair of suite.Values()) d.set(pair, 0);

	percentages.forEach( (p) => {
		var interval = suite.MaxLikeInterval(p);
		interval.forEach( (pair) => d.set(pair, d.get(pair) + 1) );
	});
	return d;
}

(function() {

	const title = "9.7 Credible intervals";

	const suite = new Paintball(alphas, betas, locations, title);
	suite.UpdateSet([15, 16, 18, 21]);

	const [ALPHA, BETA] = [0, 1];
	const percentages = [75, 50, 25];

	var d = MakeCrediblePlot(suite, percentages);

	var cdfs = [];
	for( const [ [alpha, beta], count ] of d )
	{
		if(!cdfs[count]) cdfs[count] = new Cdf( [], [], `(${count}) ${percentages[count-1]}%` );
		cdfs[count].xs.push(alpha);
		cdfs[count].ps.push(beta);
	}

	var plotData = [];

	var markerTypes = ["none", "square", "square", "square", "triangle"];

	cdfs.forEach( (cdf, i) => {
		if (i == 0) return;
		chargePlot(cdf, plotData, "scatter", extra={markerSize:20, markerType: markerTypes[i]} );
	});

	renderPlot(title, plotData, "chart_", {x:{title:"alpha"},y:{title:"beta"}});

})();
