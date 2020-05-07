var keystone = require('keystone');
const {BigQuery} = require('@google-cloud/bigquery');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	const bigqueryClient = new BigQuery();

	// The SQL query to run
	const sqlQueryMap = `SELECT country_region, max(deaths) as deaths, max(recovered) as recovered, max(confirmed) as confirmed, max(date) as date, max(latitude) as lat, max(longitude) as lon
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	WHERE deaths>0
	group by country_region
	order by deaths desc`;

	const sqlQueryConfirmed = `SELECT country_region, max(deaths) as deaths, max(recovered) as recovered, max(confirmed) as confirmed, max(date) as date, max(latitude) as lat, max(longitude) as lon
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	WHERE deaths>0
	group by country_region
	order by confirmed desc
	LIMIT 10`;

	const optionsMap = {
	query: sqlQueryMap,
	// Location must match that of the dataset(s) referenced in the query.
	location: 'US'
	};
	const optionsConfirmed = {
		query: sqlQueryConfirmed,
		// Location must match that of the dataset(s) referenced in the query.
		location: 'US'
		};
	
	// Run the query
	bigqueryClient.query(optionsMap).then((rowsMap)=>{	
		bigqueryClient.query(optionsConfirmed).then((rowsConfirmed)=>{
			// Render the view
			view.render('index', {
				title: 'Covid19 - Situación actual',
				data_map: rowsMap[0],
				data_confirmed: rowsConfirmed[0],
			});
		});
	});

};
