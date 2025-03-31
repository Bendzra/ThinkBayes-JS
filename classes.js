///////////////////////////////////////////////////////////////////////////////

class Suite extends Pmf
{
	titleSlug = "titleslug";
	title = null;
	msgDiv = null;

	constructor(hypos=null, title=null, name="")
	{
		super(hypos, name);

		if (hypos && hypos.constructor === Array && hypos.length) this.Normalize();

		this.title = (!title || typeof title !== 'string') ? guid() : title;
		this.titleSlug = slugify(this.title);
		this.CreateDiv();
	};

	CreateDiv(prefix="msg_")
	{
		this.msgDiv = createDiv(prefix, this.titleSlug);
	};

	// @Override
	// Likelihood(data, hypo) {;};

	Update(data)
	{
		for( var [hypo, p] of this.Items() )
		{
			var like = this.Likelihood(data, hypo);
			this.Mult(hypo, like);
		}
		return this.Normalize();
	};

	UpdateSet(dataset)
	{
		dataset.forEach( (data) => {
			for( var [hypo, p] of this.Items() ) {
				var like = this.Likelihood(data, hypo);
				this.Mult(hypo, like);
			}
		}, this);
		return this.Normalize();
	};

	Print(msg=title, given="")
	{
		var given = (given) ? "|" + given : "";
		var s = "<dt>" + msg + ": </dt>";
		for( var [x, p] of this.Items() )
		{
			s += "<dd>P(<b>" + x + given + "</b>) = " + p + ";</dd>"
		}
		this.msgDiv.innerHTML += s;
	};
}

///////////////////////////////////////////////////////////////////////////////

class Pdf
{
	// Represents a continuous probability density function

	name = "";

	constructor(name="") { this.name = name; }

	Density(x) { throw new ReferenceError("Pdf : UnimplementedMethodException"); }

	MakePmf(xs, name="")
	{
		var pmf = new Pmf(null, name);

		xs.forEach( (x) => { pmf.Set(x, this.Density(x)); }, this );

		pmf.Normalize();
		return pmf;
	}
}

class GaussianPdf extends Pdf
{
	// Represents the PDF of a Gaussian distribution

	mu = 0;
	sigma = 1;
	variance2 = 2;
	sqrtDivisor = Math.sqrt(2 * Math.PI);

	constructor(mu, sigma)
	{
		super();
		this.mu = mu;
		this.sigma = sigma;
		this.variance2 = 2 * sigma * sigma;
		this.sqrtDivisor = Math.sqrt(Math.PI * this.variance2);
	}

	Density(x)
	{
		var pow = (this.mu - x) * (x - this.mu) / this.variance2 ;
		var d = Math.exp(pow) / this.sqrtDivisor;
		return d ;
	}
}

class GaussianKde
{
	#mu       = 0;     // expectation (= mean = median)
	#sigma    = 1;     // standard deviation
	#variance = 1;     //
	#iqr      = 27/20; // interquartile range
	#h        = 1.06;  // bandwidth
	#xs       = null;
	#diHH     = 2;
	#diNH     = 0;

	constructor(sample)
	{
		if ( !sample || sample.length < 3 )
		{
			throw new RangeError("Error! Please ensure that there are a minimum of 3 values in your data set.");
		}
		this.#xs = sample.slice(0);
		this.#xs = this.#xs.sort( function(a, b) { return (a - b); } );

		this.setMU( this.estimateMU(this.#xs) );
		this.setSigma( this.estimateSigma(this.#xs, this.#mu) );
		this.setIQR( this.estimateIQR(this.#xs) );
		this.setBandwidth( this.estimateBandwidth(this.#xs, this.#sigma, this.#iqr) );
	}

	setBandwidth(h)
	{
		this.#h = h;
		this.#diHH  = 2 * this.#h * this.#h;
		this.#diNH  = this.#xs.length * this.#h * Math.sqrt(2 * Math.PI);

		console.log ("h = ", this.#h);
	}

	estimateMU(dataset)
	{
		let sum = dataset.reduce((partialSum, a) => partialSum + a, 0);
		return sum / dataset.length;
	}

	setMU(mu)
	{
		this.#mu = mu;
		console.log ("mu = ", this.#mu);
	}

	estimateSigma(dataset, mu)
	{
		let sum = dataset.reduce((partialSum, a) => partialSum + Math.pow(a - mu, 2), 0);
		this.#variance = sum / dataset.length;
		return Math.sqrt(this.#variance);
	}

	setSigma(sigma)
	{
		this.#sigma = sigma;
		this.#variance = sigma * sigma;

		console.log ("sigma = ", this.#sigma);
		console.log ("variance = ", this.#variance);
	}

	estimateBandwidth(dataset, sigma, iqr)
	{
		return 0.9 * Math.min(sigma, iqr/1.34) * Math.pow(dataset.length, -1/5);
	}

	estimateIQR(dataset)
	{
		var l  = dataset.length;
		var r  = l % 2 ;

		var k2 = Math.floor(l / 2);
		var q2 = ( r ) ? q2 = dataset[k2] : (dataset[k2] + dataset[k2-1]) / 2;

		var k1 = Math.floor(k2 / 2);
		var q1 = 0;

		var k3 = k2 + r + k1;
		var q3 = 0;

		if (k2 % 2)
		{
			q1 = dataset[k1];
			q3 = dataset[k3];
		}
		else
		{
			q1 = (dataset[k1] + dataset[k1-1]) / 2;
			q3 = (dataset[k3] + dataset[k3-1]) / 2;
		}
		return q3 - q1;
	}

	setIQR(iqr)
	{
		this.#iqr = iqr;
		console.log ("iqr = ", this.#iqr);
	}

	evaluate(x)
	{
		var y = 0;
		for(var i = 0; i < this.#xs.length; i++)
		{
			y += Math.exp( (this.#xs[i] - x) * (x - this.#xs[i]) / this.#diHH );
		}
		return y / this.#diNH;
	}
}

class EstimatedPdf extends Pdf
{
	// Represents a PDF estimated by KDE

	kde = null;

	constructor(sample)
	{
		super();
		this.kde = new GaussianKde(sample);
	}

	Density(x)
	{
		return this.kde.evaluate(x);
	}
}


///////////////////////////////////////////////////////////////////////////////

const JointMixin = (BasePmf) => class extends BasePmf
{

	// Represents a joint distribution.
	// The values are sequences (usually tuples)

	Marginal(i, name='')
	{
		// Gets the marginal distribution of the indicated variable.
		//    i: index of the variable we want
		//    Returns: Pmf

		var pmf = new Pmf(null, name);
		for( const [vs, prob] of this.Items() ) { pmf.Incr(vs[i], prob); }
		return pmf;
	};

	Conditional(i, j, val, name='')
	{
		// Gets the conditional distribution of the indicated variable.

		// Distribution of vs[i], conditioned on vs[j] = val.

		//   i: index of the variable we want
		//   j: which variable is conditioned on
		// val: the value the jth variable has to have

		// Returns: Pmf

		var pmf = new Pmf(null, name);
		for(const [vs, prob] of this.Items())
		{
			if (vs[j] != val) continue;
			pmf.Incr(vs[i], prob);
		}
		pmf.Normalize();
		return pmf;
	};

	MaxLikeInterval(percentage=90)
	{
		// """Returns the maximum-likelihood credible interval.

		// If percentage=90, computes a 90% CI containing the values
		// with the highest likelihoods.

		// percentage: float between 0 and 100

		// Returns: list of values from the suite

		var interval = [];
		var total = 0;

		var t = [...this.Items()].toSorted( ([val1, prob1], [val2, prob2]) => prob2 - prob1 );

		for(var i = 0; i < t.length; i++)
		{
			const [val, prob] = t[i];
			interval.push(val);
			total += prob;
			if (total >= percentage / 100) break;
		}

		return interval;
	};

}
