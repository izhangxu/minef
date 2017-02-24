# 命令行工具：前端开发

包含常用的前端开发功能，还在完善...

## 功能简介

#### 项目构建
* 生成标准化的项目文件夹
* 生成唯一配置文件

#### 文件/文件夹覆盖至线上
* 移动开发环境文件至正式环境路径

#### 文件发布
* 发布文件或文件夹到线上（svn）

#### 切换环境
* 设置不同hosts组适应多个项目
* 切换开发环境hosts至正式环境

#### 静态服务器
* 开启本地静态服务器


## 安装

    git clone https://github.com/izhangxu/minef.git

    cd minef 

	npm link

## 用法

	(sudo) minef [options]

## 参数:

### `minef config`
	
生成一个配置文件，其中包含开发环境和生产环境的文件路径(svn或git路径)、想要配置的hosts地址...   e.g.: minef config

### `minef init(minef i)`

`i`或`init` 初始化一个文件目录，包含js,assets,css,html,widget文件夹及config.json文件  e.g.: minef init page

### `minef copy(minef c)`

把开发环境的文件/文件夹复制（覆盖）到生产环境的文件目录。

`minef copy -d` 把开发环境下当前文件夹复制（覆盖）到生产环境  e.g.: minef c -d
 
### `minef release(minef r)`

把开发环境的文件/文件夹移动到生成环境目录，并且通过svn发布
    
 `minef release -m 'update'` 把开发环境下当前文件夹复制（覆盖）到生产环境  e.g.: minef release abc/ app.js -m 'update'
 
### `minef hosts(minef h)`

修改hosts文件，添加任意的一个或一组hosts地址。在hosts中添加后后会有类似下面的区块

![](https://github.com/izhangxu/minef/blob/master/screenshots/hosts.jpg)

`-s`或`-set`    在hosts文件中添加一条地址  e.g.: minef hosts -set cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-a`或`-active`    在hosts文件中激活一条地址  e.g.: minef hosts -active cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-d`或`-disable`    在hosts文件中禁用一条地址  e.g.: minef hosts -disable cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-r`或`-remove`    在hosts文件中删除一条地址  e.g.: minef hosts -remove cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-A`或`-activeGroup`    在hosts文件中激活一组地址  e.g.: minef hosts --active-group abc
        
`-D`或`-disableGroup`    在hosts文件中禁用一组地址  e.g.: minef hosts --disable-group abc
        
`-R`或`-removeGroup`    在hosts文件中删除一组地址  e.g.: minef hosts --delete-group abc

`-l`或`-list`    显示hosts  e.g.: minef hosts -l

### `minef server(minef h)`

启动http服务

`minef server -i` 启动http服务并且打开默认的index.html（默认false）

`minef server -p` 修改http服务监听的端口（默认8080）

`minef server -o` 启动http服务并且自动打开浏览器
