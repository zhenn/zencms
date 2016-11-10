## ZenCMS是什么？

> balabala

## 能干什么？

## 实现原理（流程图）

## 如何使用？ 



## 一个标准的标签

	<cms:custom name="自定义表情" alias="alias" fields="pic:图片,text:文本" row="2" defaultRow="1">
    	<%
        	data.forEach(function(item, index){
    	%>
    	<div><img src="<%= item.pic %>" /></div><p><%= item.text %></p>
    	<%
        	});
    	%>
	</cms>
	

#### 分解说明

- `<cms:custom></cms>`声明一个完整的zencms标签
- 
- 字段：
	- name
	- alias
	- fields
	- row
	- defaultRow

渲染标签数据







	
	