sap.ui.define([], function() {
	"use strict";

	return {
		
		checkForm: function(date) {
			var iDayIndex = date.getUTCDay();
			var iDayOfMonth = date.getUTCDate();
			var iMonthIndex = date.getUTCMonth();
			var iYear = date.getUTCFullYear();
			var sDay;
			var sMonth;
			
			if (iDayIndex === 1) {
				sDay = "Montag";
			} else if (iDayIndex === 2) {
				sDay = "Dienstag";
			} else if (iDayIndex === 3) {
				sDay = "Mittwoch";
			} else if (iDayIndex === 4) {
				sDay = "Donnerstag";
			} else if (iDayIndex === 5) {
				sDay = "Freitag";
			} else if (iDayIndex === 6) {
				sDay = "Samstag";
			} else if (iDayIndex === 7) {
				sDay = "Sonntag";
			}
			
			if (iMonthIndex === 0) {
				sMonth = "Januar";
			} else if (iMonthIndex === 1) {
				sMonth = "Februar";
			} else if (iMonthIndex === 2) {
				sMonth = "März";
			} else if (iMonthIndex === 3) {
				sMonth = "April";
			} else if (iMonthIndex === 4) {
				sMonth = "Mai";
			} else if (iMonthIndex === 5) {
				sMonth = "Juni";
			} else if (iMonthIndex === 6) {
				sMonth = "Juli";
			} else if (iMonthIndex === 7) {
				sMonth = "August";
			} else if (iMonthIndex === 8) {
				sMonth = "September";
			} else if (iMonthIndex === 9) {
				sMonth = "Oktober";
			} else if (iMonthIndex === 10) {
				sMonth = "November";
			} else if (iMonthIndex === 11) {
				sMonth = "Dezember";
			}
			
			var sFullDate = sDay + ", den " + iDayOfMonth + ". " + sMonth + " " + iYear;
			
			return sFullDate;
		}
	

	};

});