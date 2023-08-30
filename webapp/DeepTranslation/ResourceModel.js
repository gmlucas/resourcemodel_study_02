sap.ui.define([
    "sap/ui/model/resource/ResourceModel",
	"sap/ui/util/Storage",    
    "./UserInterface"
], function (ResourceModel, LocalStorage, UserInterface ) {
    "use strict";

    /**
     * Version 1 - minimalistic blogpost version
     * 
     * This version of the application is the most basic approach to how we
     * can incorporate user interface logic into the Resource Model. This
     * particular commit is identical to what is discussed in the related
     * blog post.
     * 
     */

    var DeepResourceModel = ResourceModel.extend("com.sample.DeepTranslation.ResourceModel", {
        
        status: { enabled: false, transform: "none" },

        constructor: function (oData) {
            ResourceModel.apply(this, arguments);
            this.status = this.getStatus();
            UserInterface.init(this);
        },

        getProperty: function( sPath ) {
            let s = ResourceModel.prototype.getProperty.call( this, sPath );
            if ( this.status.enabled ) {
                this.injectGetText();
                switch ( this.status.transform ) {
                    case "upper":
                        s = s.toUpperCase();
                        break;
                    case "hidenum":
                        s = s.replaceAll(/(\d{1,15}\.?\d{1,15})/g,"****");
                        break;                    
                }
            }
			return s;
		},

		getStatus: function() {
			let storage = new LocalStorage(LocalStorage.Type.local, "tr");
			let storageKey = "status-"+this.oData.bundleName;
			let status = JSON.parse(storage.get( storageKey )) || { "enabled": false };	
			return status;
		},

		saveStatus: function() {
			let storage = new LocalStorage(LocalStorage.Type.local, "tr");
			let storageKey = "status-"+this.oData.bundleName;
			storage.put( storageKey, JSON.stringify( this.status ) );
		},

        setEnabled: function( isEnabled ) {
            this.status.enabled = isEnabled;
            this.saveStatus();
            this.refresh(true);
        },

        setTransformation: function( transformation ) {
            this.status.transform = transformation;
            this.saveStatus();
            this.refresh(true);
        },

		injectGetText: function() {
			let oRB = this.getResourceBundle();
			if ( oRB && !oRB.inheritedGetText ) {
				oRB.inheritedGetText = oRB.getText;
				oRB.getText = DeepResourceModel.getText.bind({ DeepResourceModel: this, bundle: oRB });
			}
		}       
    });

    const KEYREF = new RegExp(/\(\(\((.*?)\)\)\)/, 'g');

    DeepResourceModel.getText = function (sKey, aArgs, bIgnoreKeyFallback) {
        let sTemplate = this.bundle.inheritedGetText(sKey, aArgs, bIgnoreKeyFallback);        
        let sTranslated = sTemplate;
        if ( this.DeepResourceModel.status.enabled ) {
            for (const captureGroup of sTemplate.matchAll(KEYREF)) {
                let sub = this.bundle.getText(captureGroup[1], [], bIgnoreKeyFallback)
                sTranslated = sTranslated.replace(captureGroup[0], sub);
            }
        }
        return sTranslated
    };

    return DeepResourceModel;
});