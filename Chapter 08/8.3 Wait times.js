///////////////////////////////////////////////////////////////////////////////
// 8.3 Wait times
//
//       Wait time = y = the time between the arrival of a passenger
//                       and the next arrival of a train.
//    Elapsed time = x = the time between the arrival of the previous train
//                       and the arrival of a passenger.
//    so that zb = x + y.
//

class WaitTimeCalculator
{
	pmf_z  =  null;
	pmf_zb =  null;
	pmf_y  =  null;
	pmf_x  =  null;

	constructor(pmf_z)
	{
		this.pmf_z  = pmf_z;
		this.pmf_zb = BiasPmf(pmf_z);
		this.pmf_zb.SortMasses();

		this.pmf_y  = this.PmfOfWaitTime(this.pmf_zb);
		this.pmf_x  = this.pmf_y.Copy();
	};

	PmfOfWaitTime(pmf_zb)
	{
		const metapmf = new Pmf();
		var xs = [];
		for(const [gap, prob] of pmf_zb.Items())
		{
			xs.push(gap);
			var uniform = new Pmf( xs );
			uniform.Normalize();
			metapmf.Set(uniform, prob);
		}
		var pmf_y = MakeMixture(metapmf);
		pmf_y.Normalize();
		pmf_y.SortMasses();

		return pmf_y;
	};

}

(function() {

	const title = "8.3 Wait times";

	var wtCalc = new WaitTimeCalculator(pmf_z);


	/// --- plotting --- ///

	var plotData = [];

	wtCalc.pmf_z.name = "actual (z)";
	logSummary(title, wtCalc.pmf_z, "Wait_times_8_3_summary_", 'indigo');
	chargePlot(wtCalc.pmf_z, plotData, "line" );

	wtCalc.pmf_zb.name = "biased (zb)";
	logSummary(title, wtCalc.pmf_zb, "Wait_times_8_3_summary_", 'indigo');
	chargePlot(wtCalc.pmf_zb, plotData, "line" );

	wtCalc.pmf_y.name = "wait time (y)";
	logSummary(title, wtCalc.pmf_y, "Wait_times_8_3_summary_", 'indigo');
	chargePlot(wtCalc.pmf_y, plotData, "line" );

	renderPlot(title, plotData, "Wait_times_8_3_chart_", {x:{title:"Gaps between trains (min)"},y:{title:"Probability (PMF)"}});

	var plotData = [];

	chargePlot(wtCalc.pmf_z.MakeCdf("z"), plotData, "line" );
	chargePlot(wtCalc.pmf_zb.MakeCdf("zb"), plotData, "line" );
	chargePlot(wtCalc.pmf_y.MakeCdf("y"), plotData, "line" );

	renderPlot(title, plotData, "Wait_times_8_3_cdf_chart_", {x:{title:"Time (min)"},y:{title:"Probability (CDF)"}});

})();
