# 命令行工具：前端开发

包含常用的前端工程构建功能，功能还在完善...

# 安装

    git clone https://github.com/izhangxu/minf.git

	cd mainf 

	npm link

## 用法

	(sudo) mainf [options]

## 参数:
	
	`config` 生成一个配置文件，其中包含开发环境和生产环境的文件路径(svn或git路径)、想要配置的hosts地址...   e.g.: mainf config

	`i`或`init` 初始化一个文件目录，包含js,assets,css,html,widget文件夹及config.json文件  e.g.: mainf init page

	`c`或`copy` 把开发环境的文件/文件夹复制（覆盖）到生产环境的文件目录

		`-d` 把开发环境下当前文件夹复制（覆盖）到生产环境  e.g.: mainf c -d

	`h`或`hosts` 修改hosts文件，添加任意的一个或一组hosts地址

	    `-s`或`-set`    在hosts文件中添加一条地址  e.g.: mainf hosts -s cdn.leju.com 192.168.192.1 {group: "abc"}
        
        `-active`    在hosts文件中激活一条地址  e.g.: mainf hosts -active cdn.leju.com 192.168.192.1 {group: "abc"}
        
        `-disable`    在hosts文件中禁用一条地址  e.g.: mainf hosts -disable cdn.leju.com 192.168.192.1 {group: "abc"}
        
        `-d`或`-delete`    在hosts文件中删除一条地址  e.g.: mainf hosts -d cdn.leju.com 192.168.192.1 {group: "abc"}
        
        `-activeGroup`    在hosts文件中激活一组地址  e.g.: mainf hosts -activeGroup abc
        
        `-disableGroup`    在hosts文件中禁用一组地址  e.g.: mainf hosts -disableGroup abc
        
        `-deleteGroup`    在hosts文件中删除一组地址  e.g.: mainf hosts -deleteGroup abc
    
        `-t`或`-test`    在hosts文件中删除一组地址（配合config.json中的 hosts 字段）  e.g.: mainf hosts -t
		
        `-o`或`-online`    在hosts文件中删除一组地址（配合config.json中的 hosts 字段）  e.g.: mainf hosts -o