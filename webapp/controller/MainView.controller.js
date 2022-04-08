sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/util/File",
	"sap/m/MessageBox",
	"com/arcelor/ZGEEHS_REG_ANOM/model/formatter"
], function(Controller, JSONModel, File, MessageBox, formatter) {
	"use strict";

	return Controller.extend("com.arcelor.ZGEEHS_REG_ANOM.controller.MainView", {

		formatter: formatter,

		onInit: function() {
			var oViewModel = new JSONModel({
				AcoesImedLabel: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("lblAcoesImediatasSintomas"),
				ConsequenciaLabel: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("lblConsequenciaPerda"),
				EntradaRegistroValue: "",
				TituloAnomaliaValue: "",
				DataOcorrenciaValue: new Date(),
				HoraOcorrenciaValue: new Date(),
				DescPreliminarAnomValue: "",
				AcoesImediatasValue: "",
				ConsequenciaValue: "",
				PossiveisCausasValue: "",
				SugestoesValue: "",
				EntradaRegistroEnabled: false,
				UnidadeOrganizacionalEnabled: false,
				SiteRespRegEnabled: false,
				FornecedorRespRegEnabled: false,
				DetalhamentoLocalEnabled: false,
				ComunicadoPorEnabled: false,

				ListaLetraRegTrab: [],
				ListaOrigemAnomalia: [],
				ListaLocaisInstalacao: [],
				ListaDetalhamentoLocal: [],

				tabValueHelpComunicado: [],
				tabAnomalia: [],

				InfoUser: {},
				AnexosLista: []
			});
			this.getView().setModel(oViewModel, "registrarAnomalia");
			this.getDadosIniciais();
		},

		getDadosIniciais: function() {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var usuario = sap.ushell.Container.getService("UserInfo").getId();

			var sURL = "/GET_DADOS_INICIAISSet(USUARIO='" + usuario + "')";

			sap.ui.core.BusyIndicator.show();
			oModel.read(sURL, {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();

					if (oData.ES_INFOS_USER) {
						var oInfoUser = JSON.parse(oData.ES_INFOS_USER);

						oViewModel.setProperty("/SiteRespRegValue", oInfoUser);
						oViewModel.setProperty("/InfoUser", oInfoUser);
					}

					if (oData.LIST_LETRA_REG_TRAB) {
						var oListRegTrab = JSON.parse(oData.LIST_LETRA_REG_TRAB);

						oViewModel.setProperty("/ListaLetraRegTrab", oListRegTrab);
					}

					if (oData.LIST_ORIGEM_ANOMALIA) {
						var oListOrigemAnomalia = JSON.parse(oData.LIST_ORIGEM_ANOMALIA);

						oViewModel.setProperty("/ListaOrigemAnomalia", oListOrigemAnomalia);
					}

					if (oData.LIST_LOCAIS_INSTALACAO) {
						var oListLocaisInst = JSON.parse(oData.LIST_LOCAIS_INSTALACAO);

						oViewModel.setProperty("/ListaLocaisInstalacao", oListLocaisInst);
					}

					if (oData.TAB_ANOMALIA) {
						var oTabAnomalia = JSON.parse(oData.TAB_ANOMALIA);

						//if (oTabAnomalia.length > 0) {
						if (oTabAnomalia.IASTATUS === "I0439") {
							
							if(oData.TAB_ANEXOS){
							var	oTabAnexos = JSON.parse(oData.TAB_ANEXOS);
								oViewModel.setProperty("/AnexosLista", oTabAnexos);
							}
							
							oViewModel.setProperty("/tabAnomalia", oTabAnomalia);
							oViewModel.setProperty("/DataOcorrenciaValue", formatter.formatDate(oTabAnomalia.EVDAT));
							oViewModel.setProperty("/HoraOcorrenciaValue", formatter.formatTime(oTabAnomalia.EVTIME, oTabAnomalia.EVDAT));
							oViewModel.setProperty("/TituloAnomaliaValue", oTabAnomalia.EVDESC);
							oViewModel.setProperty("/EntradaRegistroValue", oTabAnomalia.IALID);
							oViewModel.setProperty("/DescPreliminarAnomValue", oTabAnomalia.MWERT3);
							oViewModel.setProperty("/AcoesImediatasValue", oTabAnomalia.MWERT6);
							oViewModel.setProperty("/ConsequenciaValue", oTabAnomalia.MWERT10);
							oViewModel.setProperty("/PossiveisCausasValue", oTabAnomalia.MWERT4);
							oViewModel.setProperty("/SugestoesValue", oTabAnomalia.MWERT7);
							oViewModel.setProperty("/InfoUser/PERNR", oTabAnomalia.MWERT8);
							this.getDetalhamentoLocal();
							this.getView().byId("ComunicadoPor").fireChange();
						}
						//}
					}

				}.bind(this),
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();

				}.bind(this)
			});
		},

		getDetalhamentoLocal: function(oEvent) {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var codLocal = this.getView().byId("LocalInstalacao").getSelectedKey();

			var sURL = "/GET_DETALHAMENTO_LOCALSet(COD_LOCAL_INSTALACAO='" + codLocal + "')";

			sap.ui.core.BusyIndicator.show();
			oModel.read(sURL, {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();

					if (oData.LIST_DETALHAMENTO_LOCAL) {
						var oListDetalheLocal = JSON.parse(oData.LIST_DETALHAMENTO_LOCAL);

						if (oListDetalheLocal.length > 0)
							oViewModel.setProperty("/ListaDetalhamentoLocal", oListDetalheLocal);
							oViewModel.setProperty("/DetalhamentoLocalEnabled", true);
					}

				}.bind(this),
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();

				}.bind(this)
			});
		},

		onChangeComunicadoPor: function() {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var matricula = oViewModel.getProperty("/InfoUser/PERNR");
			var sURL = "/GET_PESQUISA_COMUNICADO_PORSet(PERNR='" + matricula + "')";

			sap.ui.core.BusyIndicator.show();
			oModel.read(sURL, {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();

					if (oData.ET_MENSAGEM) {
						var oMensagem = JSON.parse(oData.ET_MENSAGEM);

						if (oMensagem.length > 0) {
							if (oMensagem[0].TYPE === "E") {
								MessageBox.error(oMensagem[0].MESSAGE, {
									onClose: function(oAction) {
										oViewModel.setProperty("/InfoUser", "");
										this.getView().byId("ComunicadoPor").fireChange();
									}.bind(this)
								});
								return;
							}
						}
					}

					if (oData.ES_DADOS_USUARIO) {
						var oDadosUsuarioPesquisado = JSON.parse(oData.ES_DADOS_USUARIO);

						oViewModel.setProperty("/InfoUser", oDadosUsuarioPesquisado);
						this.getLocaisInst();
					}

				}.bind(this),
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();

				}.bind(this)
			});
		},

		onChangeAutoRealto: function(oEvent) {
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var autoRelatoSelectedkey = oEvent.getSource().getSelectedKey();

			if (autoRelatoSelectedkey === "S") {
				oViewModel.setProperty("/ComunicadoPorEnabled", false);
				oViewModel.setProperty("/InfoUser", []);
				this.getView().byId("ComunicadoPor").fireChange();
			} else {
				oViewModel.setProperty("/ComunicadoPorEnabled", true);
			}
		},

		onSearchComunicadoPorValueHelp: function() {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var matricula = "";
			var nome = "";

			if (this.getView().byId("SearchMatricula").getValue() !== "") {
				matricula = this.getView().byId("SearchMatricula").getValue();
			} else if (this.getView().byId("SearchNome").getValue() !== "") {
				nome = this.getView().byId("SearchNome").getValue();
				nome = nome.toUpperCase().trim();
				nome = encodeURIComponent(nome);
			}

			if (matricula === "" && nome === "") {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("msgPreencherPeloMenosUm"));
				return;
			}

			var sURL = "/GET_COMUNICADO_VALUE_HELPSet(PERNR='" + matricula + "',NOME='" + nome + "')";

			sap.ui.core.BusyIndicator.show();
			oModel.read(sURL, {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();

					if (oData.ET_MENSAGEM) {
						var oMensagem = JSON.parse(oData.ET_MENSAGEM);

						if (oMensagem.length > 0) {
							if (oMensagem[0].TYPE === "E") {
								MessageBox.error(oMensagem[0].MESSAGE);
								return;
							}
						}
					}

					if (oData.ES_DADOS_USUARIO) {
						var oDadosUsuarioPesquisado = JSON.parse(oData.ES_DADOS_USUARIO);

						oViewModel.setProperty("/tabValueHelpComunicado", oDadosUsuarioPesquisado);
					}

				}.bind(this),
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();

				}.bind(this)
			});
		},

		valueHelpSetResponsavel: function(oEvent) {
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var oInfoUser = oViewModel.getProperty("/tabValueHelpComunicado")[0];
			oViewModel.setProperty("/InfoUser", oInfoUser);

			this.onCloseDialog("ComunicadoPorHelpFrag");
			this.getLocaisInst();
		},

		getLocaisInst: function() {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var oInfoUser = oViewModel.getProperty("/InfoUser");
			var btrtl = oInfoUser.BTRTL;

			var sURL = "/GET_LOCAIS_INSTALACAOSet(BTRTL='" + btrtl + "')";

			sap.ui.core.BusyIndicator.show();
			oModel.read(sURL, {
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();

					if (oData.LIST_LOCAIS_INSTALACAO) {
						var oListaLocaisInstalacao = JSON.parse(oData.LIST_LOCAIS_INSTALACAO);

						oViewModel.setProperty("/ListaLocaisInstalacao", oListaLocaisInstalacao);
					}

				}.bind(this),
				error: function(oError) {
					sap.ui.core.BusyIndicator.hide();

				}.bind(this)
			});
		},

		checaNumerico: function(sID, sLength) {
			var regExp = /[a-zA-Z]/g;
			var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?°¨¨ºª₢£¢¬§`~´çÇ]+/;
			var sValue = this.getView().byId(sID).getValue();

			if (sLength) {
				this.getView().byId(sID).setValue(sValue.substr(0, sLength));
			}

			if (regExp.test(sValue) || format.test(sValue)) {
				this.getView().byId(sID).setValue(sValue.substring(0, sValue.length - 1));
			}
		},

		onCloseDialog: function(sID) {
			var oViewModel = this.getView().getModel("registrarAnomalia");
			this.getView().byId(sID).close();

			if (sID === "ComunicadoPorHelpFrag") {
				this.getView().byId("SearchMatricula").setValue("");
				this.getView().byId("SearchNome").setValue("");
				oViewModel.setProperty("/tabValueHelpComunicado", []);
			}
		},

		onValueHelpComunicadoPor: function() {
			this._openValueHelpComunicadoPor().open();
		},

		_openValueHelpComunicadoPor: function() {
			if (!this.openValueHelpComunicadoPor) {
				this.openValueHelpComunicadoPor = sap.ui.xmlfragment(this.getView().getId(),
					"com.arcelor.ZGEEHS_REG_ANOM.view.fragments.ComunicadoPorHelp", this);
				this.getView().addDependent(this.openValueHelpComunicadoPor);
			}
			return this.openValueHelpComunicadoPor;
		},

		fileUploader: function(oEvent) {
			var fileUP = this.byId("fileUploader");
			var reader = new FileReader();
			var file = oEvent.getParameter("files")[0];
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var sName = oEvent.getParameters().files[0].name;
			var sType = this.getExtension(sName);
			var anexoLista = oViewModel.getProperty("/AnexosLista");

			if (sType === "jpg" || sType === "jpeg" || sType === "bmp" || sType === "png" || sType === "svg") {
				reader.onload = function(e) {
					var binaryString = e.target.result;
					var fileBase64 = btoa(binaryString);

					var oFile = {
						"FNAME": sName,
						"FTYPE": sType.toUpperCase(),
						"FSIZE": file.size,
						"FCONT": fileBase64
					};

					anexoLista.push(oFile);

					oViewModel.setProperty("/AnexosLista", anexoLista);

					fileUP.clear();
				};
				reader.readAsBinaryString(file);
			} else {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("msgApenasImagens"));
				fileUP.clear();
				return;
			}
		},

		deletarAnexo: function(oEvent) {
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var fileUP = this.getView().byId("fileUploader");
			var oItem = oEvent.getParameter("listItem");
			var anexoList = oViewModel.getProperty("/AnexosLista");
			var anexoListSelectedPath = oItem.getBindingContextPath("registrarAnomalia").replace("/AnexosLista/", "");

			anexoList.splice(anexoListSelectedPath, 1);

			oViewModel.setProperty("/AnexosLista", anexoList);
			fileUP.clear();
		},

		getExtension: function(filename) {
			var parts = filename.split('.');
			return parts[parts.length - 1];
		},

		linkAttach: function(oEvent) {
			var linkSelected = oEvent.getSource().getBindingInfo("text").binding.getContext().sPath;
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var tableData = oViewModel.getProperty(linkSelected);

			if (tableData.FTYPE == "JPG" || tableData.FTYPE == "PNG" || tableData.FTYPE == "JPEG" || tableData.FTYPE == "SVG" ||
				tableData.FTYPE == "BMP") {
				var tab = window.open("about:blank", "_blank");
				tableData.FCONT = "data:image/jpeg;bmp;png;jpg;svg;base64," + tableData.FCONT;
				tab.document.write("<image src='" + tableData.FCONT + "' width=" + 700 + " heigh=" + 700 + " ></image>");

				tableData.FCONT = tableData.FCONT.replace("data:image/jpeg;bmp;png;jpg;svg;base64,", "");
			} else if (tableData.FTYPE == "PDF") {
				var fileBase64 = atob(tableData.FCONT);
				var attachNamePDF = tableData.FNAME.replace(".pdf", "");

				var byteArray = new Uint8Array(fileBase64.length);
				for (var i = 0; i < fileBase64.length; i++) {
					byteArray[i] = fileBase64.charCodeAt(i);
				}

				var blob = new Blob([byteArray.buffer], {
					type: 'application/pdf'
				});

				var pdfURL = URL.createObjectURL(blob);

				window.open(pdfURL, "_blank");

			} else if (tableData.FTYPE == "XLSX") {
				var fileBase64XLSX = atob(tableData.FCONT);
				var attachName = tableData.FNAME.replace(".xlsx", "");

				var byteArrayXLSX = new Uint8Array(fileBase64XLSX.length);
				for (var k = 0; k < fileBase64XLSX.length; k++) {
					byteArrayXLSX[k] = fileBase64XLSX.charCodeAt(k);
				}

				File.save(
					byteArrayXLSX.buffer,
					attachName,
					"xlsx",
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				);

				// var XLSXUrl = URL.createObjectURL(blobXLSX);

				// window.open(XLSXUrl, "_blank");
			} else if (tableData.FTYPE == "TXT") {
				var fileBase64TXT = atob(tableData.FCONT);
				var attachNameTXT = tableData.FNAME.replace(".txt", "");

				var byteArrayTXT = new Uint8Array(fileBase64TXT.length);
				for (var j = 0; j < fileBase64TXT.length; j++) {
					byteArrayTXT[j] = fileBase64TXT.charCodeAt(j);
				}

				File.save(
					byteArrayTXT.buffer,
					attachNameTXT,
					"txt",
					"text/plain"
				);
			} else if (tableData.FTYPE == "PPTX") {
				var fileBase64PPTX = atob(tableData.FCONT);
				var attachNamePPTX = tableData.FNAME.replace(".pptx", "");

				var byteArrayPPTX = new Uint8Array(fileBase64PPTX.length);
				for (var h = 0; h < fileBase64PPTX.length; h++) {
					byteArrayPPTX[h] = fileBase64PPTX.charCodeAt(h);
				}

				File.save(
					byteArrayPPTX.buffer,
					attachNamePPTX,
					"pptx",
					"application/vnd.ms-powerpoint"
				);
			} else if (tableData.FTYPE == "DOC" || tableData.FTYPE == "DOCX") {
				var fileBase64DOC = atob(tableData.FCONT);
				var attachNameDOC = "";

				if (tableData.FTYPE == "DOC") {
					attachNameDOC = tableData.FNAME.replace(".doc", "");
				} else if (tableData.FTYPE == "DOCX") {
					attachNameDOC = tableData.FNAME.replace(".docx", "");
				}

				var byteArrayDOC = new Uint8Array(fileBase64DOC.length);
				for (var f = 0; f < fileBase64DOC.length; f++) {
					byteArrayDOC[f] = fileBase64DOC.charCodeAt(f);
				}

				File.save(
					byteArrayDOC.buffer,
					attachNameDOC,
					"docx",
					"application/vnd.openxmlformats-officedocument.wordprocessingml"
				);
			}

		},

		validaCamposObrigatórios: function() {
			var TituloAnomalia = this.getView().byId("TituloAnomalia").getValue();
			var DataOcorrencia = this.getView().byId("DataOcorrencia").getDateValue();
			var LetraRegTrabalho = this.getView().byId("LetraRegTrabalho").getSelectedKey();
			var LocalInstalacao = this.getView().byId("LocalInstalacao").getSelectedKey();
			var DescPrelimAnom = this.getView().byId("DescPrelimAnom").getValue();
			var AcoesImediatas = this.getView().byId("AcoesImediatas").getValue();
			var ComunicadoPor = this.getView().byId("ComunicadoPor").getValue();

			if (TituloAnomalia === "") {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("msgTituloAnomaliaObrigatorio"));
				return false;
			} else if (DataOcorrencia === null) {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("msgDataOcorrenciaObrigatorio"));
				return false;
			} else if (LetraRegTrabalho === "") {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("msgLetraRegTrabalhoObrigatorio"));
				return false;
			} else if (LocalInstalacao === "") {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("msgLocalInstalacaoObrigatorio"));
				return false;
			} else if (DescPrelimAnom === "") {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("msgDescPremilimObrigatorio"));
				return false;
			} else if (AcoesImediatas === "") {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("msgAcoesImediatasObrigatorio"));
				return false;
			} else if (ComunicadoPor === "") {
				MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("msgComunicadoPorObrigatorio"));
				return false;
			}
		},

		montaEstruturaAnomalia: function(sAction) {
			var Iatype = "9";
			var Mwert5 = "1";
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var EntradaRegistroValue = oViewModel.getProperty("/EntradaRegistroValue");
			var TituloAnomaliaValue = oViewModel.getProperty("/TituloAnomaliaValue");
			var DataOcorrenciaValue = formatter.converToABAPDate(oViewModel.getProperty("/DataOcorrenciaValue"));
			var HoraOcorrenciaValue = formatter.convertToABAPTime(oViewModel.getProperty("/HoraOcorrenciaValue"));
			var LetraRegTrabalho = this.getView().byId("LetraRegTrabalho").getSelectedKey();
			var OrigemAnomalia = this.getView().byId("OrigemAnomalia").getSelectedKey();
			var UnidadeOrganizacional = oViewModel.getProperty("/InfoUser/ORGEH");
			var SiteRespReg = oViewModel.getProperty("/InfoUser/BTRTL");
			var FornecRespReg = oViewModel.getProperty("/InfoUser/LIFNR_NAME");
			var LocalInstalacao = this.getView().byId("LocalInstalacao").getSelectedKey();
			var DetalhamentoLocal = this.getView().byId("DetalhamentoLocal").getSelectedKey();
			var LIFNR = oViewModel.getProperty("/InfoUser/LIFNR");
			var DescPreliminarAnomValue = oViewModel.getProperty("/DescPreliminarAnomValue");
			var AcoesImediatasValue = oViewModel.getProperty("/AcoesImediatasValue");
			var ConsequenciaValue = oViewModel.getProperty("/ConsequenciaValue");
			var PossiveisCausasValue = oViewModel.getProperty("/PossiveisCausasValue");
			var SugestoesValue = oViewModel.getProperty("/SugestoesValue");
			var AutoRelato = this.getView().byId("AutoRelato").getSelectedKey();
			var ComunicadoPorValue = oViewModel.getProperty("/InfoUser/PERNR");
			var ComunicadoPorNome = oViewModel.getProperty("/InfoUser/ENAME").trim();

			var oAnomalia = {
				IALID: EntradaRegistroValue, //oViewModel.getProperty("/anomaliaId"),
				IATYPE: Iatype, //"9",
				EVDESC: TituloAnomaliaValue, //oViewModel.getProperty("/tituloAnomalia"),
				EVDAT: DataOcorrenciaValue, //this.convertToDate(oViewModel.getProperty("/dataOcorrencia")),
				EVTIME: HoraOcorrenciaValue, //this.convertToHour(oViewModel.getProperty("/horaOcorrencia")),
				LETRA: LetraRegTrabalho, //this.byId("fieldLetraReg").getSelectedKey(),
				ORIGEM: OrigemAnomalia, //this.byId("fieldOrigemAnomalia").getSelectedKey(),
				WAID: UnidadeOrganizacional, //oViewModel.getProperty("/unidadeOriganizacional"),
				IAPLANT: SiteRespReg, // oViewModel.getProperty("/siteRespRegistro"),
				LIFNR_T: FornecRespReg,
				LOC_INSTAL: LocalInstalacao,
				//ZZLOCAL: ,							//this.byId("fieldLocalInstalacao").getSelectedKey(),
				DETALHE: DetalhamentoLocal,
				LIFNR: LIFNR,
				//	Aclocdesc:								//oViewModel.getProperty("/localAnomalia"),
				MWERT3: DescPreliminarAnomValue, //oViewModel.getProperty("/descricaoPreliminar"),
				MWERT5: Mwert5, //"1",
				MWERT9: sAction, // _action,
				MWERT6: AcoesImediatasValue, //oViewModel.getProperty("/acaoImediata"),
				MWERT10: ConsequenciaValue, // oViewModel.getProperty("/consequencia"),
				MWERT4: PossiveisCausasValue, //oViewModel.getProperty("/possivelCausa"),
				MWERT7: SugestoesValue, //oViewModel.getProperty("/sugestao"),
				MWERT2: AutoRelato === "S" ? "1" : "2", //sRelato === "S" ? "X" : " ",
				MWERT8: ComunicadoPorValue, //oViewModel.getProperty("/comunicadoPor"),
				COMUNIC_POR_T: ComunicadoPorNome //sComunicado
			};

			return JSON.stringify(oAnomalia);
		},

		onGravar: function(sAction) {
			var oModel = this.getOwnerComponent().getModel();
			var oViewModel = this.getView().getModel("registrarAnomalia");
			var validaCampos = this.validaCamposObrigatórios();
			var anexos = this.getView().getModel("registrarAnomalia").getProperty("/AnexosLista");
			var oDadosAnomalia;
			if (validaCampos === false) {
				return;
			}
			var oEntry = {
				DADOS_ANOMALIA: this.montaEstruturaAnomalia(sAction),
				ANEXOS: JSON.stringify(anexos)
			};

			sap.ui.core.BusyIndicator.show();
			oModel.create("/SALVAR_ANOMALIASet", oEntry, {

				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					if (oData.ES_MENSAGEM) {
						var oMensagem = JSON.parse(oData.ES_MENSAGEM);

						if (oMensagem.length > 0) {
							if (oMensagem[0].TYPE === "S") {
								MessageBox.success(oMensagem[0].MESSAGE);
							}
						}
					}

				}.bind(this),

				error: function(error) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.error(this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("msgErroInesperado"));
				}.bind(this)

			});
		}

	});
});