///////////////////////////////////////////////////////////////////////////////
// *** 6.2 The prior ***
//


// --------------- PDF tests --------------- //


(function() {

	var title = "6.4 Representing PDFs";

	var plotData = [];

	const showcases = readShowcases();
	var prices1 = showcases.price1;
	var prices2 = showcases.price2;

	var low = 10000, high = 75000;
	var n   = 1001,  step = (high - low) / (n-1);

	var xs = [];
	for (var i = 0, prev = low; i < n; i++, prev += step)
	{
		xs.push( prev );
	}

	var estPdf1 = new EstimatedPdf(prices1);
	// estPdf1.kde.setBandwidth(1000);
	var pmf1 = estPdf1.MakePmf(xs) ;

	pmf1.name = "showcase 1";
	logSummary(title, pmf1, "summary_showcase_", "grey");
	chargePlot(pmf1, plotData, "line");

	var estPdf2 = new EstimatedPdf(prices2);
	// estPdf2.kde.setBandwidth(1000);

	var pmf2 = estPdf2.MakePmf(xs) ;

	pmf2.name = "showcase 2";
	logSummary(title, pmf2, "summary_showcase_", "grey");
	chargePlot(pmf2, plotData, "line");

	const axes = {
		"x": { "title": "price ($)", suffix: "" },
		"y": { "title": "PDF",       suffix: "" }
	};

	renderPlot(title, plotData, divPrefix="chart_showcase_", axes) ;

})();

