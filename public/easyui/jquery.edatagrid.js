/**
 * edatagrid - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2011-2015 www.jeasyui.com 
 * 
 * Dependencies:
 *   datagrid
 *   messager
 * 
 */
(function($){
	// var oldLoadDataMethod = $.fn.datagrid.methods.loadData;
	// $.fn.datagrid.methods.loadData = function(jq, data){
	// 	jq.each(function(){
	// 		$.data(this, 'datagrid').filterSource = null;
	// 	});
	// 	return oldLoadDataMethod.call($.fn.datagrid.methods, jq, data);
	// };

	// 20240201 Maria 新增全域變數判斷，給行驗證機制用的。如果工程師沒設定行驗證，就都能順利編輯下一行。
	// var continue_edit = true;

	var autoGrids = [];
	function checkAutoGrid(){
		autoGrids = $.grep(autoGrids, function(t){
			return t.length && t.data('edatagrid');
		});
	}
	function saveAutoGrid(omit){
		checkAutoGrid();
		$.map(autoGrids, function(t){
			if (t[0] != $(omit)[0]){
				t.edatagrid('saveRow');
			}
		});
		checkAutoGrid();
	}
	function addAutoGrid(dg){
		checkAutoGrid();
		for(var i=0; i<autoGrids.length; i++){
			if ($(autoGrids[i])[0] == $(dg)[0]){return;}
		}
		autoGrids.push($(dg));
	}
	function delAutoGrid(dg){
		checkAutoGrid();
		autoGrids = $.grep(autoGrids, function(t){
			return $(t)[0] != $(dg)[0];
		});
	}

	$(function(){
		$(document).unbind('.edatagrid').bind('mousedown.edatagrid', function(e){
			var p = $(e.target).closest('div.datagrid-view,div.combo-panel,div.window,div.window-mask');
			if (p.length){
				if (p.hasClass('datagrid-view')){
					saveAutoGrid(p.children('table'));
				}
				return;
			}
			saveAutoGrid();
		});
	});
	
	function buildGrid(target){
		var opts = $.data(target, 'edatagrid').options;
		$(target).datagrid($.extend({}, opts, {
			onDblClickCell:function(index,field,value){
				// 20231212 Maria DBClick要觸發更新頁開啟，所以取消原始的設定
				// if (opts.editing){
				// 	$(this).edatagrid('editRow', index);
				// 	focusEditor(target, field);
				// }
				// if (opts.onDblClickCell){
				// 	opts.onDblClickCell.call(target, index, field, value);
				// }
			},
			// 20231212 Maria 關閉點擊別行就自動存檔
			onClickCell:function(index,field,value){
				// if (opts.editing && opts.editIndex >= 0){
				// 	$(this).edatagrid('editRow', index);
				// 	focusEditor(target, field);
				// }
				// if (opts.editIndex >= 0){
				// 	var dg = $(this);
				// 	if (opts.editing){
				// 		dg.edatagrid('editRow', index);
				// 	} else {
				// 		setTimeout(function(){
				// 			dg.edatagrid('selectRow', opts.editIndex);
				// 		}, 0);
				// 	}
				// 	focusEditor(target, field);
				// }
				// if (opts.onClickCell){
				// 	opts.onClickCell.call(target, index, field, value);
				// }
			},
			onBeforeEdit: function(index, row){
				if (opts.onBeforeEdit){
					if (opts.onBeforeEdit.call(target, index, row) == false){
						return false;
					}
				}
				if (opts.autoSave){
					addAutoGrid(this);
				}
				opts.originalRow = $.extend(true, [], row);
			},
			onAfterEdit: function(index, row){
				delAutoGrid(this);
				opts.editIndex = -1;
				var url = row.isNewRecord ? opts.saveUrl : opts.updateUrl;
				if (url){
					var changed = false;
					var fields = $(this).edatagrid('getColumnFields',true).concat($(this).edatagrid('getColumnFields'));
					for(var i=0; i<fields.length; i++){
						var field = fields[i];
						var col = $(this).edatagrid('getColumnOption', field);
						if (col.editor && opts.originalRow[field] != row[field]){
							changed = true;
							break;
						}
					}
					if (changed){
						opts.poster.call(target, url, row, function(data){
							if (data.isError){
								var originalRow = opts.originalRow;
								$(target).edatagrid('cancelRow',index);
								$(target).edatagrid('selectRow',index);
								$(target).edatagrid('editRow',index);
								opts.originalRow = originalRow;
								opts.onError.call(target, index, data);
								return;
							}
							data.isNewRecord = null;
							$(target).datagrid('updateRow', {
								index: index,
								row: data
							});
							if (opts.tree){
								var idValue = row[opts.idField||'id'];
								var t = $(opts.tree);
								var node = t.tree('find', idValue);
								if (node){
									node.text = row[opts.treeTextField];
									t.tree('update', node);
								} else {
									var pnode = t.tree('find', row[opts.treeParentField]);
									t.tree('append', {
										parent: (pnode ? pnode.target : null),
										data: [{id:idValue,text:row[opts.treeTextField]}]
									});
								}
							}
							opts.onSuccess.call(target, index, row);
							opts.onSave.call(target, index, row);
						}, function(data){
							opts.onError.call(target, index, data);
						});
					} else {
						opts.onSave.call(target, index, row);
					}
				} else {
					row.isNewRecord = false;
					opts.onSave.call(target, index, row);
				}
				if (opts.onAfterEdit) opts.onAfterEdit.call(target, index, row);
			},
			onCancelEdit: function(index, row){
				delAutoGrid(this);
				opts.editIndex = -1;
				if (row.isNewRecord) {
					$(this).datagrid('deleteRow', index);
				}
				if (opts.onCancelEdit) opts.onCancelEdit.call(target, index, row);
			},
			onBeforeLoad: function(param){
				if (opts.onBeforeLoad.call(target, param) == false){return false}
				$(this).edatagrid('cancelRow');
				if (opts.tree){
					var node = $(opts.tree).tree('getSelected');
					param[opts.treeParentField] = node ? node.id : undefined;
				}
			},
			// 20240201 Maria 新增edatagrid.event，用於執行row驗證，若回傳false會中斷下一筆的編輯事件
			onValidRow:function(index,row){
				if (opts.onValidRow.call(target, index,row) == undefined){return true}
			}
		}));
		
		
		
		if (opts.tree){
			$(opts.tree).tree({
				url: opts.treeUrl,
				onClick: function(node){
					$(target).datagrid('load');
				},
				onDrop: function(dest,source,point){
					var targetId = $(this).tree('getNode', dest).id;
					var data = {
						id:source.id,
						targetId:targetId,
						point:point
					};
					opts.poster.call(target, opts.treeDndUrl, data, function(result){
						$(target).datagrid('load');
					});
				}
			});
		}
	}

	function focusEditor(target, field){
		var opts = $(target).edatagrid('options');
		var t;
		var editor = $(target).datagrid('getEditor', {index:opts.editIndex,field:field});
		if (editor){
			t = editor.target;
		} else {
			var editors = $(target).datagrid('getEditors', opts.editIndex);
			if (editors.length){
				// 20240911 Maria 新增判斷，跳過 鎖定 或 隱藏的 editor
				let i = 0;
				while ( i < editors.length ){
					let input_target = $(editors[i].target).data('textbox') ? $(editors[i].target).textbox('textbox') :$(editors[i].target);
					// 預設為鎖定
					if (  input_target.is(":disabled") ) {
						i++;
					}
					//或隱藏
					else if ( input_target .parents("td").is(":hidden")){
						i++;
					}
					else{
						t = editors[i].target;
						break;
					}
				}
			}
		}
		if (t !==undefined){
			var state = $(target).data('datagrid');
			var left = state.dc.body2._scrollLeft();
			if ($(t).hasClass('textbox-f')){
				$(t).textbox('textbox').focus();
			} else {
				$(t).focus();					
			}
			state.dc.body2._scrollLeft(left);	// restore the scroll left
		}else{
			// 沒有半個的話，focus在panel上
			state.datagrid('getPanel').panel('panel').focus();
		}
	}
	
	$.fn.edatagrid = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.edatagrid.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.datagrid(options, param);
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'edatagrid');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'edatagrid', {
					options: $.extend({}, $.fn.edatagrid.defaults, $.fn.edatagrid.parseOptions(this), options)
				});
			}
			buildGrid(this);
		});
	};
	
	$.fn.edatagrid.parseOptions = function(target){
		return $.extend({}, $.fn.datagrid.parseOptions(target), {
		});
	};
	
	$.fn.edatagrid.methods = {
		options: function(jq){
			var opts = $.data(jq[0], 'edatagrid').options;
			return opts;
		},
		loadData: function(jq, data){
			return jq.each(function(){
				$(this).edatagrid('cancelRow');
				$(this).datagrid('loadData', data);
			});
		},
		enableEditing: function(jq){
			return jq.each(function(){
				var opts = $.data(this, 'edatagrid').options;
				opts.editing = true;
			});
		},
		disableEditing: function(jq){
			return jq.each(function(){
				var opts = $.data(this, 'edatagrid').options;
				opts.editing = false;
			});
		},
		isEditing: function(jq, index){
			var opts = $.data(jq[0], 'edatagrid').options;
			var tr = opts.finder.getTr(jq[0], index);
			return tr.length && tr.hasClass('datagrid-row-editing');
		},
		// 20241223 Maria Edatagrid版的 getSelected，如果有 editor元件會先替換值
		getSelected:function(jq){
			// var dg = jq;
			var _84d=$.data(jq[0],"datagrid");
			var opts=_84d.options;
			var rows=[];
			opts.finder.getTr(jq[0],"","selected",2).each(function(){
				rows = opts.finder.getRow(jq[0],$(this));
				$(this).find("div").each(function(){
					var field = $(this).parent().attr("field") == undefined?"":$(this).parent().attr("field");
					if ( $(this).hasClass("datagrid-editable")){
						var ed=$.data(this,"datagrid.editor");
						var t=$(ed.target);
						// 把值設定回去
						rows[field] = ed.actions.getValue(ed.target);
					}
				})
			});
			return rows;
		},
		editRow: function(jq, index){
			return jq.each(function(){
				var dg = $(this);
				var opts = $.data(this, 'edatagrid').options;
				var editIndex = opts.editIndex;
				if (editIndex != index){
					if (dg.datagrid('validateRow', editIndex)){
						if (editIndex>=0){
							if (opts.onBeforeSave.call(this, editIndex) == false) {
								setTimeout(function(){
									dg.datagrid('selectRow', editIndex);
								},0);
								return;
							}
						}
						dg.datagrid('endEdit', editIndex);
						dg.datagrid('beginEdit', index);
						if (!dg.edatagrid('isEditing', index)){
							return;
						}
						opts.editIndex = index;
						focusEditor(this);
						var rows = dg.datagrid('getRows');
						opts.onEdit.call(this, index, rows[index]);
					} else {
						setTimeout(function(){
							dg.datagrid('selectRow', editIndex);
						}, 0);
					}
				}
			});
		},
		addRow: function(jq, index){
			return jq.each(function(){
				var dg = $(this);
				var opts = $.data(this, 'edatagrid').options;
				if (opts.editIndex >= 0){
					if (!dg.datagrid('validateRow', opts.editIndex)){
						dg.datagrid('selectRow', opts.editIndex);
						return;
					}
					if (opts.onBeforeSave.call(this, opts.editIndex) == false){
						setTimeout(function(){
							dg.datagrid('selectRow', opts.editIndex);
						},0);
						return;
					}
					dg.datagrid('endEdit', opts.editIndex);
				}
				
				function _add(index, row){
					if (index == undefined){
						dg.datagrid('appendRow', row);
						opts.editIndex = dg.datagrid('getRows').length - 1;
					} else {
						dg.datagrid('insertRow', {index:index,row:row});
						opts.editIndex = index;
					}
				}
				if (typeof index == 'object'){
					_add(index.index, $.extend(index.row, {isNewRecord:true}))
				} else {
					_add(index, {isNewRecord:true});
				}
								
				dg.datagrid('beginEdit', opts.editIndex);
				dg.datagrid('selectRow', opts.editIndex);
				
				var rows = dg.datagrid('getRows');
				if (opts.tree){
					var node = $(opts.tree).tree('getSelected');
					rows[opts.editIndex][opts.treeParentField] = (node ? node.id : 0);
				}
				
				opts.onAdd.call(this, opts.editIndex, rows[opts.editIndex]);
			});
		},
		saveRow: function(jq){
			return jq.each(function(){
				var dg = $(this);
				var opts = $.data(this, 'edatagrid').options;
				if (opts.editIndex >= 0){
					if (opts.onBeforeSave.call(this, opts.editIndex) == false) {
						setTimeout(function(){
							dg.datagrid('selectRow', opts.editIndex);
						},0);
						return;
					}
					$(this).datagrid('endEdit', opts.editIndex);
				}
			});
		},
		cancelRow: function(jq){
			return jq.each(function(){
				var opts = $.data(this, 'edatagrid').options;
				if (opts.editIndex >= 0){
					$(this).datagrid('cancelEdit', opts.editIndex);
				}
			});
		},
		// 20231226 Maria 編輯狀態的刪除，做一些自定義的調整
		destroyRow: function(jq, index){
			return jq.each(function(){
				var dg = $(this);
				var opts = $.data(this, 'edatagrid').options;
				
				var rows = [];
				if (index == undefined){
					rows = dg.datagrid('getSelections');
				} else {
					var rowIndexes = $.isArray(index) ? index : [index];
					for(var i=0; i<rowIndexes.length; i++){
						var row = opts.finder.getRow(this, rowIndexes[i]);
						if (row){
							rows.push(row);
						}
					}
				}
				let next_idx = 0;
				// 把selecte起來的row刪除
				for(var i=0; i<rows.length; i++){
					// 取得該表的總數量
					let dg_records = dg.datagrid("getRows");
					// 取得該行的row
					let row_idx = dg.datagrid("getRowIndex",rows[i].keyid);
					// 刪除該筆資料
					_del(rows[i]);
					// 紀錄下一個要被刪除的row
					next_idx = row_idx < dg_records.length ? row_idx: 0;
				}
				// 然後選取下一筆(刷新下游)
				dg.datagrid('selectRow',next_idx);
				// 把該筆進入編輯狀態
				dg.edatagrid('editRow', next_idx);
				
				function _del(row){
					var index = dg.datagrid('getRowIndex', row);
					if (index == -1){return}
					if (row.isNewRecord){
						dg.datagrid('cancelEdit', index);
					} else {
						if (opts.destroyUrl){
							var idValue = row[opts.idField||'id'];
							opts.poster.call(dg[0], opts.destroyUrl, {id:idValue}, function(data){
								var index = dg.datagrid('getRowIndex', idValue);
								if (data.isError){
									dg.datagrid('selectRow', index);
									opts.onError.call(dg[0], index, data);
									return;
								}
								if (opts.tree){
									dg.datagrid('reload');
									var t = $(opts.tree);
									var node = t.tree('find', idValue);
									if (node){
										t.tree('remove', node.target);
									}
								} else {
									dg.datagrid('cancelEdit', index);
									dg.datagrid('deleteRow', index);
								}
								opts.onDestroy.call(dg[0], index, $.extend(row,data));
								var pager = dg.datagrid('getPager');
								if (pager.length && !dg.datagrid('getRows').length){
									dg.datagrid('options').pageNumber = pager.pagination('options').pageNumber;
									dg.datagrid('reload');
								}
							}, function(data){
								opts.onError.call(dg[0], index, data);
							});
						} else {
							dg.datagrid('cancelEdit', index);
							dg.datagrid('deleteRow', index);
							opts.onDestroy.call(dg[0], index, row);
						}
					}
				}
			});
		},
		/*
			20241223 Maria 編輯狀態下的updateRow，可用於改變當前編輯row的資料
			其原理與datagrid的updateow相同，但不影響編輯狀態
			用於彈窗或工程師自行擴充事件。
			row可以不用給全部欄位，只給要異動的欄位即可
			參數說明：
			data	要更新的資料，請以物件形式給予。EX:{index:1,row:row}
		*/
		updateRow:function(jq,param){
			return jq.each(function(){
				var dg = this;
				var opts = $.data(dg, 'datagrid').options;
				var row = param.row;
				var index = param.index;
				// 取得指定資料的 tr元件
				var tr=opts.finder.getTr(dg,param.index);
				var ori_row=opts.finder.getRow(dg,param.index);
				// 把看不見的值也替換掉
				for (let field in row  ){
					if ( ori_row.hasOwnProperty(field) ){
						ori_row[field] = row[field];
					}
				}
				// 比對 row 的回填值，如果是 editor就回填
				tr.find("div").each(function(){
					var field = $(this).parent().attr("field") == undefined?"":$(this).parent().attr("field");
					if ( row.hasOwnProperty(field)){
						if ( $(this).hasClass("datagrid-editable")){
							var ed=$.data(this,"datagrid.editor");
							var t=$(ed.target);
							// 把值設定回去
							ed.actions.setValue(ed.target,row[field]);
						}else{
							// 如果不是 editor，重新建構 td (參考 jquery.easyui.min 的 datagrid.renderRow 方法 )
							var col = $(dg).datagrid('getColumnOption', field);
							if (col){
								// 清空 td 結構，重新規劃
								var v=row[field];
								var css=col.styler?(col.styler.call(dg,v,row,index)||""):"";
								var cs=getStyleValue(css);
								var cls=cs.c?"class=\""+cs.c+"\"":"";
								var _962=col.hidden?"style=\"display:none;"+cs.s+"\"":(cs.s?"style=\""+cs.s+"\"":"");
								var cc="<td field=\""+field+"\" "+cls+" "+_962+">";
								var _962="";
								if(!col.checkbox){
								if(col.align){
								_962+="text-align:"+col.align+";";
								}
								if(!opts.nowrap){
								_962+="white-space:normal;height:auto;";
								}else{
								if(opts.autoRowHeight){
								_962+="height:auto;";
								}
								}
								}

								cc+="<div style=\""+_962+"\" ";
								if(v==undefined){
								cc+="title='　' ";
								}else{
								if(col.formatter && col.field !== "delete" && col.field !== "ck" ){
								if (col.formatter.name !== "showBloean" ){
								title = col.formatter(v,row,index);
								if (col.formatter.name == "FieldShowNumeric"){
								if (title == null || Number.isNaN(title)){
								title="　";}}}
								else{
								title="　";
								}
								cc+="title=\""+title+"\" ";
								}else{
								cc+="title=\""+v+"\" ";
								}
								}
								cc+=col.checkbox?"class=\"datagrid-cell-check\"":"class=\"datagrid-cell "+col.cellClass+"\"";
								cc+=">";
								if(col.checkbox){
								cc+="<input type=\"checkbox\" "+(row.checked?"checked=\"checked\"":"");
								cc+=" name=\""+field+"\" value=\""+(v!=undefined?v:"")+"\">";
								}else{
								if(col.formatter){
								cc+=col.formatter(v,row,index);
								}else{
								cc+=v;
								}
								}
								cc+="</div>";
								cc+="</td>";
								$(this).parent("td").replaceWith($(cc));
							}
						}
					}
				});
				function getStyleValue(css){
					var _963="";
					var _964="";
					if(typeof css=="string"){
					_964=css;
					}else{
					if(css){
					_963=css["class"]||"";
					_964=css["style"]||"";
					}
					}
					return {c:_963,s:_964};
				}
			})
		},
		editCell:function(jq, param){
			var dg = $(this);
			var opts = dg.datagrid('options');
			var input = dg.datagrid('input', param);
			if (input){
				dg.datagrid('gotoCell', param);
				input.focus();
				return;
			}
			if (!endCellEdit(target, true)){return;}
			if (opts.onBeforeCellEdit.call(target, param.index, param.field) == false){
				return;
			}
	
			var fields = dg.datagrid('getColumnFields',true).concat(dg.datagrid('getColumnFields'));
			$.map(fields, function(field){
				var col = dg.datagrid('getColumnOption', field);
				col.editor1 = col.editor;
				if (field != param.field){
					col.editor = null;
				}
			});
	
			var col = dg.datagrid('getColumnOption', param.field);
			if (col.editor){
				dg.datagrid('beginEdit', param.index);
				var input = dg.datagrid('input', param);
				if (input){
					dg.datagrid('gotoCell', param);
					setTimeout(function(){
						input.unbind('.cellediting').bind('keydown.cellediting', function(e){
							if (e.keyCode == 13){
								return opts.navHandler['13'].call(target, e);
								// return false;
							}
						});
						input.focus();
					}, 0);
					opts.onCellEdit.call(target, param.index, param.field, param.value);
				} else {
					dg.datagrid('cancelEdit', param.index);
					dg.datagrid('gotoCell', param);
				}
			} else {
				dg.datagrid('gotoCell', param);
			}
	
			$.map(fields, function(field){
				var col = dg.datagrid('getColumnOption', field);
				col.editor = col.editor1;
			});
		},
		// destroyRow: function(jq, index){
		// 	return jq.each(function(){
		// 		var dg = $(this);
		// 		var opts = $.data(this, 'edatagrid').options;
				
		// 		var rows = [];
		// 		if (index == undefined){
		// 			rows = dg.datagrid('getSelections');
		// 		} else {
		// 			var rowIndexes = $.isArray(index) ? index : [index];
		// 			for(var i=0; i<rowIndexes.length; i++){
		// 				var row = opts.finder.getRow(this, rowIndexes[i]);
		// 				if (row){
		// 					rows.push(row);
		// 				}
		// 			}
		// 		}

		// 		if (!rows.length){
		// 			$.messager.show({
		// 				title: opts.destroyMsg.norecord.title,
		// 				msg: opts.destroyMsg.norecord.msg
		// 			});
		// 			return;
		// 		}
				
		// 		$.messager.confirm(opts.destroyMsg.confirm.title,opts.destroyMsg.confirm.msg,function(r){
		// 			if (r){
		// 				for(var i=0; i<rows.length; i++){
		// 					_del(rows[i]);
		// 				}
		// 				dg.datagrid('clearSelections');
		// 			}
		// 		});
			
		// 		function _del(row){
		// 			var index = dg.datagrid('getRowIndex', row);
		// 			if (index == -1){return}
		// 			if (row.isNewRecord){
		// 				dg.datagrid('cancelEdit', index);
		// 			} else {
		// 				if (opts.destroyUrl){
		// 					var idValue = row[opts.idField||'id'];
		// 					opts.poster.call(dg[0], opts.destroyUrl, {id:idValue}, function(data){
		// 						var index = dg.datagrid('getRowIndex', idValue);
		// 						if (data.isError){
		// 							dg.datagrid('selectRow', index);
		// 							opts.onError.call(dg[0], index, data);
		// 							return;
		// 						}
		// 						if (opts.tree){
		// 							dg.datagrid('reload');
		// 							var t = $(opts.tree);
		// 							var node = t.tree('find', idValue);
		// 							if (node){
		// 								t.tree('remove', node.target);
		// 							}
		// 						} else {
		// 							dg.datagrid('cancelEdit', index);
		// 							dg.datagrid('deleteRow', index);
		// 						}
		// 						opts.onDestroy.call(dg[0], index, $.extend(row,data));
		// 						var pager = dg.datagrid('getPager');
		// 						if (pager.length && !dg.datagrid('getRows').length){
		// 							dg.datagrid('options').pageNumber = pager.pagination('options').pageNumber;
		// 							dg.datagrid('reload');
		// 						}
		// 					}, function(data){
		// 						opts.onError.call(dg[0], index, data);
		// 					});
		// 				} else {
		// 					dg.datagrid('cancelEdit', index);
		// 					dg.datagrid('deleteRow', index);
		// 					opts.onDestroy.call(dg[0], index, row);
		// 				}
		// 			}
		// 		}
		// 	});
		// },
		focusEditor:function(jq,field){
			focusEditor(jq, field);
		}
	};
	
	$.fn.edatagrid.defaults = $.extend({}, $.fn.datagrid.defaults, {
		singleSelect: true,
		editing: true,
		editIndex: -1,
		destroyMsg:{
			norecord:{
				title:'Warning',
				msg:'請先選擇要刪除的資料。'
			},
			confirm:{
				title:'Confirm',
				msg:'請問您確定要刪除嗎?'
			}
		},
		poster: function(url, data, success, error){
			$.ajax({
				type: 'post',
				url: url,
				data: data,
				dataType: 'json',
				success: function(data){
					success(data);
				},
				error: function(jqXHR, textStatus, errorThrown){
					error({
						jqXHR: jqXHR,
						textStatus: textStatus,
						errorThrown: errorThrown
					});
				}
			});
		},
		
		autoSave: false,	// auto save the editing row when click out of datagrid
		url: null,	// return the datagrid data
		saveUrl: null,	// return the added row
		updateUrl: null,	// return the updated row
		destroyUrl: null,	// return {success:true}
		
		tree: null,		// the tree selector
		treeUrl: null,	// return tree data
		treeDndUrl: null,	// to process the drag and drop operation, return {success:true}
		treeTextField: 'name',
		treeParentField: 'parentId',
		
		onAdd: function(index, row){},
		onEdit: function(index, row){},
		onBeforeSave: function(index){},
		onSave: function(index, row){},
		onSuccess: function(index, row){},
		onDestroy: function(index, row){},
		onError: function(index, row){},
		// onClickRow:  function(index, row){},
		// onDblClickRow:  function(index, row){},
	});
	
	////////////////////////////////
	$.parser.plugins.push('edatagrid');
})(jQuery);
/*
	20231212 Maria 
	自定義 edatagrid的editor擴充格式
*/ 
$.extend($.fn.datagrid.defaults.editors, {
	/* 刪除按鈕:編輯前：單筆刪除／編輯後：deleteRow(暫時)*/
	btn_delrow: {
		init: function (container, options) {
		   var dgID = "";
			if (!(typeof options.dgID === "undefined")) { dgID = options.dgID; }
		   var btn =
			  ' <button onclick="DeleteERow(this)" style="background-color: rgba(255,255,255,0);border:0px;" ><span class="bi bi-trash" style="font-size:18px;color: red;"></span></button>';
			var Button = $(btn).appendTo(container);
		   return Button;
	   },
	   getValue: function (target) {
		   return $(target).val();
	   },
	   setValue: function (target, value) {
		   $(target).val(value);
	   },
	   resize: function (target, width) {
		   var input = $(target);
	   }
   	},
	//------------------------------------------------
	/*
		帶有按鍵的文字標籤	-- 20241016 add by Wallis
		使用時，在 grid呼叫 editor使用
	 */
	//------------------------------------------------
	btnLabel: {
	   init: function(container, options){
		   // 取得編輯器套用的欄位編碼
		   fieldName = options.field;
		   selpopCode = options.code;
		   multselect = options.multselect == undefined?0:options.multselect;
		   split = options.split == undefined?",":options.split;
		   idField = options.idField== undefined?"MultKeyCheck":options.idField;
		   // 取得生成編輯器的資料表id
		   datagridId = $(container).closest('.datagrid').find('.datagrid-f').attr('id');
		   // 要用來產生編輯器的元素
		   var newEditor = 
		   "<div class='input-group custom_editor'>" +
		   '<input type="text" class="datagrid-editable-input" ' +
		   'style="width:65%;text-align:left;border:0pt;background:transparent" >' + 
		   '<button class="form-control openSelectPopupTable" type="button" '+
		   'value="'+selpopCode+'" '+ // 彈窗編碼
		   'data-idField="'+idField+'"'+ // 彈窗grid的 idField(複選彈窗時用)
		   'data-openid="' + datagridId + '"' +     // 將開啟作用對象的原件id放入(目前有modal與grid兩種)
		   'data-opentype="datagrid"' +     // 元件作用的類別(目前有modal與grid兩種)
		   'data-field="' + fieldName + '" ' +     // 將欄位編碼帶入
		   'multselect="'+multselect+'"'+ // 是否為多選彈窗(複選彈窗時用)
		   'data-split="'+split+'"'+ // 多選彈窗的分割符號(複選彈窗時用)
		   'style="border-radius:35%;width:30px;max-width:30px;padding:5px 7px;" ' + 
		   'onclick=javascript:openSelpop(this)>...</button>' +
		   '<input class="selpop_otherwhere d-none">'+
		   '</div>';
   
		   return $(newEditor).appendTo(container);
	   },
	   getValue: function(target){
		   return $(target).find('input.datagrid-editable-input').val();
	   },
	   setValue: function(target, value){
		   $(target).find('input.datagrid-editable-input').val(value);
	   },
	   resize: function(target, width){
		   $(target).find('input.datagrid-editable-input').css("width", String(width -30)+"px");
	   }
	},
})

/*
	20231225 Maria 自行擴充的欄位驗證類型
	validDate		:驗證日期欄位
	validDateTime	:日期時間欄位內容
	validNumber		:驗證數字欄位長度需與格式設定相同
*/ 
$.extend($.fn.validatebox.defaults.rules, {
	validDate: { 
		validator: function(value){ 
			var date = $.fn.datebox.defaults.parser(value);
			var s = $.fn.datebox.defaults.formatter(date);
			return s==value;
		}, 
	},
	validDateTime: { 
		validator: function(value){ 
			var date = $.fn.datetimebox.defaults.parser(value);
			var s = $.fn.datetimebox.defaults.formatter(date);
			return s==value;
		}, 
	},
	validNumber: { 
		validator: function(value,param){ 
			// 先把value小數點後多餘的0去掉
			value = parseFloat(value);
			value += "";
			var numeric_format = param[0];
			// 檢查輸入格式是否有符合格式
			var Int_f = 0;
			var Float_f = 0;
			// 有千分位的話先去除
			if ( numeric_format.includes(",") ){
				var reg1 = new RegExp(",","g"); // 加'g'，删除字符串里所有的"a"
				numeric_format = numeric_format.replace(reg1,"");
			}
			// 拆解整數位與小數位
			if ( numeric_format.includes(".") ){
				tmp_c = numeric_format.split(".")[0];
				Int_f = tmp_c.length;
				tmp_f = numeric_format.split(".")[1];
				Float_f = tmp_f.length;
			}else{
				Int_f = numeric_format.length;
			}
			// 檢查輸入格式是否有符合格式
			var Int_v = 0;
			var Float_v = 0;
			// 有千分位的話先去除
			if ( value.includes(",") ){
				var reg1 = new RegExp(",","g"); // 加'g'，删除字符串里所有的"a"
				value = value.replace(reg1,"");
			}
			// 檢查輸入字串的長度
			if ( value.includes(".") ){
				tmp_c = value.split(".")[0];
				Int_v = tmp_c.length;
				tmp_f = value.split(".")[1];
				Float_v = tmp_f.length;
			}else{
				Int_v = value.length;
			}
			return Int_v <= Int_f && Float_v <= Float_f;
		}, 
		message: 'Field do not match.',
	},
});
/*
	20231212 Maria 
	時間/日期元件，將格式固定為 YYYY/MM/DD
	formater:日期在datagrid的顯示格式
	parse:套用到formater之前，先解析資料庫的變數
*/ 
$.fn.datebox.defaults.formatter = function (date) {
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	var d = date.getDate();
	return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d);
};
$.fn.datebox.defaults.parser = function (s) {
	if (!s) return new Date();
	var ss = s.split('-');
	var y = parseInt(ss[0], 10);
	var m = parseInt(ss[1], 10);
	var d = parseInt(ss[2], 10);
	if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
		return new Date(y, m - 1, d);
	} else {
		return new Date();
	}
};
$.fn.datetimebox.defaults.formatter = function (date) {
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var t = date.toTimeString().substr(0,8);
	return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d)+' '+t;
};
$.fn.datetimebox.defaults.parser = function (s) {
	return new Date(s);
};
// 20240410 Maria 新增numberbox的規則，自動去除小數位後的0
$.fn.numberbox.defaults.formatter = function (num) {
	return isNaN(parseFloat(num)) ? 0 :parseFloat(num);
}