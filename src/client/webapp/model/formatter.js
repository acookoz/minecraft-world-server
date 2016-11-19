sap.ui.define([
	"sap/ui/core/ValueState"
	] , function (ValueState) {
		"use strict";

		return {
		
			stateIcon: function(sValue) {
				switch (sValue.toUpperCase()) {
					case 'STOPPED': 
						return 'sap-icon://pause';
					case 'RUNNING':
						return 'sap-icon://play';
					case 'STOPPING':
					case 'STARTING':
						return 'sap-icon://fob-watch';
				}
			},
			
			state: function(sValue) {
				switch (sValue.toUpperCase()) {
					case 'RUNNING':
						return ValueState.Success;
					case 'STOPPING':
						return ValueState.Error;
					case 'STARTING':
						return ValueState.Warning;
						
				}
			}
		};
	});