sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"qperior/mw_challenge/mw_challenge/model/formatter"
], function (Controller, formatter) {
	"use strict";

	return Controller.extend("qperior.mw_challenge.mw_challenge.controller.Startpage", {
		formatter: formatter,

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onSelectReservation: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext().getPath();
			var oContext = this.getView().getModel().getProperty(sPath);
			
			this.getRouter().getTargets().display("Checkin", {
				fromTarget: "Startpage",
				oContext: oContext
			});
		}

	});
});