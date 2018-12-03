sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"qperior/mw_challenge/mw_challenge/model/formatter",
	"sap/f/Avatar",
	"sap/m/Text"
], function (Controller, Button, Dialog, List, Standardlistitem, formatter, Avatar, Text) {
	"use strict";

	return Controller.extend("qperior.mw_challenge.mw_challenge.controller.Checkin", {
		formatter: formatter,

		onInit: function () {
			this.getRouter().getTarget("Checkin").attachDisplay(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			var oRM = new sap.ui.model.json.JSONModel();
			var oReservationContext = oEvent.getParameter("data").oContext;
			oRM.setData(oReservationContext);
			this.getView().setModel(oRM, "RM");

			var oPM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oPM, "PM");

			var oCM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oCM, "CM");

			var oFM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oFM, "FM");
			var oTM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oTM, "TM");

			this.getLocationData(oReservationContext.START_LOCATION, "FM");
			this.getLocationData(oReservationContext.END_LOCATION, "TM");
			this.getUserData(oReservationContext.PERSON_ID);

			var oModel = this.getView().getModel("RM").getData();
			var iCategoryId = oModel.KATEGORIE_ID;
			
			if (this.getView().getModel("CM").getData()) {
				this.getCarsByCategory(iCategoryId, "CM");
			}
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		onNext: function (oEvent) {
			var self = this;
			var sId = this.getView().byId("idIconTabBar2").getSelectedKey();
			var iId = parseInt(sId.slice(-1), 10) + 1;
			var oModel = this.getView().getModel("RM").getData();
			var iCategoryId = oModel.KATEGORIE_ID;
			if (iId === 2) {
				this.getCarsByCategory(iCategoryId, "CM");
				var oCars = this.getView().getModel("CM").getData();

				var oResultSet = oCars.results;
				if (this.getView().byId("avatar0").getProperty("title") === "") {
					// create avatar and text
					for (var i = 0; i < oResultSet.length; i++) {
						var j = oResultSet[i].PRODUKT_ID;
						var oAvatar = new sap.f.Avatar({
							src: "img/" + j + ".jpg",
							displayShape: "Square",
							displaySize: "Custom",
							customDisplaySize: "200px",
							press: function () {
								self.onPressMap(undefined, true);
							}
						});

						var sText = oResultSet[i].BESCHREIBUNG.substring(0, 200) + "...";
						var oText = new sap.m.Text({
							text: sText,
							width: "200px"
						});
						
						var oButton = new sap.m.Button({
							text: "Dieses Fahrzeug auswählen!"
						});

						// placing it into our view
						this.getView().byId("avatar" + i).addContent(oAvatar);
						this.getView().byId("avatar" + i).addContent(oText);
						this.getView().byId("avatar" + i).setTitle(oResultSet[i].BEZEICHNUNG);
						this.getView().byId("avatar" + i).addContent(oButton);
					}
				}
			}
			this.getView().byId("tab" + iId).setEnabled(true);
			this.getView().byId("idIconTabBar2").setSelectedKey("tab" + iId);

		},

		getUserData: function (iId) {
			this.getView().getModel().read("/PERSONEN(" + iId + ")", {
				success: function (oData) {
					this.getView().getModel("PM").setData(oData);
				}.bind(this),
				error: function (e) {
				}
			});
		},

		onPressMap: function (oEvent, bindingMode) {

			if (bindingMode) {
				return;
			}

			var sModel = oEvent.getSource().getId().indexOf("From") > 0 ? "FM" : "TM";
			var oModel = this.getView().getModel(sModel).getData();
			var iLong = oModel.LONG;
			var iLat = oModel.LAT;

			this.pressDialog = new Dialog({
				title: "Karte",
				content: new sap.m.Image({
					src: "https://maps.googleapis.com/maps/api/staticmap?zoom=8&size=350x350&markers=" + iLong + "," + iLat +
						"&key=AIzaSyDGJMMzLmYVXTEh_QEVE4xwUB7caS_2wPw"
				}),
				beginButton: new Button({
					text: "Close",
					press: function (oEvent) {
						this.pressDialog.close();
						this.pressDialog = undefined;
					}.bind(this)
				})
			});

			//to get access to the global model
			this.getView().addDependent(this.pressDialog);
			this.pressDialog.open();
		},

		getLocationData: function (iId, sModel) {
			this.getView().getModel().read("/STANDORTE(" + iId + ")", {
				success: function (oData) {
					this.getView().getModel(sModel).setData(oData);
				}.bind(this),
				error: function (e) {
				}
			});
		},

		getCarsByCategory: function (iId, sModel) {
			this.getView().getModel().read("/PRODUKTE", {
				filters: [new sap.ui.model.Filter("KATEGORIE_ID", sap.ui.model.FilterOperator.EQ, iId)],
				success: function (oData) {
					this.getView().getModel(sModel).setData(oData);
				}.bind(this),
				error: function (e) {
				}
			});
		},

		onReturnBack: function () {
			var sId = this.getView().byId("idIconTabBar2").getSelectedKey();
			var iId = parseInt(sId.slice(-1), 10) - 1;

			if (sId === "tab1") {
				this.getView().byId("avatar0").removeAllContent();
				this.getView().byId("avatar1").removeAllContent();
				this.getView().getModel("CM").setData(null);
				this.getView().byId("avatar0").setTitle("");
				this.getView().byId("avatar1").setTitle("");
				this.getRouter().getTargets().display("Startpage", {
					fromTarget: "Checkin"
				});
			} else {
				this.getView().byId("tab" + iId).setEnabled(true);
				this.getView().byId("idIconTabBar2").setSelectedKey("tab" + iId);
			}
		}
	});

});