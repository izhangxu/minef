#!/bin/sh

OLD_IFS="$IFS"
IFS=","
files=($1)
test_dir=$2
online_dir=$3
commit_msg=$4
iNow=0

echo ""
echo "***************待移动文件路径："
# 文件目录转换为数组
for s in ${files[@]}
do
	echo $s
done
IFS="$OLD_IFS"

# 检测测试环境当前目录是否存在
if [ ! -d $test_dir ]
	then
	echo "[ERROR] 测试环境的文件目录 ( $test_dir ) 未找到"
	exit 1
fi

# 检测生成环境当前目录是否存在
if [ ! -d $online_dir ]
	then
	echo "[ERROR] 生产环境的文件目录 ( $online_dir ) 未找到"
	exit 1
fi

# 执行覆盖文件操作
echo ""
echo "***************移动文件到正式线："

# 更新正式线代码
echo "***************正式线版本号："
svn up $online_dir

# 移动文件到正式线
cd $test_dir
for path in ${files[@]}
do
	echo "移动 $path 到 $online_dir"
	rsync -ravu --delete $path $online_dir
done

# svn对比提交代码
cd $online_dir
echo ""
echo "***************改动文件状态："
echo `svn status`

# 部署线上 svn
echo ""
echo "***************提交正式线svn："
svn status | grep ^! | xargs | sed 's/\!//g'| xargs svn rm
svn status | grep ^? | xargs | sed 's/\?//g'| xargs svn add
# svn ci -m $commit_msg

echo ""
echo "***************提交完成"
exit 0



