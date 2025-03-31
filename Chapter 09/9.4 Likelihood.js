///////////////////////////////////////////////////////////////////////////////
// 9.4 Likelihood
//

Paintball.prototype.Likelihood = function(data, hypo)
{
	var [alpha, beta] = hypo;
	var x = data;
	var pmf = MakeLocationPmf(alpha, beta, this.locations);
	var like = pmf.Prob(x);
	return like;
};


(function() {

	const title = "9.4 Likelihood";

	const suite = new Paintball(alphas, betas, locations, title);
	suite.UpdateSet([15, 16, 18, 21]);

	console.log(suite.GetDict());

})();
