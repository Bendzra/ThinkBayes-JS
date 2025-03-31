///////////////////////////////////////////////////////////////////////////////
// 9.2 The suite
//

class BasePaintball extends Suite
{
	locations = "";

	constructor(alphas, betas, locations, title="", name="")
	{
		super(null, title, name)

		this.locations = locations;
		var pairs = [];
		for(var a = 0; a < alphas.length; a++)
		{
			for (var b = 0; b < betas.length; b++)
			{
				var pair = [ alphas[a], betas[b] ];
				pairs.push(pair);
				this.Set(pair, 1);
			}
		}
		this.Normalize();
	};
}

class Paintball extends JointMixin(BasePaintball) {}

const alphas = spreadDots(null, 31, 0, 30);
const betas  = spreadDots(null, 51, 1, 51);
const locations = spreadDots(null, 32, 0, 31);

joinedClassesStudy();

function joinedClassesStudy()
{
	function Classes(bases)
	{
		class Bases
		{
			constructor()
			{
				bases.forEach( (base) => Object.assign(this, new base()) );
			};
		}

		bases.forEach(base => {
			Object.getOwnPropertyNames(base.prototype)
				.filter(prop => prop != 'constructor')
				.forEach(prop => {
					Bases.prototype[prop] = base.prototype[prop];
			});
		});

		return Bases;
	}

	class Age
	{
		constructor(years)
		{
			this.setYears(years);
		};

		setYears(years) {this.years = years;};

		sayAge() { console.log(this.constructor.name, `: Мне ${this.years} лет!`); };
		sayHi()  { console.log(this.constructor.name, `: Привет, ${this.name}`); };
	}

	class User
	{
		constructor(name)
		{
			this.setName(name);
		};

		setName(name) {this.name = name;};

		sayName() { console.log(this.constructor.name, `: Меня зовут ${this.name}.`); };
		sayBye() { console.log(this.constructor.name,   `: Пока, ${this.name}`); };
	}

	class Y extends Classes([Age,User])
	{
		constructor(name, years)
		{
			super();
			this.name  = name ;
			this.years = years;
		};
    }

	var y = new Y("Вася", 999);

	y.sayName();
	y.sayHi();
	y.sayAge();
	y.sayBye();
}

(function() {

	const title = "9.2 The suite";

	const suite = new Paintball(alphas, betas, locations, title);

})();
