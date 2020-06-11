const request = require('request');
const {BigQuery} = require('@google-cloud/bigquery');

const bigqueryClient = new BigQuery();

const apiOptions = {
    server : "http://localhost:3000"
};

/* GET 'home' page */
const homelist = (req, res) => {

    // The SQL query to run
    const sqlQueryMap = `
    SELECT country_region, max(deaths) as deaths, max(recovered) as recovered, max(confirmed) as confirmed, max(date) as date, 
    avg(latitude) as lat, avg(longitude) as lon
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	WHERE deaths>0
	group by country_region
	order by deaths desc`;

    const optionsMap = {
	query: sqlQueryMap,
	// Location must match that of the dataset(s) referenced in the query.
	location: 'US'
	};

    const sqlQueryTop = `
    SELECT country_region, max(deaths) as deaths, max(recovered) as recovered, max(confirmed) as confirmed, 
    max(date) as date FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	WHERE deaths>0
	group by country_region
	order by confirmed desc
    LIMIT 10`;
    
    const optionsTop = {
		query: sqlQueryTop,
		// Location must match that of the dataset(s) referenced in the query.
		location: 'US'
        };
        
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

    const sqlQueryGraph = `SELECT country_region, date, max(deaths) as deaths FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
    where country_region in (select country_region from (SELECT country_region, max(deaths) as deaths
    FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
    group by country_region
    order by deaths desc
    LIMIT 10))
    and date > "2020-02-20"
    group by country_region, date
    order by country_region asc, date asc`;

	const optionsGraph = {
	query: sqlQueryGraph,
	// Location must match that of the dataset(s) referenced in the query.
	location: 'US'
    };
    
    const sqlQueryGraphConfirmed = `SELECT country_region, date, max(confirmed) as confirmed FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
    where country_region in (select country_region from (SELECT country_region, max(confirmed) as confirmed
    FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
    group by country_region
    order by confirmed desc
    LIMIT 10))
    and date > "2020-02-20"
    group by country_region, date
    order by country_region asc, date asc`;

	const optionsGraphConfirmed = {
	query: sqlQueryGraphConfirmed,
	// Location must match that of the dataset(s) referenced in the query.
	location: 'US'
    };

    let paises = {
        date: [],
        paises: []
    };
    let paises_confirmed = {
        date: [],
        paises: []
    };

    let nombres_paises = [];
    let nombres_paises_confirmed = [];

    // Run the query
    bigqueryClient.query(optionsMap).then((rowsMap)=>{	
	bigqueryClient.query(optionsSummary).then((rowsSummary)=>{	
		bigqueryClient.query(optionsTop).then((rowsTop)=>{
            bigqueryClient.query(optionsGraph).then((rowsGraph)=>{
                let i=-1;
                rowsGraph[0].forEach(row=>{
                    if(!paises.date.includes(row.date.value))
                        paises.date.push(row.date.value)

                    if(!nombres_paises.includes(row.country_region)){
                        i++;
                        nombres_paises.push(row.country_region);
                        paises.paises[i] = {
                            country: row.country_region,
                            deaths: [],
                          };
                    }
                        
                    paises.paises[i].deaths.push(row.deaths);
                })

                paises.paises.forEach(pais =>{
                    if(pais.deaths.length != paises.date.length){
                        const cantidad = paises.date.length - pais.deaths.length;
                        for(let i = 0; i< cantidad; i++){
                            pais.deaths.unshift(0);
                        }
                    }
                });
                
                bigqueryClient.query(optionsGraphConfirmed).then((rowsGraph)=>{
                    let i=-1;
                    rowsGraph[0].forEach(row=>{
                        if(!paises_confirmed.date.includes(row.date.value))
                        paises_confirmed.date.push(row.date.value)
    
                        if(!nombres_paises_confirmed.includes(row.country_region)){
                            i++;
                            nombres_paises_confirmed.push(row.country_region);
                            paises_confirmed.paises[i] = {
                                country: row.country_region,
                                confirmed: [],
                              };
                        }                            
                        paises_confirmed.paises[i].confirmed.push(row.confirmed);
                    })
    
                    paises_confirmed.paises.forEach(pais =>{
                        if(pais.confirmed.length != paises_confirmed.date.length){
                            const cantidad = paises_confirmed.date.length - pais.confirmed.length;
                            for(let i = 0; i< cantidad; i++){
                                pais.confirmed.unshift(0);
                            }
                        }
                    });
                    res.render('index', {
                        title: 'Covid19 - Situación actual',
                        data_map: rowsMap[0],
                        world_summary: rowsSummary[0][0],
                        data_confirmed: rowsTop[0],
                        graph_top: paises,
                        graph_top_confirmed: paises_confirmed
                    });
                });    
            });
        });
    });

	});
};

/* GET 'home' page */
const mapa = (req, res) => {

    // The SQL query to run
    const sqlQueryMap = `SELECT country_region, max(deaths) as deaths, max(recovered) as recovered, 
    max(confirmed) as confirmed, max(date) as date, avg(latitude) as lat, avg(longitude) as lon
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
    
    const sqlQueryGraph = `
    SELECT date, sum(deaths) as deaths, sum(recovered) as recovered, sum(confirmed) as confirmed
	FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
	group by date
    order by date asc`;

	const optionsGraph = {
	query: sqlQueryGraph,
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

    const sqlQuerySummary = `
    SELECT date, sum(deaths) as deaths, sum(recovered) as recovered, sum(confirmed) as confirmed
    FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
    where country_region="Spain"
	group by date
	order by date desc
    limit 1`;

    const sqlQueryGraph = `
    SELECT date, sum(deaths) as deaths, sum(recovered) as recovered, sum(confirmed) as confirmed
    FROM \`bigquery-public-data.covid19_jhu_csse.summary\`
    where country_region="Spain"
	group by date
    order by date asc`;


	const optionsGraph = {
        query: sqlQueryGraph,
        // Location must match that of the dataset(s) referenced in the query.
        location: 'US'
    };

	const optionsSummary = {
		query: sqlQuerySummary,
		// Location must match that of the dataset(s) referenced in the query.
		location: 'US'
    };
	
	// Run the query
	bigqueryClient.query(optionsSummary).then((rowSummary)=>{	
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
            res.render('spain', {
                title: 'Covid19 - Situación actual',
                spain_summary: rowSummary[0][0],
                data_graph: jsonSalida,
                data_graph_diario: jsonSalida_diario,    
            });
        });
	});
};

module.exports = {
    homelist,
    mapa,
    graficos,
    spain
};