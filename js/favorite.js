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

var Favorite = {
    cookie_name: 'Favorite',
    max_items: 50,

    /*
     * Update the page
     *   1) Count, name="all"
     *   2) Checkbox indicating if the case is selected or note  class="Favoritebtn"
     */
    updateUI: function () {

        alert('ccc');
        var favorite_cases = this.getFavoriteCasesFromCookie();	// Get the list of selected cases
        var number_of_favorite_cases = favorite_cases.length;
        var can_not_add_cases = ( number_of_favorite_cases >= this.max_items);

        $("#watch-list-count").html(number_of_favorite_cases);

    },

    /*
     * setCase: Add or Remove a case from the selected list
     * 
     * This is called after the check box has been updated.
     * 
     */
    setCase: function (case_id, is_now_checked) {

        var favorite_cases = this.getFavoriteCasesFromCookie();

        if (is_now_checked) {									// Request is to add the case 
            if (favorite_cases.length === 0) {					// No items, then make it the first one
                favorite_cases[0] = case_id;
            } else {
                var n = favorite_cases.indexOf(case_id);
                if (n !== -1) {									// It already exist, 
                    //  do nothing
                } else {										// Does not exist,
                    n = favorite_cases.length;					//  add it to the end
                    favorite_cases[n] = case_id;
                }
            }
        } else {												// Request is to remove
            if (favorite_cases.length === 0) {					// No items, then there is nothing to remove

            } else {
                var n = favorite_cases.indexOf(case_id);
                if (n !== -1) {									// The case is in the list
                    favorite_cases.splice(n, 1);					// 	 remove it
                } else {										// The case is not in the list
                    //   do nothing
                }
            }
        }

        document.cookie = this.cookie_name + "=" + favorite_cases.join('|') +
        "; expires=Thu, 01 Jan 2022 00:00:01 GMT; path=/";

        this.updateUI();
    },

    /**
     * Clear the Favorite
     *    1) Remove the cookie
     *    2) Upate the page
     */
    clear: function () {
        document.cookie = this.cookie_name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";

        this.updateUI();

    },

    getFavoriteCasesFromCookie: function () {
        var id_list = String(this.getFavoriteCookie());
        var favorite_cases = [];

        if (id_list.length !== 0) {
            favorite_cases = id_list.split("|");			// Create an array
        }
        return favorite_cases;
    },

    /*
     * Get the cookie containing the selected cases
     */
    getFavoriteCookie: function () {
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




