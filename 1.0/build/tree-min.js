/*! trees - v1.0 - 2013-09-24 8:27:07 PM
* Copyright (c) 2013 桐人; Licensed  */
KISSY.add("gallery/trees/1.0/store",function(a){function b(c){var d=this;c=a.merge(b.config,c),b.superclass.constructor.call(d,c),d.events=["load","searchTree"],d._init()}return b.config={url:null,requestType:"get",idKey:null,param:{},data:[],isJsonp:!1,autoLoad:!0,adapterForNode:{id:"id",value:"value",children:"children",parent:"parent",isleaf:"isleaf"},adapterForData:{success:"success",nodes:"nodes",message:"message"},dataErrorFunc:function(){}},a.extend(b,a.Base),a.augment(b,{isTreeReady:function(a,b){var c,d=this,e=d.get("adapterForNode"),f=!0;if(a){if(a[e.isleaf])return!0;c=a[e.children]}else c=d.getTreeData();if(0===c.length&&(f=!1),!f){var g=a?a[e.id]:null;d.load(g,null,b)}return f},load:function(b,c,d,e){var f=this,g=f.get("adapterForData"),h=f.get("idKey"),e=e||!1,i=f._getParam(b),j={type:f.get("requestType"),dataType:"json"};if(c=c||f.get("url"),!c)throw"please assign the URL of Data for Tree!";f.get("isJsonp")&&(j=a.merge(j,{type:"get",dataType:"jsonp",cache:!1,crossDomain:!0})),a.io(a.merge(j,{url:c,data:i,success:function(a){a&&a[g.success]===!0&&a[g.nodes].length>0?(f.fire("load",{data:a[g.nodes],id:e?null:i[h]||null,param:i}),d&&d()):f._dataError(a?a[g.message]:"")},error:function(){f._dataError("\u8bf7\u6c42\u5f02\u5e38\uff01")}}))},initLoad:function(){var a=this;a.get("url")?a.load():a.setTreeData(a.get("data"))},traverseTreeById:function(a){var b,c=this,d=c.get("adapterForNode"),e=c.getTreeData(),f=[],g=[],h=[];return b=function(c,e){if(e=e||0,c)for(var i=0;i<c.length;i++){var j=c[i];if(j[d.id]===a||!j[d.isleaf]&&b(j[d.children],e+1))return f[e]=j[d.id],g[e]=j[d.value],h[e]=j,!0}return!1},a&&b(e),{path:f,valuePath:g,pathNode:h,node:h[h.length-1]||null}},traverseTreeByText:function(b){var c,d=this,e=d.get("adapterForNode"),f=d.getTreeData(),g=[],h=[],i=[],j=[],k=[],l=[];return c=function(f,m){if(m=m||0,f)for(var n=0;n<f.length;n++){for(var o=g.length-m-1,p=f[n],q=0;o>q;q++)g.pop(),i.pop(),h.pop();g[m]=p[e.id],i[m]=p[e.value],h[m]=p,p[e.value].indexOf(b)>-1&&(j.push(a.clone(g)),l.push(a.clone(i)),k.push(d.dataFilter(h))),p[e.isleaf]||c(p[e.children],m+1)}},b&&c(f),{pathList:j,pathNodeList:k,valuePathList:l}},getNodeById:function(a){var b=this;return b.traverseTreeById(a).node},getNodeByPath:function(b){b=b||[];var c=this,d=c.get("adapterForNode"),e=c.getTreeData(),f=null,g=e;return a.each(b,function(b){a.each(g,function(a){return a[d.id]===b?(f=a,!1):void 0}),g=f[d.children]}),f},getPathById:function(a){var b=this;return b.traverseTreeById(a).path},getParentById:function(a){var b=this,c=b.get("adapterForNode"),d=b.getNodeById(a);return d[c.parent],b.getNodeById(parent)},getChildrenById:function(a){var b=this,c=b.get("adapterForNode"),d=b.getNodeById(a);return d?d[c.children]||[]:[]},getChildrenByPath:function(a){a=a||[];var b=this,c=b.get("adapterForNode"),d=null;return 0===a.length?b.getTreeData():(d=b.getNodeByPath(a),d?d[c.children]||[]:[])},getChildrenByNode:function(a){var b=this,c=b.get("adapterForNode"),d=[];return d=a?a[c.children]||[]:[]},getLeafsById:function(a){var b=this,c=(b.get("adapterForNode"),b.getNodeById(a));return c?b.getLeafsByNode(c):[]},getLeafsByNode:function(a){var b,c=this,d=c.get("adapterForNode"),e=[],f=[];return b=function(a,g){if(g=g||0,a)for(var h=0;h<a.length;h++){for(var i=e.length-g-1,j=a[h],k=0;i>k;k++)e.pop();e[g]=j,j[d.isleaf]?f.push(c.dataFilter(e)):b(j[d.children],g+1)}},b(c.getChildrenByNode(a)),f},getTreeData:function(){var a=this;return a.get("treeData")},setTreeData:function(a,b){var c=this;c.fire("load",{data:a,id:b})},searchTree:function(a){var b=this,c=b.traverseTreeByText(a);return b.fire("searchTree",{text:a,pathList:c.pathList,valuePathList:c.valuePathList,result:c}),c},dataFilter:function(b){var c,d=this,e=d.get("adapterForNode"),f=function(b){return a.clone(b,function(a,b){return b===e.children?!1:void 0})};return a.isArray(b)?(c=[],a.each(b,function(a){var b=f(a);c.push(b)})):c=f(b),c},getTreeByLevel:function(b){var c,d=this,e=d.getTreeData(),f=d.get("adapterForNode"),g=a.clone(e);return c=function(a,d){if(d=d||0,a)for(var e=0;e<a.length;e++){var g=a[e];d===b-1?(g[f.children]=[],g[f.isleaf]=!0):c(g[f.children],d+1)}},b>0?c(g):g=[],g},destroy:function(){var a=this;a.detach(),a=null},_init:function(){var a=this;a.set("treeData",[]),a._initIdKey(),a._initEvent(),a.get("autoLoad")&&a.initLoad()},_initEvent:function(){var a=this;a.on("load",function(b){a._fillInTreeData(b.data,b.id)})},_initIdKey:function(){var a=this,b=a.get("adapterForNode"),c=a.get("idKey");c||a.set("idKey",b.id)},_fillInTreeData:function(b,c){var d,e=this,f=e.get("adapterForNode"),g=e.getTreeData();c&&(d=e.getNodeById(c),d&&(g=d[f.children])),g.length=0,a.each(b,function(a){g.push(a)})},_dataError:function(a){var b=this;a&&b.get("dataErrorFunc")(a)},_getParam:function(b){var c=this,d=c.get("idKey"),e=c.get("lastParam")||c.get("param"),f={};return b&&(a.isNumber(b)||a.isString(b))?(f[d]=b,f=a.merge(e,f)):!b||a.isEmptyObject(b)?f=e:a.isPlainObject(b)&&(f=b),c.set("lastParam",f),f}}),b},{requires:["core"]}),KISSY.add("gallery/trees/1.0/base",function(a,b,c){function d(b){var c=this;if(b=a.merge(d.config,b),!b.renderTo||!e.get("#"+b.renderTo))throw"please assign the id of render Dom!";d.superclass.constructor.call(c,b),c.events=["load","searchTree","resultPush","resultPop","resultUpdate","beforeDestroy","loadTree","initData","beforeReload","loadFinished"],c._init()}var e=a.DOM;return a.Event,d.config={renderTo:null,resultId:null,resultType:"result",store:null,url:null,idKey:null,param:{},data:[],isJsonp:!1,storeConfig:{},contentTemplate:null},a.extend(d,a.Base),a.augment(d,{storeLoad:function(b,c){var d=this,e=d.getStore();b?a.isArray(b)?e.setTreeData(b):e.load(b,null,null,c):e.initLoad()},reload:function(a){var b=this,c=b.getResultManage();c.length=0,b.fire("beforeReload"),b.set("isInit",!1),b.storeLoad(a,!0)},getStore:function(){return this.get("store")},searchTree:function(a){var b=this,c=b.getStore();return c.searchTree(a)},getResultManage:function(){return this.get("resultManage")},getIdFromResult:function(){var a=this;return a.getIdFromData(null)},getIdFromData:function(a){var b=this,c=null;return c=b.traverseResult(function(a){return a[a.length-1].id},a)},getValueFromResult:function(){var a=this;return a.getValueFromData(null)},getValueFromData:function(a){var b=this,c=null;return c=b.traverseResult(function(a){return a[a.length-1].value},a)},getPathFromResult:function(){var a=this;return a.getPathFromData(null)},getPathFromData:function(b){var c=this,d=null;return d=c.traverseResult(function(b){var c=[];return a.each(b,function(a){c.push(a.id)}),c},b)},getValuePathFromResult:function(){var a=this;return a.getValuePathFromData(null)},getValuePathFromData:function(b){var c=this,d=null;return d=c.traverseResult(function(b){var c=[];return a.each(b,function(a){c.push(a.value)}),c},b)},getValueStrFromResult:function(a){var b=this;return b.getValueStrFromData(null,a)},getValueStrFromData:function(b,c){var d=this,e=null;return c=c||" > ",e=d.traverseResult(function(b){var d=[];return a.each(b,function(a){var b=a.value;d.push(b)}),d.join(c)},b)},getAllLeafsFromResult:function(){var a=this;return a.getAllLeafsFromData(null)},getAllLeafsFromData:function(b){var c=this,d=c.getStore(),e=[];return c.traverseResult(function(b){var c=b[b.length-1],f=null;c.isleaf?e.push(a.clone(b)):(f=d.getLeafsById(c.id),a.each(f,function(a){e.push(b.concat(a))}))},b),e},initData:function(){var a=this,b=a.getIdFormResultInput();return a.fire("initData",{id:b}),b},getIdFormResultInput:function(){var b=this,c=b.get("resultInput"),d=b.get("resultType").split(" "),e=null,f=null;return c&&(e=a.JSON.parse(c.val()),null!==e&&(a.inArray("result",d)?f=b.traverseResult(function(a){return a[a.length-1].id},e.result):a.inArray("id",d)?f=e.id:a.inArray("path",d)&&(f=b.traverseResult(function(a){return a[a.length-1]},e.path)))),f},isBlankResult:function(a){var b=this,c=a||b.getResultManage(),d=!1;return 0===c.length&&(d=!0),d},isLeafResult:function(b){var c=this,d=(b||c.getResultManage(),!1),e=null;return e=c.traverseResult(function(a){return a[a.length-1].isleaf}),a.isBoolean(e)?d=e:null===d?d=!1:a.isArray(e)&&(d=a.reduce(e,function(a,b){return a&&b})),d},traverseResult:function(b,c){var d=this,e=c||d.getResultManage(),f=null;return d.isBlankResult(c)||(d.isMultipleResult(c)?(f=[],a.each(e,function(a){f.push(b(a))})):f=b(e)),f},isMultipleResult:function(b){var c=this,d=b||c.getResultManage(),e=!1;return d.length>0&&a.isArray(d[0])&&(e=!0),e},destroy:function(){var a=this,b=a.getStore(),c=a.getResultManage(),d=a.get("container");a.fire("beforeDestroy"),b.destroy(),c.length=0,d[0].innerHTML="",a.detach(),a=null},_init:function(){var b=this,d=a.one("#"+b.get("renderTo")),e=a.one("#"+b.get("resultId")),f=[],g=b.get("contentTemplate");b._initStore(),b.set("container",d),e&&b.set("resultInput",e),b.set("resultManage",f),b._initEvent(),g&&b.set("contentTemplateObj",new c(g))},_initEvent:function(){var a=this,b=a.getStore();b.on("searchTree",function(b){a.fire("searchTree",{text:b.text,pathList:b.pathList,valuePathList:b.valuePathList,result:b.result})}),b.on("load",function(b){a.fire("load",{data:b.data,id:b.id,param:b.param})}),a.on("load",function(){a._loadTree(),a.get("isInit")||(a.initData(),a.set("isInit",!0)),a.fire("loadFinished")}),a.on("resultUpdate",function(){a._updateResult()})},_loadTree:function(){var a=this;a.fire("loadTree")},_getStoreConfig:function(){var b=this,c=b.get("storeConfig");return a.mix(c,{url:b._getStoreUrl(),idKey:b.get("idKey"),param:b.get("param"),data:b.get("data"),isJsonp:b.get("isJsonp"),autoLoad:!1}),c},_initStore:function(){var a,c=this,d=c.get("store");d||(a=c._getStoreConfig(),d=new b(a)),c.set("store",d)},_getStoreUrl:function(){return this.get("url")},_pushResult:function(a){var b=this,c=b.getResultManage(),d={};d.id=a.id,d.value=a.value,d.isleaf=a.isleaf,c.push(d),b.fire("resultPush",{result:c,resultObj:d}),b.fire("resultUpdate",{result:c})},_popResult:function(){var a=this,b=a.getResultManage(),c=b.pop();a.fire("resultPop",{result:b,resultObj:c}),a.fire("resultUpdate",{result:b})},_getContent:function(a){var b,c,d=this,e=d.get("contentTemplateObj");return e?c=e.render(a):(b=d.getStore().get("adapterForNode"),c=a[b.value]),c},_updateResult:function(){var b=this,c=b.get("resultInput"),d=b.get("resultType").split(" "),e={},f=null;c&&(a.inArray("result",d)&&(f=b.getResultManage(),f&&f.length>0&&(e.result=f)),a.inArray("id",d)&&(f=b.getIdFromResult(),null!==f&&""!==f&&(e.id=f)),a.inArray("value",d)&&(f=b.getValueFromResult(),null!==f&&""!==f&&(e.value=f)),a.inArray("path",d)&&(f=b.getPathFromResult(),f&&f.length>0&&(e.path=f)),a.inArray("valuePath",d)&&(f=b.getValuePathFromResult(),f&&f.length>0&&(e.valuePath=f)),a.inArray("valueStr",d)&&(f=b.getValueStrFromResult(),null!==f&&""!==f&&(e.valueStr=f)),c.val(a.isEmptyObject(e)?"":a.JSON.stringify(e)))}}),d},{requires:["./store","xtemplate","core"]}),KISSY.add("gallery/trees/1.0/tree",function(a,b,c){function d(b){var c=this;b=a.merge(d.config,b),d.superclass.constructor.call(c,b),c.events=["click","selected","expand","collapse"],c._initTree()}return a.DOM,a.Event,d.config={title:"Tree",showRootNode:!0,showAll:!1,checkable:!1,prefixCls:"mui-",isLazyLoad:!1,lazyCount:5,lazyTime:300},a.extend(d,c),a.augment(d,{getTree:function(){return this.get("tree")},getChildrenByNode:function(a){return a?a.get("children"):[]},initTreeNode:function(a){var b=this,c=b.getTree(),d=b.get("showAll"),e=void 0===a?b.get("showRootNode"):a;d?c.expandAll():e&&b.nodeExpand(c)},addNodes:function(a,b){var c=this,d=null;return a&&(b=void 0===b?c.get("isLazyLoad"):b,b&&(d=c._initLazyLoadProcess(c._addNodesLazyLoad)),c._addNodes(a,0,d)),a},nodeExpand:function(a,b){var c=this;a&&(a.set("expanded",!0),b=void 0===b?c.get("isLazyLoad"):b,c.fire("expand",{targetNode:a,isLazyLoad:b}))},nodeCollapse:function(a){a&&a.set("expanded",!1)},nodeSelect:function(a,c){var d=this,e=d.get("checkable"),c=void 0===c?!0:c;if(a)return e?c?a.set("checkState",b.CheckNode.CHECK):a.set("checkState",b.CheckNode.EMPTY):c?(a.select(),a.set("focused",!0)):(a.set("selected",!1),a.set("focused",!1)),c&&d.fire("selected",{targetNode:a}),d},isNodeSelected:function(a){var c=this,d=c.get("checkable"),e=!1;if(a)return e=d?a.get("checkState")===b.CheckNode.CHECK:a.get("selected")},showNodeById:function(b,c){var d=this,e=d.getStore(),f=[],g=[];return b&&(a.isArray(b)?a.each(b,function(a){g=e.getPathById(a),g.length>0&&f.push(e.getPathById(a))}):f=e.getPathById(b)),d.showNodeByPath(f,c),d},showNodeByPath:function(b,c){var d=this,c=void 0===c?!0:c;return c&&d.clearSelect(),b&&b.length>0&&(d.isMultipleResult(b)?a.each(b,function(a){d._showNodeByPath(a)}):d._showNodeByPath(b)),d},clearSelect:function(){var a=this,b=a.getTree();return a.nodeSelect(b,!1),b.collapseAll(),a.initTreeNode(),a},getTreeResult:function(){var b,c=this,d=c.getTree(),e=[],f=[];return b=function(d,g){g=g||0;var h=d.get("children");if(h)for(var i=0;i<h.length;i++){for(var j=e.length-g-1,k=0;j>k;k++)e.pop();e[g]={},e[g].id=h[i].get("nodeId"),e[g].value=h[i].get("content"),e[g].isleaf=h[i].get("isLeaf"),c.isNodeSelected(h[i])?f.push(a.clone(e)):h[i].get("isLeaf")||b(h[i],g+1)}return!1},b(d),c.set("resultManage",f),c.fire("resultUpdate",{result:f}),f},getNodeChildrenData:function(a){var b=this,c=a.get("nodeId")||null,d=b._getNodesData(c,a);return d},resetTitle:function(a){var b=this;b.getTree().set("content",a)},_initTree:function(){var a=this;a.set("lazyLoadManage",{}),a._newTree(),a._initTreeEvent(),a.storeLoad()},_initTreeEvent:function(){var a=this,b=a.getTree();a.on("initData",function(b){a.initTreeNode(!0),a._checkNodeLoaded(a.getTree(),a.showNodeById,[b.id])}),b.on("expand",function(b){a.nodeExpand(b.target)}),a.on("expand",function(b){var c=b.targetNode;c.get("children").length||a.addNodes(c,b.isLazyLoad)}),b.on("collapse",function(b){a.fire("collapse",{targetNode:b.target})}),b.on("click",function(b){a.fire("click",{targetNode:b.target})}),a.on("beforeReload",function(){a._destroyTreeChildren()}),a.on("beforeDestroy",function(){a._destroyTree()})},_newTree:function(){var a=this,c=a.get("checkable"),d={content:a.get("title"),prefixCls:a.get("prefixCls"),isLeaf:!1,tooltip:a.get("title"),render:"#"+a.get("renderTo")},e=null;e=c?new b.CheckTree(d):new b(d),e.render(),a.set("tree",e)},_newNode:function(c,d,e,f,g){var h=this,i=h.get("checkable"),j=h.getTree(),k={content:d,nodeId:c,prefixCls:h.get("prefixCls"),isLeaf:f,tooltip:e,tree:j},l=null;return i?(k=a.merge(k,{checkState:g===b.CheckNode.CHECK?b.CheckNode.CHECK:b.CheckNode.EMPTY}),l=new b.CheckNode(k)):l=new b.Node(k),l},_addNodes:function(a,b,c){var d=this,e=d.getStore().get("adapterForNode"),f=d.getNodeChildrenData(a),g=a.get("checkState");b=void 0===b?0:b;for(var h=b;h<f.length;h++){var i=f[h][e.id],j=d._getContent(f[h]),k=f[h][e.value],l=f[h][e.isleaf];if(a.addChild(d._newNode(i,j,k,l,g)),c)if(h<f.length-1){if(!d._lazyLoad(a,h,c))return!1}else d._destroyLazyLoadProcess(c)}},_addNodesLazyLoad:function(a){var b=this,c=b.get("lazyTime"),d=b.get("lazyLoadManage"),e=d[a];setTimeout(function(){b._addNodes(e.node,e.index,a)},c)},_initLazyLoadProcess:function(b){var c=this,d=c.get("lazyLoadManage"),e=a.guid(),f={func:b,node:null,count:0,index:0};return d[e]=f,e},_destroyLazyLoadProcess:function(a){var b=this,c=b.get("lazyLoadManage");delete c[a],b.fire("destroyLazyLoadProcess",{id:a})},_lazyLoad:function(a,b,c){var d=this,e=d.get("lazyCount"),f=d.get("lazyLoadManage"),g=f[c];return g.count++,g.count<e?!0:(g.index=b+1,g.node=a,g.count=0,g.func.call(d,c),!1)},_checkNodeLoaded:function(a,b,c){var d,e=this,f=e.getNodeChildrenData(a),g=e.get("isLazyLoad"),h=function(){var g=e.getChildrenByNode(a);return g.length<f.length?void 0:(clearInterval(d),b.apply(e,c))};return c.push(a),g?(d=setInterval(h,100),void 0):b.apply(e,c)},_getNodesData:function(a,b){var c,d=this,e=d.getStore(),f=[];return a?(c=e.getNodeById(a),e.isTreeReady(c,function(){d.addNodes(b)})&&(f=e.getChildrenByNode(c))):f=e.getTreeData(),f},_showNodeByPath:function(a){var b=this,c=b.getTree(),d=b.getChildrenByNode(c);return b._getNodeByPath(d,a,0)},_getNodeByPath:function(b,c,d){var e=this,f=c[d],g=null;if(a.each(b,function(a){return a.get("nodeId")===f?(g=a,!1):void 0}),g){if(d<c.length-1)return e.nodeExpand(g),e._checkNodeLoaded(g,e._getNextNodeByPath,[c,d+1]);e.nodeSelect(g)}return g},_getNextNodeByPath:function(a,b,c){var d=this;return nodeList=d.getChildrenByNode(c),d._getNodeByPath(nodeList,a,b)},_destroyTree:function(){var a=this,b=a.getTree();b.destroy()},_destroyTreeChildren:function(){var a=this,b=a.getTree();b.removeChildren(!0)}}),d},{requires:["tree","./base","./tree.css"]});