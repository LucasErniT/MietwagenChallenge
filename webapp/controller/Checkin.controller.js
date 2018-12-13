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

		onSelectAccessory: function (oEvent) {
			var iId = oEvent.getSource().getId();
			var sImage = oEvent.getSource().getProperty("backgroundImage");
			if (sImage.indexOf("rejected") !== -1) {
				sap.ui.getCore().byId(iId).setBackgroundImage("img/selected.jpg");
			} else {
				sap.ui.getCore().byId(iId).setBackgroundImage("img/rejected.jpg");
			}

		},
		
		onSelectInsurance: function (oEvent) {
			var iId = oEvent.getSource().getId();
			var sImage = oEvent.getSource().getProperty("backgroundImage");
			if (sImage.indexOf("rejected") !== -1) {
				sap.ui.getCore().byId(iId).setBackgroundImage("img/selected.jpg");
			} else {
				sap.ui.getCore().byId(iId).setBackgroundImage("img/rejected.jpg");
			}

		},

		_onObjectMatched: function (oEvent) {
			/**
			 *	Reservation model
			 *	gets the reservation context and puts it as model "RM"
			 */
			var oRM = new sap.ui.model.json.JSONModel();
			var oReservationContext = oEvent.getParameter("data").oContext;
			oRM.setData(oReservationContext);
			this.getView().setModel(oRM, "RM");

			/**
			 *	Person model
			 *	gets the person context and puts it as model "PM"
			 */
			var oPM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oPM, "PM");

			/**
			 *	Person model
			 *	gets the person context and puts it as model "PM"
			 */
			var oCM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oCM, "CM");

			var oInitCM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oInitCM, "initCM");

			var oUpCM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oUpCM, "upCM");

			var oFM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oFM, "FM");

			var oTM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oTM, "TM");

			/** 
				Accessory Model
				-> get all accessories and save in model "AM"
			*/
			var oAM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oAM, "AM");
			this.getView().getModel().read("/ZUBEHOER", {
				success: function (oData) {
					var resultSet = oData.results;
					this.getView().getModel("AM").setData(resultSet);

					for (var i = 0; i < resultSet.length; i++) {
						var sZubehoerId = "zubehoerId" + resultSet[i].ZUBEHOER_ID;
						var oGenericTile = new sap.m.GenericTile({
							id: sZubehoerId,
							header: resultSet[i].BEZEICHNUNG,
							frameType: "TwoByOne",
							backgroundImage: "img/rejected.jpg",
							press: function (oEvent) {
								this.onSelectAccessory(oEvent);
							}.bind(this)
						});

						var j = i + 1;
						var oImageContent = new sap.m.ImageContent({
							src: "img/z" + j + ".jpg",
						});
						var oTileContent = new sap.m.TileContent({
							footer: "Für nur CHF " + resultSet[i].PREIS + ".- pro Tag",
							footerColor: "Error"
						});

						oTileContent.setContent(oImageContent);
						oGenericTile.addTileContent(oTileContent);
						if (i < 2) {
							this.getView().byId("flexBoxAccessoryId1").addItem(oGenericTile);
						} else if (i > 1 && i < 4) {
							this.getView().byId("flexBoxAccessoryId2").addItem(oGenericTile);
						} else {
							this.getView().byId("flexBoxAccessoryId3").addItem(oGenericTile);
						}

					}

				}.bind(this),
				error: function (e) {}
			});
			
			/*
			Insurance Model
			-> get all insurance and save in model "IM"
			*/
			var oIM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oIM, "IM");
			
			this.getView().getModel().read("/VERSICHERUNGEN", {
				success: function (oData) {
					var resultSet = oData.results;
					this.getView().getModel("IM").setData(resultSet);

					for (var i = 0; i < resultSet.length; i++) {
						var sVersicherungId = "versicherungId" + resultSet[i].VERSICHERUNG_ID;
						var oGenericTile = new sap.m.GenericTile({
							id: sVersicherungId,
							header: resultSet[i].VERSICHERUNG_ID,
							frameType: "TwoByOne",
							backgroundImage: "img/rejected.jpg",
							press: function (oEvent) {
								this.onSelectInsurance(oEvent);
							}.bind(this)
						});

						var j = i + 1;
						var oImageContent = new sap.m.ImageContent({
							src: "img/insurance" + j + ".jpg",
						});
						var oTileContent = new sap.m.TileContent({
							footer: "Für nur CHF " + resultSet[i].PREIS + ".- pro Tag",
							footerColor: "Error"
						});

						oTileContent.setContent(oImageContent);
						oGenericTile.addTileContent(oTileContent);
						if (i < 2) {
							this.getView().byId("flexBoxInsuranceId1").addItem(oGenericTile);
						} else if (i > 1 && i < 4) {
							this.getView().byId("flexBoxInsuranceId2").addItem(oGenericTile);
						} 

					}

				}.bind(this),
				error: function (e) {}
			});
			// ENDE HIER

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

				this.getCarsByCategory(iCategoryId, "initCM").then(function(){
					var oInitialCars = self.getView().getModel("initCM").getData();
					var oInitialResultSet = oInitialCars.results;
					
					for (var i = 0; i < oInitialResultSet.length; i++) {
					self.addInfosToTiles(oInitialResultSet, i, "initialCarRow", false);
					}
				});
				
				
				this.getCarsByCategory(iCategoryId + 1, "upCM").then(function(){
					var oUpsellCars = self.getView().getModel("upCM").getData();
					var oUpsellResultSet = oUpsellCars.results;

					for (var x = 0; x < oUpsellResultSet.length; x++) {
						self.addInfosToTiles(oUpsellResultSet, x, "upsellCarRow", true);
				}
				});
				
				/**
				 this.getCarsByCategory(iCategoryId, "initCM");
				var oInitialCars = this.getView().getModel("initCM").getData();
				var oInitialResultSet = oInitialCars.results;

				this.getCarsByCategory(iCategoryId + 1, "upCM");
				var oUpsellCars = this.getView().getModel("upCM").getData();
				var oUpsellResultSet = oUpsellCars.results;
				
				for (var i = 0; i < oInitialResultSet.length; i++) {
					self.addInfosToTiles(oInitialResultSet, i, "initialCarRow", false);
				}

				for (var x = 0; x < oUpsellResultSet.length; x++) {
					self.addInfosToTiles(oUpsellResultSet, x, "upsellCarRow", true);
				}
				 */
				
				
			}
			this.getView().byId("tab" + iId).setEnabled(true);
			this.getView().byId("idIconTabBar2").setSelectedKey("tab" + iId);
		},

		addInfosToTiles: function (oResultSet, iIndex, oElement, bIsUpselling) {
			var self = this;
			var i = iIndex;
			var j = oResultSet[i].PRODUKT_ID;

			var iKategorieId = oResultSet[i].KATEGORIE_ID;

			var oBlockLayout = new sap.ui.layout.BlockLayoutCell({});

			var oAvatar = new sap.f.Avatar({
				src: "img/" + j + ".jpg",
				displayShape: "Square",
				displaySize: "Custom",
				customDisplaySize: "200px",
				press: function () {
					alert("Hello");
				}
			});

			var sText = oResultSet[i].BESCHREIBUNG.substring(0, 200) + "...";
			var oText = new sap.m.Text({
				text: sText,
				width: "200px"
			});

			var oButton = new sap.m.Button({
				text: "Dieses Fahrzeug wählen",
				press: function (oEvent) {
					var sButtonId = oEvent.getSource();
					if (oEvent.getSource().getProperty("type") === "Default") {
						sButtonId.setType("Accept");
						sButtonId.setText("Fahrzeug ausgewählt");	
					} else {
						sButtonId.setType("Default");
						sButtonId.setText("Fahrzeug auswählen");	
					}
					

				}
			});
			
			if (bIsUpselling) {
				var iPreisAlt = this.getPricePerCategory(iKategorieId - 1);
				var iPreisNeu = this.getPricePerCategory(iKategorieId);
				var iAdd = (iPreisNeu - iPreisAlt);
				oButton = new sap.m.Button({
					text: "Diese Fahrzeug wählen für +" + iAdd,
					press: function () {
						alert("Hello");
					}
				});

			}

			// placing it into our view
			this.getView().byId(oElement).addContent(oBlockLayout);
			oBlockLayout.addContent(oAvatar);
			oBlockLayout.addContent(oText);
			oBlockLayout.setTitle(oResultSet[i].BEZEICHNUNG);
			oBlockLayout.addContent(oButton);
		},

		getUserData: function (iId) {
			this.getView().getModel().read("/PERSONEN(" + iId + ")", {
				success: function (oData) {
					this.getView().getModel("PM").setData(oData);
				}.bind(this),
				error: function (e) {}
			});
		},

		onPressMap: function (oEvent) {
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
				error: function (e) {}
			});
		},

		getCarsByCategory: function (iId, sModel) {
			return new Promise(function (resolve, reject) {
				this.getView().getModel().read("/PRODUKTE", {
					filters: [new sap.ui.model.Filter("KATEGORIE_ID", sap.ui.model.FilterOperator.EQ, iId)],
					success: function (oData) {
						resolve(this.getView().getModel(sModel).setData(oData));
					}.bind(this),
					error: function (e) {
						reject(e);
					}
				});
			}.bind(this));
		},
		/*
		getCarsByCategory: function (iId, sModel) {
			this.getView().getModel().read("/PRODUKTE", {
				filters: [new sap.ui.model.Filter("KATEGORIE_ID", sap.ui.model.FilterOperator.EQ, iId)],
				success: function (oData) {
					this.getView().getModel(sModel).setData(oData);
				}.bind(this),
				error: function (e) {}
			});
		},
		*/

		getPricePerCategory: function (iId) {
			this.getView().getModel().read("/KATEGORIE", {
				filters: [new sap.ui.model.Filter("KATEGORIE_ID", sap.ui.model.FilterOperator.EQ, iId)],
				success: function (oData) {
					return oData.results[0].PREIS;
				}.bind(this),
				error: function (e) {}
			});
		},

		onReturnBack: function () {
			var sId = this.getView().byId("idIconTabBar2").getSelectedKey();
			var iId = parseInt(sId.slice(-1), 10) - 1;
			if (sId === "tab2") {
				this.getView().byId("upsellCarRow").removeAllContent();
				this.getView().byId("initialCarRow").removeAllContent();
			}
			if (sId === "tab1") {
				this.getView().getModel("CM").setData(null);
				this.getView().getModel("initCM").setData(null);
				this.getView().getModel("upCM").setData(null);
				//this.getView().byId("avatar0").setTitle("");
				//this.getView().byId("avatar1").setTitle("");
				this.getRouter().getTargets().display("Startpage", {
					fromTarget: "Checkin"
				});
			} else {
				this.getView().byId("tab" + iId).setEnabled(true);
				this.getView().byId("idIconTabBar2").setSelectedKey("tab" + iId);
			}
		},
		
		onFinish: function () {
			this.getRouter().getTargets().display("Finish", {
				fromTarget: "Checkin"
			});
		}
	});

});