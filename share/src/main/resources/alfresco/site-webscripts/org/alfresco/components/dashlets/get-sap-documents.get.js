<import resource="classpath:/alfresco/templates/org/alfresco/import/alfresco-util.js">

/* Get filters */
function getFilters()
{
   var myConfig = new XML(config.script);
   var filters = new Array();

   for each (var xmlFilter in myConfig..filter)
   {
        filters.push(
        {
            type: xmlFilter.@type.toString(),
            parameters: xmlFilter.@parameters.toString()
        });
   }
   return filters;
}

/* Get filters */
function getFilterNamesAsList()
{
   var myConfig = new XML(config.script), filters = "";
   for each (var xmlFilter in myConfig..filter)
   {
      // add support for evaluators on the filter. They should either be missing or eval to true
        if(filters.length > 0) {
            filters = filters + "," + xmlFilter.@type.toString();
        }
        else {
            filters = xmlFilter.@type.toString();
        }
   }
   return filters;
}

/* Return the value of showOnlyMyDocuments from config*/
function getShowOnlyMyDocuments()
{
   var myConfig = new XML(config.script), showMyDocs = "";
   if (myConfig["showOnlyMyDocuments"] && myConfig["showOnlyMyDocuments"].toString().toLowerCase() == "on")
   {
      showMyDocs = myConfig["showOnlyMyDocuments"].toString();
   }
   return showMyDocs;
}


/* Default Filter */
function getMyDefaultFilter()
{
   var myConfig = new XML(config.script), myDefault = "";
   if (myConfig["defaultFilter"])
   {
      myDefault = myConfig["defaultFilter"].toString();
   }
   return myDefault;
}

/* Max Items */
function getMaxItems()
{
   var myConfig = new XML(config.script),
      maxItems = myConfig["maxNumberOfDocuments"];

   if (maxItems)
   {
      maxItems = myConfig["maxNumberOfDocuments"].toString();
   }
   return parseInt(maxItems && maxItems.length > 0 ? maxItems : 50, 10);
}

var regionId1 = args['region-id'];
model.preferences = AlfrescoUtil.getPreferences("org.alfresco.share.connexasShareDocuments.dashlet." + regionId1);
model.regionId = regionId1;
model.filters = getFilters();
model.filterNames = getFilterNamesAsList();
model.maxItems = getMaxItems();
model.defaultFilterInConfig = getMyDefaultFilter();
model.showOnlyMyDocuments = getShowOnlyMyDocuments();
  if (logger.isLoggingEnabled()) {
    logger.log("regionId1: " + regionId1);
    logger.log("getFilters(): " + getFilters());
    logger.log("getFilterNamesAsList(): " + getFilterNamesAsList());
  }

function main()
{
   var searchCriteria = args.searchCriteria;
    //!! Last value wihtout ","!!
   var connexasDocuments = {
    id : "GetLatestDoc",
    name : "Alfresco.dashlet.GetLatestDoc",
    assignTo : "connexasDocuments",
    options : {
        componentId: instance.object.id,
        siteId: args['region-id'],
        filter : model.preferences.filter != null ? model.preferences.filter : model.defaultFilterInConfig,
        validFilters : model.filters,
        simpleView : (model.preferences.simpleView == true),
        maxItems : parseInt(model.maxItems),
        contentType: searchCriteria,
        showOnlyMyDocuments: model.showOnlyMyDocuments
    }
  };

   var dashletResizer = {
      id : "DashletResizer",
      name : "Alfresco.widget.DashletResizer",
      initArgs : ["\"" + args.htmlid + "\"", "\"" + instance.object.id + "\""],
      useMessages: false
   };

    var icons = [];

    icons.push({
        cssClass: "connexasIcon",
        eventOnClick: {
            _alfValue : "websiteIcon" + args.htmlid.replace(/-/g, "_"),
            _alfType: "REFERENCE"
         },
        tooltip:  msg.get("connexas.documentsDashlet.connexasIcon.tooltip")
    });

    icons.push({
        cssClass: "connexasAdminPanelIcon",
        eventOnClick: {
            _alfValue : "websiteAdminPanelIcon" + args.htmlid.replace(/-/g, "_"),
            _alfType: "REFERENCE"
         },
        tooltip:  msg.get("connexas.documentsDashlet.connexasAdminPanelIcon.tooltip")
    });

    icons.push({
        cssClass: "edit",
        eventOnClick: {
            _alfValue : "editDashletEvent" + args.htmlid.replace(/-/g, "_"),
            _alfType: "REFERENCE"
         },
         tooltip: msg.get("connexas.documentsDashlet.edit.tooltip")
    });

    icons.push({
        cssClass: "help",
        bubbleOnClick:
        {
            message: msg.get("connexas.documentsDashlet.help")
        },
        tooltip:  msg.get("connexas.documentsDashlet.help.tooltip")
    });

   var dashletTitleBarActions = {
      id : "DashletTitleBarActions",
      name : "Alfresco.widget.DashletTitleBarActions",
      useMessages : false,
      options : {
         actions: icons
      }
   };
	var numberOfDocuments = args.maxDocuments;
	// Create XML object to pull values from
	// configuration file
	var conf = new XML(config.script);

	if(numberOfDocuments == null) {
	    numberOfDocuments = parseInt(conf.maxNumberOfDocuments[0].toString());
	}
	if(!searchCriteria) {
	    searchCriteria = conf.defaultFilter[0].toString();
	}

    // Set values on the model for use in templates
	model.searchCriteria = searchCriteria;
    model.widgets = [connexasDocuments, dashletResizer, dashletTitleBarActions];
}

main();




