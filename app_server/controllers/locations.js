const request = require('request');
const {BigQuery} = require('@google-cloud/bigquery');

const bigqueryClient = new BigQuery();

const apiOptions = {
    server : "http://localhost:3000"
};

const showError = (req, res, status) => {
    let title = '';
    let content = '';
    if (status === 404) { 
        title = "404, page not found";
        content = "Oh dear. Looks like we can't find this page. Sorry.";
    } else  {
        title = status + ", something's gone wrong";
        content = "Something, somewhere, has gone just a little bit wrong.";
    }
    res.status(status);
    res.render('generic-text', {
        title : title,
        content : content
    });
};


/* GET 'home' page */
const homelist = (req, res) => {

    // The SQL query to run
	const sqlQueryMap = `SELECT country_region, max(deaths) as deaths, max(recovered) as recovered, max(confirmed) as confirmed, max(date) as date, avg(latitude) as lat, avg(longitude) as lon
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	WHERE deaths>0
	group by country_region
	order by deaths desc`;

    const optionsMap = {
	query: sqlQueryMap,
	// Location must match that of the dataset(s) referenced in the query.
	location: 'US'
	};

	const sqlQueryConfirmed = `SELECT country_region, max(deaths) as deaths, max(recovered) as recovered, max(confirmed) as confirmed, max(date) as date, max(latitude) as lat, max(longitude) as lon
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	WHERE deaths>0
	group by country_region
	order by confirmed desc
    LIMIT 10`;
    
    const sqlQuerySummary = `SELECT sum(deaths) as deaths, sum(recovered) as recovered, sum(confirmed) as confirmed, date
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	group by date
    order by date desc
    limit 1`;


	const optionsSummary = {
	query: sqlQuerySummary,
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
	bigqueryClient.query(optionsSummary).then((rowsSummary)=>{	
		bigqueryClient.query(optionsConfirmed).then((rowsConfirmed)=>{
            console.log(rowsSummary);
			// Render the view
			res.render('index', {
                title: 'Covid19 - Situación actual',
                data_map: rowsMap[0],
				world_summary: rowsSummary[0][0],
				data_confirmed: rowsConfirmed[0],
			});
        });
    });

	});
};

/* GET 'home' page */
const mapa = (req, res) => {

    // The SQL query to run
	const sqlQueryMap = `SELECT country_region, max(deaths) as deaths, max(recovered) as recovered, max(confirmed) as confirmed, max(date) as date, avg(latitude) as lat, avg(longitude) as lon
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	WHERE deaths>0
	group by country_region
	order by deaths desc`;

    const optionsMap = {
	query: sqlQueryMap,
	// Location must match that of the dataset(s) referenced in the query.
	location: 'US'
	};
	
	// Run the query
	bigqueryClient.query(optionsMap).then((rowsMap)=>{	
        // Render the view
        res.render('mapa', {
            title: 'Covid19 - Situación actual',
            data_map: rowsMap[0],
        });
	});
};

/* GET 'graficos' page */
const graficos = (req, res) => {

    // The SQL query to run
	const sqlQueryMap = `SELECT country_region, max(deaths) as deaths, max(recovered) as recovered, max(confirmed) as confirmed, max(date) as date, avg(latitude) as lat, avg(longitude) as lon
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	WHERE deaths>0
	group by country_region
	order by deaths desc`;

    const optionsMap = {
	query: sqlQueryMap,
	// Location must match that of the dataset(s) referenced in the query.
	location: 'US'
	};

	const sqlQueryConfirmed = `SELECT country_region, max(deaths) as deaths, max(recovered) as recovered, max(confirmed) as confirmed, max(date) as date, max(latitude) as lat, max(longitude) as lon
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	WHERE deaths>0
	group by country_region
	order by confirmed desc
    LIMIT 10`;
    
    const sqlQueryGraph = `SELECT date, sum(deaths) as deaths, sum(recovered) as recovered, sum(confirmed) as confirmed
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	group by date
    order by date asc`;


	const optionsGraph = {
	query: sqlQueryGraph,
	// Location must match that of the dataset(s) referenced in the query.
	location: 'US'
    };
    
	const optionsConfirmed = {
		query: sqlQueryConfirmed,
		// Location must match that of the dataset(s) referenced in the query.
		location: 'US'
		};
    
    let paises = [];
    // Run the query
    bigqueryClient.query(optionsGraph).then((rowsGraph)=>{	
        let jsonSalida = {
            date : ["2020-01-21"],
            deaths: [0],
            recovered: [0],
            confirmed: [0],
          };
          let jsonSalida_diario = {
            date : ["2020-01-21"],
            deaths: [0],
            recovered: [0],
            confirmed: [0],
          };

        rowsGraph[0].forEach(row=>{
            jsonSalida.date.push(row.date.value);
            jsonSalida_diario.date.push(row.date.value);
            jsonSalida_diario.deaths.push(Math.abs(row.deaths-jsonSalida.deaths[jsonSalida.deaths.length-1]));
            jsonSalida_diario.confirmed.push(Math.abs(row.confirmed-jsonSalida.confirmed[jsonSalida.confirmed.length-1]));
            jsonSalida_diario.recovered.push(Math.abs(row.recovered-jsonSalida.recovered[jsonSalida.recovered.length-1]));
            jsonSalida.deaths.push(row.deaths);
            jsonSalida.recovered.push(row.recovered);
            jsonSalida.confirmed.push(row.confirmed);

        })
        // Render the view
        res.render('graficos', {
            data_graph: jsonSalida,
            data_graph_diario: jsonSalida_diario,
        });
	});
};

/* GET 'home' page */
const spain = (req, res) => {

	const sqlQuerySummary = `SELECT date, sum(deaths) as deaths, sum(recovered) as recovered, sum(confirmed) as confirmed
    FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
    where country_region="Spain"
	group by date
	order by date asc`;

	const optionsSummary = {
		query: sqlQuerySummary,
		// Location must match that of the dataset(s) referenced in the query.
		location: 'US'
		};
	
	// Run the query
	bigqueryClient.query(optionsSummary).then((rowSummary)=>{	
        // Render the view
        res.render('index', {
            title: 'Covid19 - Situación actual',
            data_summary: rowSummary[0],
            data_confirmed: rowsConfirmed[0],
        });
	});
};

module.exports = {
    homelist,
    mapa,
    graficos,
    // spain
};