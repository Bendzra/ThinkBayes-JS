function _DictWrapper(values=null, name="")
{
	// _DictWrapper: private parent class for Hist and Pmf
	// An object that contains a dictionary

	this.name = "";
	this.d    = null;

	function init(self, values=null, name="")
	{
		self.name = name;
		self.d = new Map();

		if (!values) return;

		if ( values.constructor === Array )
		{
			self.InitSequence(values);
		}
		else if (typeof values["GetDict"] == "function" && typeof values["Items"] == "function")
		{
			self.InitPmf(values);
		}
	};

	this.InitSequence = function(values)
	{
		// Initializes with a sequence of equally-likely values.
		//     values: sequence of values

		values.forEach( (v) => this.Set(v, 1), this );
	};

	this.InitPmf = function(values)
	{
		// Initializes with a Pmf
		//     values: Pmf object

		for (const [value, prob] of values.Items())
			this.Set(value, prob);
	};

	this.Set = function(x, y=0)
	{
		// Sets the freq/prob associated with the value x

		// Args:
		//     x: number value
		//     y: number freq or prob

		this.d.set(x, y);
	};

	init(this, values, name);

	this.Get = function(x, deflt=undefined)
	{
		// Gets the freq/prob associated with the value x
		// or deflt (if undefined)

		return this.d.has(x) ? this.d.get(x) : deflt;
	};

	this.Incr = function(x, term=1)
	{
		// Increments the freq/prob associated with the value x.
		//   x: number value
		//   term: how much to increment by

		this.Set(x, this.Get(x, 0) + term);
	};

	this.Values = function()
	{
		// Gets an unsorted sequence of values

		// Note: one source of confusion is that the keys of this
		// dictionary are the values of the Hist/Pmf, and the
		// values of the dictionary are frequencies/probabilities.

		return this.d.keys();
	};

	this.Remove = function(x)
	{
		// Removes a value.
		//    Throws an exception if the value is not there.
		//    x: value to remove

		if ( !this.d.delete(x) ) throw new RangeError(`the value (${x}) is not there`);
	};

	this.GetDict = function()
	{
		// Gets the dictionary (= map)
		return this.d;
	};

	this.SetDict = function(d)
	{
		// Sets the dictionary
		this.d = d;
	};

	this.Items = function()
	{
		// Gets an unsorted sequence of [value, freq/prob] pairs

		return this.d.entries();
	};

	this.Mult = function(x, factor)
	{
		// Scales the freq/prob associated with the value x.
		//   x: number value
		//   factor: how much to multiply by

		this.Set(x, this.Get(x, 0) * factor);
	};

	this.Total = function()
	{
		// Returns the total of the frequencies/probabilities in the map

		var total = 0;
		this.d.forEach( (prob, x) => total += prob );
		return total;
	};

	this.SortMasses = function(isNumeric=true)
	{
		var orderedMap = sortMapByKey( this.d, isNumeric );
		this.d.clear();
		orderedMap.forEach( (value, key) => this.d.set(key, value), this );
	};


	this.Copy = function(name="")
	{
		// Make a shallow copy of d.
		// name: string name for the new Hist/Pmf/Suite

		let aCopy = new this.constructor();
		aCopy.name = (name) ? name : this.name;
		if( Object.hasOwn(this, 'title') ) aCopy.title = this.title;
		this.d.forEach( (p, x) => aCopy.Set(x, p) );
		return aCopy;
	};
}

// -------------------- Hist -------------------- //

function Hist(values=null, name="")
{
	// Represents a histogram, which is a map from values to frequencies.
	// Values can be any hashable type; frequencies are integer counters.

	_DictWrapper.call(this, values, name);

	this.Freq = function(x)
	{
		// Gets the frequency associated with the value
		//   Args: x: number value
		//   Returns: int frequency

		return self.d.Get(x, 0) ;
	};

	this.Freqs = function(xs)
	{
		// Gets frequencies for a sequence of values
		var freqs = [];
		xs.forEach( (x) => freqs.push(this.Freq(x)), this );
		return freqs;
	};

	this.IsSubset = function(other)
	{
		// Checks whether the values in this histogram are a subset of
		// the values in the given histogram

		for ( var [val, freq] of this.Items() )
		{
			if ( freq > other.Freq(val) ) return false;
		}
		return true;
	};

	this.Subtract = function(other)
	{
		// Subtracts the values in the given histogram from this histogram
		// the values must coincide

		for ( var [val, freq] of other.Items() )
		{
			if( !this.d.has(val) ) throw new RangeError(`the values (${val}) must coincide`);
			this.Incr(val, -freq);
		}
	};

}

// -------------------- Pmf -------------------- //

function Pmf(values=null, name="")
{
	// Pmf: represents a probability mass function (map from values to probs).

	// Values can be any hashable type; probabilities are floating-point.
	// Pmfs are not necessarily normalized.

	_DictWrapper.call(this, values, name);

	this.Prob = function (x, deflt=0)
	{
		return this.Get(x, deflt);
	};

	this.ProbGreater = function(x)
	{
		var t = [];
		for(const [val, prob] of this.Items() )
		{
			if (val > x) t.push(prob);
		}
		return t.reduce((partialSum, a) => partialSum + a, 0);
	};

	this.ProbLess = function(x)
	{
		var t = [];
		for(const [val, prob] of this.Items() )
		{
			if (val < x) t.push(prob);
		}
		return t.reduce((partialSum, a) => partialSum + a, 0);
	};

	this.Normalize = function(fraction=1)
	{
		var total = this.Total();
		if (total == 0)
		{
			throw new RangeError( 'total probability is zero.' );
			return total;
		}

		var factor = fraction / total;
		this.d.forEach( (prob, x) => this.d.set(x, prob * factor), this );

		return total;
	};

	this.MaximumLikelihood = function()
	{
		// Returns the value with the highest probability.

		var val = null, maxProb = -1;
		this.d.forEach((prob, x) => {
			if (prob > maxProb) { val = x; maxProb = prob; }
		});
		return val;
	};

	this.Mean = function ()
	{
		// Computes the mean of a PMF.
		//   Returns: float mean

		var mu = 0;
		this.d.forEach( (prob, x) => mu += prob * x );
		return fixFloat(mu);
	};

	this.MakeCdf = function(name="")
	{
		// Makes a Cdf.

		return MakeCdfFromPmf(this, name);
	};

	this.CredibleInterval = function(percentage=90)
	{
		// Computes the central credible interval
		// If percentage=90, computes the 90% CI.
		//     Args: percentage: float between 0 and 100
		//     Returns: sequence of two floats, low and high

		var cdf = this.MakeCdf();
		return cdf.CredibleInterval(percentage);
	};

	this.Random = function()
	{
		// Chooses a random element from this PMF
		//     Returns: float value from the Pmf

		if ( !this.d || this.d.size == 0 )
		{
			throw new RangeError('Pmf contains no values');
		}

		var target = Math.random();
		var total = 0;
		for (var [x, p] of this.d)
		{
			total += p;
			if (total >= target) return x;
		}

		throw new RangeError("we shouldn't get here");
	};

	this.AddPmf = function(other)
	{
		// Computes the Pmf of the sum of values drawn from this and other
		//     other: another Pmf
		//     returns: new Pmf

		var pmf = new Pmf();
		for(var [x1, p1] of this.Items())
		{
			for (var [x2, p2] of other.Items())
			{
				pmf.Incr( fixFloat(x1 + x2), p1 * p2);
			}
		}

		return pmf;
	};

	this.SubtractPmf = function(other)
	{
		// Computes the Pmf of the diff of values drawn from self and other
		//     other: another Pmf
		//     returns: new Pmf

		var pmf = new Pmf();
		for( const [v1, p1] of this.Items() )
		{
			for( const [v2, p2] of other.Items() )
			{
				pmf.Incr(  fixFloat(v1 - v2), p1 * p2 );
			}
		}
		return pmf;
	};

	this.Max = function(k)
	{
		// Computes the CDF of the maximum of k selections from this dist.
		//     k: int
		//     returns: new Cdf

		var cdf = this.MakeCdf();
		cdf.ps.forEach( (p, i, arr) => arr[i] = Math.pow(p, k) );

		return cdf;
	};

}

// -------------------- Cdf -------------------- //

function Cdf(xs=null, ps=null, name="")
{

	this.name = "";
	this.xs   = [];
	this.ps   = [];

	function init(self, xs, ps, name)
	{
		if (xs)   self.xs   = xs;
		if (ps)   self.ps   = ps;
		if (name) self.name = name;
	}

	init(this, xs, ps, name);

	this.Values = function() { return xs; };

	this.Items = function()
	{
		// Returns a sorted array of [value, probability] pairs.
		var items = [];
		for(var i = 0; i < xs.length; i++) items.push([xs[i], ps[i]]);
		return items;
	};

	this.Prob = function(x)
	{
		// Returns CDF(x), the probability that corresponds to value x.
		//   Args:    x: number
		//   Returns: float probability

		if (x < this.xs[0]) return 0;

		var index = bisectRight(xs, x);
		var p = this.ps[index - 1];

		return p;
	};

	this.Value = function(p)
	{
		// Returns InverseCDF(p), the value that corresponds to probability p.
		//    p: number in the range [0, 1]
		//    Returns: number value

		if (p < 0 || p > 1)
		{
			throw new RangeError('Probability p must be in range [0, 1]');
		}

		if (p == 0) return xs[0];
		if (p == 1) return xs[xs.length - 1];
		var index = bisectRight(ps, p);

		if (p == ps[index - 1]) { return xs[index - 1]; }
		else { return xs[index]; }
	};

	this.Percentile = function(p)
	{
		// Returns the value that corresponds to percentile p.
		// Args: p: number in the range [0, 100]
		// Returns: number value

		return this.Value(p / 100);
	};

	this.CredibleInterval = function(percentage=90)
	{
		// Computes the central credible interval.
		// If percentage=90, computes the 90% CI.
		// Args: percentage: float between 0 and 100
		// Returns: sequence of two floats, low and high

		var prob = (1 - percentage / 100) / 2 ;
		var interval = [this.Value(prob), this.Value(1 - prob)] ;
		return interval;
	};

	this.Copy = function(name="")
	{
		// Returns a copy of this Cdf.
		// Args: name: string name for the new Cdf

		if (!name) name = this.name;
		return new Cdf(this.xs.slice(), this.ps.slice(), name);
	};

	this.MakePmf = function(name="")
	{
		// Makes a Pmf

		return MakePmfFromCdf(this, name);
	};

	this.Max = function(k)
	{
		// Computes the CDF of the maximum of k selections from this dist
		//     k: int
		//     returns: new Cdf

		var cdf = this.Copy();
		cdf.ps.forEach( (p, i, arr) => arr[i] = Math.pow(p, k) );

		return cdf;
	};

	this.Random = function()
	{
		// Chooses a random value from this distribution

		return this.Value( Math.random() );
	};

	this.Sample = function(n)
	{
		// Generates a random sample from this distribution
		//     n: int length of the sample

		var xs = [];
		for(var i=0; i<n; i++) xs.push( this.Random() );
		return xs;
	};
}


// ----------------------- Beta ----------------------- //

function Beta(alpha=1, beta=1)
{
	this.alpha = 1;
	this.beta = 1;

	function init(self, alpha=1, beta=1)
	{
		self.alpha = alpha;
		self.beta = beta;
	}

	init(this, alpha, beta);

	this.Update = function(data)
	{
		var heads = data[0];
		var tails = data[1];
		this.alpha += heads;
		this.beta += tails;
	};

	this.Mean = function()
	{
		return this.alpha / (this.alpha + this.beta);
	};

	this.EvalPdf = function(x)
	{
		return Math.pow(x, this.alpha - 1) * Math.pow(1 - x, this.beta - 1);
	};

	this.MakePmf = function(steps=101, name="", round=true)
	{
		/* Returns a Pmf of this distribution.

		Note: Normally, we just evaluate the PDF at a sequence
		of points and treat the probability density as a probability
		mass.

		But if alpha or beta is less than one, we have to be
		more careful because the PDF goes to infinity at x=0
		and x=1.  In that case we evaluate the CDF and compute
		differences.
		*/
		if (this.alpha < 1 || this.beta < 1)
		{
			throw new RangeError(`this.alpha (${this.alpha}) < 1 || this.beta (${this.beta}) < 1`);
			// var cdf = this.MakeCdf();
			// var pmf = cdf.MakePmf();
			// return pmf;
		}

		var pmf = new Pmf();
		var xs = new Array(steps);
		var probs = new Array(steps);
		for(var i = 0; i < steps; i++)
		{
			xs[i] = i / (steps - 1) ;
			probs[i] = this.EvalPdf( xs[i] );
			if(round) pmf.Set( Math.round( xs[i] * (steps - 1) ), probs[i] );
			else pmf.Set( xs[i], probs[i] );
		}
		pmf.Normalize();
		pmf.SortMasses(true);

		return pmf;
	};
}

