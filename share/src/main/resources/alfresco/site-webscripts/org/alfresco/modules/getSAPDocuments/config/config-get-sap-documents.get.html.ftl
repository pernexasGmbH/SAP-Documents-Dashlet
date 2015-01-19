<!-- START Easy Config Section: For i18n translation refer to config-get-sap-documents.get.properties! -->
<#assign types = ["connexasReplicate_sapreplicateaspect", "connexasArchivelink_saparchivelinkaspect", "connexasCreatearchivelink_sapcreatearchivelinktype", "connexasBarcode_sapbarcodetype", "connexasWorkflow_sapworkflowtype"] />
<#assign limits = [10, 25, 50, 100, 500] />
<!-- END Easy Config Section -->

<#assign el=args.htmlid?html>
<div id="${el}-configDialog" class="config-sapdocuments">
   <div class="hd">${msg("connexas.documentsDashlet.config.dialogTitle")}</div>
   <div class="bd">
      <form id="${el}-form" action="" method="POST">
         <div class="yui-gd">
            <div class="yui-u first">
                <label for="${el}-ContentType">${msg("connexas.documentsDashlet.config.label.Select.ContentType")}</label>
            </div>
             <div class="yui-u">
                    <select id="${el}-ContentType" name="ContentType">
                        <#list types as type>
                            <option value="${type}">${msg("connexas.filter." + type)}</option>
                        </#list>
                    </select>
             </div>
         </div>
        <div class="yui-gd">
            <div class="yui-u first">
                <label for="${el}-NumberOfDocuments">${msg("connexas.documentsDashlet.config.label.Select.NumberOfDocuments")}</label>
            </div>
            <div class="yui-u">
                <select id="${el}-NumberOfDocuments" name="NumberOfDocuments" style="width: 60px">
                    <#list limits as limit>
                        <option value="${limit}">${msg("connexas.documentsDashlet.config.label.Select.NumberOfDocuments.limit." + limit)}</option>
                    </#list>
                </select>
            </div>
        </div>
          <div class="yui-gd">
              <div class="yui-u first">
                  <label for="${el}-OnlyMyDocuments">${msg("connexas.documentsDashlet.config.label.Select.OnlyMyDocuments")}</label>
              </div>
              <div class="yui-u">
                  <input type="checkbox" id="${el}-OnlyMyDocuments_Original" name="OnlyMyDocuments_Original" onclick="if(this.checked){document.getElementById('${el}-OnlyMyDocuments').value='On';}else{document.getElementById('${el}-OnlyMyDocuments').value='';}" />
                  <input type="hidden" id="${el}-OnlyMyDocuments" name="OnlyMyDocuments" />
              </div>
          </div>

        <div class="bdft">
            <input type="submit" id="${el}-ok" value="${msg("button.ok")}" />
            <input type="reset" id="${el}-cancel" value="${msg("button.cancel")}" />
         </div>
      </form>
   </div>