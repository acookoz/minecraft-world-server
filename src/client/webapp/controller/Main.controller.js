sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"mmd/minecraft/model/formatter",
	"sap/m/Button",
	"sap/m/MessageToast"
], function(Controller, JSONModel, formatter, Button, MessageToast) {
	"use strict";

	return Controller.extend("mmd.minecraft.controller.Main", {

		formatter: formatter,

		bMock: false,

		sBaseUrl: 'http://manmountain84.ddns.net:4123/minecraftserver',
		oWorldsModel: "",

		_oRenameDialog: "",

		onInit: function() {

			// Instantiate the UI model
			var oViewModel = new JSONModel({
				tableBusyDelay: 0,
				currentName: "",
				renameContext: ""
			});

			this.getView().setModel(oViewModel, "worldView");
			
			this.onWorldsRefresh();

			oViewModel.setProperty("/tableBusyDelay", this.getView().getBusyIndicatorDelay());

		},

		onWorldsRefresh: function() {
			
			this.getView().byId("worldsTable").setBusy(true);
			
			if (!this.bMock) {
				// Load the base world data from the URL
				$.get(this.sBaseUrl,
					function(response) {
						if (!this.oWorldsModel) {
							this.oWorldsModel = new JSONModel(response);
							this.getView().setModel(this.oWorldsModel);
						} else {
							this.oWorldsModel.setData(response);
						}
						this.getView().byId("worldsTable").setBusy(false);
					}.bind(this)
				);
			} else {
				this.oWorldsModel = new JSONModel("./model/worlds.json");
				this.getView().setModel(this.oWorldsModel);
				this.getView().byId("worldsTable").setBusy(false);
			}
			
		},

		onCreateWorld: function() {

			this._openRenameDialog();

		}, 

		onRename: function(oEvent) {

			var sPath = oEvent.getSource().getBindingContext().sPath;
			var sCurrentName =
				this.oWorldsModel.getProperty(sPath && "name");

			this._setRenameParams(sCurrentName, sPath);

			this._openRenameDialog();
		},

		_openRenameDialog: function() {

			if (!this._oRenameDialog) {
				this._oRenameDialog = sap.ui.xmlfragment("mmd.minecraft.view.Rename", this);
				this._oRenameDialog.addButton(
					new Button({
						text: "Save",
						press: this._onDoRename.bind(this),
						type: "Accept"
					}));
				this._oRenameDialog.addButton(
					new Button({
						text: "Cancel",
						press: this._onCancelRename.bind(this),
						type: "Reject"
					}));
				this.getView().addDependent(this._oRenameDialog);
			}

			this._oRenameDialog.open();

		},

		_onDoRename: function() {

			var sContext = this.getView().getModel("worldView").getProperty("/renameContext");
			var sName = this.getView().getModel("worldView").getProperty("/currentName");

			var sService = "";
			var sOperation = "";

			// If no context, do a create
			if (!sContext) {
				sService = "/create";
				sOperation = "created";
			} else {
				sService = "/" + this.getView().getModel().getProperty(sContext).id + "/rename";
				sOperation = "renamed";
			}

			// Call the service
			$.ajax({
				url: this.sBaseUrl + sService,
				type: "POST",
				data: JSON.stringify({
					name: sName
				}),
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				success: function() {
					MessageToast.show("World successfully " + sOperation, {
						duration: 10000
					});
					this.onWorldsRefresh();
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					MessageToast.show(errorThrown, {
						duration: 20000
					});
				}
			});

			this._setRenameParams("", "");
			this._oRenameDialog.close();

		},

		_onCancelRename: function() {
			this._setRenameParams("", "");
			this._oRenameDialog.close();
		},

		_setRenameParams: function(sCurrentName, sPath) {
			this.getView().getModel("worldView").setProperty("/currentName", sCurrentName);
			this.getView().getModel("worldView").setProperty("/renameContext", sPath);
		},

		onStop: function(oEvent) {

		},

		onStart: function(oEvent) {

		},

		onDelete: function(oEvent) {

		}
	});
});