///////////////////////////////////////////////////////////////////////////////
// 8.2 The model
//
// The average time between trains seen by a random passenger coming to the platform,
// is substantially higher than the true average observed by a static inspector
//

function BiasPmf(pmf, name="")
{
	var newPmf = pmf.Copy(name);
	for ( var [x, p] of pmf.Items() )
	{
		newPmf.Set(x, x*p);
	}
	newPmf.Normalize();
	return newPmf;
}

const observed_gap_times = [
    428, 705, 407, 465, 433, 425, 204, 506, 143, 351,
    450, 598, 464, 749, 341, 586, 754, 256, 378, 435,
    176, 405, 360, 519, 648, 374, 483, 537, 578, 534,
    577, 619, 538, 331, 186, 629, 193, 360, 660, 484,
    512, 315, 457, 404, 740, 388, 357, 485, 567, 160,
    428, 387, 901, 187, 622, 616, 585, 474, 442, 499,
    437, 620, 351, 286, 373, 232, 393, 745, 636, 758,
];

const zs   = observed_gap_times.map((x) => x / 60);

var pdf_z  = new EstimatedPdf(zs);
var qs     = spreadDots(zs, 101, 0, 20);
var pmf_z  = pdf_z.MakePmf(qs);

var pmf_zb = BiasPmf(pmf_z);


(function() {

	const title = "8.2 The model";

	/// --- plotting --- ///

	var plotData = [];

	pmf_z.name = "actual (z)";
	logSummary(title, pmf_z, "observer_8_2_summary_", 'blue');
	chargePlot(pmf_z, plotData, "line" );

	pmf_zb.name = "biased (zb)";
	logSummary(title, pmf_zb, "observer_8_2_summary_", 'blue');
	chargePlot(pmf_zb, plotData, "line" );

	renderPlot(title, plotData, "observer_8_2_chart_", {x:{title:"Gaps between trains (min)"},y:{title:"Probability (PMF)"}});

})();