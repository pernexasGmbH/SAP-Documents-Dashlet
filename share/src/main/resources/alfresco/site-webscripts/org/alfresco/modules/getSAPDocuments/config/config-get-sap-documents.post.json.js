/*
*       Get Latest Document configuration component POST method
*       Path is: WEB-INF\classes\alfresco\site-webscripts\org\alfresco\components\dashlets\
*/

function main()
{
    var c = sitedata.getComponent(url.templateArgs.componentId);
	var saveValue = function(name, value)
	{
        c.properties[name] = value;
        model[name] = value;
	}
	saveValue("contentType", String(json.get("ContentType")));
	saveValue("showOnlyMyDocuments", String(json.get("OnlyMyDocuments")));
	saveValue("maxItems", String(json.get("NumberOfDocuments")));
	c.save();
}

main();

