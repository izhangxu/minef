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

#### 代理开发环境
* 代理到不同开发环境（本地，测试线，线上）
* 支持代理到gulp|webpack等工具开启的服务器地址，方便本地调试代码

#### 静态服务器
* 开启本地静态服务器

#### 图片压缩（gif,jpg,png,jpeg）
* 单个图片压缩
* 整个文件目录里的图片压缩

## 安装

    git clone https://github.com/izhangxu/minef.git

    cd minef 

	npm link

## 用法

	(sudo) minef [options]

## 参数:

### `minef config`
	
生成一个配置文件，其中包含开发环境和生产环境的文件路径(svn或git路径)、想要配置的hosts地址...   e.g.: minef config

### `minef init`

`i`或`init` 初始化一个文件目录，包含js,assets,css,html,widget文件夹及config.json文件  e.g.: minef init page

### `minef copy`

把开发环境的文件/文件夹复制（覆盖）到生产环境的文件目录。

`minef copy -d` 把开发环境下当前文件夹复制（覆盖）到生产环境  e.g.: minef c -d
 
### `minef release`

把开发环境的文件/文件夹移动到生成环境目录，并且通过svn发布
    
 `minef release -m 'update'` 把开发环境下当前文件夹复制（覆盖）到生产环境  e.g.: minef release abc/ app.js -m 'update'
 
### `minef hosts`

修改hosts文件，添加任意的一个或一组hosts地址。在hosts中添加后后会有类似下面的区块

![](https://github.com/izhangxu/minef/blob/master/screenshots/hosts.jpg)

`-s`或`-set`    在hosts文件中添加一条地址  e.g.: minef hosts -set cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-a`或`-active`    在hosts文件中激活一条地址  e.g.: minef hosts -active cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-d`或`-disable`    在hosts文件中禁用一条地址  e.g.: minef hosts -disable cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-r`或`-remove`    在hosts文件中删除一条地址  e.g.: minef hosts -remove cdn.leju.com 192.168.192.1 {group: "abc"}
        
`-A`或`--active-group`    在hosts文件中激活一组地址  e.g.: minef hosts --active-group abc
        
`-D`或`--disable-group`    在hosts文件中禁用一组地址  e.g.: minef hosts --disable-group abc
        
`-R`或`--delete-group`    在hosts文件中删除一组地址  e.g.: minef hosts --delete-group abc

`-l`或`-list`    显示hosts  e.g.: minef hosts -l

### `minef server`

启动http服务

`-i`或`-autoindex` 启动http服务并且打开默认的index.html（默认false）

`-p`或`-port` 修改http服务监听的端口（默认8080）

`-o`或`-open` 启动http服务并且自动打开浏览器（默认true）

### `sudo minef proxy`

代理http服务。将需要代理的域名绑定host（例如：cdn.lemeng.com 127.0.0.1），然后在代码根目录启动命令（例如正使用的链接为 http://cdn.lemeng.com/abc/def/js/index.js ，则需要在cdn.lemeng.com/目录下启动命令）

`-l`或者`-local` 代理到本地

`-t`或`-test` 代理到测试线（域名在config.js中配置）

`-o`或`-online` 代理到正式线（域名在config.js中配置）

### `minef imagemin`

图片压缩

`-i`或`-input` 待压缩文件或文件夹路径（必传）

`-o`或`-output` 输出文件夹路径（不传则命名上加_out e.g.: index_out.js /public_out）

`-f`或`-focus` 强制替换文件或文件夹（默认false）

`-q`或`-quality` jpg,jpeg压缩质量（1-100，默认70）

`-l`或`-level` png压缩质量（1-100，默认70）

`-c`或`-colors` gif压缩质量（2-256，默认70）
