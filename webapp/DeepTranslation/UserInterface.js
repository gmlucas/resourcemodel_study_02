sap.ui.define([ 
	"sap/ui/core/Fragment",
	"sap/ui/core/Popup"
], function( Fragment, Popup ) {
	"use strict";

	var UserInterface = {

		_oPopup: null,
		
		init: function( resourceModel ) {
			document.addEventListener("keydown", this.handleKeypress.bind(this), { capture: true } );
			this.resourceModel = resourceModel;
			this.UI = new sap.ui.model.json.JSONModel( this.defineModelData() );
		},
		
		defineModelData: function() {
			return {
				enabled: false,
				transformation: "none"
			}
		},
		
		handleKeypress: function( ev ) {
			if ( ev.keyCode === 84 ) {
				if ( ev.altKey && ev.ctrlKey && ev.shiftKey ) {
					ev.stopImmediatePropagation();					
					this.openTranslationMenu();
				}
			}
		},

		openTranslationMenu: function() {
			if ( !this._oPopup ) {
				this._oPopup = new Popup(this, true, false, false ); // modal, shadow, autoclose
			}
			if ( this._oPopup && !this._oPopup.isOpen() ) {
				Fragment.load({
					type: 'XML', definition: MENU_FRAGMENT,
					controller: this,
					id: "translation-frame-menu"
				}).then(function( fragment ){
					console.log("fragment loaded, will open....");
					fragment.setModel( this.UI, "UI" );
					this.UI.setProperty("/enabled", this.resourceModel.status.enabled );
					this.UI.setProperty("/transform", this.resourceModel.status.transform );
					this._oPopup.setContent( fragment );
					this._oPopup.open(1, sap.ui.core.Popup.Dock.EndTop, sap.ui.core.Popup.Dock.EndTop, document, '-32 32', "none");	// flip, fit, none
				}.bind(this));
			}
		},

		handleCloseMenu: function() {
			if ( this._oPopup !== null ) {
				this._oPopup.close(0);
			}
		},

		handleSwitch: function( oEvent ) {
			this.resourceModel.setEnabled( this.UI.getProperty("/enabled") );
		},

		handleTransformationChange: function( oEvent ) {
			this.resourceModel.setTransformation( this.UI.getProperty("/transform") );
		}

	};

	/* ==========================================================
	 * Inline XML fragment definition
	 * ========================================================== */
	
	let MENU_FRAGMENT = 	 
		`<core:FragmentDefinition xmlns:html="http://www.w3.org/1999/xhtml" xmlns="sap.m" xmlns:core="sap.ui.core">
			<Popover title="Translation Experiments" class="sapUiSizeCompact" contentMinWidth="28rem">
				<VBox>
					<InputListItem label="Local Translation Support:" class="sapUiTinyMargin">
						<Switch state="{UI>/enabled}" change="handleSwitch"/>
					</InputListItem>
					<InputListItem label="Text transformation:" class="sapUiTinyMargin">
						<Select selectedKey="{UI>/transform}" enabled="{UI>/enabled}" change="handleTransformationChange">
							<core:Item key="none" text="None"/>
							<core:Item key="upper" text="Upper case"/>
							<core:Item key="hidenum" text="Hide numbers"/>
						</Select>
					</InputListItem>
				</VBox>
				<endButton>
					<Button icon="sap-icon://decline" press="handleCloseMenu"/>
				</endButton>
			</Popover>
		</core:FragmentDefinition>`;	

	return UserInterface;
});