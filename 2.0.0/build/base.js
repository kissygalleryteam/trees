/*
combined files : 

kg/trees/2.0.0/store
kg/trees/2.0.0/base

*/
/** 
* Store 树专用数据缓冲对象
* @version 2.0
*/
KISSY.add('kg/trees/2.0.0/store',function(S){

	/**
	* Store 树专用数据缓冲对象 树的遍历、树的数据管理
	* @class Trees.Store
	* @module Trees
	* @author 桐人<wwwfuzheng@qq.com>
	* @extend KISSY.Base
	* @constructor Store
	* @param {Object} config 配置项
	*/
	function Store(config){
		var _self = this;
		config = S.merge(Store.config, config);
		Store.superclass.constructor.call(_self, config);
		//支持的事件
		_self.events = [
			/**  
			* 数据加载完成时 触发此事件（load/setTreeData 都会触发)
			* @event load
			* @param {event} e  事件对象
			* @param {Array} e.data 加载的数据
			* @param {String} e.id 所在节点的id
			* @param {Object} e.param 加载的参数（setTreeData触发时没有此属性）
			*/
			'load',
			/**  
			* 通过text遍历搜索树后 触发此事件
			* @event searchTree
			* @param {event} e  事件对象
			* @param {String} e.text 搜索的文本值
			* @param {Array} e.pathList 搜索的路径id集合
			* @param {Array} e.valuePathList 搜索的路径value集合
			* @param {Object} e.result 搜索结果
			*/
			'searchTree'
		];
		_self._init();
	}
	Store.config = {
		/**
		* 数据异步读取url（选填，不填的话可以手动设置树的数据）
		* @property url
		* @type String
		*/
		url: null,
		/**
		* 异步请求方式('get'/'post')，在jsonp方式下，不起作用，固定为get
		* @property requestType
		* @type String
		* @default  'get'
		*/
		requestType: 'get',
		/**
		* 节点数据中，id的key（选填, 不填的话默认是 adapterForNode.id）
		* @property idKey
		* @type String
		*/
		idKey: null,
		/**
		* 数据读取的初始化参数，与 url 配合适用（选填）
		* @property param
		* @type Object
		* @default  {}
		*/
		param: {},
		/**
		* 给store初始化用的数据
		* @property data
		* @type Array
		* @default  []
		*/
		data: [],
		/**
		* 是否用jsonp形式发送请求
		* @property isJsonp
		* @type Boolean
		* @default  false
		*/
		isJsonp: false,
		/**
		* 数据是否自动加载（选填）
		* @property autoLoad
		* @type Boolean
		* @default  true
		*/
		autoLoad: true,
		/**
		* node数据的适配器（选填）
		* @property adapterForNode
		* @type Object
		* @default  
		*	{
		*		id: 'id',
		*		value: 'value',
		*		children: 'children',
		*		parent: 'parent',
		*		isleaf: 'isleaf'
		*	}
		*/
		adapterForNode: {
			id: 'id',
			value: 'value',
			children: 'children',
			parent: 'parent',
			isleaf: 'isleaf'
		},
		/**
		* 数据的适配器（选填）
		* @property adapterForData
		* @type Object
		* @default  
		*	{
		*		success: 'success',
		*		nodes: 'nodes',
		*		message: 'message'
		*	}
		*/
		adapterForData: {
			success: 'success',
			nodes: 'nodes',
			message: 'message'
		},
		/**
		* 当数据加载失败的回调方法（选填）
		* @property dataErrorFunc
		* @type Function
		* @default  alert(msg);
		*/
		dataErrorFunc: function(msg){
			//S.error(msg);
		}
	};
	S.extend(Store, S.Base);

	S.augment(Store, {
		/**
		* 检查树的数据是否加载完成
		* @method isTreeReady
		* @param {Object} [node] 要检查的节点对象 （选填，不填则检查整个树对象）
		* @param {Function} [func] 若没有完成时，加载数据是需要回调的方法 （选填）
		* @return {Boolean} 是否准备完成
		*/
		isTreeReady: function(node, func){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				nodeData,
				isReady = true;
			
			if(node){
				if(node[adapterForNode.isleaf]){
					return true;
				}else{
					nodeData = node[adapterForNode.children];
				}
			}else{
				nodeData = _self.getTreeData();
			}

			if(nodeData.length === 0){
				isReady = false;
			}
			// 若没有准备好，则加载数据
			if(!isReady){
				var id = node ? node[adapterForNode.id] : null;
				_self.load(id, null, func);
			}

			return isReady;
		},
		/**
		* 加载树数据 此方法会触发load事件
		* @method load
		* @param {Object|String} [param] 参数对象 或 需要加载的id (不填则取默认的参数对象，若是String，则会用idKey配置参数对象)
		* @param {String} [url] 加载数据的url （选填，没有则取默认的url）
		* @param {Function} [func] 加载完成时需要回调的方法 （选填）
		* @param {Boolean} [isTreeData] 是否加载整树数据 （选填，默认为false）
		*/
		load: function(param, url, func, isTreeData){
			var _self = this,
				adapterForData = _self.get('adapterForData'),
				idKey = _self.get('idKey'),
				isTreeData = isTreeData || false,
				loadParam = _self._getParam(param),
				ajaxConfig = {
					type: _self.get('requestType'),
					dataType: 'json'
				};

			url = url || _self.get('url');
			// 若调用load 则 url 必填
			if(!url){
				throw 'please assign the URL of Data for Tree!';
			}
			// 是否用jsonp方式请求
			if(_self.get('isJsonp')){
				ajaxConfig = S.merge(ajaxConfig, {
					type: 'get',
					dataType: 'jsonp',
					cache: false,
					crossDomain: true
				});
			}

			S.io(S.merge(ajaxConfig, {
				url: url,
				data: loadParam,
				success: function(data){
					if(data && data[adapterForData.success] === true  && data[adapterForData.nodes].length > 0){
						_self.fire('load', {
							data: data[adapterForData.nodes],
							id: isTreeData ? null : loadParam[idKey] || null, 
							param: loadParam
						});
						if(func){
							func();
						}
					}else{
						_self._dataError(data ? data[adapterForData.message] : '');
					}
				},
				error: function(){
					_self._dataError('请求异常！');
				}				
			
			}));
		},
		/**
		* 初始化加载store
		* @method initLoad
		*/
		initLoad: function(){
			var _self = this;
			if(_self.get('url')){
				_self.load();
			}else{
				_self.setTreeData(_self.get('data'));
			}
		},
		/**
		* 遍历树，通过id搜索节点
		* @method traverseTreeById
		* @param {String|Number} id 目标id。 若没有，则返回的皆为空值
		* @return {Object} 返回值： 
				obj.path => 该节点的路径id
				obj.valuePath => 该节点的路经value
				obj.pathNode => 该节点的路经node
				obj.node => 该节点对象
		*/
		traverseTreeById: function(id){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				treeData = _self.getTreeData(),
				path = [],
				valuePath = [],
				pathNode = [],
				_traverse;

			_traverse = function(nodeData, deep){
				deep = deep || 0;
				if(nodeData){
					for(var i = 0; i < nodeData.length; i++){
						var node = nodeData[i];
						if(node[adapterForNode.id] === id || (!node[adapterForNode.isleaf] && _traverse(node[adapterForNode.children], deep + 1))){
							path[deep] = node[adapterForNode.id];
							valuePath[deep] = node[adapterForNode.value];
							pathNode[deep] = node;
							return true;
						}
					}
				}
				return false;			
			};

			if(id){
				_traverse(treeData);
			}

			return {
				path: path,
				valuePath: valuePath,
				pathNode: pathNode,
				node: pathNode[pathNode.length - 1] || null
			};
		},
		/**
		* 遍历树，通过text搜索节点列表
		* @method traverseTreeByText
		* @param {String} text 目标文本。 若没有，则返回的皆为空值
		* @return {Object} 返回值： 
				obj.pathList => 路径id列表
				obj.valuePathList => 路径value列表
				obj.pathNodeList => 路径node列表，节点数据不带children属性
		*/
		traverseTreeByText: function(text){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				treeData = _self.getTreeData(),
				path = [],
				pathNode = [],
				valuePath = [],
				pathList = [],
				pathNodeList = [],
				valuePathList = [],
				_traverse;

			_traverse = function(nodeData, deep){
				deep = deep || 0;
				if(nodeData){
					for(var i = 0; i < nodeData.length; i++){
						var l = path.length - deep - 1,
							node = nodeData[i];
						for(var j = 0; j < l; j++){
							path.pop();
							valuePath.pop();
							pathNode.pop();
						}
						path[deep] = node[adapterForNode.id];
						valuePath[deep] = node[adapterForNode.value];
						pathNode[deep] = node;
						if(node[adapterForNode.value].indexOf(text) > -1){
							pathList.push(S.clone(path));
							valuePathList.push(S.clone(valuePath));
							pathNodeList.push(_self.dataFilter(pathNode));
						}
						if(!node[adapterForNode.isleaf]){
							_traverse(node[adapterForNode.children], deep + 1);
						}
					}
				}
			};

			if(text){
				_traverse(treeData);
			}

			return {
				pathList: pathList,
				pathNodeList: pathNodeList,
				valuePathList: valuePathList
			};
		},
		/**
		* 通过id 获取节点对象
		* @method getNodeById
		* @param {String|Number} id 目标id。 若没有，则返回空值
		* @return {Object} 节点对象
		*/
		getNodeById: function(id){
			var _self = this;
			return _self.traverseTreeById(id).node;
		},
		/**
		* 通过Path 获取节点对象
		* @method getNodeByPath
		* @param {Array} path 目标path。 若没有，则返回空值
		* @return {Object} 节点对象
		*/
		getNodeByPath: function(path){
			path = path || [];
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				treeData = _self.getTreeData(),
				node = null,
				nodeChildren = treeData;
			S.each(path, function(id){
				S.each(nodeChildren, function(n){
					if(n[adapterForNode.id] === id){
						node = n;
						return false;
					}
				});
				nodeChildren = node[adapterForNode.children];
			});

			return node;
		},
		/**
		* 通过id 获取节点路径
		* @method getPathById
		* @param {String|Number} id 目标id。 若没有，则返回[]
		* @return {Array} 节点路径
		*/
		getPathById: function(id){
			var _self = this;
			return _self.traverseTreeById(id).path;
		},
		/**
		* 通过id 获取该节点的父节点对象
		* @method getParentById
		* @param {String|Number} id 目标id。 （必填）
		* @return {Object} 父节点对象
		*/
		getParentById: function(id){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				node = _self.getNodeById(id),
				parentId = node[adapterForNode.parent];
			return _self.getNodeById(parent);
		},
		/**
		* 通过id 获取子节点列表
		* @method getChildrenById
		* @param {String|Number} id 目标id。 若没有，则返回[]
		* @return {Array} 子节点列表
		*/
		getChildrenById: function(id){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				node = _self.getNodeById(id);
			return node ? node[adapterForNode.children] || [] : [];
		},
		/**
		* 通过Path 获取子节点列表
		* @method getChildrenByPath
		* @param {Array} path 目标path。 若没有，则返回 treeData
		* @return {Array} 子节点列表
		*/
		getChildrenByPath: function(path){
			path = path || [];
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				node = null;
			if(path.length === 0){
				return _self.getTreeData();
			}else{
				node = _self.getNodeByPath(path);
				return node ? node[adapterForNode.children] || [] : [];
			}
		},
		/**
		* 获取节点的子节点列表
		* @method getChildrenByNode
		* @param {Object} node 目标节点
		* @return {Array} 子节点列表
		*/
		getChildrenByNode: function(node){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				children = [];
			if(node){
				children = node[adapterForNode.children] || [];			
			}else{
				children = [];
			}
			return children;
		},
		/**
		* 根据id 获取节点的全部叶子节点
		* @method getLeafsById
		* @param {String} id 目标节点Id
		* @return {Array} 叶子节点路径列表（pathNade）, 路径内不带当前节点，节点数据不带children属性
		*/
		getLeafsById: function(id){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				node = _self.getNodeById(id);
			return node ? _self.getLeafsByNode(node) : [];
		},
		/**
		* 根据节点 获取节点的全部叶子节点
		* @method getLeafsByNode
		* @param {Object} node 目标节点
		* @return {Array} 叶子节点路径列表（pathNade）, 路径内不带当前节点，节点数据不带children属性
		*/
		getLeafsByNode: function(node){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				_traverse,
				pathNode = [],
				leafsList = [];
					
			_traverse = function(nodeData, deep){
				deep = deep || 0;
				if(nodeData){
					for(var i = 0; i < nodeData.length; i++){
						var l = pathNode.length - deep - 1,
							node = nodeData[i];
						for(var j = 0; j < l; j++){
							pathNode.pop();
						}
						pathNode[deep] = node;
						if(node[adapterForNode.isleaf]){
							leafsList.push(_self.dataFilter(pathNode));
						}else{
							_traverse(node[adapterForNode.children], deep + 1);
						}
					}
				}
			};
			
			_traverse(_self.getChildrenByNode(node));
			
			return leafsList;
		},
		/**
		* 获取树的数据
		* @method getTreeData
		* @return {Array} 树数据
		*/
		getTreeData: function(){
			var _self = this;
			return _self.get('treeData');
		},
		/**
		* 手动填充树的数据 此方法会触发load事件
		* @method setTreeData
		* @param {Array} nodeData 带填充的节点列表
		* @param {String|Number} [id] 需要填充的节点id, (选填，若不填则当作整个树数据填充)
		*/
		setTreeData: function(nodeData, id){
			var _self = this;
			_self.fire('load', {data: nodeData, id: id});
		},
		/**
		* 通过文本搜索树 此方法会触发searchTree事件
		* @method searchTree
		* @param {String} searchText 要搜索的文本
		* @return {Object} 搜索结果
		*/
		searchTree: function(searchText){
			var _self = this,
				searchResult = _self.traverseTreeByText(searchText);

			_self.fire('searchTree', {
				text: searchText,
				pathList: searchResult.pathList,
				valuePathList: searchResult.valuePathList,
				result: searchResult
			});

			return searchResult;
		},
		/**
		* 将节点中的children属性过滤掉
		* @method dataFilter
		* @param {Array|Object} data 需要过滤的数据: 节点 或节点列表
		* @return {Array|Object} 过滤后的数据
		*/
		dataFilter: function(data){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				_data,
				_filter = function(n){
					return S.clone(n, function(v, k){
						if(k === adapterForNode.children){
							return false;
						}
					});
				};
				
			if(S.isArray(data)){
				_data = [];
				S.each(data, function(n){
					var filterData = _filter(n);
					_data.push(filterData);			
				});
			}else{
				_data = _filter(data);
			}

			return _data;
		},
		/**
		* 获取特定层级的树
		* @method getTreeByLevel
		* @param {Number} level 目标层级 跟节点为0级
		* @return {Array} 过滤后获取的数据
		*/
		getTreeByLevel: function(level){
			var _self = this,
				treeData = _self.getTreeData(),
				adapterForNode = _self.get('adapterForNode'),
				data = S.clone(treeData),
				_traverse;
			
			_traverse = function(nodeData, deep){
				deep = deep || 0;
				if(nodeData){
					for(var i = 0; i < nodeData.length; i++){
						var node = nodeData[i];
						if(deep === level - 1){
							node[adapterForNode.children] = [];
							node[adapterForNode.isleaf] = true;
						}else{
							_traverse(node[adapterForNode.children], deep + 1);
						}
					}
				}
			};
			
			if(level > 0){
				_traverse(data);
			}else{
				data = [];
			}

			return data;		
		},

		/**
		* 对象销毁
		* @method destroy
		*/
		destroy: function(){
			var _self = this;
			_self.detach();
			_self = null;
		},
		// 初始化
		_init: function(){
			var _self = this;
			_self.set('treeData', []);

			_self._initIdKey();

			_self._initEvent();

			if(_self.get('autoLoad')){
				_self.initLoad();
			}

		},
		// 初始化事件
		_initEvent: function(){		
			var _self = this;
			// 当load后把数据填充进treeData
			_self.on('load', function(e){
				_self._fillInTreeData(e.data, e.id);
			});
		},
		// 初始化idKey
		_initIdKey: function(){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				idKey = _self.get('idKey');
			if(!idKey){
				_self.set('idKey', adapterForNode.id);
			}
		},
		// 填充数据到treeData 若无id则作为整个树填充
		_fillInTreeData: function(data, id){
			var _self = this,
				adapterForNode = _self.get('adapterForNode'),
				nodeChildren = _self.getTreeData(),
				node;
			if(id){
				node = _self.getNodeById(id);
				if(node){
					nodeChildren = node[adapterForNode.children];
				}
			}
			nodeChildren.length = 0;
			S.each(data, function(n){
				nodeChildren.push(n);
			});
		},
		// 载入数据出错时调用
		_dataError: function(msg){
			var _self = this;
			if(msg){
				_self.get('dataErrorFunc')(msg);
			}
		},
		// 获取重载参数
		_getParam: function(param){
			var _self = this,
				idKey = _self.get('idKey'),
				lastParam = _self.get('lastParam') || _self.get('param'),
				loadParam = {};

			if(!!param && (S.isNumber(param) || S.isString(param))){
				// 若 param是id 则用idKey 配置参数对象
				loadParam[idKey] = param;
				loadParam = S.merge(lastParam, loadParam);
			}else if(!param || S.isEmptyObject(param)){
				// 取上一次参数或默认参数
				loadParam = lastParam;
			}else if(S.isPlainObject(param)){
				loadParam = param;
			}
			
			_self.set('lastParam', loadParam);
			return loadParam;		
		}

	});

	return Store; 

},{requires: ['core']});



/**
* Tree.Base 树的基类
* @version 2.0
* @date: 2013-05-3
*/
KISSY.add('kg/trees/2.0.0/base',function(S, Store, XTemplate){
	var DOM = S.DOM,
		Event = S.Event;

	/**
	* Base 树的基类 负责数据对象管理、结果管理、回显管理
	* @class Trees.Base
	* @module Trees
	* @author 桐人<wwwfuzheng@qq.com>
	* @extend KISSY.Base
	* @constructor Base
	* @param {Object} config 配置项
	*/
	function Base(config){
		var _self = this;
		config = S.merge(Base.config, config);
		if(!config.renderTo || !DOM.get('#' + config.renderTo)){
			throw 'please assign the id of render Dom!';
		}
		Base.superclass.constructor.call(_self, config);
		//支持的事件
		_self.events = [
			/**
			* 代理Store的load事件 树的数据加载完成后 触发此事件
			* @event load
			* @param {event} e 事件对象
			* @param {String} e.data 加载的数据
			* @param {Array} e.id 父节点id
			* @param {Array} e.param 加载参数
			*/
			'load',
			/**
			* 代理Store的searchTree事件 通过text遍历搜索树后 触发此事件
			* @event searchTree
			* @param {event} e 事件对象
			* @param {String} e.text 搜索的文本值
			* @param {Array} e.pathList 搜索的路径id集合
			* @param {Array} e.valuePathList 搜索的路径value集合
			* @param {Object} e.result 搜索结果
			*/
			'searchTree',
			/**
			* 增加堆栈结果集时触发该事件
			* @event resultPush
			* @param {event} e 事件对象
			* @param {Object} e.resultObj 新增的结果对象
			* @param {Array} e.result 当前结果集
			*/
			'resultPush',
			/**
			* 减少堆栈结果集时触发该事件
			* @event resultPop
			* @param {event} e 事件对象
			* @param {Object} e.resultObj 减少的结果对象
			* @param {Array} e.result 当前结果集
			*/
			'resultPop',
			/**
			* 结果集更新是时触发该事件 pop和push都会触发
			* @event resultUpdate
			* @param {event} e 事件对象
			* @param {Array} e.result 当前结果集
			*/
			'resultUpdate',
			/**
			* 在销毁对象前 触发此事件
			* @event beforeDestroy
			*/
			'beforeDestroy',
			/**
			* tree载入，在数据load结束后，数据初始化之前触发
			* @event loadTree
			* @param {event} e 事件对象
			*/
			'loadTree',
			/**
			* 数据初始化，在数据load结束后，并且tree载入完成时触发
			* @event initData
			* @param {event} e 事件对象
			* @param {Array} e.id 需要初始化的节点id或id列表
			*/
			'initData',
			/**
			* 重新载入树数据，在载入之前触发
			* @event beforeReload
			* @param {event} e 事件对象
			*/
			'beforeReload',
			/**
			* 树全部加载完成后触发
			* @event loadFinished
			* @param {event} e 事件对象
			*/
			'loadFinished'
		];
		_self._init();
	}
	Base.config = {
		/**
		* 树渲染dom的容器ID (必填)
		* @property renderTo
		* @type String
		*/
		renderTo: null,
		/**
		* 存储选择结果的容器Id（选填, 没有则不写入结果，此处写入的是选择节点的id）
		* @property resultId
		* @type String
		*/
		resultId: null,
		/**
		* 获取结果的类型 可选填的值有：'result', 'id', 'value', 'path', 'valuePath', 'valueStr' 可以组合多个类型的值 用空格隔开 注意：只有'result', 'id', 'path'三种类型支持回显
		* @property resultType
		* @type String
		* @default 'result'
		*/
		resultType: 'result',
		/**
		* 传入store对象
		* @property store
		* @type Object
		*/
		store: null,
		/**
		* 这里是 storeConfig.url 的简写形式，用于数据异步读取url（选填，不填的话可以手动设置树的数据）
		* @property url
		* @type String
		*/
		url: null,
		/**
		* 这里是 storeConfig.idKey 的简写形式，用于标识节点数据中，id的key（选填, 不填的话默认是 adapterForNode.id）
		* @property idKey
		* @type String
		*/
		idKey: null,
		/**
		* 这里是 storeConfig.param 的简写形式，用于数据读取的初始化参数，与 url 配合适用（选填）
		* @property param
		* @type Object
		* @default {}
		*/
		param: {},
		/**
		* 这里是 storeConfig.data 的简写形式，用于数据读取的初始化数据（选填）
		* @property data
		* @type Array
		* @default []
		*/
		data: [],
		/**
		* 这里是 storeConfig.isJsonp 的简写形式，用于选择是否用jsonp形式发送请求
		* @property isJsonp
		* @type Boolean
		* @default  false
		*/
		isJsonp: false,
		/**
		* 在这里进行store的配置，具体配置项请参见treeSore（选填）
		* @property storeConfig
		* @type Object
		*/
		storeConfig: {},
		/**
		* 节点文案显示模板(kissy.XTemplate)，默认只显示value
		* @property contentTemplate
		* @type String
		* @default  null
		*/
		contentTemplate: null
	};

	S.extend(Base, S.Base);
	S.augment(Base, {
		/**
		* 调用store的load方法，载入tree的数据
		* @method storeLoad
		* @param {Object|String|Array} [param] 参数对象 或 需要加载的id (不填则取默认的参数对象，若是String，则会用idKey配置参数对象) 或想置的数据
		*/
		storeLoad: function(param, isTreeData){
			var _self = this,
				store = _self.getStore();
			if(param){
				if(S.isArray(param)){
					store.setTreeData(param);
				}else{
					store.load(param, null, null, isTreeData);
				}
			}else{
				store.initLoad();
			}
		},
		/**
		* 调用store的load方法，重新载入整树数据
		* @method reload
		* @param {Object|String} param 参数对象
		*/
		reload: function(param){
			var _self = this,
				resultManage = _self.getResultManage();

			resultManage.length = 0;
			_self.fire('beforeReload');

			_self.set('isInit', false);
			_self.storeLoad(param, true);
		},
		/**
		* 获取store对象
		* @method getStore
		* @return {Object} store对象
		*/
		getStore: function(){
			return this.get('store');
		},
		/**
		* 调用store的searchTree方法，通过文本搜索树 此方法会触发searchTree事件
		* @method searchTree
		* @param {String} searchText 要搜索的文本
		* @return {Object} 搜索结果
		*/
		searchTree: function(searchText){
			var _self = this,
				store = _self.getStore();
			return store.searchTree(searchText);
		},

		// 关于结果
		/**
		* 获取结果对象 结果管理器中可以存放单结果，也可以存放多结果，根据不同树的使用场景不同 而下面的去结果方法，都可以正确的取到结果，一个值或是数组
		* @method getResultManage
		* @return {Array} 结果集列表
		*/
		getResultManage: function(){
			return this.get('resultManage');
		},
		/**
		* 获取选中结果的ID
		* @method getIdFromResult
		* @return {Number|String|Array} 选中结果的ID
		*/
		getIdFromResult: function(){
			var _self = this;
			return _self.getIdFromData(null);
		},
		/**
		* 从数据中，获取ID
		* @method getIdFromData
		* @param {Array} data 类似结果管理器的数据，为null,则直接去结果管理器
		* @return {Number|String|Array} 选中结果的ID
		*/
		getIdFromData: function(data){
			var _self = this,
				id = null;
			id = _self.traverseResult(function(result){
				return result[result.length - 1].id;
			}, data);
			return id;
		},
		/**
		* 获取选中结果的velue
		* @method getValueFromResult
		* @return {String|Array} 选中结果的velue
		*/
		getValueFromResult: function(){
			var _self = this;
			return _self.getValueFromData(null);
		},
		/**
		* 从数据中，获取velue
		* @method getValueFromData
		* @param {Array} data 类似结果管理器的数据，为null,则直接去结果管理器
		* @return {String|Array} 选中结果的velue
		*/
		getValueFromData: function(data){
			var _self = this,
				value = null;
			value = _self.traverseResult(function(result){
				return result[result.length - 1].value;
			}, data);
			return value;
		},
		/**
		* 获取结果的ID路径
		* @method getPathFromResult
		* @return {Array} ID路径
		*/
		getPathFromResult: function(){
			var _self = this;
			return _self.getPathFromData(null);
		},
		/**
		* 从数据中，获取ID路径
		* @method getPathFromData
		* @param {Array} data 类似结果管理器的数据，为null,则直接去结果管理器
		* @return {Array} ID路径
		*/
		getPathFromData: function(data){
			var _self = this,
				path = null;
			path = _self.traverseResult(function(result){
				var list = [];
				S.each(result, function(r){
					list.push(r.id);
				});
				return list;
			}, data);
			return path;
		},
		/**
		* 获取结果的value路径
		* @method getValuePathFromResult
		* @return {Array} value路径
		*/
		getValuePathFromResult: function(){
			var _self = this;
			return _self.getValuePathFromData(null);
		},
		/**
		* 从数据中，获取value路径
		* @method getValuePathFromData
		* @param {Array} data 类似结果管理器的数据，为null,则直接去结果管理器
		* @return {Array} value路径
		*/
		getValuePathFromData: function(data){
			var _self = this,
				valuePath = null;
			valuePath = _self.traverseResult(function(result){
				var list = [];
				S.each(result, function(r){
					list.push(r.value);
				});
				return list;
			}, data);
			return valuePath;
		},
		/**
		* 获取结果的value路径字符串形式
		* @method getValueStrFromResult
		* @param {String} joinStr 连接符，默认为 ' > '
		* @return {String|Array} value路径字符串形式
		*/
		getValueStrFromResult: function(joinStr){
			var _self = this;
			return _self.getValueStrFromData(null, joinStr);
		},
		/**
		* 从数据中，获取value路径字符串形式
		* @method getValueStrFromData
		* @param {Array} data 类似结果管理器的数据，为null,则直接去结果管理器
		* @param {String} joinStr 连接符，默认为 ' > '
		* @return {String|Array} value路径字符串形式
		*/
		getValueStrFromData: function(data, joinStr){
			var _self = this,
				valueStr = null;
			joinStr = joinStr || ' > ';
			valueStr = _self.traverseResult(function(result){
				var list = [];
				S.each(result, function(r){
					var _value = r.value;
					list.push(_value);
				});
				return list.join(joinStr);
			}, data);
			return valueStr;
		},
		/**
		* 从结果管理其中，获取所有叶子节点列表
		* @method getAllLeafsFromResult
		* @return {Array} 所有子节点的节点路径
		*/
		getAllLeafsFromResult: function(){
			var _self = this;
			return _self.getAllLeafsFromData(null);
		},
		/**
		* 从数据中，获取所有叶子节点列表
		* @method getAllLeafsFromData
		* @param {Array} data 类似结果管理器的数据，为null,则直接去结果管理器
		* @return {Array} 所有子节点的节点路径
		*/
		getAllLeafsFromData: function(data){
			var _self = this,
				store = _self.getStore(),
				_result = [];
				
			_self.traverseResult(function(result){
				var lastData = result[result.length - 1],
					_leafsList = null;
				
				if(!lastData.isleaf){
					_leafsList = store.getLeafsById(lastData.id);
					S.each(_leafsList, function(l){
						_result.push(result.concat(l));
					});
				}else{
					_result.push(S.clone(result));
				}
			}, data);
				
			return _result;
		},
		
		/**
		* 根据resultInput的值 初始化数据 触发 initData 事件
		* @method initData
		* @return {String|Number|Array} 需要初始化的id 或 id列表
		*/
		initData: function(){
			var _self = this,
				id = _self.getIdFormResultInput();

			_self.fire('initData', {id: id});

			return id;
		},
		/**
		* 从存储结果的input中获取id, 根据 resultType
		* @method getIdFormResultInput
		* @return {Number|String} id
		*/
		getIdFormResultInput: function(){
			var _self = this,
				resultInput = _self.get('resultInput'),
				resultTypeList = _self.get('resultType').split(' '),
				result = null,
				id = null,
				targetResult;
			if(resultInput){
				result = S.JSON.parse(resultInput.val());
				if(result !== null){
					if(S.inArray('result', resultTypeList)){
						id = _self.traverseResult(function(r){
							return r[r.length - 1].id;
						}, result['result']);
					}else if(S.inArray('id', resultTypeList)){
						id = result['id'];
					}else if(S.inArray('path', resultTypeList)){
						id = _self.traverseResult(function(p){
							return p[p.length - 1];
						}, result['path']);
					}
				}
			}
			return id;
		},
		/**
		* 判断当前结果集是否为空
		* @method isBlankResult
		* @param {Array} [data] 其他数据
		* @return {Boolean} 是否为空
		*/
		isBlankResult: function(data){
			var _self = this,
				resultManage = data || _self.getResultManage(),
				isBlank = false;
			if(resultManage.length === 0){
				isBlank = true;
			}
			return isBlank;
		},
		/**
		* 判断当前结果是不是叶子节点 如果是多结果，则只有全都是叶子节点 才返回true
		* @method isLeafResult
		* @param {Array} [data] 其他数据
		* @return {Boolean} 是否是叶子节点 若结果集为空，也会返回false
		*/
		isLeafResult: function(data){
			var _self = this,
				resultManage = data || _self.getResultManage(),
				isLeaf = false,
				_isLeaf = null;
			_isLeaf = _self.traverseResult(function(result){
				return result[result.length - 1].isleaf;
			});
			if(S.isBoolean(_isLeaf)){
				isLeaf = _isLeaf;
			}else if(isLeaf === null){
				isLeaf = false;
			}else if(S.isArray(_isLeaf)){
				isLeaf = S.reduce(_isLeaf, function(a, b){
					return a && b;
				});
			}
			return isLeaf;
		},
		/**
		* 多结果管理功能 遍历结果管理器
		* @method traverseResult
		* @param {Function} func 需要执行的方法 参数为单结果对象
		* @param {Array} [data] 其他数据
		* @return {String|Array} 处理之后的数据
		*/
		traverseResult: function(func, data){
			var _self = this,
				resultManage = data || _self.getResultManage(),
				outResult = null;
			if(!_self.isBlankResult(data)){
				if(_self.isMultipleResult(data)){
					outResult = [];
					S.each(resultManage, function(result){
						outResult.push(func(result));
					});
				}else{
					outResult = func(resultManage);
				}
			}
			return outResult;
		},
		/**
		* 判断结果是否为多结果
		* @method isMultipleResult
		* @param {Array} [data] 其他数据
		* @return {boolean} 结果
		*/
		isMultipleResult: function(data){
			var _self = this,
				resultManage = data || _self.getResultManage(),
				isMultiple = false;
			if(resultManage.length > 0 && S.isArray(resultManage[0])){
				isMultiple = true;
			}
			return isMultiple;
		},
		/**
		* 销毁tree对象
		* @method destroy
		*/
		destroy: function(){
			var _self = this,
				store = _self.getStore(),
				resultManage = _self.getResultManage(),
				container = _self.get('container');

			_self.fire('beforeDestroy');

			store.destroy();
			resultManage.length = 0;
			container[0].innerHTML = '';
			_self.detach();
			_self = null;
		},
		// tree初始化
		_init: function(){
			var _self = this,
				container = S.one('#' + _self.get('renderTo')),
				resultInput = S.one('#' + _self.get('resultId')),
				resultManage = [],
				contentTemplate = _self.get('contentTemplate');
			_self._initStore();
			_self.set('container', container);

			if(resultInput){
				_self.set('resultInput', resultInput);
			}

			_self.set('resultManage', resultManage);

			_self._initEvent();

			// 初始化节点模板
			if(contentTemplate){
				_self.set('contentTemplateObj', new XTemplate(contentTemplate));
			}

		},
		// 初始化事件
		_initEvent: function(){
			var _self = this,
				store = _self.getStore();

			// 代理store的searchTree事件
			store.on('searchTree', function(e){
				_self.fire('searchTree', {
					text: e.text,
					pathList: e.pathList,
					valuePathList: e.valuePathList,
					result: e.result
				});
			});
			// 代理store的load事件
			store.on('load', function(e){
				_self.fire('load', {
					data: e.data,
					id: e.id,
					param: e.param
				});
			});
			// 数据加载完成
			_self.on('load', function(e){
				_self._loadTree();
				if(!_self.get('isInit')){
					_self.initData();
					_self.set('isInit', true);
				}
				_self.fire('loadFinished');
			});
			// 结果更新
			_self.on('resultUpdate', function(e){
				_self._updateResult();
			});
		},
		// 数据加载完成时调用此方法
		_loadTree: function(){
			var _self = this;
			_self.fire('loadTree');
		},
		// 获取整理store的配置项
		_getStoreConfig: function(){
			var _self = this,
				storeConfig = _self.get('storeConfig');
			S.mix(storeConfig, {
				url: _self._getStoreUrl(),
				idKey: _self.get('idKey'),
				param: _self.get('param'),
				data: _self.get('data'),
				isJsonp: _self.get('isJsonp'),
				autoLoad: false
			});
			return storeConfig;
		},
		// 初始化store
		_initStore: function(){
			var _self = this,
				store = _self.get('store'),
				storeConfig;
			if(!store){
				storeConfig = _self._getStoreConfig();
				store = new Store(storeConfig);
			}
			_self.set('store', store);
		},
		// 获取url 可以重写此方法以获得更灵活的url获取方式
		_getStoreUrl: function(){
			return this.get('url');
		},
		// 增加单结果集堆栈
		_pushResult: function(nodeData){
			var _self = this,
				resultManage = _self.getResultManage(),
				_result = {},
				valueStr;

			_result.id = nodeData.id;
			_result.value = nodeData.value;
			_result.isleaf = nodeData.isleaf;
			resultManage.push(_result);

			_self.fire('resultPush', {result: resultManage, resultObj: _result});
			_self.fire('resultUpdate', {result: resultManage});
		},
		// 减少单结果集堆栈
		_popResult: function(){
			var _self = this,
				resultManage = _self.getResultManage(),
				popResult = resultManage.pop();

			_self.fire('resultPop', {result: resultManage, resultObj: popResult});
			_self.fire('resultUpdate', {result: resultManage});
		},
		// 根据模板获取content
		_getContent: function(data){
			var _self = this,
				contentTemplateObj = _self.get('contentTemplateObj'),
				adapterForNode,
				content;
			if(contentTemplateObj){
				content =  contentTemplateObj.render(data);
			}else{
				adapterForNode = _self.getStore().get('adapterForNode');
				content = data[adapterForNode.value];
			}
			return content;
		},
		// 更新结果
		_updateResult: function(){
			var _self = this,
				resultInput = _self.get('resultInput'),
				resultTypeList = _self.get('resultType').split(' '),
				result = {},
				_result = null;

			if(resultInput){
				if(S.inArray('result', resultTypeList)){
					_result = _self.getResultManage();
					if(_result && _result.length > 0){
						result['result'] = _result;
					}
				}
				if(S.inArray('id', resultTypeList)){
					_result = _self.getIdFromResult();
					if(_result !== null && _result !== ''){
						result['id'] = _result;
					}
				}
				if(S.inArray('value', resultTypeList)){
					_result = _self.getValueFromResult();
					if(_result !== null && _result !== ''){
						result['value'] = _result;
					}
				}
				if(S.inArray('path', resultTypeList)){
					_result = _self.getPathFromResult();
					if(_result && _result.length > 0){
						result['path'] = _result;
					}
				}
				if(S.inArray('valuePath', resultTypeList)){
					_result = _self.getValuePathFromResult();
					if(_result && _result.length > 0){
						result['valuePath'] = _result;
					}
				}
				if(S.inArray('valueStr', resultTypeList)){
					_result = _self.getValueStrFromResult();
					if(_result !== null && _result !== ''){
						result['valueStr'] = _result;
					}
				}
				resultInput.val(S.isEmptyObject(result) ? '' : S.JSON.stringify(result));
			}
		}
	});

	return Base;

}, {requires: ['./store', 'xtemplate', 'core']});


