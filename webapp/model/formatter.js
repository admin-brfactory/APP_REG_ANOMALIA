sap.ui.define(function() {
	"use strict";
	return {
		formatDate: function(sValue) {
			if (!sValue) {
				return;
			}

			//sValue = sValue.substr(6, 2) + "/" + sValue.substr(4, 2) + "/" + sValue.substr(0, 4);
			sValue = sValue.substr(0, 4) + "-" + sValue.substr(4, 2) + "-" + sValue.substr(6);
			sValue = sValue + "T23:00:00";
			return new Date(sValue);
		},

		formatTime: function(sTime, sDate) {
			if (!sTime || !sDate) {
				return;
			}

			sTime = sTime.substr(0, 2) + ":" + sTime.substr(2, 2) + ":" + sTime.substr(4);
			sDate = sDate.substr(0, 4) + "-" + sDate.substr(4, 2) + "-" + sDate.substr(6);
			sTime = sDate + "T" + sTime;
			return new Date(sTime);
		},

		formatMatricula: function(sValue) {
			var auxValue;
			if (!sValue) {
				return;
			}

			try {
				auxValue = parseInt(sValue);
				if (auxValue === 0 || isNaN(auxValue)) {
					sValue = "";
					this.getView().getModel("registrarAnomalia").setProperty("/tabValueHelpComunicado", []);
				}

			} catch (e) {
				sValue = "";
				this.getView().getModel("registrarAnomalia").setProperty("/tabValueHelpComunicado", []);
			}
			return sValue;
		},

		converToABAPDate: function(sValue) {
			if (!sValue) {
				return;
			}

			sValue = sValue.toLocaleDateString();

			sValue = sValue.substr(6) + sValue.substr(3, 2) + sValue.substr(0, 2);

			return sValue;
		},

		convertToABAPTime: function(sValue) {
			if (!sValue) {
				return;
			}

			sValue = sValue.toLocaleTimeString();
			sValue = sValue.replaceAll(":", "");

			return sValue;
		}

	};
});