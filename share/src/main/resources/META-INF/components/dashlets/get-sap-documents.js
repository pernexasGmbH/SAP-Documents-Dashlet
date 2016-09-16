/**
 * Alfresco.dashlet.GetLatestDoc
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var  Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event,
        Selector = YAHOO.util.Selector;

   /**
    * GetLatestDoc constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {Alfresco.dashlet.GetLatestDoc} The new GetLatestDoc instance
    * @constructor
    */
   Alfresco.dashlet.GetLatestDoc = function GetLatestDoc_constructor(htmlId)
   {
        this.configDialog = null;
	    return Alfresco.dashlet.GetLatestDoc.superclass.constructor.call(this, htmlId);
    };

    YAHOO.extend(Alfresco.dashlet.GetLatestDoc, Alfresco.component.SimpleDocList,
    {
 		/**
         * Object container for initialization options
         *
         * !! Last entry requires a ","
         * @property options
         * @type object
         */
        options:
        {
            componentId: "",
            siteId: "",
            validFilters : {},
            filter: "connexasReplicate_sapreplicateaspect",
            simpleView : true,
            maxItems : 50,
            contentType: "",
            showOnlyMyDocuments: "",
        },

        widgets: {},

      PREFERENCES_CONNEXAS_SAP_DASHLET_FILTER: "",
      PREFERENCES_CONNEXAS_SAP_DASHLET_VIEW: "",
      PREFERENCES_CONNEXAS_SAP_DASHLET_MAX_ITEMS: "",
      PREFERENCES_CONNEXAS_SAP_DASHLET_SHOW_ONLY_MY_DOCUMENTS: "",

        /**
         *	Fired by YUI when parent element is available for scripting
         *
         * 	@method onReady
         */

        onReady: function GetLatestDoc_onReady()
        {
         // var me = this;
         /**
          * Preferences
          */
         var PREFERENCES_CONNEXAS_SAP_DASHLET = this.services.preferences.getDashletId(this, "connexasShareDocuments");
         this.PREFERENCES_CONNEXAS_SAP_DASHLET_FILTER = PREFERENCES_CONNEXAS_SAP_DASHLET + ".filter";
         this.PREFERENCES_CONNEXAS_SAP_DASHLET_VIEW = PREFERENCES_CONNEXAS_SAP_DASHLET + ".simpleView";
         this.PREFERENCES_CONNEXAS_SAP_DASHLET_MAX_ITEMS = PREFERENCES_CONNEXAS_SAP_DASHLET + ".maxItems";
         this.PREFERENCES_CONNEXAS_SAP_DASHLET_SHOW_ONLY_MY_DOCUMENTS = PREFERENCES_CONNEXAS_SAP_DASHLET + ".showOnlyMyDocuments";

         // Create Dropdown filter
         this.widgets.filter = Alfresco.util.createYUIButton(this, "filters", this.onFilterChange,
         {
            type: "menu",
            menu: "filters-menu",
            lazyloadmenu: false
         });

         // Select the preferred filter in the ui
         var filter = this.options.filter;
         filter = Alfresco.util.arrayContains(this.options.validFilters, filter) ? filter : this.options.validFilters[1];
         this.widgets.filter.set("label", this.msg("connexas.filter." + filter.type) + " " + Alfresco.constants.MENU_ARROW_SYMBOL);
         this.widgets.filter.value = filter.type;
         // Detailed/Simple List button
         this.widgets.simpleDetailed = new YAHOO.widget.ButtonGroup(this.id + "-simpleDetailed");
         if (this.widgets.simpleDetailed !== null)
         {
            this.widgets.simpleDetailed.check(this.options.simpleView ? 0 : 1);
            this.widgets.simpleDetailed.on("checkedButtonChange", this.onSimpleDetailed, this.widgets.simpleDetailed, this);
         }

         //Set the number of results:
         this.services.preferences.set(this.PREFERENCES_CONNEXAS_SAP_DASHLET_MAX_ITEMS, "50");
         //Set whether only My Documents should be returned
         this.services.preferences.set(this.PREFERENCES_CONNEXAS_SAP_DASHLET_SHOW_ONLY_MY_DOCUMENTS, this.options.showOnlyMyDocuments);

         // Display the toolbar now that we have selected the filter
         Dom.removeClass(Selector.query(".toolbar div", this.id, true), "hidden");
         // DataTable can now be rendered
         Alfresco.dashlet.GetLatestDoc.superclass.onReady.apply(this, arguments);
        },

      /**
       * Show/Hide detailed list buttongroup click handler
       * If the user clicks on the Simple Detailed View icon
       *
       * @method onSimpleDetailed
       * @param e {object} DomEvent
       * @param p_obj {object} Object passed back from addListener method
       */
      onSimpleDetailed: function GetLatestDoc_onSimpleDetailed(e, p_obj)
      {
         this.options.simpleView = e.newValue.index === 0;
         this.services.preferences.set(this.PREFERENCES_CONNEXAS_SAP_DASHLET_VIEW, this.options.simpleView);
         if (e)
         {
            Event.preventDefault(e);
         }
         this.reloadDataTable();
      },

      /**
       * Generate base webscript url.
       * Can be overridden.
       * This is important for the following container in file ".get.html.ftl": <div id="${id}-documents"></div>
       * @method getWebscriptUrl
       */
      getWebscriptUrl: function SimpleDocList_getWebscriptUrl()
      {
         return Alfresco.constants.PROXY_URI + "/connexas/get-sap-documents/documents/node/alfresco/company/home/?max=50";
      },

      /**
       * Calculate webscript parameters
       *
       * @method getParameters
       * @override
       */
      getParameters: function SimpleDocList_getParameters()
      {
        //filter used for the query, catch the first call:
        var myContentType = (this.options.contentType == null) ? this.widgets.filter.value : this.options.contentType;
        var myDocuments = (this.options.showOnlyMyDocuments == null) ? "" : this.options.showOnlyMyDocuments;
        return "searchContentType=" + myContentType + "&numberOfDocuments=" + this.options.maxItems + "&returnOnlyMyDocuments=" + myDocuments;
      },

      /**
       * Filter Change menu handler
       * If the user selects any other value from dropdown
       *
       * @method onFilterChange
       * @param p_sType {string} The event
       * @param p_aArgs {array}
       */
      onFilterChange: function GetLatestDoc_onFilterChange(p_sType, p_aArgs)
      {
         var menuItem = p_aArgs[1];
         if (menuItem)
         {
            this.widgets.filter.set("label", menuItem.cfg.getProperty("text") + " " + Alfresco.constants.MENU_ARROW_SYMBOL);
            this.widgets.filter.value = menuItem.value;
            //We have to override the contentType because otherwise the getParameters() function does always use the filter value from the Config dialog...
            this.options.contentType = this.widgets.filter.value;
            this.services.preferences.set(this.PREFERENCES_CONNEXAS_SAP_DASHLET_FILTER, this.widgets.filter.value);
            this.reloadDataTable();
         }
      },

       /**
         * Called when the user clicks the connexas "e" icon.
         * Will open the website in a new window.
         *
         * @method onWebsiteIconClick
         * @param e The click event
         */
        onWebsiteIconClick: function GetLatestDoc_onWebsiteIconClick(e)
        {
            window.open('http://www.connexas.eu', '_blank');
        },

      /**
         * Called when the user clicks the connexas AdminPanel icon.
         * Will open the connexa AdminPanel.
         *
         * @method onWebsiteAdminPanelIconClick
         * @param e The click event
         */
        onWebsiteAdminPanelIconClick: function GetLatestDoc_onWebsiteAdminPanelIconClick(e)
        {
            //http://localhost:8080/share/page/console/admin-console/adminpanel
            window.open(Alfresco.constants.URL_SERVICECONTEXT + 'console/admin-console/adminpanel', '_self');
        },
        /**
         * Called when the user clicks the config GetLatestDoc link.
         * Will open a GetLatestDoc config dialog
         *
         * @method onConfigGetLatestDocClick
         * @param e The click event
         */
        onConfigGetLatestDocClick: function GetLatestDoc_onConfigGetLatestDocClick(e)
        {
            //Event.stopEvent(e);
            var actionUrl = Alfresco.constants.URL_SERVICECONTEXT + "modules/connexas/get-sap-documents/config/" + encodeURIComponent(this.options.componentId);
            if (!this.configDialog)
            {
                this.configDialog = new Alfresco.module.SimpleDialog(this.id + "-configDialog").setOptions(
                {
                    width: "40em",
                    templateUrl: Alfresco.constants.URL_SERVICECONTEXT + "modules/connexas/get-sap-documents/config",
                    onSuccess:
                    {
                        fn: function GetLatestDoc_onConfig_callback(response)
                		{
                            var obj = response.json;
                            // Save values for new config dialog openings
                            this.options.contentType = (obj && obj.contentType) ? obj.contentType : this.options.contentType;
                            this.options.maxItems = (obj && obj.maxItems) ? obj.maxItems : this.options.maxItems;
                            this.options.showOnlyMyDocuments = (obj && obj.showOnlyMyDocuments != null) ? obj.showOnlyMyDocuments : this.options.showOnlyMyDocuments;
                            var scriptURL = Alfresco.constants.PROXY_URI + "/connexas/get-sap-documents?contentType="
                                        +obj.contentType+"&maxItems=" + obj.maxItems+"&showOnlyMyDocuments="+ obj.showOnlyMyDocuments;
                            // Update dashlet config with new values
                            Dom.get(this.configDialog.id + "-ContentType").value =       obj ? obj.contentType : "connexasArchivelink_saparchivelinkaspect";
                            Dom.get(this.configDialog.id + "-NumberOfDocuments").value = obj ? obj.maxItems : "50";
                            Dom.get(this.configDialog.id + "-OnlyMyDocuments").value =   (obj && (obj.showOnlyMyDocuments=="on")) ? obj.showOnlyMyDocuments : "";
                            //Set the number of results:
                            this.services.preferences.set(this.PREFERENCES_CONNEXAS_SAP_DASHLET_MAX_ITEMS, obj.maxItems);
                            this.services.preferences.set(this.PREFERENCES_CONNEXAS_SAP_DASHLET_FILTER, obj.contentType);
                            this.services.preferences.set(this.PREFERENCES_CONNEXAS_SAP_DASHLET_SHOW_ONLY_MY_DOCUMENTS, obj.showOnlyMyDocuments);
                            //Set the value in the dropdown to the current selection
                            this.widgets.filter.set("label", this.msg("connexas.filter." + obj.contentType ) + " " + Alfresco.constants.MENU_ARROW_SYMBOL);
                            this.widgets.filter.value = obj.contentType;
                            this.reloadDataTable();
                        },
                        scope: this
                    },
                    onFailure:
                    {
                        fn : function GetLatestDoc_onConfig_failure(response)
                        {
                            alert("Could not update the results with the selected choice! Unknown error. " + response);
                        },
                        scope : this
                    },
                    doSetupFormsValidation: 
					{
                        fn: function GetLatestDoc_doSetupForm_callback(form) {
                            Dom.get(this.configDialog.id + "-ContentType").value = this.options.contentType;
                            Dom.get(this.configDialog.id + "-NumberOfDocuments").value = this.options.maxItems;
                            Dom.get(this.configDialog.id + "-OnlyMyDocuments").value = (this.options.showOnlyMyDocuments == "")? "":"On";

                            //Do not set contentType but loop over existing list and set the SELECTED option if list value equals contentType...
                            var val = this.options.contentType;
                            var sel = Dom.get(this.configDialog.id + "-ContentType");
                            var opts = sel.options;
                            for(var opt, j = 0; opt = opts[j]; j++) {
                                if(opt.value == val) {
                                    sel.selectedIndex = j;
                                    break;
                                }
                            }
                            this.configDialog.widgets.contentType = Dom.get(this.configDialog.id + "-ContentType");
                            this.configDialog.widgets.maxItems = Dom.get(this.configDialog.id + "-NumberOfDocuments");
                            this.configDialog.widgets.showOnlyMyDocuments = Dom.get(this.configDialog.id + "-OnlyMyDocuments");
                        },
                        scope: this
                    }
                });
            }

            var defaultFilter = this.options.contentType;
            if(this.options.contentType == null) {
                defaultFilter = this.PREFERENCES_CONNEXAS_SAP_DASHLET_FILTER;
            }

            this.configDialog.setOptions(
            {
                actionUrl: actionUrl,
                componentId: encodeURIComponent(this.options.componentId),
                siteId: this.options.siteId,
                validFilters : {},
                filter: defaultFilter,
                simpleView : true,
                maxItems : this.options.maxItems,
                contentType: this.PREFERENCES_CONNEXAS_SAP_DASHLET_FILTER,
                showOnlyMyDocuments: this.PREFERENCES_CONNEXAS_SAP_DASHLET_SHOW_ONLY_MY_DOCUMENTS,
            }).show();
        },
    });
})();