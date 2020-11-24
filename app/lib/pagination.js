

exports.pagination = function(collection, currentPage, query, callback){
	var params = {};
	params.maxDocs = 14
	//Maximum number of pages shown.
	var maxShownPages = 10;

	params.prevPage = +currentPage - 1;
	params.nextPage = +currentPage + 1;
	collection.find(query, function(err, students){
		//Total number of records
		var numRec = students.length;
		console.log('Total # of Rec: ' + numRec)

		//number of pages in decimal
		var maxPages = (numRec / params.maxDocs)
		console.log('maxpages: ' + maxPages)

		//working out the true number of total pages
		if (!((maxPages % 1) < 0)) {
			params.totalPages = (maxPages - (maxPages % 1)) + 1
			console.log('Not < 0')
		}else{
			params.totalPages = maxPages;
			console.log('= to 0')
		}

		//if the current page is  1
		if ((+currentPage - 3) < 1) {
			//Set first visible page to 1
			params.fvp = 1;
					
			if (params.totalPages <= 7) {
				params.lvp = params.totalPages;
			}else{
				params.lvp = 7;
			}
						
		}else{
			params.fvp = +currentPage - 3;
			if ((+currentPage + 3) < params.totalPages) {
				params.lvp = +currentPage + 3;
			}else{
				params.lvp = params.totalPages;
			}
		}

		console.log('fvp: ' + params.fvp);
		console.log('lvp:' + params.lvp);

		params.skipPages = params.maxDocs*(currentPage - 1)

		callback(null, params)
	})
}