/*
 * For browsers like IE8
 */

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}


var WatchList = {
    cookie_name: 'WatchList',
    max_items: 50,

    init: function () {

        $("#clear-watch-list").on('click',function() {
            WatchList.clear();      // This is the wrong way to do this.
        });

        this.favorite_cases = this.getWatchListCasesFromCookie();	// Get the list of selected cases

    },

    /*
     * Update the page
     *   1) Count, name="all"
     *   2) Checkbox indicating if the case is selected or note  class="WatchListbtn"
     */
    updateUI: function () {

        this.favorite_cases = this.getWatchListCasesFromCookie();	// Get the list of selected cases
        var number_of_favorite_cases = this.favorite_cases.length;
        var can_not_add_cases = ( number_of_favorite_cases >= this.max_items);

        $("#watch-list-count").html(number_of_favorite_cases);

    },

    makeWatchHtml: function ( case_id ) {

        var i = case_id;

        i = this.favorite_cases.indexOf( i );


        if ( i  < 0 ) {
            return '<p id="case-id-' + case_id + '">' + this.addCaseButton( case_id ) + '</p>';
        } else {
            return '<p id="case-id-' + case_id + '">' + this.removeCaseButton( case_id ) + '</p>';
        }

    },

    addCaseButton: function( case_id ) {
        return '<a type="button" class="btn btn-default" onClick="WatchList.addCase(' + case_id + ');" href="#">Watch Case</a>';
    },

    removeCaseButton: function( case_id ) {
        return '<a  type="button" class="btn btn-default" onClick="WatchList.removeCase(' + case_id + ');" href="#">Un Watch Case</a>';
    },

    /**
     * Add case
     */

    addCase: function ( case_id ) {

        this.favorite_cases = this.getWatchListCasesFromCookie();

        console.dir( this.favorite_cases );
        if (this.favorite_cases.length === 0) {					// No items, then make it the first one
            this.favorite_cases[0] = case_id;



        } else {
            var n = this.favorite_cases.indexOf(case_id);
            if (n !== -1) {									// It already exist,
                //  do nothing
            } else {										// Does not exist,
                n = this.favorite_cases.length;					//  add it to the end
                this.favorite_cases[n] = case_id;
            }
        }
        document.cookie = this.cookie_name + "=" + this.favorite_cases.join('|') +
        "; expires=Thu, 01 Jan 2022 00:00:01 GMT; path=/";

        $("#case-id-" + case_id ).html( this.removeCaseButton( case_id ) );

        this.updateUI();


    },

    removeCase: function ( case_id ) {

        this.favorite_cases = this.getWatchListCasesFromCookie();

        if (this.favorite_cases.length === 0) {					// No items, then there is nothing to remove

        } else {

            var n = this.favorite_cases.indexOf(case_id.toString());

            if (n !== -1) {									// The case is in the list
                this.favorite_cases.splice(n, 1);					// 	 remove it
                console.dir( this.favorite_cases );
            } else {										// The case is not in the list
                //   do nothing
            }
        }

        document.cookie = this.cookie_name + "=" + this.favorite_cases.join('|') +
        "; expires=Thu, 01 Jan 2022 00:00:01 GMT; path=/";

        $("#case-id-" + case_id ).html( this.addCaseButton( case_id ) );

        this.updateUI();
    },

    /*
     * setCase: Add or Remove a case from the selected list
     * 
     * This is called after the check box has been updated.
     * 
     */
    setCase: function (case_id, is_now_checked) {

        this.favorite_cases = this.getWatchListCasesFromCookie();

        if (is_now_checked) {									// Request is to add the case 
            if (this.favorite_cases.length === 0) {					// No items, then make it the first one
                this.favorite_cases[0] = case_id;
            } else {
                var n = this.favorite_cases.indexOf(case_id);
                if (n !== -1) {									// It already exist, 
                    //  do nothing
                } else {										// Does not exist,
                    n = this.favorite_cases.length;					//  add it to the end
                    this.favorite_cases[n] = case_id;
                }
            }
        } else {												// Request is to remove
            if (this.favorite_cases.length === 0) {					// No items, then there is nothing to remove

            } else {
                var n = this.favorite_cases.indexOf(case_id);
                if (n !== -1) {									// The case is in the list
                    this.favorite_cases.splice(n, 1);					// 	 remove it
                } else {										// The case is not in the list
                    //   do nothing
                }
            }
        }

        document.cookie = this.cookie_name + "=" + this.favorite_cases.join('|') +
        "; expires=Thu, 01 Jan 2022 00:00:01 GMT; path=/";

        this.updateUI();
    },

    /**
     * Clear the WatchList
     *    1) Remove the cookie
     *    2) Upate the page
     */
    clear: function () {
        document.cookie = this.cookie_name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";
        this.updateUI();
    },

    getWatchListCasesFromCookie: function () {
        var id_list = String(this.getWatchListCookie());
        var favorite_cases = [];

        if (id_list.length !== 0) {
            favorite_cases = id_list.split("|");			// Create an array
        }
        return favorite_cases;
    },

    /*
     * Get the cookie containing the selected cases
     */
    getWatchListCookie: function () {
        var arg = this.cookie_name + "=";
        var alen = arg.length;
        var clen = document.cookie.length;
        var i = 0;
        while (i < clen) {
            var j = i + alen;
            if (document.cookie.substring(i, j) == arg)
                return this.getCookieVal(j);
            i = document.cookie.indexOf(" ", i) + 1;
            if (i == 0) break;
        }
        return '';
    },

    getCookieVal: function (offset) {
        var endstr = document.cookie.indexOf(";", offset);
        if (endstr == -1)
            endstr = document.cookie.length;
        return unescape(document.cookie.substring(offset, endstr));
    }

}




