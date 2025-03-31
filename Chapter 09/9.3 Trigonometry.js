///////////////////////////////////////////////////////////////////////////////
// 9.3 Trigonometry
//

function StrafingSpeed(alpha, beta, x)
{
	var theta = Math.atan2(x - alpha, beta);
	var speed = beta / Math.cos(theta)**2;
	return speed;
}

function MakeLocationPmf(alpha, beta, locations)
{
	var pmf = new Pmf();
	locations.forEach( (x) => {
		var prob = 1 / StrafingSpeed(alpha, beta, x);
		pmf.Set(x, prob);
	});
	pmf.Normalize();
	return pmf;
}

(function() {

	const title = "9.3 Trigonometry";

	var alpha = 10;

	var plotData = [];

	var beta  = 10;
	var pmf = MakeLocationPmf(alpha, beta, locations);
	pmf.name = `beta = ${beta}`;
	logSummary(title, pmf, "probs_summary_", 'blue');
	chargePlot(pmf, plotData, "line" );

	var beta  = 20;
	var pmf = MakeLocationPmf(alpha, beta, locations);
	pmf.name = `beta = ${beta}`;
	logSummary(title, pmf, "probs_summary_", 'blue');
	chargePlot(pmf, plotData, "line" );

	var beta  = 40;
	var pmf = MakeLocationPmf(alpha, beta, locations);
	pmf.name = `beta = ${beta}`;
	logSummary(title, pmf, "probs_summary_", 'blue');
	chargePlot(pmf, plotData, "line" );

	renderPlot(title, plotData, "probs_chart_", {x:{title:"Distance"},y:{title:`Prob`}});

})();
