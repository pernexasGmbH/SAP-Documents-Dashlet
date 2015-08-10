<!-- #START header stuff-->
<#include "/org/alfresco/components/component.head.inc">
<!-- Simple Dialog -->
<@script type="text/javascript" src="${page.url.context}/modules/simple-dialog.js"></@script>
<!-- Global Folder Select -->
<@link rel="stylesheet" type="text/css" href="${page.url.context}/modules/documentlibrary/global-folder.css" />
<@script type="text/javascript" src="${page.url.context}/modules/documentlibrary/global-folder.js"></@script>
<!-- Resize -->
<@script type="text/javascript" src="${page.url.context}/res/yui/resize/resize.js"></@script>
<!-- #END header stuff-->
<@markup id="css">
<#-- CSS Dependencies -->
    <@link rel="stylesheet" type="text/css" href="${url.context}/res/components/dashlets/get-sap-documents.css" group="dashlets" />
</@>

<@markup id="js">
<#-- JavaScript Dependencies -->
    <@script type="text/javascript" src="${url.context}/res/components/dashlets/get-sap-documents.js" group="dashlets"/>
</@>
<#assign el=args.htmlid?js_string>

<@markup id="widgets">
    <#assign element=args.htmlid?html?replace("-", "_") />
    <@inlineScript group="dashlets">
        var editDashletEvent${element} = new YAHOO.util.CustomEvent("onConfigGetLatestDocClick");
        var websiteIcon${element} = new YAHOO.util.CustomEvent("onWebsiteIconClick");
    </@>
    <@createWidgets group="dashlets"/>
    <@inlineScript group="dashlets">
        editDashletEvent${element}.subscribe(connexasDocuments.onConfigGetLatestDocClick, connexasDocuments, true);
        websiteIcon${element}.subscribe(connexasDocuments.onWebsiteIconClick, connexasDocuments, true);
    </@>
</@>

<@markup id="html">
    <@uniqueIdDiv>
        <#assign id = args.htmlid?html />
        <#assign prefSimpleView = preferences.simpleView!true />
        <div class="dashlet connexasSAPDocuments">
            <div class="title">${msg("connexas.documentsDashlet.title")}</div>
            <div class="toolbar flat-button">
                <div class="hidden">
                       <span class="align-left yui-button yui-menu-button" id="${id}-filters">
                          <span class="first-child">
                             <button type="button" tabindex="0"></button>
                          </span>
                       </span>
                    <select id="${id}-filters-menu">
                        <#list filters as filter>
                            <#if filter.type = defaultFilterInConfig>
                                <option value="${filter.type?html}" selected>${msg("connexas.filter." + filter.type)}</option>
                            <#else>
                                <option value="${filter.type?html}">${msg("connexas.filter." + filter.type)}</option>
                            </#if>
                        </#list>
                    </select>
                    <div id="${id}-simpleDetailed" class="align-right simple-detailed yui-buttongroup inline">
                      <span class="yui-button yui-radio-button simple-view<#if prefSimpleView> yui-button-checked yui-radio-button-checked</#if>">
                         <span class="first-child">
                            <button type="button" tabindex="0" title='${msg("button.view.simple")}'></button>
                         </span>
                      </span>
                      <span class="yui-button yui-radio-button detailed-view<#if !prefSimpleView> yui-button-checked yui-radio-button-checked</#if>">
                         <span class="first-child">
                            <button type="button" tabindex="0" title='${msg("button.view.detailed")}'></button>
                         </span>
                      </span>
                    </div>
                    <div class="clear"></div>
                </div>
            </div>

            <#if args.height??>
                <div class="body scrollableList" style="height: ${args.height}px;">
            <#else>
                <div class="body scrollableList">
            </#if>
                <div id="${id}-documents"></div>
            </div>
        </div>
    </@>
</@>