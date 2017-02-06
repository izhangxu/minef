# 命令行工具：前端开发

包含常用的前端工程构建功能，功能还在完善...

## 功能简介

#### 项目构建
* 生成标准化的项目文件夹
* 生成唯一配置文件

#### 文件/文件夹覆盖至线上
* 移动开发环境文件至正式环境路径

#### 切换环境
* 设置不同hosts组适应多个项目
* 切换开发环境hosts至正式环境


## 安装

    git clone https://github.com/izhangxu/minef.git

    cd minef 

	npm link

## 用法

	(sudo) minef [options]

## 参数:

### minef config
	
生成一个配置文件，其中包含开发环境和生产环境的文件路径(svn或git路径)、想要配置的hosts地址...   e.g.: minef config

### minef init(minef i)

`i`或`init` 初始化一个文件目录，包含js,assets,css,html,widget文件夹及config.json文件  e.g.: minef init page

### minef copy(minef c)

把开发环境的文件/文件夹复制（覆盖）到生产环境的文件目录。
    
 `minef copy -d` 把开发环境下当前文件夹复制（覆盖）到生产环境  e.g.: minef c -d
 
### minef hosts(minef h)

修改hosts文件，添加任意的一个或一组hosts地址。在hosts中添加后后会有类似下面的区块

![](https://github.com/izhangxu/minef/blob/master/screenshots/hosts.jpg)

`-s`或`-set`    在hosts文件中添加一条地址  e.g.: minef hosts -s cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-active`    在hosts文件中激活一条地址  e.g.: minef hosts -active cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-disable`    在hosts文件中禁用一条地址  e.g.: minef hosts -disable cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-d`或`-delete`    在hosts文件中删除一条地址  e.g.: minef hosts -d cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-activeGroup`    在hosts文件中激活一组地址  e.g.: minef hosts -activeGroup abc
        
`-disableGroup`    在hosts文件中禁用一组地址  e.g.: minef hosts -disableGroup abc
        
`-deleteGroup`    在hosts文件中删除一组地址  e.g.: minef hosts -deleteGroup abc
    
`-t`或`-test`    在hosts文件中删除一组地址（配合config.json中的 hosts 字段）  e.g.: minef hosts -t
		
`-o`或`-online`    在hosts文件中删除一组地址（配合config.json中的 hosts 字段）  e.g.: minef hosts -o