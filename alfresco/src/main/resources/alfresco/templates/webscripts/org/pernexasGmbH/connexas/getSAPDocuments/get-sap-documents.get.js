<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/slingshot/documentlibrary/evaluator.lib.js">
<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/slingshot/documentlibrary/filters.lib.js">
<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/slingshot/documentlibrary/parse-args.lib.js">

const REQUEST_MAX = 1000;
const SITES_SPACE_QNAME_PATH = "/app:company_home/st:sites/";

/**
 * Main entry point: Create collection of documents and folders in the given space
 *
 * @method getDoclist
 */
function getDoclist()
{
   // Use helper function to get the arguments
   var parsedArgs = ParseArgs.getParsedArgs();

  if (logger.isLoggingEnabled()) {
        logger.log("Using documentlibrary...");
        logger.log("get-latest-doc.get.js - parsedArgs: ");
        for (var key in parsedArgs) {
            logger.log("   --> Key: " + key + " - Value: " + parsedArgs[key]);
        }
        logger.log("get-latest-doc.get.js - args: ");
        for (var key in args) {
            logger.log("   --> Key: " + key + " - Value: " + args[key]);
        }
    }
   if (parsedArgs === null)
   {
     logger.error("parsedArgs === null ? <" + (parsedArgs === null) + "> Return..." );
      return;
   }

   var filter = args.filter,
      items = [],
      connexasSearchType = args.searchContentType,
      connexasSearchMaxDocuments = parseInt(args.numberOfDocuments,10);

      var connexasCreatorSearchAppend = "";
      if(args.returnOnlyMyDocuments && args.returnOnlyMyDocuments=="On") {
       var currentUser = person.properties.userName;
        connexasCreatorSearchAppend = " AND \@cm\\:creator:\""+currentUser+"\"";
      }

   // Try to find a filter query based on the passed-in arguments
   var allNodes = [],
      totalRecords = 0,
      requestTotalCountMax = 0,
      paged = false,
      favourites = Common.getFavourites(),
      filterParams = Filters.getFilterParams(filter, parsedArgs,
      {
         favourites: favourites
      }),
      query = filterParams.query,
      allSites = (parsedArgs.nodeRef == "alfresco://sites/home");

    //Evaluate filter to create correct query
    connexasSearchType = connexasSearchType.replace("_",":");

    if (connexasSearchType.indexOf("aspect") != -1)
    {
        query = "TYPE:\"cm:content\" AND ASPECT:\"" +connexasSearchType+ "\"" + connexasCreatorSearchAppend; //
    }
    else if (connexasSearchType.indexOf("type") != -1)
    {
        query = "TYPE:\""+connexasSearchType+"\"" + connexasCreatorSearchAppend;
    }else
    {
        //unsupported...
        query = "";
    }

   //var totalItemCount = filterParams.limitResults ? parseInt(filterParams.limitResults, 10) : -1;
   var totalItemCount = connexasSearchMaxDocuments;
   // For all sites documentLibrary query we pull in all available results and post filter
   if (totalItemCount === 0) totalItemCount = -1;
   else if (allSites) totalItemCount = (totalItemCount > 0 ? totalItemCount * 10 : 500);

    allNodes = search.query(
    {
       query: query,
       page:
       {
          maxItems: totalItemCount
       },
       templates: filterParams.templates,
       namespace: (filterParams.namespace ? filterParams.namespace : null)
    });
    totalRecords = allNodes.length;

//END connexas changes

   // TODO: replace with java.lang.String regex match for performance
   var pathMatch;
   if (allSites)
   {
      // Generate a qname path match regex required for all sites 'documentLibrary' results match
      pathMatch = new String(parsedArgs.rootNode.qnamePath).replace(/\//g, '\\/') + "\\/.*\\/cm:documentLibrary\\/.*";
      //if (logger.isLoggingEnabled())
          logger.error("get-sap-documents.get.js - will match results using regex: " + pathMatch);
   }
   else if (query)
   {
      // Generate a qname path match regex required for queries where entire repo has been searched - but don't want results
      // from sites which are not documents - i.e. filter wiki, blog etc. from results
      pathMatch = new String(SITES_SPACE_QNAME_PATH).replace(/\//g, '\\/') + ".*\\/cm:documentLibrary\\/.*";
   }
   var pathRegex = new RegExp(pathMatch, "gi");

   // Ensure folders and folderlinks appear at the top of the list
   var folderNodes = [],
      documentNodes = [],
      qnamepath;

   for each (node in allNodes)
   {
      if (totalItemCount !== 0)
      {
         try
         {
            var qnamePath = node.qnamePath;
            if (!query || (allSites && qnamePath.match(pathRegex)) || qnamePath.indexOf(SITES_SPACE_QNAME_PATH) !== 0 || qnamePath.match(pathRegex))
            {
               totalItemCount--;
               if (node.isContainer || node.isLinkToContainer)
               {
                  folderNodes.push(node);
               }
               else
               {
                  documentNodes.push(node);
               }
            }
         }
         catch (e)
         {
            // Possibly an old indexed node - ignore it
         }
      } else break;
   }

   // Node type counts
   var folderNodesCount = folderNodes.length,
      documentNodesCount = documentNodes.length,
      nodes;

   if (parsedArgs.type === "documents")
   {
      nodes = documentNodes;
      totalRecords -= folderNodesCount;
   }
   else
   {
      // TODO: Sorting with folders at end -- swap order of concat()
      nodes = folderNodes.concat(documentNodes);
   }

   if (logger.isLoggingEnabled())
      logger.log("get-sap-documents.get.js - totalRecords: " + totalRecords);

   // Pagination
   var pageSize = args.size || nodes.length,
      pagePos = args.pos || "1",
      startIndex = (pagePos - 1) * pageSize;

   if (!paged)
   {
       // Trim the nodes array down to the page size
       nodes = nodes.slice(startIndex, pagePos * pageSize);
   }

   // Common or variable parent container?
   var parent = null;

   if (!filterParams.variablePath)
   {
      // Parent node permissions (and Site role if applicable)
      parent =
      {
         node: parsedArgs.pathNode,
         userAccess: Evaluator.run(parsedArgs.pathNode, true).actionPermissions
      };
   }

   var thumbnail = null,
       locationNode,
       item;

   // Loop through and evaluate each node in this result set
   for each (node in nodes)
   {
      // Get evaluated properties.
      item = Evaluator.run(node);
      if (item !== null)
      {
         item.isFavourite = (favourites[item.node.nodeRef] === true);
         item.likes = Common.getLikes(node);

         // Does this collection of nodes have potentially differering paths?
         if (filterParams.variablePath || item.isLink)
         {
            locationNode = item.isLink ? item.linkedNode : item.node;
            // Ensure we have Read permissions on the destination on the link object
            if (!locationNode.hasPermission("Read")) break;
            location = Common.getLocation(locationNode, parsedArgs.libraryRoot);
         }
         else
         {
            location =
            {
               site: parsedArgs.location.site,
               siteTitle: parsedArgs.location.siteTitle,
               container: parsedArgs.location.container,
               path: parsedArgs.location.path,
               file: node.name
            };
         }
         location.parent = {};
         if (node.parent != null && node.parent.isContainer && node.parent.hasPermission("Read"))
         {
            location.parent.nodeRef = String(node.parent.nodeRef.toString());
         }

         // Resolved location
         item.location = location;

         items.push(item);
      }
      else
      {
         --totalRecords;
      }
   }

   // Array Remove - By John Resig (MIT Licensed)
   var fnArrayRemove = function fnArrayRemove(array, from, to)
   {
     var rest = array.slice((to || from) + 1 || array.length);
     array.length = from < 0 ? array.length + from : from;
     return array.push.apply(array, rest);
   };

   /**
    * De-duplicate orignals for any existing working copies.
    * This can't be done in evaluator.lib.js as it has no knowledge of the current filter or UI operation.
    * Note: This may result in pages containing less than the configured amount of items (50 by default).
   */
   for each (item in items)
   {
      if (item.customObj && item.customObj.isWorkingCopy)
      {
         var workingCopyOriginal = String(item.customObj.workingCopyOriginal);
         for (var i = 0, ii = items.length; i < ii; i++)
         {
            if (String(items[i].node.nodeRef) == workingCopyOriginal)
            {
               fnArrayRemove(items, i);
               --totalRecords;
               break;
            }
         }
      }
   }

   var paging =
   {
      totalRecords: totalRecords,
      startIndex: startIndex
   };

   if (paged && (totalRecords == requestTotalCountMax))
   {
      paging.totalRecordsUpper = requestTotalCountMax;
   }

   return (
   {
      luceneQuery: query,
      paging: paging,
      container: parsedArgs.rootNode,
      parent: parent,
      onlineEditing: utils.moduleInstalled("org.alfresco.module.vti"),
      itemCount:
      {
         folders: folderNodesCount,
         documents: documentNodesCount
      },
      items: items
   });
}

/**
 * Document List Component: doclist
 */
model.doclist = getDoclist();