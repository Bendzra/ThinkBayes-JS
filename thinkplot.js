/////////////////////////////////////////////////////////////////

function createDiv(prefix, titleSlug, className="info")
{
	var id = prefix + titleSlug;
	var oDiv = document.getElementById(id);
	if ( oDiv ) return oDiv;

	oDiv = document.createElement("div");
	oDiv.setAttribute("class", className);
	oDiv.setAttribute("id", id);
	document.body.appendChild(oDiv);
	return oDiv;
}

function slugify(text)
{
	return text
		.toString()                     // Cast to string
		.toLowerCase()                  // Convert the string to lowercase letters
		.normalize('NFD')       		// The normalize() method returns the Unicode Normalization Form of a given string.
		.trim()                         // Remove whitespace from both sides of a string
		.replace(/\s+/g, '-')           // Replace spaces with -
		.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
		.replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

function jsFileName()
{
	var currentScriptFileName = null;
	var scripts = document.getElementsByTagName("script");
	var currentScriptUrl = (document.currentScript || scripts[scripts.length - 1]).src;
	var re = /\/([^\/]+)\.js$/i;
	var arr = re.exec(currentScriptUrl);
	if(arr) currentScriptFileName = arr[1];
	return currentScriptFileName;
}

function guid()
{
	var currentScriptFileName = jsFileName();
	if(currentScriptFileName) return currentScriptFileName;

	function _p8(s)
	{
		var p = ( Math.random().toString(16) + "000000000").substr(2,8);
		return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
	}
	return _p8() + _p8(true) + _p8(true) + _p8();
}

function logSummary(title, suite, divPrefix="summary_", boldColor='black')
{
	/// print out:

	var subtutle = suite.name;
	const bold = "font-weight: bold; color: " + boldColor + ";" ;
	const normal = "font-weight: normal; color: black;" ;
	console.log( "< %c%s%c >", bold, title, normal);

	if(subtutle) console.log( "\t", subtutle);

	var log = {}, v = null;
	var cdf = suite.MakeCdf();

	log.maximumLikelihood = {'v': (v = suite.MaximumLikelihood()), 'p': fixFloat(suite.Prob(v))};
	log.mean = {'v': (v = suite.Mean()), 'p': fixFloat(suite.Prob(v))};
	log.median = {'v': (v = cdf.Percentile(50)), 'p': fixFloat(suite.Prob(v))};
	log.credibleInterval = {
		'v': JSON.stringify( v = cdf.CredibleInterval(90) ),
		'p': JSON.stringify( [ fixFloat(suite.Prob(v[0])), fixFloat(suite.Prob(v[1])) ] )
	};

	var html = "";
	for (var prop in log)
	{
	    if (Object.prototype.hasOwnProperty.call(log, prop))
	    {
	    	var s = `${prop} = ${log[prop].v}, Prob = ${log[prop].p}`;
	    	html += "<dd>" + s + ";</dd>"
	        console.log( s );
	    }
	}

	var infoDiv = (divPrefix) ? createDiv( divPrefix, slugify(guid()) ) : suite.msgDiv;
	var subtutle = ( (subtutle) ? " (<b>" + subtutle + "</b>)" : "" )
	infoDiv.innerHTML += "<dt>" + title + subtutle + ":</dt>" + html;
};

/////////////////////////////////////////////////////////////////

function chargePlot(suite, plotData=[], type="line", extra={lineThickness:2})
{
	var legendText = suite.name;
	const d = { type: type, showInLegend: false };
	if (legendText)
	{
		d.showInLegend = true;
		d.legendText = legendText;
	}
	const xy = [];
	for(const [x, p] of suite.Items()) xy.push({ "x": x, "y": p });
	d.dataPoints = xy;

	for (let key in extra) if (extra.hasOwnProperty(key)) d[key] = extra[key];

	plotData.push(d);

	return plotData;
}

function renderPlot(title, plotData, divPrefix="chart_", axes={})
{
	/// --- chart --- ///

	var chartDiv = createDiv( divPrefix, slugify(guid()) );
	chartDiv.style.cssText = "height: 370px; max-width: 920px; margin: 0px;";

	var o = {
		x: { title: "Hypotheses",  suffix:"" },
		y: { title: "Probability", suffix:"" }
	};

	if(typeof axes === 'object' && !Array.isArray(axes) && axes !== null)
	{
		if( !(axes.x) ) o.x = { title: "Hypotheses",  suffix:"" };
		else
		{
			o.x.title  = ( !(axes.x.title) )  ? "Hypotheses" : axes.x.title;
			o.x.suffix = ( !(axes.x.suffix) ) ? ""           : axes.x.suffix;
		}
		if( !(axes.y) ) o.y = { title: "Probability", suffix:"" };
		else
		{
			o.y.title  = ( !(axes.y.title) )  ? "Probability" : axes.y.title;
			o.y.suffix = ( !(axes.y.suffix) ) ? ""            : axes.y.suffix;
		}
	}

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
			title: o.x.title,
			suffix: o.x.suffix
		},
		axisY: {
			title: o.y.title,
			suffix: o.y.suffix
		},
		data: plotData
	});
	chart.render();
}
