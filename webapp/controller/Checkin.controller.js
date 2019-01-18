sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"qperior/mw_challenge/mw_challenge/model/formatter",
	"sap/f/Avatar",
	"sap/m/Text"
], function (Controller, Button, Dialog, List, formatter, Avatar, Text) {
	"use strict";

	return Controller.extend("qperior.mw_challenge.mw_challenge.controller.Checkin", {
		formatter: formatter,

		onInit: function () {
			this.getRouter().getTarget("Checkin").attachDisplay(this._onObjectMatched, this);

			// offer model
			var oOM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oOM, "OM");

			// temporary accessory model
			var oTAM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oTAM, "TAM");

			// insurance model
			var oIM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oIM, "IM");

			this.oWeatherJson = {
				"Flughafen Frankfurt am Main": {
					text: "sun",
					c: "25"
				},
				"Madrid Flughafen": {
					text: "rain",
					c: "10"
				},
				"Berlin Flughafen": {
					text: "sun",
					c: "15"
				},
				"Zürich Flughafen": {
					text: "sun",
					c: "5"
				},
				"München Flughafen": {
					text: "rain",
					c: "17"
				}
			};

		},

		onAfterRendering: function () {
			console.log(this.getPrice(1, [1, 0, 1000], [1, 2]));
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

		onWeatherRead: function (oLocation) {
			return new Promise(function (resolve, reject) {
				var sUrl = 'https://api.apixu.com/v1/current.json?key=32381fe47fc240718e182845191701&q=' + "Quito";
				var aData = jQuery.ajax({
					type: "GET",
					url: sUrl,
					dataType: "json",
					success: function (data) {
						resolve(data);
					}
				});
			});
		},

		getWeatherByLocation: function (sLocation) {
			return this.oWeatherJson[sLocation];
		},

		onSelectInsurance: function (oEvent) {
			var iId = oEvent.getSource().getId();

			var oModelData = this.getView().getModel("IM").getData();
			var insuranceArray = [];
			for (var j = 0; j < oModelData.length; j++) {
				insuranceArray.push("versicherungId" + oModelData[j].VERSICHERUNG_ID);
			}

			var index = insuranceArray.indexOf(iId);
			if (index !== -1) {
				insuranceArray.splice(index, 1);
			}

			for (var i = 0; i < insuranceArray.length; i++) {
				sap.ui.getCore().byId(insuranceArray[i]).setBackgroundImage("img/rejected.jpg");
			}

			var sImage = oEvent.getSource().getProperty("backgroundImage");
			if (sImage.indexOf("rejected") !== -1) {
				sap.ui.getCore().byId(iId).setBackgroundImage("img/selected.jpg");
			} else {
				sap.ui.getCore().byId(iId).setBackgroundImage("img/rejected.jpg");
			}

			var iInsuranceId = 1;

			// get the appropriate insurance (filtering by STARTWERT, ENDWERT & SELBSTBEHALT) and set it in offer model (OM)
			// https://ikha1315a822.hana.ondemand.com/q_perior/mw_challenge/services/MW_Challenge.xsodata/VERSICHERUNGEN?$filter=STARTWERT gt 50
			// https://ikha1315a822.hana.ondemand.com/q_perior/mw_challenge/services/MW_Challenge.xsodata/VERSICHERUNGEN?$filter=STARTWERT le 25 and ENDWERT ge 25 and SELBSTBEHALT eq 500
			var oOfferModel = this.getView().getModel("OM");
			var oOfferData = oOfferModel.getData();
			oOfferData.VERSICHERUNG_ID = iInsuranceId;

			oOfferModel.setData(oOfferData);

		},

		setInsurancesAsModel: function (data) {
			/*
			Insurance Model
			-> get all insurance and save in model "IM"
			*/

			for (var i = 0; i < data.length; i++) {
				var sVersicherungId = "versicherungId" + data[i].VERSICHERUNG_ID;
				var oGenericTile = new sap.m.GenericTile({
					id: sVersicherungId,
					header: data[i].BEZEICHNUNG,
					subheader: "Selbstbehalt: CHF " + data[i].SELBSTBEHALT + ".-",
					frameType: "TwoByOne",
					backgroundImage: "img/rejected.jpg",
					press: function (oEvent) {
						this.onSelectInsurance(oEvent);
					}.bind(this)
				});

				var j = i + 1;
				var oImageContent = new sap.m.ImageContent({
					src: "img/insurance" + j + ".jpg"
				});
				var oTileContent = new sap.m.TileContent({
					footer: "Für nur CHF " + data[i].PREIS + ".- pro Tag",
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
			var oOfferModel = this.getView().getModel("OM");
			var oOfferData = {
				"ANGEBOT_ID": 2837392,
				"ANGEBOT_START": oReservationContext.START_TIME, // utc
				"ANGEBOT_END": oReservationContext.END_TIME, // utc
				"PRODUKT_ID": null, // int
				"PERSON_ID": oReservationContext.PERSON_ID, // int
				"STANDORT_ID_START": oReservationContext.START_LOCATION, // int
				"STANDORT_ID_END": oReservationContext.END_LOCATION, // int
				"VERSICHERUNG_ID": null, // int
				"ZUBEHOER_ID": null // int
			};
			oOfferModel.setData(oOfferData);

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

			var oSpecialCM = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oSpecialCM, "specialCM");

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
							src: "img/z" + j + ".jpg"
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

		getCarById: function (id) {
			var self = this;
			var oModel = this.getView().getModel();
			oModel.read("/PRODUKTE(" + id + ")", {
				success: function (productData) {
					var iCategory = productData.KATEGORIE_ID;
					oModel.read("/KATEGORIE(" + iCategory + ")", {
						success: function (categoryData) {
							var iPrice = categoryData.PREIS;
							oModel.read("/VERSICHERUNGEN", {
								filters: [new sap.ui.model.Filter("STARTWERT", sap.ui.model.FilterOperator.LE, iPrice), new sap.ui.model.Filter(
									"ENDWERT", sap.ui.model.FilterOperator.GE, iPrice)],
								sorters: [new sap.ui.model.Sorter("PREIS", false)],
								success: function (insuranceData) {
									self.getView().getModel("IM").setData(insuranceData.results);
									self.setInsurancesAsModel(insuranceData.results);
								},
								error: function (e) {
									// do something
								}
							});
						},
						error: function (e) {
							// do something
						}
					});

				},
				error: function (e) {
					// do something
				}
			});
		},

		onNext: function (oEvent) {
			var self = this;
			var sId = this.getView().byId("idIconTabBar2").getSelectedKey();
			var iId = parseInt(sId.slice(-1), 10) + 1;
			var oModel = this.getView().getModel("RM").getData();
			var iCategoryId = oModel.KATEGORIE_ID;
			if (iId === 2) {

				this.getCarsByCategory(iCategoryId, "initCM").then(function () {
					var oInitialCars = self.getView().getModel("initCM").getData();
					var oInitialResultSet = oInitialCars.results;

					for (var i = 0; i < oInitialResultSet.length; i++) {
						self.addInfosToTiles(oInitialResultSet, i, "initialCarRow", false);
					}
				});

				this.getCarsByCategory(iCategoryId + 1, "upCM").then(function () {
					var oUpsellCars = self.getView().getModel("upCM").getData();
					var oUpsellResultSet = oUpsellCars.results;

					for (var x = 0; x < oUpsellResultSet.length; x++) {
						self.addInfosToTiles(oUpsellResultSet, x, "upsellCarRow", true);
					}
				});

				var oFromModel = this.getView().getModel("FM");
				var oToModel = this.getView().getModel("TM");

				if (this.getWeatherByLocation(oFromModel.getProperty("/BEZEICHNUNG")).text === "sun" || this.getWeatherByLocation(oToModel.getProperty(
						"/BEZEICHNUNG")).text === "sun") {
					this.getView().byId("specialCarBox").setVisible(true);
					this.getCarsByCategory(6, "specialCM").then(function () {
						var oSpecialCars = self.getView().getModel("specialCM").getData();
						var oSpecialResultSet = oSpecialCars.results;

						for (var x = 0; x < oSpecialResultSet.length; x++) {
							self.addInfosToTiles(oSpecialResultSet, x, "specialCarRow", true);
						}
					});
				}

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

			if (iId === 3) {
				var sSelectedCarIdLong = this.getView().getModel("OM").getData().PRODUKT_ID;
				var sSelectedCarIdShort = sSelectedCarIdLong.substring(5);
				var iSelectedCarId = parseInt(sSelectedCarIdShort, 10);
				var oSelectedCarData = this.getCarById(iSelectedCarId);
			}

			this.getView().byId("tab" + iId).setEnabled(true);
			this.getView().byId("idIconTabBar2").setSelectedKey("tab" + iId);
		},

		addInfoToOfferModel: function (oOfferObject) {
			var oOfferModel = this.getView().getModel("OM");
			var oOfferModelData = oOfferModel.getData();

			var oOfferData = {
				"ANGEBOT_ID": 8273917382,
				"ANGEBOT_START": oOfferModelData.ANGEBOT_START, // utc
				"ANGEBOT_END": oOfferModelData.ANGEBOT_ENDE, // utc
				"PRODUKT_ID": null, // int
				"PERSON_ID": oOfferModelData.PERSON_ID, // int
				"STANDORT_ID_START": oOfferModelData.STANDORT_ID_START, // int
				"STANDORT_ID_END": oOfferModelData.STANDORT_ID_END, // int
				"VERSICHERUNG_ID": null // int
			};
			// get the product_id
			if (oOfferObject && oOfferObject.PRODUKT_ID) {
				oOfferData.PRODUKT_ID = oOfferObject.PRODUKT_ID;
			} else if (oOfferModelData && oOfferModelData.PRODUKT_ID) {
				oOfferData.PRODUKT_ID = oOfferModelData.PRODUKT_ID;
			}

			// get the 
			oOfferModel.setData(oOfferData);
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
				id: "carId" + j,
				text: "Fahrzeug auswählen",
				press: function (oEvent) {
					var aCarIds = [];
					var sCarId = this.getId();
					var oOfferObject = {
						PRODUKT_ID: sCarId
					};
					self.addInfoToOfferModel(oOfferObject);
					for (var k = 1; k < 15; k++) {
						if (sap.ui.getCore().byId("carId" + k) === undefined) {
							continue;
						} else if ("carId" + k === oEvent.getSource().getId()) {
							continue;
						} else {
							aCarIds.push("carId" + k);
						}
					}

					for (var l = 0; l < aCarIds.length; l++) {
						sap.ui.getCore().byId(aCarIds[l]).setType("Default");
						sap.ui.getCore().byId(aCarIds[l]).setText("Fahrzeug auswählen");
					}

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
				var iPreisAlt = this.getPricePerCategory(iKategorieId - 1).then(function () {
					var iPreisNeu = self.getPricePerCategory(iKategorieId).then(function () {
						var iAdd = (iPreisNeu - iPreisAlt);
						oButton = new sap.m.Button({
							id: "carUpId" + j,
							text: "Dieses Fahrzeug wählen für +" + iAdd,
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
					});
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
			return new Promise(function (resolve, reject) {
				this.getView().getModel().read("/KATEGORIE", {
					filters: [new sap.ui.model.Filter("KATEGORIE_ID", sap.ui.model.FilterOperator.EQ, iId)],
					success: function (oData) {
						resolve(oData.results[0].PREIS);
					}.bind(this),
					error: function (e) {
						reject(e);
					}
				});
			}.bind(this));
		},

		onReturnBack: function () {
			var sId = this.getView().byId("idIconTabBar2").getSelectedKey();
			var iId = parseInt(sId.slice(-1), 10) - 1;
			if (sId === "tab2") {
				this.getView().byId("upsellCarRow").removeAllContent();
				this.getView().byId("specialCarRow").removeAllContent();
				this.getView().byId("initialCarRow").removeAllContent();
			}
			if (sId === "tab1") {
				this.getView().getModel("CM").setData(null);
				this.getView().getModel("initCM").setData(null);
				this.getView().getModel("upCM").setData(null);
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
		},

		getSelectedAccessories: function () {
			var aSelectedAccessories = [];
			for (var i = 1; i < 7; i++) {
				if (sap.ui.getCore().byId("zubehoerId" + i).getBackgroundImage().indexOf("selected") > -1) {
					aSelectedAccessories.push(i);
				}
			}
			return aSelectedAccessories;
		},

		saveOfferAccessories: function (data) {
			var oModel = this.getView().getModel();
			oModel.create("/ANGEBOTZUBEHOER", data, {
				success: function (dataAZS) {
					// do nothing
				},
				error: function (dataAZE) {
					// do nothing
				}
			});
		},

		finishOffer: function () {
			this.getRouter().getTargets().display("Finish", {
				fromTarget: "Checkin"
			});
		},

		onSaveOffer: function () {
			/*
				=> get all relevant data and save it in collection "/ANGEBOTE" as final offer
			*/
			var self = this;
			var iProductId;
			for (var i = 1; i < 15; i++) {
				if (sap.ui.getCore().byId("carId" + i) !== undefined) {
					if (sap.ui.getCore().byId("carId" + i).getType() === "Accept") {
						iProductId = i;
					}
				}
			}

			var iZubehoerId = [];
			for (var j = 1; j < 7; j++) {
				if (sap.ui.getCore().byId("zubehoerId" + j) !== undefined) {
					if (sap.ui.getCore().byId("zubehoerId" + j).getBackgroundImage().indexOf("selected") > 0) {
						iZubehoerId.push(j);
					}
				}
			}

			var iVersicherungId;
			for (var k = 1; k < 5; k++) {
				if (sap.ui.getCore().byId("versicherungId" + k).getBackgroundImage().indexOf("selected") > 0) {
					iVersicherungId = k;
				}
			}

			var iPersonId = this.getView().getModel("PM").getData().PERSON_ID;
			var dStartTime = this.getView().getModel("RM").getData().START_TIME;
			var dEndTime = this.getView().getModel("RM").getData().END_TIME;
			var iStartLocation = this.getView().getModel("RM").getData().START_LOCATION;
			var iEndLocation = this.getView().getModel("RM").getData().END_LOCATION;

			var oData = {
				"ANGEBOT_ID": 8273917382,
				"ANGEBOT_START": dStartTime, // utc
				"ANGEBOT_END": dEndTime, // utc
				"PRODUKT_ID": iProductId, // int
				"PERSON_ID": iPersonId, // int
				"STANDORT_ID_START": iStartLocation, // int
				"STANDORT_ID_END": iEndLocation, // int
				"VERSICHERUNG_ID": iVersicherungId // int
			};

			var aSelectedAccessories = this.getSelectedAccessories();

			var oModel = this.getView().getModel();
			oModel.create("/ANGEBOTE", oData, {
				success: function (data) {
					oModel.read("/ANGEBOTE", {
						success: function (dataO) {
							var oDataSet = dataO.results;
							var iIndexOfLastObject = oDataSet.length - 1;
							var iOfferIdOfLastObject = oDataSet[iIndexOfLastObject].ANGEBOT_ID;
							for (var l = 0; l < aSelectedAccessories.length; l++) {
								var oAccessories = {
									ANGEBOTZUBEHOER_ID: 33747323299,
									ANGEBOT_ID: iOfferIdOfLastObject,
									ZUBEHOER_ID: aSelectedAccessories[l]
								};
								self.saveOfferAccessories(oAccessories);
								self.finishOffer();
							}
						},
						error: function (e) {
							// do nothing
						}
					});
				},
				error: function (e) {}
			});

		},

		getPrice: function (iKategorieId, aVersicherung, aZubehörArray) {
			var iPreis;
			this.getView().getModel().read("/KATEGORIE(" + iKategorieId + ")", {
				success: function (oData) {
					iPreis = oData.PREIS;
					this.getView().getModel().read("/VERSICHERUNGEN(VERSICHERUNG_ID=1,STARTWERT=0d,SELBSTBEHALT=1000d)", {
						success: function (oData) {
							var iVsPreis = oData.PREIS;
							iPreis = parseInt(iVsPreis, 10) + iPreis;
							aZubehörArray.forEach(function (iZubehörId) {
								this.getView().getModel().read("/ZUBEHOER(" + iZubehörId + ")", {
									success: function (oData) {
										var iZbPreis = oData.PREIS;
										iPreis = parseInt(iZbPreis, 10) + iPreis;
										console.log(iPreis);
									}
								});
							}.bind(this));
							return iPreis;
						}.bind(this)
					});
				}.bind(this)
			});

		}

	});

});