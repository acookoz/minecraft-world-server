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
		oWorldsModel: {},
		
		_oRenameDialog: "",

		onInit: function() {

			// Instantiate the UI model
			var oViewModel = new JSONModel({
				tableBusyDelay: 0,
				currentName: "",
				renameContext: ""
			});

			this.getView().setModel(oViewModel, "worldView");

			oViewModel.setProperty("/tableBusyDelay", this.getView().getBusyIndicatorDelay());

			if (!this.bMock) {
				// Load the base world data from the URL
				$.get(this.sBaseUrl,
					function(response) {
						this.oWorldsModel = new JSONModel(response);
						this.getView().setModel(this.oWorldsModel);
						this._onDataLoaded();
					}.bind(this)
				);
			} else {
				this.oWorldsModel = new JSONModel("./model/worlds.json");
				this.getView().setModel(this.oWorldsModel);
			}
			
		},
		
		onWorldsRefresh: function() {
			this._onDataLoaded();
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
			var sName	 = this.getView().getModel("worldView").getProperty("/currentName");

			var sService = "";
			var sOperation = "";
			
			// If no context, do a create
			if (!sContext) {
				sService = "/create";
				sOperation = "created";
			} else {
				sService = sContext.replace("/world/", "/") + "/rename";
				sOperation = "renamed";
			}
			
			
			if (!sContext) {
				// Call the service
				$.post(
					this.sBaseUrl + sService,
					JSON.stringify(
						{
							"name": sName
						}
					),
					function(data, status, err) {
						if (status === "success") {
							MessageToast.show("World successfully " + sOperation, { duration: 10000 } );
						} else {
							MessageToast.show(err, { duration: 20000 });
						}
					}
				);
			}
			
			this._setRenameParams("","");
			this._oRenameDialog.close();
			
		},
		
		_onCancelRename: function() {
			this._setRenameParams("","");
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
			
		},
		
		_onDataLoaded: function() {
		//	this.getView().byId("worldsTable").getBinding("items").refresh();
		}
	});
});